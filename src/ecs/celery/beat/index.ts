import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as logs from '@aws-cdk/aws-logs';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';

export interface CeleryBeatProps {
  readonly image: ecs.ContainerImage;
  readonly command: string[];
  readonly environment: { [key: string]: string };
  readonly cluster: ecs.ICluster;
  readonly securityGroups: ec2.ISecurityGroup[];
  readonly dbSecret: secretsmanager.ISecret;
}

export class CeleryBeat extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: CeleryBeatProps) {
    super(scope, id);


    const taskDefinition = new ecs.TaskDefinition(scope, `TaskDefinitionFor${id}`, {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });

    props.dbSecret.grantRead(taskDefinition.taskRole);

    taskDefinition.addContainer(`TaskContainerFor${id}`, {
      image: props.image,
      // TODO: figure out what the best practice is here
      // running as the `app` user results in permissions error
      user: 'root',
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
      // only run one instance of celery beat
      desiredCount: 1,
      securityGroups: props.securityGroups,
    });
  }
}