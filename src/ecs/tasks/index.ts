// import * as ec2 from '@aws-cdk/aws-ec2';
import { ISecurityGroup } from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as logs from '@aws-cdk/aws-logs';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';

export interface managementCommandTaskProps {
  /**
   * Options to configure a Django Management Command Task
   */
  readonly command: string[];
  readonly bucketName?: string[];
  readonly appSecurityGroup: ISecurityGroup;
  readonly image: ecs.ContainerImage;
  readonly environment: { [key: string]: string };
  readonly dbSecret: secretsmanager.ISecret;
}

export class managementCommandTask extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: managementCommandTaskProps) {
    super(scope, id);


    const taskDefinition = new ecs.TaskDefinition(scope, `TaskDefinitionFor${id}`, {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });

    /**
     * Allow the task role to access the database
     */
    props.dbSecret.grantRead(taskDefinition.taskRole);

    taskDefinition.addContainer(`TaskContainer${id}`, {
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
  }
}