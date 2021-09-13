import * as acm from '@aws-cdk/aws-certificatemanager';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as patterns from '@aws-cdk/aws-ecs-patterns';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as iam from '@aws-cdk/aws-iam';
import * as kms from '@aws-cdk/aws-kms';
import * as logs from '@aws-cdk/aws-logs';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53targets from '@aws-cdk/aws-route53-targets';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { RdsPostgresInstance } from './common/database';
import { ElastiCacheCluster } from './common/elasticache';
import { ApplicationVpc } from './common/vpc';
import { CeleryBeat } from './ecs/celery/beat';
import { CeleryWorker } from './ecs/celery/worker';
import { managementCommandTask } from './ecs/tasks';


/**
 * Options to configure a Django ECS project
 */
export interface DjangoEcsProps {

  /**
   * Domain name for backend (including sub-domain)
   */
  readonly apiDomainName?: string;

  readonly zoneName?: string;

  /**
    * Certificate ARN
    */
  readonly certificateArn?: string;


  /**
   * Name of existing bucket to use for media files
   *
   * This name will be auto-generated if not specified
   */
  readonly bucketName?: string;

  /**
   * The VPC to use for the application. It must contain
   * PUBLIC, PRIVATE and ISOLATED subnets
   *
   * A VPC will be created if this is not specified
   */
  readonly vpc?: ec2.IVpc;

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
  readonly webCommand?: string[];

  /**
   * Used to enable the celery beat service.
   *
   * @default false
   */
  readonly useCeleryBeat?: boolean;

  /**
   *
   * This allows you to exec into the backend API container using ECS Exec
   *
   * https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html
   *
   * @default false
   */
  readonly useEcsExec?: boolean;

  /**
   * Frontend URL
   *
   * This is used to tell the backend what URL(s) will send API requests
   *
   * In Django settings use .split(",") to split the URLs into a list
   *
   * This is needed for CORS
   *
   * TODO: change to a list of strings
   */
  readonly frontendUrl?: string;

}

/**
 * Configures a Django project using ECS Fargate
 */
export class DjangoEcs extends cdk.Construct {

  public staticFileBucket: s3.Bucket;
  public vpc: ec2.IVpc;
  public cluster: ecs.Cluster;
  public image: ecs.ContainerImage;

  constructor(scope: cdk.Construct, id: string, props: DjangoEcsProps) {
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

    /**
     * ECS cluster
     */
    this.cluster = new ecs.Cluster(scope, 'EcsCluster', { vpc: this.vpc });

    /**
     * task definition construct
     */
    const taskDefinition = new ecs.TaskDefinition(scope, 'TaskDefinition', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });

    /**
     * Container image used in web API, celery worker and management task containers
     */
    this.image = new ecs.AssetImage(props.imageDirectory);

    /**
     * RDS managed database using PostgreSQL
     */
    const database = new RdsPostgresInstance(scope, 'RdsPostgresInstance', {
      vpc: this.vpc,
      dbSecretName: 'dbSecret',
    });


    /**
     * A security group in the VPC for our application (ECS Fargate services and tasks)
     * Allow the application services to access the RDS security group
     */
    const appSecurityGroup = new ec2.SecurityGroup(scope, 'appSecurityGroup', {
      vpc: this.vpc,
    });

    /**
     * ElastiCache Redis Cluster for caching, celery message brokering
     */
    const elastiCacheRedis = new ElastiCacheCluster(scope, 'ElastiCacheCluster', {
      vpc: this.vpc,
      appSecurityGroup,
    });


    const environment: { [key: string]: string } = {
      S3_BUCKET_NAME: staticFilesBucket.bucketName,
      AWS_STORAGE_BUCKET_NAME: staticFilesBucket.bucketName,
      POSTGRES_SERVICE_HOST: database.rdsPostgresInstance.dbInstanceEndpointAddress,
      DB_SECRET_NAME: database.dbSecretName,
      DEBUG: '0',
      DJANGO_SETTINGS_MODULE: 'backend.settings.aws',
      REDIS_SERVICE_HOST: elastiCacheRedis.elastiCacheCluster.attrRedisEndpointAddress,
      FRONTEND_URL: props.frontendUrl ?? '',
    };

