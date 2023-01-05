import { Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import {
  LogDriver,
  Cluster,
  ContainerImage,
  FargateService,
  FargateTaskDefinition,
} from 'aws-cdk-lib/aws-ecs';
import {
  ApplicationListener,
  ApplicationListenerRule,
  ApplicationProtocol,
  ApplicationTargetGroup,
  ListenerAction,
  ListenerCondition,
  TargetType,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Role } from 'aws-cdk-lib/aws-iam';
import {
  LogGroup,
  LogStream,
  RetentionDays,
} from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';


export interface WebProps {
  readonly name: string;
  readonly cluster: Cluster;
  readonly vpc: IVpc;
  readonly listener: ApplicationListener;
  readonly cpu?: number;
  readonly memorySize?: number;
  readonly appSecurityGroup: ISecurityGroup;
  readonly image: ContainerImage;
  readonly command: string[];
  readonly useSpot?: boolean;
  readonly taskRole: Role;
  readonly executionRole: Role;
  readonly environmentVariables: { [key: string]: string };
  readonly domainName: string;
  readonly pathPatterns: string[];
  readonly port: number;
  readonly priority: number;
  readonly healthCheckPath: string;
};

export class WebService extends Construct {
  constructor(scope: Construct, id: string, props: WebProps) {
    super(scope, id);

    const stackName = Stack.of(this).stackName;

    // define log group and logstream
    const logGroupName = `/ecs/${stackName}/${props.name}/`;
    const streamPrefix = props.name;

    // define log group and logstream
    const logGroup = new LogGroup(this, 'LogGroup', {
      logGroupName,
      retention: RetentionDays.ONE_DAY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new LogStream(this, 'LogStream', {
      logGroup,
      logStreamName: props.name,
    });

    // task definition
    const taskDefinition = new FargateTaskDefinition(this, 'TaskDefinition', {
      cpu: props.cpu ?? 256,
      executionRole: props.executionRole,
      taskRole: props.taskRole,
      family: props.name,
    });

    taskDefinition.addContainer(props.name, {
      image: props.image,
      command: props.command,
      containerName: props.name,
      environment: props.environmentVariables,
      essential: true,
      logging: LogDriver.awsLogs({
        streamPrefix,
        logGroup,
      }),
      portMappings: [{
        containerPort: props.port,
        hostPort: props.port,
      }],
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
      serviceName: `${stackName}-${props.name}`,
      vpcSubnets: {
        subnets: props.vpc.privateSubnets,
      },
    });

    const targetGroup = new ApplicationTargetGroup(this, 'TargetGroup', {
      targetType: TargetType.IP,
      port: props.port,
      protocol: ApplicationProtocol.HTTP,
      deregistrationDelay: Duration.seconds(30),
      healthCheck: {
        path: props.healthCheckPath,
        interval: Duration.seconds(10),
        timeout: Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
      },
      vpc: props.vpc,
    });

    // const listenerRule =
    new ApplicationListenerRule(this, 'ListenerRule', {
      listener: props.listener,
      priority: props.priority,
      // targetGroups: [targetGroup],
      conditions: [
        ListenerCondition.pathPatterns(props.pathPatterns),
        ListenerCondition.hostHeaders([`${stackName}.${props.domainName}`]),
      ],
      action: ListenerAction.forward([targetGroup]),
    });

    service.attachToApplicationTargetGroup(targetGroup);

  }
}