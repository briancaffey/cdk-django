import { Duration /* RemovalPolicy */ } from 'aws-cdk-lib';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { AwsLogDriver, Cluster, ContainerImage, FargateService, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { ApplicationListener, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Role } from 'aws-cdk-lib/aws-iam';
// import { LogGroup, LogStream, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface WebProps {
  readonly cluster: Cluster;
  readonly vpc: IVpc;
  readonly listener: ApplicationListener;
  readonly cpu?: number;
  readonly memorySize?: number;
  readonly appSecurityGroup: ISecurityGroup;
  readonly image: ContainerImage;
  readonly command: string[];
  readonly useSpot?: boolean;
  readonly containerName: string;
  readonly taskRole: Role;
  readonly executionRole: Role;
  readonly family: string;
  readonly environmentVariables: { [key: string]: string };
  readonly domainName: string;
  readonly pathPatterns: string[];
  readonly hostHeaders: string[];
  readonly port: number;
};

export class WebService extends Construct {
  constructor(scope: Construct, id: string, props: WebProps) {
    super(scope, id);

    // Getting circular dependency error when using `FargateTaskDefinition`
    // https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-ecs.FargateService.html#example
    // const stackName = 'test'; // Stack.of(this).stackName;

    // // define log group and logstream
    // const logGroup = new LogGroup(this, 'LogGroup', {
    //   logGroupName: `/ecs/test/${props.containerName}`,
    //   retention: RetentionDays.ONE_DAY,
    //   removalPolicy: RemovalPolicy.DESTROY,
    // });

    // new LogStream(this, 'LogStream', {
    //   logGroup,
    //   logStreamName: 'web-logs',
    // });

    // const logDriver = new AwsLogDriver({ streamPrefix: 'web' });

    // task definition
    const taskDefinition = new FargateTaskDefinition(this, 'TaskDefinition', {
      cpu: props.cpu ?? 256,
      executionRole: props.executionRole,
      taskRole: props.taskRole,
      family: props.family,
    });

    taskDefinition.addContainer(props.containerName, {
      image: props.image,
      command: props.command,
      containerName: props.containerName,
      environment: props.environmentVariables,
      // essential: true,
      healthCheck: {
        command: ['curl', '-f', 'http://localhost:8000/api/health-check/'],
        interval: Duration.seconds(10),
        timeout: Duration.seconds(5),
        retries: 3,
      },
      // logging: logDriver,
      portMappings: [{
        containerPort: props.port,
        hostPort: props.port,
      }],
      hostname: `stackName-${props.containerName}`,
    });

    const useSpot = props.useSpot ?? false;

    const service = new FargateService(this, 'Service', {
      cluster: props.cluster,
      taskDefinition,
      assignPublicIp: true,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: useSpot ? 100 : 0,
        },
        {
          capacityProvider: 'FARGATE',
          weight: useSpot ? 0 : 100,
        },
      ],
      desiredCount: 1,
      enableExecuteCommand: true,
      securityGroups: [props.appSecurityGroup],
      serviceName: `stackName-${props.containerName}`,
      vpcSubnets: {
        subnets: props.vpc.privateSubnets,
      },
    });

    // add the service as a target to the HTTPS listener on the ALB
    props.listener.addTargets(`stackName-${props.containerName}`, {
      port: props.port,
      targets: [service],
      priority: 1,
      conditions: [
        ListenerCondition.pathPatterns(props.pathPatterns),
        ListenerCondition.hostHeaders([`stackName.${props.domainName}`]),
      ],
      deregistrationDelay: Duration.seconds(10),
      healthCheck: {
        interval: Duration.seconds(10),
        path: '/api/health-check/',
        timeout: Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
        port: 'traffic-port',
      },
    });
  }
}