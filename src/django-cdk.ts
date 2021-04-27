import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as patterns from '@aws-cdk/aws-ecs-patterns';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
// import * as ecs from '@aws-cdk/aws-ecs';

export interface DjangoCdkProps {
  /**
   * Options to configure a Django CDK project
   */
  readonly bucketName?: string;
  readonly vpc?: ec2.IVpc;
}

export class DjangoCdk extends cdk.Construct {

  public staticFileBucket: s3.Bucket;
  public vpc: ec2.IVpc;

  constructor(scope: cdk.Construct, id: string, props? : DjangoCdkProps) {
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
    // const taskDefinition

    /**
     * ECS load-balanced fargate service
     */
    new patterns.ApplicationLoadBalancedFargateService(scope, 'AlbFargateService', {
      cluster, // taskDefinition
    });

    new cdk.CfnOutput(this, 'bucketName', { value: staticFilesBucket.bucketName! });
    this.staticFileBucket = staticFilesBucket;
  }
}
