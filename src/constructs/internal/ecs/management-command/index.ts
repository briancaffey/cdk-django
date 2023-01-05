import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { ISecurityGroup, IVpc, SubnetType } from 'aws-cdk-lib/aws-ec2';
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
  readonly name: string;
  readonly taskRole: Role;
  readonly executionRole: Role;
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
    const logGroupName = `/ecs/${stackName}/${props.name}/`;
    const streamPrefix = props.name;
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
    });

    const privateSubnets = props.vpc.selectSubnets({ subnetType: SubnetType.PRIVATE_WITH_EGRESS }).subnets.map(s => s.subnetId).join(',');

    // this script is called once on initial setup from GitHub Actions
    const executionScript = `
START_TIME=$(date +%s000)

TASK_ID=$(aws ecs run-task --cluster ${props.cluster.clusterArn} --task-definition ${taskDefinition.taskDefinitionArn} --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[${privateSubnets}],securityGroups=[${props.appSecurityGroup.securityGroupId}],assignPublicIp=ENABLED}" | jq -r '.tasks[0].taskArn')

aws ecs wait tasks-stopped --tasks $TASK_ID --cluster ${props.cluster.clusterArn}

END_TIME=$(date +%s000)

aws logs get-log-events --log-group-name ${logGroupName} --log-stream-name ${streamPrefix}/${props.name}/\${TASK_ID##*/} --start-time $START_TIME --end-time $END_TIME | jq -r '.events[].message'
    `;

    this.executionScript = executionScript;

  }
}