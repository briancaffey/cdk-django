import * as cdk from '@aws-cdk/core';
import { StaticSite } from '../index';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};


class MyStaticSiteStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
    super(parent, name, props);

    const construct = new StaticSite(this, 'StaticSiteSample', {
      domainName: process.env.DOMAIN_NAME || 'app.domain.com',
      pathToDist: 'test/django-step-by-step/quasar-app/dist/pwa',
      zoneName: process.env.ZONE_NAME || 'domain.com',
    });

    /**
     * Add tagging for this construct and all child constructs
     */
    cdk.Tags.of(construct).add('stack', 'StaticSiteStack');
  }
}

const app = new cdk.App();

new MyStaticSiteStack(app, 'MyStaticSite', {
  /**
   * This is required for our use of hosted-zone lookup.
   *
   * Lookups do not work at all without an explicit environment
   * specified; to use them, you must specify env.
   * @see https://docs.aws.amazon.com/cdk/latest/guide/environments.html
   */
  env,
});

app.synth();