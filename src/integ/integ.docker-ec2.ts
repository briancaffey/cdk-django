import * as cdk from '@aws-cdk/core';
import { DockerEc2 } from '../index';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};

const app = new cdk.App();
const stack = new cdk.Stack(app, 'DjangoEcsStack', { env });

const construct = new DockerEc2(stack, 'DjangoEcsSample', {
  imageDirectory: './test/django-step-by-step/backend',
  webCommand: [
    './scripts/start_prod.sh',
  ],
  // s3BucketName: process.env.S3_BUCKET_NAME!,
  domainName: process.env.HOSTNAME!,
  keyName: process.env.KEY_NAME!,
  zoneName: process.env.ZONE_NAME!,
  environmentVariables: { FOO_ENV_VAR: 'foo-env-var' },

  // certificateArn: process.env.CERTIFICATE_ARN,
});

/**
 * Add tagging for this construct and all child constructs
 */
cdk.Tags.of(construct).add('stack', 'DockerEc2Stack');
