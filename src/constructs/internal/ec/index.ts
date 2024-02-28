import { IVpc, Port, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { CfnSubnetGroup, CfnCacheCluster, CfnParameterGroup } from 'aws-cdk-lib/aws-elasticache';
import { Construct } from 'constructs';


interface ElastiCacheClusterProps {
  readonly vpc: IVpc;
  readonly appSecurityGroup: SecurityGroup;
  readonly instanceClass?: string;
  readonly instanceSize?: string;
}

export class ElastiCacheCluster extends Construct {
  // public rdsInstance: DatabaseInstance;
  private instanceClass: string;
  private instanceSize: string;
  public elastiCacheHost: string;


  constructor(scope: Construct, id: string, props: ElastiCacheClusterProps) {
    super(scope, id);

    // const stackName = Stack.of(this).stackName;

    // instance type from props
    this.instanceClass = props.instanceClass ?? 't4g';
    this.instanceSize = props.instanceSize ?? 'micro';

    const cacheNodeType = `cache.${this.instanceClass}.${this.instanceSize}`;

    // security group
    const elastiCacheSecurityGroup = new SecurityGroup(this, 'SecurityGroup', {
      vpc: props.vpc,
      description: 'Allow all outbound traffic',
      allowAllOutbound: true,
    });

    // elastiCacheSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(6379), 'ElastiCacheRedis');
    elastiCacheSecurityGroup.addIngressRule(props.appSecurityGroup, Port.tcp(6379), 'AppSecurityGroup');

    // ElastiCache subnet group
    const subnetGroup = new CfnSubnetGroup(this, 'SubnetGroup', {
      description: 'Subnet group for ElastiCache',
      subnetIds: props.vpc.selectSubnets({ subnetType: SubnetType.PRIVATE_WITH_EGRESS }).subnetIds,
    });

    // ElastiCache parameter group
    const elastiCacheParameterGroup = new CfnParameterGroup(this, 'ElastiCacheParameterGroup', {
      description: 'parameter group for elasticache cluster',
      cacheParameterGroupFamily: 'redis7',
      properties: {},
    });

    // ElastiCache cluster
    const cacheCluster = new CfnCacheCluster(this, 'CacheCluster', {
      cacheNodeType: cacheNodeType, // Node type for a single-node cluster
      engine: 'redis',
      engineVersion: '7.0',
      numCacheNodes: 1, // Single node
      cacheSubnetGroupName: subnetGroup.ref,
      cacheParameterGroupName: elastiCacheParameterGroup.ref,
      vpcSecurityGroupIds: [elastiCacheSecurityGroup.securityGroupId],
    });

    this.elastiCacheHost = cacheCluster.attrRedisEndpointAddress;

  }
}
