// eslint-disable-next-line @typescript-eslint/no-require-imports
import cdk = require('aws-cdk-lib');
// import { IListenerCertificate } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { AdHocBase } from '../../../constructs/ad-hoc/base';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};

const app = new cdk.App();
const stack = new cdk.Stack(app, 'AdHocBaseStack', { env, stackName: 'test-ad-hoc-base' });

let certArn = process.env.CERTIFICATE_ARN || 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012';

const construct = new AdHocBase(stack, 'AdHocBase', {
  certificateArn: certArn,
});

/**
 * Add tagging for this construct and all child constructs
 */
cdk.Tags.of(construct).add('stack', 'AdHocBaseStack');
