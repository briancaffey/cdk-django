// import { Stack } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { IVpc, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { ApplicationListener, ApplicationLoadBalancer, ApplicationProtocol, ApplicationTargetGroup, ListenerAction, ListenerCertificate, TargetType } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';


interface AlbResourcesProps {
  readonly vpc: IVpc;
  readonly albSecurityGroup: SecurityGroup;
  readonly certificateArn: string;
}

export class AlbResources extends Construct {
  // public rdsInstance: DatabaseInstance;
  public readonly alb: ApplicationLoadBalancer;
  public readonly listener: ApplicationListener;

  constructor(scope: Construct, id: string, props: AlbResourcesProps) {
    super(scope, id);

    const loadBalancer = new ApplicationLoadBalancer(scope, 'LoadBalancer', {
      vpc: props.vpc,
      securityGroup: props.albSecurityGroup,
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
      vpc: props.vpc,
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
    this.listener = httpsListener;

  }
}