    taskDefinition.addContainer('backendContainer', {
      image: this.image,
      environment,
      command: props.webCommand,
      portMappings: [{
        containerPort: 8000,
        hostPort: 8000,
      }],
      logging: ecs.LogDriver.awsLogs(
        {
          logRetention: logs.RetentionDays.ONE_DAY,
          streamPrefix: 'BackendContainer',
        },
      ),
    });

    new managementCommandTask(scope, 'migrate', {
      image: this.image,
      command: ['python3', 'manage.py', 'migrate', '--no-input'],
      appSecurityGroup,
      environment,
      dbSecret: database.secret,
      cluster: this.cluster,
      // this command will run automatically on every deployment
      run: true,
      vpc: this.vpc,
    });

    const collectStaticCommand = new managementCommandTask(scope, 'collectstatic', {
      image: this.image,
      command: ['python3', 'manage.py', 'collectstatic', '--no-input'],
      appSecurityGroup,
      environment,
      dbSecret: database.secret,
      cluster: this.cluster,
      run: true,
      vpc: this.vpc,
    });
    staticFilesBucket.grantReadWrite(collectStaticCommand.taskDefinition.taskRole);

    /**
     * Use celery beat if it is configured in props
     */
    if (props.useCeleryBeat ?? false) {
      new CeleryBeat(scope, 'CeleryBeat', {
        dbSecret: database.secret,
        image: this.image,
        command: [
          'celery',
          '--app=backend.celery_app:app',
          'beat',
          '--loglevel=INFO',
          '--pidfile=/code/celerybeat.pid',
        ],
        environment,
        cluster: this.cluster,
        securityGroups: [appSecurityGroup],
      });
    };

    /**
     * Celery worker
     *
     * TODO: refactor to support defining multiple queues
     */
    const celeryWorker = new CeleryWorker(scope, 'CeleryWorkerDefaultQueue', {
      image: this.image,
      command: [
        'celery',
        '-A',
        'backend.celery_app:app',
        'worker',
        '-l',
        'info',
        '-Q',
        'celery',
        '-n',
        'worker-celery@%h',
      ],
      environment,
      cluster: this.cluster,
      securityGroups: [appSecurityGroup],
      dbSecret: database.secret,
    });
    staticFilesBucket.grantReadWrite(celeryWorker.taskDefinition.taskRole);

    /**
     * Lookup Certificate from ARN or generate
     * Deploy external-dns and related IAM resource if a domain name is included
     */
    let certificate = undefined;
    let hostedZone = undefined;
    if (props.apiDomainName && props.zoneName) {

      hostedZone = route53.HostedZone.fromLookup(scope, 'hosted-zone', {
        domainName: props.zoneName,
      });

      /**
       * Lookup or request ACM certificate depending on value of certificateArn
       */
      if (props.certificateArn) {
        // lookup ACM certificate from ACM certificate ARN
        certificate = acm.Certificate.fromCertificateArn(scope, 'certificate', props.certificateArn);
      } else {
        // request a new certificate
        certificate = new acm.Certificate(this, 'SSLCertificate', {
          domainName: props.apiDomainName,
          validation: acm.CertificateValidation.fromDns(hostedZone),
        });
      }
    }

    /**
      * ECS load-balanced fargate service
     */
    const albfs = new patterns.ApplicationLoadBalancedFargateService(scope, 'AlbFargateService', {
      cluster: this.cluster,
      taskDefinition,
      securityGroups: [appSecurityGroup],
      desiredCount: 1,
      assignPublicIp: true,
      redirectHTTP: !!props.apiDomainName ?? false,
      protocol: props.apiDomainName ? elbv2.ApplicationProtocol.HTTPS : elbv2.ApplicationProtocol.HTTP,
      certificate: props.apiDomainName ? certificate : undefined,
    });

    database.secret.grantRead(albfs.taskDefinition.taskRole);

    const albLogsBucket = new s3.Bucket(scope, `${id}-alb-logs`);

