import { CfnOutput, Duration, Stack } from 'aws-cdk-lib';
import { BastionHostLinux, CloudFormationInit, InitPackage, IVpc, Peer, Port, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import {
  ApplicationProtocol,
  ApplicationListener,
  ApplicationLoadBalancer,
  ApplicationTargetGroup,
  ListenerCertificate,
  TargetType,
  ListenerAction,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';
import { RdsInstance } from '../../internal/rds';
import { ApplicationVpc } from '../../internal/vpc';

// TODO: add props
export interface AdHocBaseProps {
  readonly certificateArn: string;
}

export class AdHocBase extends Construct {

  public vpc: IVpc;
  public alb: ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: AdHocBaseProps) {
    super(scope, id);

    // get the stack name
    const stackName = Stack.of(this).stackName;

    const vpc = new ApplicationVpc(scope, 'Vpc');
    this.vpc = vpc.vpc;

    // security group for the ALB
    const albSecurityGroup = new SecurityGroup(scope, 'AlbSecurityGroup', {
      vpc: this.vpc,
    });

    // allow internet traffic from port 80 and 443 to the ALB for HTTP and HTTPS
    albSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443), 'HTTPS');
    albSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80), 'HTTP');

    // create application security group
    const appSecurityGroup = new SecurityGroup(scope, 'AppSecurityGroup', {
      vpc: this.vpc,
    });

    // allow traffic from ALB security group to the application security group
    appSecurityGroup.addIngressRule(albSecurityGroup, Port.tcp(-1), 'ALB');

    // load balancer
    const loadBalancer = new ApplicationLoadBalancer(scope, 'LoadBalancer', {
      vpc: this.vpc,
      securityGroup: albSecurityGroup,
      internetFacing: true,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
    });
    this.alb = loadBalancer;

    // application target group
    // Target group with duration-based stickiness with load-balancer generated cookie
    // const defaultTargetGroup =
    new ApplicationTargetGroup(this, 'default-target-group', {
      targetType: TargetType.INSTANCE,
      port: 80,
      stickinessCookieDuration: Duration.minutes(5),
      vpc: this.vpc,
      healthCheck: {
        path: '/api/health-check/', // TODO parametrize this
        interval: Duration.minutes(5),
        timeout: Duration.minutes(2),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        port: '80', // TODO parametrize this
      },
    });

    // listener - HTTP
    // const httpListener =
    new ApplicationListener(this, 'http-listener', {
      loadBalancer: loadBalancer,
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      defaultAction: ListenerAction.redirect({
        protocol: ApplicationProtocol.HTTPS,
        port: '443',
        permanent: false,
      }),
    });

    // listener - HTTPS
    const httpsListener = new ApplicationListener(this, 'https-listener', {
      loadBalancer: loadBalancer,
      port: 443,
      protocol: ApplicationProtocol.HTTPS,
      certificates: [ListenerCertificate.fromArn(props.certificateArn)],
      defaultAction: ListenerAction.fixedResponse(200, {
        contentType: 'text/plain',
        messageBody: 'Fixed content response',
      }),
    });

    // Service Discovery namespace
    const serviceDiscoveryPrivateDnsNamespace = new PrivateDnsNamespace(this, 'ServiceDiscoveryNamespace', {
      vpc: this.vpc,
      // TODO: add stack name as part of the name
      name: 'sd-ns',
    });

    // IAM
    const ecsTaskRole = new Role(this, 'EcsTaskRole', {
      roleName: `${stackName}EcsTaskRole`,
      assumedBy: new ServicePrincipal('ecs.amazonaws.com'),
    });

    ecsTaskRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ecs:*',
        'ec2:*',
        'elasticloadbalancing:*',
        'ecr:*',
        'cloudwatch:*',
        's3:*',
        'rds:*',
        'logs:*',
        'elasticache:*',
        'secretsmanager:*',
      ],
      resources: ['*'],
    }));

    const taskExecutionRole = new Role(this, 'EcsTaskRole', {
      roleName: `${stackName}EcsTaskRole`,
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // S3
    taskExecutionRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:*'],
      resources: ['arn:aws:s3:::*', 'arn:aws:s3:::*/*'],
    }));

    // Secrets manager
    taskExecutionRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: ['*'],
    }));

    // EcsExec SSM
    taskExecutionRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ssmmessages:CreateControlChannel',
        'ssmmessages:CreateDataChannel',
        'ssmmessages:OpenControlChannel',
        'ssmmessages:OpenDataChannel',
      ],
      resources: ['*'],
    }));

    // RDS
    const rdsInstance = new RdsInstance(this, 'RdsInstance', {
      vpc: this.vpc,
      appSecurityGroup: appSecurityGroup,
      dbSecretName: 'DB_SECRET_NAME',
    });

    // Bastion host
    // https://github.com/aws/amazon-ssm-agent/issues/259#issuecomment-591850202
    new BastionHostLinux(this, 'BastionHost', {
      vpc: this.vpc,
      securityGroup: appSecurityGroup,
      init: CloudFormationInit.fromElements(
        InitPackage.yum('postgresql'),
      ),
    });

    // Outputs that will be used in ad hoc environments
    new CfnOutput(this, 'vpcId', { value: this.vpc.vpcId });
    new CfnOutput(this, 'privateSubnets', { value: this.vpc.privateSubnets.map(subnet => subnet.subnetId).join(',') });
    new CfnOutput(this, 'publicSubnets', { value: this.vpc.publicSubnets.map(subnet => subnet.subnetId).join(',') });
    new CfnOutput(this, 'appSecurityGroup', { value: appSecurityGroup.securityGroupId });
    new CfnOutput(this, 'albListenerArn', { value: httpsListener.listenerArn });
    new CfnOutput(this, 'albDnsName', { value: loadBalancer.loadBalancerDnsName });
    new CfnOutput(this, 'serviceDiscoveryNamespaceId', { value: serviceDiscoveryPrivateDnsNamespace.namespaceId });
    new CfnOutput(this, 'taskRoleArn', { value: ecsTaskRole.roleArn });
    new CfnOutput(this, 'executionRoleArn', { value: taskExecutionRole.roleArn });
    new CfnOutput(this, 'rdsAddress', { value: rdsInstance.rdsInstance.dbInstanceEndpointAddress });
  }
}
