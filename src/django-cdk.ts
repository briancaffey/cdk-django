import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as patterns from '@aws-cdk/aws-ecs-patterns';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

export interface DjangoCdkProps {
  /**
   * Options to configure a Django CDK project
   */
  readonly bucketName?: string;
  readonly vpc?: ec2.IVpc;
  readonly imageDirectory: string;
  readonly webCommand?: string[];

}


export class DjangoCdk extends cdk.Construct {

  public staticFileBucket: s3.Bucket;
  public vpc: ec2.IVpc;

  constructor(scope: cdk.Construct, id: string, props: DjangoCdkProps) {
    super(scope, id);

    /**
     * VPC must have public, private and isolated subnets
     */
    const vpc = props?.vpc ?? ec2.Vpc.fromLookup(this, 'DefaultVpc', {
      isDefault: true,
    });
    this.vpc = vpc;

    /**
     * static files bucket name is derived from the Construct id if not provided
     */
    const staticFilesBucket = new s3.Bucket(scope, 'StaticBucket', {
      bucketName: props?.bucketName,
    });

    /**
     * cluster
     */
    const cluster = new ecs.Cluster(scope, 'EcsCluster', { vpc });

    /**
     * task definition construct
     */
    const taskDefinition = new ecs.TaskDefinition(scope, 'TaskDefinition', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });

    const environment = {
      AWS_STORAGE_BUCKET_NAME: staticFilesBucket.bucketName,
    };

    const container = taskDefinition.addContainer('backendContainer', {
      image: new ecs.AssetImage(props.imageDirectory),
      environment,
      command: props.webCommand,
    });

    container.addPortMappings({
      containerPort: 80,
      protocol: ecs.Protocol.TCP,
    });

    /**
     * ECS load-balanced fargate service
     */
    const albfs = new patterns.ApplicationLoadBalancedFargateService(scope, 'AlbFargateService', {
      cluster,
      taskDefinition,
    });

    new cdk.CfnOutput(this, 'bucketName', { value: staticFilesBucket.bucketName! });
    new cdk.CfnOutput(this, 'apiUrl', { value: albfs.loadBalancer.loadBalancerFullName });

    this.staticFileBucket = staticFilesBucket;

  }
}
