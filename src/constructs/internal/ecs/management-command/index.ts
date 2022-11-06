import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import {
  LogDriver,
  Cluster,
  ContainerImage,
  FargateTaskDefinition,
} from 'aws-cdk-lib/aws-ecs';
import { Role } from 'aws-cdk-lib/aws-iam';
import {
  LogGroup,
  LogStream,
  RetentionDays,
} from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';


export interface ManagementCommandTaskProps {
  readonly cluster: Cluster;
  readonly vpc: IVpc;
  readonly cpu?: number;
  readonly memorySize?: number;
  readonly appSecurityGroup: ISecurityGroup;
  readonly image: ContainerImage;
  readonly command: string[];
  readonly containerName: string;
  readonly taskRole: Role;
  readonly executionRole: Role;
  readonly family: string;
  readonly environmentVariables: { [key: string]: string };
};

export class ManagementCommandTask extends Construct {

  /**
   * Script to invoke run-task and send task logs to standard output
   */
  public executionScript: string;

  constructor(scope: Construct, id: string, props: ManagementCommandTaskProps) {
    super(scope, id);

    const stackName = Stack.of(this).stackName;

    // define log group and logstream
    const logGroupName = `/ecs/${stackName}/${props.containerName}/`;
    const streamPrefix = props.containerName;
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
      command: props.command,
      containerName: props.containerName,
      environment: props.environmentVariables,
      essential: true,
      logging: LogDriver.awsLogs({
        streamPrefix,
        logGroup,
      }),
      hostname: props.containerName,
    });

    // this script is called once on initial setup from GitHub Actions
    const executionScript = `
START_TIME=$(date +%s000)

TASK_ID=$(aws ecs run-task --cluster ${props.cluster.clusterArn} --task-definition ${taskDefinition.taskDefinitionArn} --network-configuration "awsvpcConfiguration={subnets=[${props.vpc.privateSubnets.map(x=>{x.subnetId;}).join(',')}],securityGroups=[${props.appSecurityGroup}],assignPublicIp=ENABLED}" | jq -r '.tasks[0].taskArn')

aws ecs wait tasks-stopped --tasks $TASK_ID --cluster ${props.cluster.clusterArn}

END_TIME=$(date +%s000)

aws logs get-log-events --log-group-name ${logGroupName} --log-stream-name ${streamPrefix}/${props.containerName}/\${TASK_ID##*/} --start-time $START_TIME --end-time $END_TIME | jq -r '.events[].message'
    `;

    this.executionScript = executionScript;

  }
}