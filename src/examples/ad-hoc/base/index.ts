import { App, Stack, Tags } from 'aws-cdk-lib';
import { AdHocApp } from '../../../constructs/ad-hoc/app';
// import { IListenerCertificate } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { AdHocBase } from '../../../constructs/ad-hoc/base';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};

// https://docs.aws.amazon.com/cdk/v2/guide/stack_how_to_create_multiple_stacks.html
const app = new App();

const baseStack = new Stack(app, 'TestAdHocBaseStack', { env, stackName: 'test-ad-hoc-base' });

const appStack = new Stack(app, 'TestAdHocAppStack', { env, stackName: 'test-ad-hoc-app' });

appStack.addDependency(baseStack);

let certArn = process.env.CERTIFICATE_ARN || 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012';

const adHocBase = new AdHocBase(baseStack, 'AdHocBase', {
  certificateArn: certArn,
  domainName: process.env.DOMAIN_NAME || 'example.com',
});

const addHocApp = new AdHocApp(appStack, 'AdHocApp', {
  baseStackName: 'test-ad-hoc-base',
  vpc: adHocBase.vpc,
  alb: adHocBase.alb,
  appSecurityGroup: adHocBase.appSecurityGroup,
  taskRole: adHocBase.taskRole,
  executionRole: adHocBase.executionRole,
  serviceDiscoveryNamespace: adHocBase.serviceDiscoveryNamespace,
  rdsInstance: adHocBase.databaseInstance,
  assetsBucket: adHocBase.assetsBucket,
  domainName: adHocBase.domainName,
  listener: adHocBase.listener,

  djangoSettingsModule: process.env.DJANGO_SETTINGS_MODULE || 'backend.settings.production',
  backendVersion: process.env.BACKEND_VERSION || 'latest',
  frontendVersion: process.env.FRONTEND_VERSION || 'latest',
});

/**
 * Add tagging for this construct and all child constructs
 */
Tags.of(adHocBase).add('stack', 'AdHocBaseStack');

Tags.of(addHocApp).add('stack', 'AdHocAppStack');