import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib/core';

export class ApplicationVpc extends cdk.Construct {
  public vpc: ec2.IVpc;
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);
    const vpc = new ec2.Vpc(scope, 'ApplicationVpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'application',
          subnetType: ec2.SubnetType.PRIVATE,
        },
        {
          cidrMask: 28,
          name: 'rds',
          subnetType: ec2.SubnetType.ISOLATED,
        },
      ],
    });
    this.vpc = vpc;
  }
}