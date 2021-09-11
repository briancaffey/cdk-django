import * as cdk from '@aws-cdk/core';
import { StaticSite } from '../index';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};

const app = new cdk.App();
const stack = new cdk.Stack(app, 'StaticSiteStack', { env });

const construct = new StaticSite(stack, 'StaticSiteSample', {
  domainName: process.env.DOMAIN_NAME || 'app.domain.com',
  pathToDist: 'test/django-step-by-step/quasar-app/dist/pwa',
  zoneName: process.env.ZONE_NAME || 'domain.com',
});

/**
 * Add tagging for this construct and all child constructs
 */
cdk.Tags.of(construct).add('stack', 'StaticSiteStack');
