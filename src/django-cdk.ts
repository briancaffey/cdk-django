import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as patterns from '@aws-cdk/aws-ecs-patterns';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { RdsPostgresInstance } from './database';
import { ApplicationVpc } from './vpc';


export interface DjangoCdkProps {
  /**
   * Options to configure a Django CDK project
   */
  readonly bucketName?: string;
  readonly vpc?: ec2.IVpc;
  readonly imageDirectory: string;
  readonly webCommand?: string[];

}


export class DjangoCdk extends cdk.Construct {

  public staticFileBucket: s3.Bucket;
  public vpc: ec2.IVpc;

  constructor(scope: cdk.Construct, id: string, props: DjangoCdkProps) {
    super(scope, id);

    /**
     * VPC must have public, private and isolated subnets
     *
     * If you don't provide a VPC, a new VPC will be created
     */
    if (!props.vpc) {
      const applicationVpc = new ApplicationVpc(scope, 'AppVpc');
      this.vpc = applicationVpc.vpc;
    } else {
      const vpc = props.vpc;
      this.vpc = vpc;
    }

    /**
     * static files bucket name is derived from the Construct id if not provided
     */
    const staticFilesBucket = new s3.Bucket(scope, 'StaticBucket', {
      bucketName: props?.bucketName,
    });
    this.staticFileBucket = staticFilesBucket;

    /**
     * ECS cluster
     */
    const cluster = new ecs.Cluster(scope, 'EcsCluster', { vpc: this.vpc });

    /**
     * task definition construct
     */
    const taskDefinition = new ecs.TaskDefinition(scope, 'TaskDefinition', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });

    const database = new RdsPostgresInstance(scope, 'RdsPostgresInstance', { vpc: this.vpc });

    const environment: { [key: string]: string } = {
      AWS_STORAGE_BUCKET_NAME: staticFilesBucket.bucketName,
      POSTGRES_SERVICE_HOST: database.rdsPostgresInstance.dbInstanceEndpointAddress,
    };

    const container = taskDefinition.addContainer('backendContainer', {
      image: new ecs.AssetImage(props.imageDirectory),
      environment,
      command: props.webCommand,
    });

    container.addPortMappings({
      containerPort: 80,
      protocol: ecs.Protocol.TCP,
    });

    /**
     * A security group in the VPC for our application (ECS Fargate services and tasks)
     * Allow the application services to access the RDS security group
     */
    const appSecurityGroup = new ec2.SecurityGroup(scope, 'appSecurityGroup', {
      vpc: this.vpc,
    });

    /**
     * ECS load-balanced fargate service
     */
    const albfs = new patterns.ApplicationLoadBalancedFargateService(scope, 'AlbFargateService', {
      cluster,
      taskDefinition,
      securityGroups: [appSecurityGroup],
    });

    /**
     * Allows the app security group to communicate with the database security group
     */
    database.rdsSecurityGroup.addIngressRule(appSecurityGroup, ec2.Port.tcp(5432));

    /**
     * Grant the task defintion read-write access to static files bucket
     */
    staticFilesBucket.grantReadWrite(albfs.taskDefinition.taskRole);

    new cdk.CfnOutput(this, 'bucketName', { value: staticFilesBucket.bucketName! });
    new cdk.CfnOutput(this, 'apiUrl', { value: albfs.loadBalancer.loadBalancerFullName });

  }
}
