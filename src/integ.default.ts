import { Vpc } from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import { DjangoCdk } from './index';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};
const app = new cdk.App();
const stack = new cdk.Stack(app, 'MyStack', { env });
const vpc = new Vpc(stack, 'Vpc');

new DjangoCdk(stack, 'Cdk-Sample-Lib', {
  vpc,
  bucketName: 'my-django-cdk-static-files-bucket',
  imageDirectory: './test/backend',
  // webCommand: ['gunicorn'],
});
