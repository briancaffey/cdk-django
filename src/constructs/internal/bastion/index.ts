import { Fn } from 'aws-cdk-lib';
import { IVpc, SecurityGroup, BastionHostLinux, UserData, CfnInstance, InstanceType, InstanceClass, InstanceSize } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';


interface BastionHostResourcesProps {
  readonly instanceClass?: InstanceClass;
  readonly instanceSize?: InstanceSize;
  readonly rdsAddress: string;
  readonly vpc: IVpc;
  readonly appSecurityGroup: SecurityGroup;
}

export class BastionHostResources extends Construct {
  public instanceClass: InstanceClass;
  public instanceSize: InstanceSize;
  public instanceId: string;

  constructor(scope: Construct, id: string, props: BastionHostResourcesProps) {
    super(scope, id);

    this.instanceClass = props.instanceClass ?? InstanceClass.T3;
    this.instanceSize = props.instanceSize ?? InstanceSize.NANO;

    const socatForwarderString = `
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

      ExecStart=/usr/bin/socat -d -d TCP4-LISTEN:5432,fork TCP4:${props.rdsAddress}:5432
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
      vpc: props.vpc,
      securityGroup: props.appSecurityGroup,
      instanceType: InstanceType.of(this.instanceClass, this.instanceSize),
    });
    this.instanceId = bastionHost.instanceId;

    const bastionHostUserData = UserData.forLinux({ shebang: '#cloud-config' });

    bastionHostUserData.addCommands(socatForwarderString);

    const cfnBastionHost = bastionHost.instance.node.defaultChild as CfnInstance;

    cfnBastionHost.addPropertyOverride('UserData', Fn.base64(bastionHostUserData.render()));

  }
}