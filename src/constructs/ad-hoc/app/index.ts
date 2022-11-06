import { CfnOutput, Stack } from 'aws-cdk-lib';
import { IVpc, ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Cluster, EcrImage } from 'aws-cdk-lib/aws-ecs';
import { IApplicationLoadBalancer, ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';
// import { HighestPriorityRule } from '../../internal/customResources/highestPriorityRule';
import { EcsRoles } from '../../internal/ecs/iam';
import { ManagementCommandTask } from '../../internal/ecs/management-command';
import { WebService } from '../../internal/ecs/web';

export interface AdHocAppProps {
  readonly baseStackName: string;
  readonly vpc: IVpc;
  readonly alb: IApplicationLoadBalancer;
  readonly appSecurityGroup: ISecurityGroup;
  readonly serviceDiscoveryNamespace: PrivateDnsNamespace;
  readonly rdsInstance: DatabaseInstance;
  readonly assetsBucket: Bucket;
  readonly domainName: string;
  readonly listener: ApplicationListener;

  // application specific props
  readonly backendVersion: string;
  readonly frontendVersion: string;
  readonly djangoSettingsModule?: string;
}

export class AdHocApp extends Construct {

  constructor(scope: Construct, id: string, props: AdHocAppProps) {
    super(scope, id);

    const stackName = Stack.of(this).stackName;
    // const awsAccountId = Stack.of(this).account;
    // const awsRegion = Stack.of(this).region;

    // custom resource to get the highest available listener rule priority
    // then take the next two highest priorities and use them for the frontend and backend listener rule priorities
    // https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/custom-resource/index.ts

    // const highestPriorityRule = new HighestPriorityRule(this, 'HighestPriorityRule', { listener: props.listener });

    const backendEcrRepo = Repository.fromRepositoryName(this, 'BackendRepo', 'backend');
    const backendImage = new EcrImage(backendEcrRepo, props.backendVersion);

    const frontendEcrRepo = Repository.fromRepositoryName(this, 'FrontendRepo', 'frontend');
    const frontendVersion = props.frontendVersion ?? 'latest';
    const frontendImage = new EcrImage(frontendEcrRepo, frontendVersion);

    const cluster = new Cluster(this, 'Cluster', {
      vpc: props.vpc,
    });

    const serviceDiscoveryNamespace = props.serviceDiscoveryNamespace.namespaceName;
    // shared environment variables
    const environmentVariables: { [key: string]: string }= {
      S3_BUCKET_NAME: props.assetsBucket.bucketName,
      REDIS_SERVICE_HOST: `${stackName}-redis.${serviceDiscoveryNamespace}`,
      POSTGRES_SERVICE_HOST: props.rdsInstance.dbInstanceEndpointAddress,
      POSTGRES_NAME: `${stackName}-db`,
      DJANGO_SETTINGS_MODULE: props.djangoSettingsModule ?? 'backend.settings.production',
      FRONTEND_URL: `https://${stackName}.${props.domainName}`,
      DOMAIN_NAME: props.domainName,
    };

    // define ecsTaskRole and taskExecutionRole for ECS
    const ecsRoles = new EcsRoles(scope, 'EcsRoles');

    // api service
    // const backendService =
    new WebService(this, 'ApiService', {
      cluster,
      environmentVariables,
      vpc: props.vpc,
      appSecurityGroup: props.appSecurityGroup,
      taskRole: ecsRoles.ecsTaskRole,
      executionRole: ecsRoles.taskExecutionRole,
      image: backendImage,
      listener: props.listener,
      command: ['gunicorn', '-t', '1000', '-b', '0.0.0.0:8000', '--log-level', 'info', 'backend.wsgi'],
      containerName: 'api',
      family: 'api',
      port: 8000,
      domainName: props.domainName,
      pathPatterns: ['/api/*', '/admin/*', '/mtv/*', '/graphql/*'],
      hostHeaders: ['*'],
      priority: 2, //highestPriorityRule.priority + 1,
      healthCheckPath: '/api/health-check/',
    });

    // frontend service
    // const frontendService =
    new WebService(this, 'FrontendService', {
      cluster,
      environmentVariables: {},
      vpc: props.vpc,
      appSecurityGroup: props.appSecurityGroup,
      taskRole: ecsRoles.ecsTaskRole,
      executionRole: ecsRoles.taskExecutionRole,
      image: frontendImage,
      listener: props.listener,
      command: ['nginx', '-g', 'daemon off;'],
      containerName: 'frontend',
      family: 'frontend',
      port: 80,
      domainName: props.domainName,
      pathPatterns: ['/*'],
      hostHeaders: ['*'],
      priority: 3, // highestPriorityRule.priority + 2,
      healthCheckPath: '/',
    });

    // worker service

    // scheduler service

    // management command task definition
    const backendUpdateTask = new ManagementCommandTask(this, 'BackendUpdateTask', {
      cluster,
      environmentVariables,
      vpc: props.vpc,
      appSecurityGroup: props.appSecurityGroup,
      taskRole: ecsRoles.ecsTaskRole,
      executionRole: ecsRoles.taskExecutionRole,
      image: backendImage,
      command: ['python', 'manage.py', 'backend_update'],
      containerName: 'backendUpdate',
      family: 'backendUpdate',
    });

    // define stack output use for running the management command
    new CfnOutput(this, 'backendUpdateCommand', { value: backendUpdateTask.executionScript });
  }
}
