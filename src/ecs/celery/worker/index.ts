import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as logs from '@aws-cdk/aws-logs';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';

export interface CeleryWorkerProps {
  readonly image: ecs.ContainerImage;
  readonly command: string[];
  readonly environment: { [key: string]: string };
  readonly cluster: ecs.ICluster;
  readonly securityGroups: ec2.ISecurityGroup[];
  readonly dbSecret: secretsmanager.ISecret;
}

export class CeleryWorker extends cdk.Construct {

  public taskDefinition: ecs.TaskDefinition;

  constructor(scope: cdk.Construct, id: string, props: CeleryWorkerProps) {
    super(scope, id);


    const taskDefinition = new ecs.TaskDefinition(scope, `TaskDefinitionFor${id}`, {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });

    /**
     * Allow the task definition's role to read the database secret
     */
    props.dbSecret.grantRead(taskDefinition.taskRole);

    taskDefinition.addContainer(`TaskContainerFor${id}`, {
      image: props.image,
      command: props.command,
      environment: props.environment,
      logging: ecs.LogDriver.awsLogs(
        {
          logRetention: logs.RetentionDays.ONE_DAY,
          streamPrefix: `${id}Container`,
        },
      ),
    });
    this.taskDefinition = taskDefinition;

    new ecs.FargateService(scope, `FargateService${id}`, {
      cluster: props.cluster,
      taskDefinition,
      desiredCount: 1,
      securityGroups: props.securityGroups,
    });

    // TODO: scaling options
  }
}