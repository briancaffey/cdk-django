import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import * as cdk from '@aws-cdk/core';


export interface RdsPostgresInstanceProps {
  readonly vpc: ec2.IVpc;
}

export class RdsPostgresInstance extends cdk.Construct {

  public rdsPostgresInstance: rds.IDatabaseInstance;

  constructor(scope: cdk.Construct, id: string, props: RdsPostgresInstanceProps) {
    super(scope, id);


    const rdsPostgresInstance = new rds.DatabaseInstance(scope, 'RdsDatabaseInstance', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_13_1 }),
      vpc: props.vpc,
      vpcPlacement: { subnetType: ec2.SubnetType.ISOLATED },
    });
    this.rdsPostgresInstance = rdsPostgresInstance;
  }
}
