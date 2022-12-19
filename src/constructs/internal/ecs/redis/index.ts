import { Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import {
  LogDriver,
  Cluster,
  ContainerImage,
  FargateService,
  FargateTaskDefinition,
} from 'aws-cdk-lib/aws-ecs';
import { Role } from 'aws-cdk-lib/aws-iam';
import {
  LogGroup,
  LogStream,
  RetentionDays,
} from 'aws-cdk-lib/aws-logs';
import { DnsRecordType, PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';


export interface RedisProps {
  readonly cluster: Cluster;
  readonly vpc: IVpc;
  readonly cpu?: number;
  readonly memorySize?: number;
  readonly appSecurityGroup: ISecurityGroup;
  readonly image: ContainerImage;
  readonly useSpot?: boolean;
  readonly containerName: string;
  readonly taskRole: Role;
  readonly executionRole: Role;
  readonly family: string;
  readonly environmentVariables: { [key: string]: string };
  readonly serviceDiscoveryNamespace: PrivateDnsNamespace;
};

export class RedisService extends Construct {
  constructor(scope: Construct, id: string, props: RedisProps) {
    super(scope, id);

    const stackName = Stack.of(this).stackName;

    // define log group and logstream
    const logGroupName = `/ecs/${stackName}/${props.containerName}/`;
    const streamPrefix = props.containerName;

    // define log group and logstream
    const logGroup = new LogGroup(this, 'LogGroup', {
      logGroupName,
      retention: RetentionDays.ONE_DAY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new LogStream(this, 'LogStream', {
      logGroup,
      logStreamName: props.containerName,
    });

    // task definition
    const taskDefinition = new FargateTaskDefinition(this, 'TaskDefinition', {
      cpu: props.cpu ?? 256,
      executionRole: props.executionRole,
      taskRole: props.taskRole,
      family: props.family,
    });

    taskDefinition.addContainer(props.containerName, {
      image: props.image,
      containerName: props.containerName,
      environment: props.environmentVariables,
      essential: true,
      logging: LogDriver.awsLogs({
        streamPrefix,
        logGroup,
      }),
    });

    const useSpot = props.useSpot ?? false;


    // TODO: add service discovery service
    const cloudMapService = props.serviceDiscoveryNamespace.createService('Service', {
      name: `${stackName}-redis`,
      dnsRecordType: DnsRecordType.A,
      dnsTtl: Duration.seconds(30),
    });

    const fargateService = new FargateService(this, 'Service', {
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
      serviceName: `${stackName}-${props.containerName}`,
      vpcSubnets: {
        subnets: props.vpc.privateSubnets,
      },
    });

    fargateService.associateCloudMapService({ service: cloudMapService });
  }
}