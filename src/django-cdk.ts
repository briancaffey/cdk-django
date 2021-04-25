// import * as ec2 from '@aws-cdk/aws-ec2';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
// import * as ecs from '@aws-cdk/aws-ecs';

export interface DjangoCdkProps {
  /**
   * Options to configure a Django CDK project
   */
  readonly bucketName: string;
}

export class DjangoCdk extends cdk.Construct {

  public staticFileBucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props? : DjangoCdkProps) {
    super(scope, id);

    /**
     * static files bucket name is derived from the Construct id if not provided
     */
    const staticFilesBucket = new s3.Bucket(scope, 'StaticBucket', {
      bucketName: props?.bucketName && `${id}-static-files`,
    });

    new cdk.CfnOutput(this, 'bucketName', { value: staticFilesBucket.bucketName! });
    this.staticFileBucket = staticFilesBucket;
  }
}
