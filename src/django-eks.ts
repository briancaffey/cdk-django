import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecrAssets from '@aws-cdk/aws-ecr-assets';
import * as eks from '@aws-cdk/aws-eks';
// import * as logs from '@aws-cdk/aws-logs';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';
import { CfnJson } from '@aws-cdk/core';
import { RdsPostgresInstance } from './database';
// import { ElastiCacheCluster } from './elasticache';

// k8s manifests
// import { nginxDeployment, nginxService } from './nginx';
import { MigrateJob } from './eks/resources/migrate';
// import { WebResources } from './eks/resources/web';
// import { appIngress } from './ingress';
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

    /**
     * Namespace for application
     */
    this.cluster.addManifest('app-namespace', {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: 'app',
      },
    });

    const DB_SECRET_NAME = 'dbSecret';
    /**
     * Secret used for RDS postgres password
     */
    this.secret = new secretsmanager.Secret(scope, 'dbSecret', {
      secretName: DB_SECRET_NAME,
      description: 'secret for rds',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
      },
    });


    const POD_SERVICE_ACCOUNT_NAME = 'pod-service-account';
    const oidcProviderId = this.cluster.openIdConnectProvider.openIdConnectProviderIssuer;

    /**
     * The Principal that will assume the podRole
     */
    const federatedPrincipal = new iam.FederatedPrincipal(
      this.cluster.openIdConnectProvider.openIdConnectProviderArn,
      {
        StringEquals: new CfnJson(scope, "FederatedPrincipalCondition", {
          value: {
            [`${oidcProviderId}:aud`]: "sts.amazonaws.com",
            [`${oidcProviderId}:sub`]: `system:serviceaccount:app:${POD_SERVICE_ACCOUNT_NAME}`
          }
        })
      }, "sts:AssumeRoleWithWebIdentity"
    );

    /**
     * Setup a new IAM Role that will be used by Pods to access the secret and S3 bucket
     *
     * This role is assumed by the Principal defined above
     */
    const podRole = new iam.Role(scope, 'podRole', {
      assumedBy: federatedPrincipal,
    });

    const podServiceAccount = {
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: {
        name: POD_SERVICE_ACCOUNT_NAME,
        namespace: 'app',
        annotations: {
          'eks.amazonaws.com/role-arn': podRole.roleArn,
        },
      },
    };

    /**
     * Give the podRole read access to the bucket and read/write access to the S3 bucket
     */
    this.secret.grantRead(podRole);
    this.staticFileBucket.grantReadWrite(podRole);

    /**
     * Create a service account manfiest that will be used by pods
     * The ARN will be passed into the templates
     */
    this.cluster.addManifest('pod-service-account', podServiceAccount);

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
    // this.secret.grantRead(this.cluster.def);

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
    // this.cluster.addManifest('nginx-deployment', nginxDeployment);
    // this.cluster.addManifest('nginx-service', nginxService);

    // backend docker image

    const backendImage = new ecrAssets.DockerImageAsset(scope, 'backendImage', {
      directory: props.imageDirectory,
    });

    // TODO: use https://github.com/aws/aws-secretsmanager-caching-python/blob/master/test/integ/test_aws_secretsmanager_caching.py
    // instead of passing password string to environment variable

    /**
     * Common environment variables for Jobs and Deployments
     */
    const env = [
      {
        name: 'DEBUG',
        value: '0',
      },
      {
        // this is used in the application to fetch the secret value
        name: 'DB_SECRET_NAME',
        value: DB_SECRET_NAME,

      },
      {
        name: 'POSTGRES_SERVICE_HOST',
        value: database.rdsPostgresInstance.dbInstanceEndpointAddress,
      },
      {
        name: 'DJANGO_SETTINGS_MODULE',
        value: 'backend.settings.production',
      },
    ];

    // Django K8s resources

    const migrateJob = new MigrateJob(scope, 'django-migrate-job', {
      cluster: this.cluster,
      backendImage,
      namespace: 'app',
      env,
    });

    /**
     * Job that runs Django migrations
     */
    this.cluster.addManifest('migrate-job', migrateJob.manifest);

    // web service and deployment
    // const webResources = new WebResources(scope, 'web-resources', {
    //   env,
    //   cluster: this.cluster,
    //   webCommand: props.webCommand ?? ['./scripts/start_prod.sh'],
    //   backendImage,
    //   namespace: 'app',
    // });

    /**
     * Add deployment and service manifests for web to the cluster
     */
    // this.cluster.addManifest('app-ingresss', appIngress);
    // this.cluster.addManifest('web-deployment', webResources.deploymentManifest);
    // this.cluster.addManifest('web-service', webResources.serviceManifest);


    /**
     * Get the ALB address using KubernetesObjectValue as a String
     */

    // const albAddress = new eks.KubernetesObjectValue(scope, 'AlbAddress', {
    //   cluster: this.cluster,
    //   objectType: 'ingress',
    //   objectNamespace: 'app',
    //   objectName: 'app-ingress',
    //   jsonPath: '.items[0].status.loadBalancer.ingress[0].hostname',
    // });

    /**
     * Route53 A Record pointing to ALB that is created by AWS Application Load Balancer Controller
     */


    /**
     * Output the Load Balancer URL as a CfnOutput
     */
    // new cdk.CfnOutput(this, 'apiUrl', { value: albAddress.value });

  }
}