import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

/**
 * Properties for the S3 bucket.
 */
export interface S3BucketProps {
  /**
   * The name of the S3 bucket.
   */
  readonly bucketName?: string;
}

/**
 * Construct that configures an S3 bucket.
 *
 * Use this construct when you want to host Django media files
 * in S3 but you are not using AWS for hosting your main Django app.
 */
export class S3BucketResources extends cdk.Construct {

  public bucketName?: string;

  constructor(scope: cdk.Construct, id: string, props: S3BucketProps) {
    super(scope, id);

    // bucket to be used for storing media files
    const bucket = new s3.Bucket(scope, 'S3Bucket', {
      bucketName: props.bucketName ?? `media-storage-${id.toLocaleLowerCase()}`,
    });

    const user = new iam.User(scope, 'S3BucketUser');

    bucket.grantReadWrite(user);

    // bucket.grantReadWrite(user) essentially does the following:

    // const bucketPolicyStatement = new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   actions: [
    //     "s3:PutObject",
    //     "s3:GetObjectAcl",
    //     "s3:GetObject",
    //     "s3:ListBucket",
    //     "s3:DeleteObject",
    //     "s3:PutObjectAcl"
    //   ],
    //   resources: [
    //     bucket.bucketArn + "/*",
    //     bucket.bucketArn,
    //   ],
    // });

    // user.addToPolicy(bucketPolicyStatement);

    // the name of the S3 bucket
    new cdk.CfnOutput(scope, 'S3BucketNameOutput', {
      value: bucket.bucketName,
    });

    // the name of the IAM user that will be used to access the bucket
    new cdk.CfnOutput(scope, 'S3BucketUserNameOuput', {
      value: user.userName,
    });
  }
}
