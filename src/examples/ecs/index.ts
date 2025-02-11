import * as fs from 'fs';
import { App, Stack, Tags } from 'aws-cdk-lib';
import { EcsApp } from '../../constructs/ecs/app';
import { EcsBase } from '../../constructs/ecs/base';

const ecsBaseEnvName = process.env.AD_HOC_BASE_NAME || 'dev';
const ecsAppEnvName = process.env.AD_HOC_APP_NAME || 'alpha';

// TODO: define interfaces for these config and type check them
var ecsBaseEnvConfig = JSON.parse(fs.readFileSync(`src/examples/ecs/config/${ecsBaseEnvName}.json`, 'utf8'));
var ecsAppEnvConfig = JSON.parse(fs.readFileSync(`src/examples/ecs/config/${ecsAppEnvName}.json`, 'utf8'));

// https://docs.aws.amazon.com/cdk/v2/guide/stack_how_to_create_multiple_stacks.html
const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const baseStack = new Stack(app, 'ExampleEcsBaseStack', { env, stackName: ecsBaseEnvName });
baseStack.node.setContext('config', ecsBaseEnvConfig);

const appStack = new Stack(app, 'ExampleEcsAppStack', { env, stackName: ecsAppEnvName });
appStack.node.setContext('config', ecsAppEnvConfig);

const certificateArn = process.env.CERTIFICATE_ARN || 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012';
const domainName = process.env.DOMAIN_NAME || 'example.com';

const ecsBase = new EcsBase(baseStack, 'EcsBase', { certificateArn, domainName });

const ecsApp = new EcsApp(appStack, 'EcsApp', {
  baseStackName: ecsBaseEnvName,
  vpc: ecsBase.vpc,
  alb: ecsBase.alb,
  appSecurityGroup: ecsBase.appSecurityGroup,
  rdsInstance: ecsBase.databaseInstance,
  assetsBucket: ecsBase.assetsBucket,
  domainName: ecsBase.domainName,
  listener: ecsBase.listener,
  elastiCacheHost: ecsBase.elastiCacheHostname,
});

/**
 * Add tagging for this construct and all child constructs
 */
Tags.of(ecsBase).add('env', ecsBaseEnvName);
Tags.of(ecsApp).add('env', ecsAppEnvName);