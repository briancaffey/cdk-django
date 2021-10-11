import * as cdk from '@aws-cdk/core';
import { DjangoVue } from '../index';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};


const app = new cdk.App();
const stack = new cdk.Stack(app, 'DjangoVueStack', { env });

// no props needed on this construct
const construct = new DjangoVue(stack, 'DjangoVueSample', {
  domainName: process.env.FRONTEND_DOMAIN_NAME!,
  zoneName: process.env.ZONE_NAME!,
  certificateArn: process.env.CERTIFICATE_ARN!,
});

/**
 * Add tagging for this construct and all child constructs
 */
cdk.Tags.of(construct).add('stack', 'DjangoVueStack');
