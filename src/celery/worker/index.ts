import * as ecs from '@aws-cdk/aws-ecs';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';

export interface CeleryWorkerProps {
  readonly image: ecs.ContainerImage;
  readonly command: string[];
  readonly environment: { [key: string]: string };
  readonly cluster: ecs.ICluster;
}

export class CeleryWorker extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: CeleryWorkerProps) {
    super(scope, id);


    const taskDefinition = new ecs.TaskDefinition(scope, `TaskDefinitionFor${id}`, {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });

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

    new ecs.FargateService(scope, `FargateService${id}`, {
      cluster: props.cluster,
      taskDefinition,
      desiredCount: 1,
    });

    // TODO: scaling options
  }
}