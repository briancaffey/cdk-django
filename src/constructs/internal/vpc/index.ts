import { IVpc, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';

import { Construct } from 'constructs';

export class ApplicationVpc extends Construct {
  public vpc: IVpc;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const vpc = new Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'application',
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
      ],
    });
    this.vpc = vpc;
  }
}
