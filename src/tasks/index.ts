// import * as ec2 from '@aws-cdk/aws-ec2';
import { ISecurityGroup } from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as cdk from '@aws-cdk/core';

export interface managementCommandTaskProps {
  /**
   * Options to configure a Django Management Command Task
   */
  readonly command: string[];
  readonly bucketName?: string[];
  readonly appSecurityGroup: ISecurityGroup;
  readonly image: ecs.ContainerImage;
}

export class managementCommandTask extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: managementCommandTaskProps) {
    super(scope, id);


    const taskDefinition = new ecs.TaskDefinition(scope, `TaskDefinitionFor${id}`, {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });

    taskDefinition.addContainer(`TaskContainer${id}`, {
      image: props.image,
      command: props.command,
    });
  }
}