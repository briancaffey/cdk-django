import { Stack } from 'aws-cdk-lib';
import { InstanceClass, InstanceType, InstanceSize, IVpc, Peer, Port, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';


interface RdsInstanceProps {
  readonly vpc: IVpc;
  readonly appSecurityGroup: SecurityGroup;
  readonly dbSecretName: string;
}

export class RdsInstance extends Construct {
  public rdsInstance: DatabaseInstance;
  constructor(scope: Construct, id: string, props: RdsInstanceProps) {
    super(scope, id);

    const stackName = Stack.of(this).stackName;

    const secret = new Secret(scope, 'dbSecret', {
      secretName: props.dbSecretName,
      description: 'secret for rds',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
      },
    });

    const rdsSecurityGroup = new SecurityGroup(this, 'RdsSecurityGroup', {
      vpc: props.vpc,
      securityGroupName: `${stackName}RdsSecurityGroup`,
    });

    rdsSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(5432), 'RDS');
    rdsSecurityGroup.addIngressRule(props.appSecurityGroup, Port.tcp(5432), 'AppSecurityGroup');

    const rdsInstance = new DatabaseInstance(this, 'RdsInstance', {
      vpc: props.vpc,
      engine: DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_13_4 }),
      credentials: Credentials.fromSecret(secret),
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      port: 5432,
      securityGroups: [rdsSecurityGroup],
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_WITH_NAT,
      },
    });
    this.rdsInstance = rdsInstance;
  }
}