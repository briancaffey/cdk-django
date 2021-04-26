import * as cdk from '@aws-cdk/core';
import { DjangoCdk } from './index';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};
const app = new cdk.App();
const stack = new cdk.Stack(app, 'MyStack', { env });

new DjangoCdk(stack, 'Cdk-Sample-Lib', {
  bucketName: 'my-django-cdk-static-files-bucket',
});
