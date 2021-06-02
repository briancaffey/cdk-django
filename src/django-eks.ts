import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
// import * as ecrAssets from '@aws-cdk/aws-ecr-assets';
// import * as logs from '@aws-cdk/aws-logs';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';
import { RdsPostgresInstance } from './database';
// import { ElastiCacheCluster } from './elasticache';

// k8s manifests
import { appIngress } from './ingress';
import { nginxDeployment, nginxService } from './nginx';
import { ApplicationVpc } from './vpc';


// eslint-disable-next-line
const request = require('sync-request');
// eslint-disable-next-line
const yaml = require('js-yaml');

export interface DjangoEksProps {
  /**
   * Options to configure a Django CDK project
   */

  /**
   * Name of existing bucket to use for media files
   *
   * This name will be auto-generated if not specified
   */
  readonly bucketName ? : string;

  /**
   * The VPC to use for the application. It must contain
   * PUBLIC, PRIVATE and ISOLATED subnets
   *
   * A VPC will be created if this is not specified
   */
  readonly vpc ? : ec2.IVpc;

  /**
   * The location of the Dockerfile used to create the main
   * application image. This is also the context used for building the image.
   *
   * TODO: set image and context path separately.
   */
  readonly imageDirectory: string;

  /**
   * The command used to run the API web service.
   */
  readonly webCommand ? : string[];

  /**
   * Used to enable the celery beat service.
   *
   * @default false
   */
  readonly useCeleryBeat ? : boolean;

}


export class DjangoEks extends cdk.Construct {

  public staticFileBucket: s3.Bucket;
  public vpc: ec2.IVpc;
  public cluster: eks.Cluster;
  private secret: secretsmanager.ISecret;


  constructor(scope: cdk.Construct, id: string, props: DjangoEksProps) {
    super(scope, id);

    /**
     * VPC must have public, private and isolated subnets
     *
     * If you don't provide a VPC, a new VPC will be created
     */
    if (!props.vpc) {
      const applicationVpc = new ApplicationVpc(scope, 'AppVpc');
      this.vpc = applicationVpc.vpc;
    } else {
      const vpc = props.vpc;
      this.vpc = vpc;
    }

    /**
     * static files bucket name is derived from the Construct id if not provided
     */
    const staticFilesBucket = new s3.Bucket(scope, 'StaticBucket', {
      bucketName: props?.bucketName,
    });
    this.staticFileBucket = staticFilesBucket;

    // allow all account users to assume this role in order to admin the cluster
    const mastersRole = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal(),
    });

    /**
     * EKS cluster
     */
    this.cluster = new eks.Cluster(this, 'MyEksCluster', {
      version: eks.KubernetesVersion.V1_19,
      vpc: this.vpc,
      mastersRole,
      defaultCapacity: 2,
    });

    this.cluster.addManifest('app-namespace', {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: 'app',
      },
    });

    /**
     * Secret used for RDS postgres password
     */
    this.secret = new secretsmanager.Secret(scope, 'dbSecret', {
      secretName: 'dbSecret',
      description: 'secret for rds',
    });

    /**
     * RDS instance
     */
    const database = new RdsPostgresInstance(scope, 'RdsPostgresInstance', {
      vpc: this.vpc,
      secret: this.secret,
    });

    /**
     * Security Group for worker nodes
     */
    const appSecurityGroup = new ec2.SecurityGroup(scope, 'appSecurityGroup', {
      vpc: this.vpc,
    });

    /**
     * cluster.defaultCapactiy is the autoScalingGroup (the cluster's default node group)
     * Here the appSecurityGroup created above is added to that ASG
     */
    this.cluster.defaultCapacity?.addSecurityGroup(appSecurityGroup);

    /**
     * Allow th ASG to accesss the database
     */
    database.rdsSecurityGroup.addIngressRule(appSecurityGroup, ec2.Port.tcp(5432));

    // Installation of AWS Load Balancer Controller
    // https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/deploy/installation/
    // Adopted from comments in this issue: https://github.com/aws/aws-cdk/issues/8836

    const albServiceAccount = this.cluster.addServiceAccount('aws-alb-ingress-controller-sa', {
      name: 'aws-load-balancer-controller',
      namespace: 'kube-system',
    });

    const awsAlbControllerPolicyUrl = 'https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.2.0/docs/install/iam_policy.json';
    const policyJson = request('GET', awsAlbControllerPolicyUrl).getBody('utf8');
    ((JSON.parse(policyJson)).Statement as any[]).forEach(statement => {
      albServiceAccount.addToPrincipalPolicy(iam.PolicyStatement.fromJson(statement));
    });

    // AWS Load Balancer Controller Helm Chart
    // https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/deploy/installation/#summary

    // AWS Application Load Balancer Controller Helm Chart CRDs
    // These must be installed before installing the Helm Chart because CDK
    // installs the Helm chart with `helm upgrade` which does not
    // automatically install CRDs
    // This should be equivalent to Step 2:
    // kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"

    const awslbcCrdsUrl = 'https://raw.githubusercontent.com/aws/eks-charts/master/stable/aws-load-balancer-controller/crds/crds.yaml';
    const awslbcCrdsYaml = request('GET', awslbcCrdsUrl).getBody('utf8');
    const awslbcCrdsObjects = yaml.loadAll(awslbcCrdsYaml);

    new eks.KubernetesManifest(this, 'alb-custom-resource-definition', {
      cluster: this.cluster,
      manifest: awslbcCrdsObjects,
      overwrite: true,
      prune: true,
    });

    // The following is equivalent to:
    // helm repo add eks https://aws.github.io/eks-charts
    // helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=<cluster-name> --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-controller

    new eks.HelmChart(scope, 'alb-ingress-controller', {
      cluster: this.cluster,
      wait: true,
      chart: 'aws-load-balancer-controller',
      repository: 'https://aws.github.io/eks-charts',
      // Note: the chart version 1.2.0 will install version 2.2.0 of the Helm Chart
      // https://github.com/aws/eks-charts/blob/master/stable/aws-load-balancer-controller/Chart.yaml
      version: '1.2.0',
      namespace: 'kube-system',
      values: {
        clusterName: this.cluster.clusterName,
        serviceAccount: {
          create: false,
          name: 'aws-load-balancer-controller',
        },
      },
    });

    // sample nginx deployment and service for demonstration
    this.cluster.addManifest('nginx-deployment', nginxDeployment);
    this.cluster.addManifest('nginx-service', nginxService);
    this.cluster.addManifest('app-ingresss', appIngress);
  }
}