    albfs.loadBalancer.logAccessLogs(albLogsBucket);

    // optionally disable the admin interface
    // albfs.listener.addAction


    /**
     * Configure ECS Exec if enabled in props
     *
     * ECS Exec allows you to open an interactive shell in a container running in a ECS Fargate task
     *
     * Based on https://github.com/pahud/ecs-exec-cdk-demo/blob/main/src/main.ts
     *
     * Helpful: https://github.com/aws-containers/amazon-ecs-exec-checker
     *
     * TODO: clean up permissions
     */
    if (props.useEcsExec ?? false) {

      // create kms key
      const kmsKey = new kms.Key(this, 'KmsKey');
      // create log group
      const logGroup = new logs.LogGroup(this, 'LogGroup');
      // ecs exec bucket
      const execBucket = new s3.Bucket(this, 'EcsExecBucket', {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      });

      logGroup.grantWrite(taskDefinition.taskRole);
      kmsKey.grantDecrypt(taskDefinition.taskRole);
      execBucket.grantPut(taskDefinition.taskRole);

      // https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html#ecs-exec-logging
      taskDefinition.taskRole.addToPrincipalPolicy(new iam.PolicyStatement({
        actions: [
          'logs:DescribeLogGroups',
          'logs:DescribeLogStreams',
        ],
        resources: ['*'],
      }));

      // TODO: this can be removed
      // check the resources property of the policy statement`
      taskDefinition.taskRole.addToPrincipalPolicy(new iam.PolicyStatement({
        actions: [
          'logs:DescribeLogGroups',
          'logs:CreateLogStream',
          'logs:DescribeLogStreams',
          'logs:PutLogEvents',
        ],
        resources: [`arn:aws:logs:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:log-group:/aws/ecs/${logGroup.logGroupName}:*`],
      }));

      taskDefinition.taskRole.addToPrincipalPolicy(new iam.PolicyStatement({
        resources: ['*'],
        actions: [
          'ssmmessages:CreateControlChannel',
          'ssmmessages:CreateDataChannel',
          'ssmmessages:OpenControlChannel',
          'ssmmessages:OpenDataChannel',
        ],
      }));


      // // we need ExecuteCommandConfiguration
      const cfnCluster = this.cluster.node.defaultChild as ecs.CfnCluster;
      cfnCluster.addPropertyOverride('Configuration.ExecuteCommandConfiguration', {
        KmsKeyId: kmsKey.keyId,
        LogConfiguration: {
          CloudWatchLogGroupName: logGroup.logGroupName,
          S3BucketName: execBucket.bucketName,
          S3KeyPrefix: 'exec-output',
        },
        Logging: 'OVERRIDE',
      });

      // enable EnableExecuteCommand for the service
      const cfnService = albfs.service.node.findChild('Service') as ecs.CfnService;
      cfnService.addPropertyOverride('EnableExecuteCommand', true);

      // Output the command that will allow us to use ECS Exec on our backend container
      new cdk.CfnOutput(this, 'EcsExecCommand', {
        value:
          `ecs_exec_service ${this.cluster.clusterName} ${albfs.service.serviceName} ${taskDefinition.defaultContainer?.containerName}`,
      });
    }
    /**
     * Health check for the application load balancer
     */
    albfs.targetGroup.configureHealthCheck({
      path: '/api/health-check/',
    });

    /**
     * Allows the app security group to communicate with the RDS security group
     */
    database.rdsSecurityGroup.addIngressRule(appSecurityGroup, ec2.Port.tcp(5432));

    /**
     * Grant the task defintion read-write access to static files bucket
     */
    staticFilesBucket.grantReadWrite(albfs.taskDefinition.taskRole);

    new cdk.CfnOutput(this, 'bucketName', { value: staticFilesBucket.bucketName! });
    new cdk.CfnOutput(this, 'apiUrl', { value: albfs.loadBalancer.loadBalancerFullName });

    if (props.apiDomainName) {
      new route53.ARecord(scope, 'ARecord', {
        target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(albfs.loadBalancer)),
        zone: hostedZone!,
        recordName: props.apiDomainName,
      });
    }
  }
}