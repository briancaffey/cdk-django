import * as cdk from 'aws-cdk-lib/core';
import { DockerEc2 } from '../index';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};

const app = new cdk.App();
const stack = new cdk.Stack(app, 'DockerEc2Stack', { env });

const construct = new DockerEc2(stack, 'DockerEc2Sample', {
  imageDirectory: './test/django-step-by-step/backend',
  frontendImageDirectory: './test/django-step-by-step',
  frontendImageDockerfile: 'nginx/prod/Dockerfile',
  // s3BucketName: process.env.S3_BUCKET_NAME!,
  domainName: process.env.HOSTNAME!,
  keyName: 'jbc-aws',
  zoneName: process.env.ZONE_NAME!,
  // environmentVariables: { FOO_ENV_VAR: 'foo-env-var' },
});

/**
 * Add tagging for this construct and all child constructs
 */
cdk.Tags.of(construct).add('stack', 'DockerEc2Stack');
