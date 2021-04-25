import * as cdk from '@aws-cdk/core';
import { DjangoCdk } from './index';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'MyStack');

new DjangoCdk(stack, 'Cdk-Sample-Lib', {
  bucketName: 'my-django-cdk-static-files-bucket',
});
