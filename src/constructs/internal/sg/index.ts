import { Stack, Tags } from 'aws-cdk-lib';
import { IVpc, Peer, Port, SecurityGroup, SubnetType, InterfaceVpcEndpoint, GatewayVpcEndpointAwsService } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface SecurityGroupResourcesProps {
  readonly vpc: IVpc;
}

export class SecurityGroupResources extends Construct {
  public readonly albSecurityGroup: SecurityGroup;
  public readonly appSecurityGroup: SecurityGroup;
  public readonly vpceSecurityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props: SecurityGroupResourcesProps) {
    super(scope, id);

    const stackName = Stack.of(this).stackName;

    // ALB Security Group
    this.albSecurityGroup = new SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: props.vpc,
      description: 'ALB security group',
      allowAllOutbound: true,
    });
    Tags.of(this.albSecurityGroup).add('Name', `${stackName}-alb-sg`);
    this.albSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80), 'Allow HTTP traffic from anywhere');
    this.albSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443), 'Allow HTTPS traffic from anywhere');

    // Application Security Group
    this.appSecurityGroup = new SecurityGroup(this, 'AppSecurityGroup', {
      vpc: props.vpc,
      description: 'Allows inbound access from the ALB only',
      allowAllOutbound: true,
    });
    Tags.of(this.appSecurityGroup).add('Name', `${stackName}-ecs-sg`);
    this.appSecurityGroup.addIngressRule(this.albSecurityGroup, Port.allTraffic(), 'Allow all traffic from ALB');

    // VPC Endpoint Security Group
    this.vpceSecurityGroup = new SecurityGroup(this, 'VpceSecurityGroup', {
      vpc: props.vpc,
      description: 'Security Group for VPC Endpoints',
      allowAllOutbound: true,
    });
    Tags.of(this.vpceSecurityGroup).add('Name', `${stackName}-vpce-sg`);
    this.appSecurityGroup.addIngressRule(this.vpceSecurityGroup, Port.tcp(443), 'Allow HTTPS from VPC Endpoint');
    this.vpceSecurityGroup.addIngressRule(this.appSecurityGroup, Port.tcp(443), 'Allow HTTPS to App');

    // VPC Endpoint - ECR API
    const ecrApiEndpoint = new InterfaceVpcEndpoint(this, 'EcrApiEndpoint', {
      vpc: props.vpc,
      service: {
        name: `com.amazonaws.${Stack.of(this).region}.ecr.api`,
        port: 443,
      },
      subnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [this.vpceSecurityGroup],
      privateDnsEnabled: true,
    });
    Tags.of(ecrApiEndpoint).add('Name', `${stackName}-vpce-ecr-api`);

    // VPC Endpoint - ECR DKR
    const ecrDkrEndpoint = new InterfaceVpcEndpoint(this, 'EcrDkrEndpoint', {
      vpc: props.vpc,
      service: {
        name: `com.amazonaws.${Stack.of(this).region}.ecr.dkr`,
        port: 443,
      },
      subnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [this.vpceSecurityGroup],
      privateDnsEnabled: true,
    });
    Tags.of(ecrDkrEndpoint).add('Name', `${stackName}-vpce-ecr-dkr`);

    // VPC Endpoint - S3
    const s3Endpoint = props.vpc.addGatewayEndpoint('S3Endpoint', {
      service: GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetType: SubnetType.PRIVATE_WITH_EGRESS }],
    });
    Tags.of(s3Endpoint).add('Name', `${stackName}-vpce-s3`);
  }
}