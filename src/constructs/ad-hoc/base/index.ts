import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { ApplicationListener, ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';
import { AlbResources } from '../../internal/alb';
import { BastionHostResources } from '../../internal/bastion';
import { RdsInstance } from '../../internal/rds';
import { SecurityGroupResources } from '../../internal/sg';
import { ApplicationVpc } from '../../internal/vpc';

export interface AdHocBaseProps {
  readonly certificateArn: string;
  readonly domainName: string;
}

export class AdHocBase extends Construct {

  public vpc: IVpc;
  public alb: ApplicationLoadBalancer;
  public appSecurityGroup: SecurityGroup;
  public albSecurityGroup: SecurityGroup;
  public serviceDiscoveryNamespace: PrivateDnsNamespace;
  public databaseInstance: DatabaseInstance;
  public assetsBucket: Bucket;
  public domainName: string;
  public listener: ApplicationListener;

  constructor(scope: Construct, id: string, props: AdHocBaseProps) {
    super(scope, id);

    const stackName = Stack.of(this).stackName;
    this.domainName = props.domainName;

    const applicationVpc = new ApplicationVpc(scope, 'Vpc');
    this.vpc = applicationVpc.vpc;

    const assetsBucket = new Bucket(scope, 'AssetsBucket', {
      bucketName: `${props.domainName.replace('.', '-')}-${stackName}-assets-bucket`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    this.assetsBucket = assetsBucket;

    const { albSecurityGroup, appSecurityGroup } = new SecurityGroupResources(this, 'SecurityGroupResources', {
      vpc: this.vpc,
    });
    this.albSecurityGroup = albSecurityGroup;
    this.appSecurityGroup = appSecurityGroup;

    const { alb, listener } = new AlbResources(this, 'AlbResources', {
      albSecurityGroup,
      vpc: this.vpc,
      certificateArn: props.certificateArn,
    });
    this.alb = alb;
    this.listener = listener;

    const serviceDiscoveryPrivateDnsNamespace = new PrivateDnsNamespace(this, 'ServiceDiscoveryNamespace', {
      vpc: this.vpc,
      name: `${stackName}-sd-ns`,
    });
    this.serviceDiscoveryNamespace = serviceDiscoveryPrivateDnsNamespace;

    const rdsInstance = new RdsInstance(this, 'RdsInstance', {
      vpc: this.vpc,
      appSecurityGroup: appSecurityGroup,
      dbSecretName: this.node.tryGetContext('config')?.dbSecretName ?? 'DB_SECRET_NAME',
    });
    this.databaseInstance = rdsInstance.rdsInstance;
    const { dbInstanceEndpointAddress } = rdsInstance.rdsInstance;

    new BastionHostResources(this, 'BastionHostResources', {
      appSecurityGroup,
      vpc: this.vpc,
      rdsAddress: dbInstanceEndpointAddress,
      instanceClass: this.node.tryGetContext('config').instanceClass,
      // instanceType: this.node.tryGetContext('config').instanceType,
    });
  }
}
