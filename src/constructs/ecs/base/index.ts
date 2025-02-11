import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { ApplicationListener, ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Bucket, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { AlbResources } from '../../internal/alb';
import { ElastiCacheCluster } from '../../internal/ec';
import { RdsInstance } from '../../internal/rds';
import { SecurityGroupResources } from '../../internal/sg';
import { ApplicationVpc } from '../../internal/vpc';

export interface EcsBaseProps {
  readonly certificateArn: string;
  readonly domainName: string;
}

export class EcsBase extends Construct {

  public vpc: IVpc;
  public alb: ApplicationLoadBalancer;
  public appSecurityGroup: SecurityGroup;
  public albSecurityGroup: SecurityGroup;
  public databaseInstance: DatabaseInstance;
  public assetsBucket: Bucket;
  public domainName: string;
  public listener: ApplicationListener;
  public elastiCacheHostname: string;
  public rdsPasswordSecretName: string;

  constructor(scope: Construct, id: string, props: EcsBaseProps) {
    super(scope, id);

    const stackName = Stack.of(this).stackName;
    this.domainName = props.domainName;

    const applicationVpc = new ApplicationVpc(scope, 'Vpc');
    this.vpc = applicationVpc.vpc;

    const assetsBucket = new Bucket(scope, 'AssetsBucket', {
      bucketName: `${props.domainName.replace('.', '-')}-${stackName}-assets-bucket`,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      autoDeleteObjects: true,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
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

    // TODO: rename to RdsResources
    const rdsInstance = new RdsInstance(this, 'RdsInstance', {
      vpc: this.vpc,
      appSecurityGroup: appSecurityGroup,
      dbSecretName: this.node.tryGetContext('config')?.dbSecretName ?? 'DB_SECRET_NAME',
    });
    this.databaseInstance = rdsInstance.rdsInstance;
    this.rdsPasswordSecretName = rdsInstance.rdsPasswordSecretName;

    // elasticache cluster
    const elastiCacheCluster = new ElastiCacheCluster(this, 'ElastiCacheCluster', {
      vpc: this.vpc,
      appSecurityGroup: appSecurityGroup,
    });

    // get the elasticache cluster hostname
    this.elastiCacheHostname = elastiCacheCluster.elastiCacheHost;

  }
}
