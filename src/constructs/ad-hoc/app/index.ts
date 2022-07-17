import { Stack } from 'aws-cdk-lib';
import { IVpc, ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Cluster, EcrImage } from 'aws-cdk-lib/aws-ecs';
import { IApplicationLoadBalancer, ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Role } from 'aws-cdk-lib/aws-iam';
import { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';
import { WebService } from '../../internal/ecs/web';

export interface AdHocAppProps {
  readonly baseStackName: string;
  readonly vpc: IVpc;
  readonly alb: IApplicationLoadBalancer;
  readonly appSecurityGroup: ISecurityGroup;
  readonly taskRole: Role;
  readonly executionRole: Role;
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

    // api service
    // const backendService =
    new WebService(this, 'ApiService', {
      cluster,
      environmentVariables,
      vpc: props.vpc,
      appSecurityGroup: props.appSecurityGroup,
      taskRole: props.taskRole,
      executionRole: props.executionRole,
      image: backendImage,
      listener: props.listener,
      command: ['gunicorn', '-t', '1000', '-b', '0.0.0.0:8000', '--log-level', 'info', 'backend.wsgi'],
      containerName: 'api',
      family: 'api',
      port: 8000,
      domainName: props.domainName,
      pathPatterns: ['/api/*', '/admin/*', '/mtv/*', '/graphql/*'],
      hostHeaders: ['*'],
    });


    // frontend service
    // const frontendService =
    new WebService(this, 'FrontendService', {
      cluster,
      environmentVariables: {},
      vpc: props.vpc,
      appSecurityGroup: props.appSecurityGroup,
      taskRole: props.taskRole,
      executionRole: props.executionRole,
      image: frontendImage,
      listener: props.listener,
      command: ['nginx', '-g', 'daemon off;'],
      containerName: 'frontend',
      family: 'frontend',
      port: 80,
      domainName: props.domainName,
      pathPatterns: ['/*'],
      hostHeaders: ['*'],
    });

    // ensure that the backend service listener rule has a higher priority than the frontend service listener rule
    // backendService.node.addDependency(frontendService);

    // worker service

    // scheduler service

    // management command task definition
  }
}
