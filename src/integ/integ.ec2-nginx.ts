import * as cdk from 'aws-cdk-lib/core';
import { Ec2Nginx } from '../index';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};

const app = new cdk.App();
const stack = new cdk.Stack(app, 'Ec2NginxStack', { env });

const construct = new Ec2Nginx(stack, 'Ec2NginxSample', {
  gitRepoUrl: 'https://github.com/briancaffey/django-step-by-step.git',
  domainName: process.env.HOSTNAME!,
  zoneName: process.env.ZONE_NAME!,
  letsEncryptEmail: process.env.EMAIL_HOST_USER!,
  keyName: process.env.KEY_PAIR_NAME!,
  // environmentVariables: { FOO_ENV_VAR: 'foo-env-var' },
});

/**
 * Add tagging for this construct and all child constructs
 */
cdk.Tags.of(construct).add('stack', 'Ec2NginxStack');
