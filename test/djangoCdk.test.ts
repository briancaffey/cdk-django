import * as cdk from '@aws-cdk/core';
import { DjangoCdk } from '../src/index';
import '@aws-cdk/assert/jest';

test('create app', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app);
  new DjangoCdk(stack, 'TestDjangoCdkStack');
  expect(stack).toHaveResource('AWS::S3::Bucket');
});