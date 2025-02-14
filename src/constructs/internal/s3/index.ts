import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface S3ResourcesProps {
  bucketName: string;
  forceDestroy: boolean;
  publicReadAccess?: boolean;
}

export class S3Resources extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly bucketName: string;

  constructor(scope: Construct, id: string, props: S3ResourcesProps) {
    super(scope, id);

    const blockPublicAccess = props.publicReadAccess
      ? s3.BlockPublicAccess.BLOCK_ACLS
      : s3.BlockPublicAccess.BLOCK_ALL;

    this.bucket = new s3.Bucket(this, 'S3Bucket', {
      bucketName: props.bucketName,
      removalPolicy: props.forceDestroy ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: props.forceDestroy,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: blockPublicAccess,
    });

    this.bucketName = this.bucket.bucketName;
  }
}
