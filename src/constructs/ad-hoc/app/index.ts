// import { Fn } from 'aws-cdk-lib/';
import { IVpc, ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { IApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Role } from 'aws-cdk-lib/aws-iam';
import { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';

export interface AdHocAppProps {
  readonly baseStackName: string;
  readonly vpc: IVpc;
  readonly alb: IApplicationLoadBalancer;
  readonly appSecurityGroup: ISecurityGroup;
  readonly taskRole: Role;
  readonly executionRole: Role;
  readonly serviceDiscoveryNamespace: PrivateDnsNamespace;
  readonly rdsInstance: DatabaseInstance;
}

export class AdHocApp extends Construct {

  // public vpc: IVpc;

  constructor(scope: Construct, id: string, props: AdHocAppProps) {
    super(scope, id);

    // const cluster =
    new Cluster(this, 'Cluster', {
      vpc: props.vpc,
    });


    // const base = props.baseStackName;

    // Get the VPC from the base Stack
    // const vpcId = Fn.importValue(`${base}-vpcId`);
    // const appSecurityGroup = Fn.importValue(`${base}-appSecurityGroup`);
    // const albSecurityGroup = Fn.importValue(`${base}-albSecurityGroup`);
    // const albListenerArn = Fn.importValue(`${base}-albListenerArn`);
    // const albDnsName = Fn.importValue(`${base}-albDnsName`);
    // const serviceDiscoveryNamespaceId = Fn.importValue(`${base}-serviceDiscoveryNamespaceId`);
    // const taskRoleArn = Fn.importValue(`${base}-taskRoleArn`);
    // const executionRoleArn = Fn.importValue(`${base}-executionRoleArn`);
    // const rdsAddress = Fn.importValue(`${base}-rdsAddress`);

    // const vpc = Vpc.fromLookup(this, 'Vpc', { vpcId });

  }
}
