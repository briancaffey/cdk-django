import { Stack, Tags } from 'aws-cdk-lib';
import { IVpc, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';

import { Construct } from 'constructs';

export class ApplicationVpc extends Construct {
  public vpc: IVpc;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const stackName = Stack.of(this).stackName;
    const vpc = new Vpc(this, 'Vpc', {
      vpcName: `${stackName}-vpc`,
      maxAzs: 2,
      natGateways: 1,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });
    this.vpc = vpc;

    // having trouble making sure the VPC resources are getting tagged correctly
    Tags.of(vpc).add('env', Stack.of(this).stackName);
  }
}
