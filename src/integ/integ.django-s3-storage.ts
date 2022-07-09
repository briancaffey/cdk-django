import * as cdk from 'aws-cdk-lib/core';
import { S3BucketResources } from '../index';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};

const app = new cdk.App();
const stack = new cdk.Stack(app, 'S3BucketResourcesStack', { env });

const construct = new S3BucketResources(stack, 'S3BucketResourcesExample', {
  bucketName: 'my-django-s3-bucket-example',
});

/**
 * Add tagging for this construct and all child constructs
 */
cdk.Tags.of(construct).add('stack', 'S3BucketResourcesExample');
