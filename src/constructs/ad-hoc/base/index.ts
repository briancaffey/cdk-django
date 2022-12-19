import {
  Duration,
  RemovalPolicy,
  Stack,
} from 'aws-cdk-lib';
import { BastionHostLinux, IVpc, Peer, Port, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import {
  ApplicationProtocol,
  ApplicationListener,
  ApplicationLoadBalancer,
  ApplicationTargetGroup,
  ListenerCertificate,
  TargetType,
  ListenerAction,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';
import { RdsInstance } from '../../internal/rds';
import { ApplicationVpc } from '../../internal/vpc';

// TODO: add props
export interface AdHocBaseProps {
  readonly certificateArn: string;
  readonly domainName: string;
}

export class AdHocBase extends Construct {

  public vpc: IVpc;
  public alb: ApplicationLoadBalancer;
  public appSecurityGroup: SecurityGroup;
  public serviceDiscoveryNamespace: PrivateDnsNamespace;
  public databaseInstance: DatabaseInstance;
  public assetsBucket: Bucket;
  public domainName: string;
  public listener: ApplicationListener;

  constructor(scope: Construct, id: string, props: AdHocBaseProps) {
    super(scope, id);

    // get the stack name
    const stackName = Stack.of(this).stackName;

    // the domain name to use for the ad hoc environments
    this.domainName = props.domainName;

    // vpc
    const vpc = new ApplicationVpc(scope, 'Vpc');
    this.vpc = vpc.vpc;

    // one bucket for all environments
    const assetsBucket = new Bucket(scope, 'AssetsBucket', {
      bucketName: `${stackName}-assets-bucket`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    this.assetsBucket = assetsBucket;

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
    this.appSecurityGroup = appSecurityGroup;

    // allow traffic from ALB security group to the application security group
    appSecurityGroup.addIngressRule(albSecurityGroup, Port.allTcp(), 'ALB');

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

    // Service Discovery namespace
    const serviceDiscoveryPrivateDnsNamespace = new PrivateDnsNamespace(this, 'ServiceDiscoveryNamespace', {
      vpc: this.vpc,
      // TODO: add stack name as part of the name
      name: `${stackName}-sd-ns`,
    });
    this.serviceDiscoveryNamespace = serviceDiscoveryPrivateDnsNamespace;

    // RDS
    const rdsInstance = new RdsInstance(this, 'RdsInstance', {
      vpc: this.vpc,
      appSecurityGroup: appSecurityGroup,
      dbSecretName: 'DB_SECRET_NAME',
    });
    this.databaseInstance = rdsInstance.rdsInstance;
    const { instanceEndpoint } = rdsInstance.rdsInstance;

    const socatForwarderString = `
#cloud-config
package_upgrade: true
packages:
  - postgresql
  - socat
write_files:
  - content: |
      # /etc/systemd/system/socat-forwarder.service
      [Unit]
      Description=socat forwarder service
      After=socat-forwarder.service
      Requires=socat-forwarder.service

      [Service]
      Type=simple
      StandardOutput=syslog
      StandardError=syslog
      SyslogIdentifier=socat-forwarder

      ExecStart=/usr/bin/socat -d -d TCP4-LISTEN:5432,fork TCP4:${instanceEndpoint}:5432
      Restart=always

      [Install]
      WantedBy=multi-user.target
    path: /etc/systemd/system/socat-forwarder.service

runcmd:
  - [ systemctl, daemon-reload ]
  - [ systemctl, enable, socat-forwarder.service ]
  # https://dustymabe.com/2015/08/03/installingstarting-systemd-services-using-cloud-init/
  - [ systemctl, start, --no-block, socat-forwarder.service ]
`;

    const bastionHost = new BastionHostLinux(this, 'BastionHost', {
      vpc: this.vpc,
      securityGroup: appSecurityGroup,
    });

    bastionHost.instance.addUserData(socatForwarderString);
  }
}
