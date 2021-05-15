import * as cdk from '@aws-cdk/core';
import { DjangoCdk, DjangoCdkProps } from '../src/index';
import '@aws-cdk/assert/jest';

test('create app', () => {
  const env = {
    region: 'us-east-1',
    account: '12345678',
  };
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'MyStack', { env });

  const djangoCdkProps: DjangoCdkProps = {
    bucketName: 'my-bucket',
    imageDirectory: './test/test-app/backend',
    webCommand: ['gunicorn'],
  };
  new DjangoCdk(stack, 'TestDjangoCdkStack', djangoCdkProps);
  expect(stack).toHaveResource('AWS::S3::Bucket');
  expect(stack).toHaveResource('AWS::EC2::VPC');
  expect(stack).toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer');
});

test('create app with default bucket name', () => {
  const env = {
    region: 'us-east-1',
    account: '12345678',
  };
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'MyStack', { env });

  const djangoCdkProps: DjangoCdkProps = {
    imageDirectory: './test/test-app/backend',
    webCommand: ['gunicorn'],
  };
  new DjangoCdk(stack, 'TestDjangoCdkStack', djangoCdkProps);
  expect(stack).toHaveResource('AWS::S3::Bucket');
  expect(stack).toHaveResource('AWS::EC2::VPC');
});
