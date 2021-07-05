import { ISecurityGroup, IVpc } from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as iam from '@aws-cdk/aws-iam';
import * as logs from '@aws-cdk/aws-logs';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';

/**
 * Options to configure a Django Management Command Task
 */
export interface managementCommandTaskProps {

  readonly vpc: IVpc;
  readonly cluster: ecs.ICluster;
  /**
   * CDM passed to the Docker container
   */
  readonly command: string[];
  readonly bucketName?: string;
  readonly appSecurityGroup: ISecurityGroup;
  readonly image: ecs.ContainerImage;
  readonly environment: { [key: string]: string };
  readonly dbSecret: secretsmanager.ISecret;
  /**
   * Whether or not to run task on deployment using a custom resource
   */
  readonly run?: boolean;

}

/**
 * This construct allows you to define and optionally run a one-off command
 * each time the stack is created or updated. A Custom Resource is used to
 * invoke the AWS SDK to run a task if `run` is set to `true`.
 */
export class managementCommandTask extends cdk.Construct {

  public taskDefinition: ecs.TaskDefinition;

  constructor(scope: cdk.Construct, id: string, props: managementCommandTaskProps) {
    super(scope, id);


    const taskDefinition = new ecs.TaskDefinition(scope, `TaskDefinitionFor${id}`, {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });
    this.taskDefinition = taskDefinition;

    /**
     * Allow the task role to access the database
     */
    props.dbSecret.grantRead(taskDefinition.taskRole);

    /**
     * Add container to task
     */
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

    // run the task
    if (props.run ?? false) {

      // run the task in private subnets
      const subnets = props.vpc.privateSubnets.map(x => x.subnetId);

      // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ECS.html
      const awsSdkCall: cr.AwsSdkCall = {
        action: 'runTask',
        service: 'ECS',
        parameters: {
          cluster: props.cluster.clusterName,
          taskDefinition: taskDefinition.taskDefinitionArn,
          networkConfiguration: {
            awsvpcConfiguration: {
              subnets,
              assignPublicIp: 'ENABLED',
              securityGroups: [props.appSecurityGroup.securityGroupId],
            },
          },
          count: 1,
          launchType: 'FARGATE',
        },
        physicalResourceId: cr.PhysicalResourceId.of(id),
      };

      /**
       * Custom resource to run the ECS task using the awsSdkCall defined above
       *
       * Migrations are called when the stack is created or updated
       */
      new cr.AwsCustomResource(scope, 'CustomResourceDbMigration', {
        policy: cr.AwsCustomResourcePolicy.fromStatements([
          new iam.PolicyStatement({
            actions: ['iam:PassRole'],
            resources: [
              taskDefinition.executionRole?.roleArn!,
              taskDefinition.taskRole.roleArn,
            ],
          }),
          new iam.PolicyStatement({
            actions: ['ecs:RunTask'],
            resources: [taskDefinition.taskDefinitionArn],
          }),
        ]),
        onCreate: awsSdkCall,
        onUpdate: awsSdkCall,
      });
    };
  }
}