import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import { DjangoCdk } from '../src/index';
import '@aws-cdk/assert/jest';

test('create app', () => {
  const env = {
    region: 'us-east-1',
    account: '12345678',
  };
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'MyStack', { env });
  const vpc = new ec2.Vpc(stack, 'myVpc');
  new DjangoCdk(stack, 'TestDjangoCdkStack', { bucketName: 'my-bucket', vpc });
  expect(stack).toHaveResource('AWS::S3::Bucket');
  expect(stack).toHaveResource('AWS::EC2::VPC');
});

test('create app with default bucket name', () => {
  const env = {
    region: 'us-east-1',
    account: '12345678',
  };
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'MyStack', { env });
  const vpc = new ec2.Vpc(stack, 'myVpc');
  new DjangoCdk(stack, 'TestDjangoCdkStack', { vpc });
  expect(stack).toHaveResource('AWS::S3::Bucket');
  expect(stack).toHaveResource('AWS::EC2::VPC');
});
