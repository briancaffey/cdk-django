import * as cdk from '@aws-cdk/core';
import { DjangoEcs } from '../index';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};

const app = new cdk.App();
const stack = new cdk.Stack(app, 'DjangoEcsStack', { env });

const construct = new DjangoEcs(stack, 'DjangoEcsSample', {
  imageDirectory: './test/django-step-by-step/backend',
  webCommand: [
    './scripts/start_prod.sh',
  ],
  useCeleryBeat: true,
  apiDomainName: process.env.API_DOMAIN_NAME,
  zoneName: process.env.ZONE_NAME,
  useEcsExec: true,
  frontendUrl: process.env.FRONTEND_URL,

  // certificateArn: process.env.CERTIFICATE_ARN,
});

/**
 * Add tagging for this construct and all child constructs
 */
cdk.Tags.of(construct).add('stack', 'DjangoEcsStack');
