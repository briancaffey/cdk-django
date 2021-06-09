import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecrAssets from '@aws-cdk/aws-ecr-assets';
import * as eks from '@aws-cdk/aws-eks';
// import * as logs from '@aws-cdk/aws-logs';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import { RdsPostgresInstance } from './common/database';
import { ApplicationVpc } from './common/vpc';
import { AwsLoadBalancerController } from './eks/awslbc';
// import { ElastiCacheCluster } from './elasticache';
import { Irsa } from './eks/irsa';
import { appIngress } from './eks/resources/ingress';
import { MigrateJob } from './eks/resources/migrate';
import { WebResources } from './eks/resources/web';


/**
 * Options to configure a Django EKS project
 */
export interface DjangoEksProps {

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

/**
 * Configures a Django project using EKS
 */
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
      bucketName: props.bucketName,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
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
    const appNamespace = this.cluster.addManifest('app-namespace', {
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

    /**
     * Creates an IAM role with a trust relationship that is scoped to the cluster's OIDC provider
     * https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts-technical-overview.html
     *
     * The role (podRole) will be given access the Secrets Manager Secret, the S3 bucket and
     * any other resources that are needed by pods that run the Django application
     */
    const irsa = new Irsa(scope, 'Irsa', {
      cluster: this.cluster,
    });

    /**
     * Make sure that the namespace has been deployed
     */
    irsa.node.addDependency(appNamespace);

    /**
     * Give the IRSA podRole read access to the bucket and read/write access to the S3 bucket
     */
    this.secret.grantRead(irsa.podRole);
    this.staticFileBucket.grantReadWrite(irsa.podRole);

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
     *
     * TODO: use a non-default node-group
     */
    this.cluster.defaultCapacity?.addSecurityGroup(appSecurityGroup);

    /**
     * Allow th ASG to accesss the database
     */
    database.rdsSecurityGroup.addIngressRule(appSecurityGroup, ec2.Port.tcp(5432));

    /**
     * Installation of AWS Load Balancer Controller
     * https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/deploy/installation/
     */
    new AwsLoadBalancerController(this, 'AwsLoadBalancerController', {
      cluster: this.cluster,
    });

    /**
     * Backend docker image using DockerImageAssets
     * This image will be pushed to the ECR Registry created by `cdk bootstrap`
     */
    const backendImage = new ecrAssets.DockerImageAsset(scope, 'backendImage', {
      directory: props.imageDirectory,
    });

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

    /**
     * Kubernetes Job that runs database migrations
     */
    new MigrateJob(scope, 'django-migrate-job', {
      cluster: this.cluster,
      backendImage,
      namespace: 'app',
      env,
    });

    // web service and deployment
    const webResources = new WebResources(scope, 'web-resources', {
      env,
      cluster: this.cluster,
      webCommand: props.webCommand ?? ['./scripts/start_prod.sh'],
      backendImage,
      namespace: 'app',
    });

    // webResources.node.addDependency(appNamespace);
    this.cluster.addManifest('web-deployment', webResources.deploymentManifest);
    this.cluster.addManifest('web-service', webResources.serviceManifest);

    /**
     * Add deployment and service manifests for web to the cluster
     */
    this.cluster.addManifest('app-ingresss', appIngress);
    // ingress.node.addDependency(webService);

    /**
     * Get the ALB address using KubernetesObjectValue as a String
     */
    // https://github.com/aws/aws-cdk/issues/14933
    // const albAddress = new eks.KubernetesObjectValue(scope, 'AlbAddress', {
    //   cluster: this.cluster,
    //   objectType: 'ingress',
    //   objectNamespace: 'app',
    //   objectName: 'app-ingress',
    //   jsonPath: '.items[0].status.loadBalancer.ingress[0].hostname',
    // });

    /**
     * Route53 A Record pointing to ALB that is created by AWS Application Load Balancer Controller
     *
     * TODO: fix this, since KubernetesObjectValue is not giving the ALB Public DNS URL
     */

    const alb = elbv2.ApplicationLoadBalancer.fromLookup(this, 'appAlb', {
      loadBalancerTags: {
        Environment: 'test'
      },
    });


    /**
     * Output the Load Balancer URL as a CfnOutput
     */
    new cdk.CfnOutput(this, 'apiUrl', { value: alb.loadBalancerDnsName });

  }
}