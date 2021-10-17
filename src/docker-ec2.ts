// import { readFileSync } from 'fs';
import * as ec2 from '@aws-cdk/aws-ec2';
// import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
// import * as iam from '@aws-cdk/aws-iam';
// import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

export interface DockerEc2Props {

  /**
   * Path to the Dockerfile
   */
  readonly imageDirectory: string;

  /**
   * The command used to run the API web service.
   */
  readonly webCommand?: string[];

  /*
   * Route 53 Zone Name, for example my-zone.com
   */
  readonly zoneName: string;

  /**
   * The domain name to use, such as example.my-zone.com
   */
  readonly domainName: string;

  readonly dbName?: string;
  readonly dbUser?: string;
  readonly dbPassword?: string;
  // readonly s3BucketName: string;
  readonly keyName: string;
  /**
   * Extra Environment Variables to set in the backend container
   */
  readonly environmentVariables?: { [key: string]: string };
}

export class DockerEc2 extends cdk.Construct {
  // public staticFileBucket: s3.Bucket;
  public vpc: ec2.IVpc;

  constructor(scope: cdk.Construct, id: string, props: DockerEc2Props) {
    super(scope, id);


    this.vpc = new ec2.Vpc(scope, 'Vpc', {
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
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
      ],
    });

    console.log(props);


  }
}