import * as cdk from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { InstanceType, IVpc, Peer, Port, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';


interface RdsInstanceProps {
  readonly vpc: IVpc;
  readonly appSecurityGroup: SecurityGroup;
  readonly dbSecretName: string;
  readonly instanceClass?: string;
  readonly instanceSize?: string;
}

export class RdsInstance extends Construct {
  public rdsInstance: DatabaseInstance;
  public rdsPasswordSecretName: string;
  private instanceClass: string;
  private instanceSize: string;


  constructor(scope: Construct, id: string, props: RdsInstanceProps) {
    super(scope, id);

    const stackName = Stack.of(this).stackName;

    // set instance type from props
    this.instanceClass = props.instanceClass ?? 't3';
    this.instanceSize = props.instanceSize ?? 'micro';
    const instanceType = new InstanceType(`${this.instanceClass}.${this.instanceSize}`);


    const secret = new Secret(scope, 'dbSecret', {
      secretName: `${stackName}/rds-postgres-password`,
      description: 'secret for rds',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      generateSecretString: {
        // secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        // generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
      },
    });
    this.rdsPasswordSecretName = secret.secretName;

    const rdsSecurityGroup = new SecurityGroup(this, 'RdsSecurityGroup', {
      vpc: props.vpc,
      securityGroupName: `${stackName}RdsSecurityGroup`,
    });

    rdsSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(5432), 'RDS');
    rdsSecurityGroup.addIngressRule(props.appSecurityGroup, Port.tcp(5432), 'AppSecurityGroup');

    const rdsInstance = new DatabaseInstance(this, 'RdsInstance', {
      instanceIdentifier: `${stackName}RdsInstance`,
      vpc: props.vpc,
      engine: DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.of('17.2', '17') }),
      // credentials: Credentials.fromSecret(secret),
      credentials: { username: 'postgres', password: secret.secretValue },
      instanceType,
      port: 5432,
      securityGroups: [rdsSecurityGroup],
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
    });
    this.rdsInstance = rdsInstance;
  }
}