import { Port, SecurityGroup, SubnetType, IVpc } from 'aws-cdk-lib/aws-ec2';
import { CfnCacheCluster, CfnSubnetGroup } from 'aws-cdk-lib/aws-elasticache';
import * as cdk from 'aws-cdk-lib/core';

export interface ElastiCacheRedisProps {
  vpc: IVpc;
  appSecurityGroup: SecurityGroup;
}

export class ElastiCacheCluster extends cdk.Construct {
  readonly elastiCacheCluster: CfnCacheCluster;
  readonly elastiCacheClusterSecurityGroup: SecurityGroup;
  constructor(scope: cdk.Construct, id: string, props: ElastiCacheRedisProps) {
    super(scope, id);

    const elastiCacheClusterSecurityGroup = new SecurityGroup(scope, 'ElastiCacheSecurityGroup', {
      vpc: props.vpc,
      description: 'ElastiCache Security Group',
    });
    this.elastiCacheClusterSecurityGroup = elastiCacheClusterSecurityGroup;

    const elastiCacheClusterSubnetGroup = new CfnSubnetGroup(scope, 'ElastiCacheRedisSubnetGroup', {
      subnetIds: props.vpc.selectSubnets({
        subnetType: SubnetType.ISOLATED,
      }).subnetIds,
      description: 'ElastiCache Subnet Group',
    });

    this.elastiCacheCluster = new CfnCacheCluster(this, 'ElastiCacheCluster', {
      clusterName: `${id}-elstiCacheCluster`,
      cacheNodeType: 'cache.t2.micro',
      engine: 'redis',
      numCacheNodes: 1,
      vpcSecurityGroupIds: [elastiCacheClusterSecurityGroup.securityGroupId],
      cacheSubnetGroupName: elastiCacheClusterSubnetGroup.ref,
    });

    this.elastiCacheCluster.addDependsOn(elastiCacheClusterSubnetGroup);
    elastiCacheClusterSecurityGroup.connections.allowFrom(props.appSecurityGroup, Port.tcp(6379));
  }
}
