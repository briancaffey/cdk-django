// import { Stack } from 'aws-cdk-lib';
import { IVpc, Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';


interface SecurityGroupResourcesProps {
  readonly vpc: IVpc;
}

export class SecurityGroupResources extends Construct {
  // public rdsInstance: DatabaseInstance;
  public readonly albSecurityGroup: SecurityGroup;
  public readonly appSecurityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props: SecurityGroupResourcesProps) {
    super(scope, id);

    // security group for the ALB
    const albSecurityGroup = new SecurityGroup(scope, 'AlbSecurityGroup', {
      vpc: props.vpc,
    });
    this.albSecurityGroup = albSecurityGroup;

    // allow internet traffic from port 80 and 443 to the ALB for HTTP and HTTPS
    albSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443), 'HTTPS');
    albSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80), 'HTTP');

    // create application security group
    const appSecurityGroup = new SecurityGroup(scope, 'AppSecurityGroup', {
      vpc: props.vpc,
    });
    appSecurityGroup.connections.allowFrom(appSecurityGroup, Port.allTcp());

    this.appSecurityGroup = appSecurityGroup;

    // allow traffic from ALB security group to the application security group
    appSecurityGroup.addIngressRule(albSecurityGroup, Port.allTcp(), 'ALB');
  }
}