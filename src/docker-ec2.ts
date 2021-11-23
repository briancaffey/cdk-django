// import { readFileSync } from 'fs';
import * as ec2 from '@aws-cdk/aws-ec2';
// import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
// import * as iam from '@aws-cdk/aws-iam';
// import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

export interface DockerEc2Props {

  /**
   * Path to the Dockerfile
   */
  // readonly imageDirectory: string;

  /**
   * The command used to run the API web service.
   */
  // readonly webCommand?: string[];

  /*
   * Route 53 Zone Name, for example my-zone.com
   */
  readonly zoneName: string;

  /**
   * The domain name to use, such as example.my-zone.com
   */
  readonly domainName: string;

  // readonly dbName?: string;
  // readonly dbUser?: string;
  // readonly dbPassword?: string;
  // readonly s3BucketName: string;
  readonly keyName: string;
  /**
   * Extra Environment Variables to set in the backend container
   */
  // readonly environmentVariables?: { [key: string]: string };
}

export class DockerEc2 extends cdk.Construct {
  // public staticFileBucket: s3.Bucket;
  public vpc: ec2.IVpc;

  constructor(scope: cdk.Construct, id: string, props: DockerEc2Props) {
    super(scope, id);


    this.vpc = new ec2.Vpc(scope, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        // {
        //   cidrMask: 24,
        //   name: 'application',
        //   subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        // },
      ],
    });

    console.log(props);


    const stack = cdk.Stack.of(scope);

    const stackName = stack.stackName;
    const stackRegion = stack.region;
    const stackId = stack.stackId;

    const instanceResourceName = 'DockerEc2Instance';

    const dockerEc2ConfigSetName = 'dockerEc2';

    const userDataScript = `
yum update -y aws-cfn-bootstrap # good practice - always do this.
yum update -y
pvcreate /dev/xvdf
vgcreate vg0 /dev/xvdf
lvcreate -l 100%FREE -n data vg0
mkfs.ext4 /dev/vg0/data
mkdir /var/data
echo "/dev/mapper/vg0-data /var/data ext4 defaults 0 2" >> /etc/fstab
mount -a
/opt/aws/bin/cfn-init -v --stack ${stackName} --resource ${instanceResourceName} --configsets ${dockerEc2ConfigSetName} --region ${stackRegion}
/opt/aws/bin/cfn-signal -e $? --stack ${stackName} --resource ${instanceResourceName} --region ${stackRegion}
`;

    const userData = ec2.UserData.custom(userDataScript);


    const config = new ec2.InitConfig([]);
    const init = ec2.CloudFormationInit.fromConfig(config);

    const handle = new ec2.InitServiceRestartHandle();
    handle._addFile('/etc/cfn/cfn-hup.conf');
    handle._addFile('/etc/cfn/hooks.d/cfn-auto-reloader.conf');

    const contentStringCfnAutoReloader = `
[cfn-auto-reloader-hook]
triggers=post.update
path=Resources.${instanceResourceName}.Metadata.AWS::CloudFormation::Init
action=/opt/aws/bin/cfn-init -v --stack ${stackName} --resource ${instanceResourceName} --configsets ${dockerEc2ConfigSetName} --region ${stackRegion}
`;

    const contentStringCfnHup = `
[main]
stack=${stackId}
region=${stackRegion}
verbose=true
interval=5
`;

    // const dockerEc2S3Role = new iam.Role(scope, 'DockerEc2S3Role', {
    //   assumedBy: new iam.ServicePrincipal('s3.amazonaws.com'),
    // });

    // const s3User = new iam.User(scope, 'S3User');
    // const s3UserKey = new iam.CfnAccessKey(scope, 'S3UserKey', {
    //   userName: s3User.userName,
    // });


    // const s3DockerEc2Policy = new iam.Policy(scope, 'S3applicationPolicy', {
    //   policyName: 'S3applicationPolicy',
    // });

    // s3DockerEc2Policy.attachToRole(dockerEc2S3Role);

    // TODO: replace this with props.s3BucketName
    // const bucketNamePlaceholder = 'bucket-name-placeholder';

    // TODO: add these later
    // DATABASE_NAME=${props.dbName ?? 'postgres'}
    // DATABASE_USER=${props.dbUser ?? 'postgres'}
    // DATABASE_PASSWORD=${props.dbPassword ?? 'postgres'}
    // BUCKET_URL=https://${bucketNamePlaceholder}.s3.${stackRegion}.amazonaws.com
    // SHORT_BUCKET_HOST=${bucketNamePlaceholder}.s3.${stackRegion}.amazonaws.com
    // AWS_REGION=${stackRegion}
    // BUCKET_ACCESS_KEY=${s3UserKey.ref}
    // BUCKET_SECRET_KEY=${s3UserKey.attrSecretAccessKey}
    //     const contentStringConfigapplication = `
    // `;

    const contentStringInstallapplication = `
#!/bin/bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
sysctl -w vm.max_map_count=262144
# curl https://raw.githubusercontent.com/briancaffey/django-cdk/src/files/docker-compose-nginx.yml -o docker-compose.yml
curl https://github.com/briancaffey/django-cdk/blob/docker-swarm/src/files/docker-compose-nginx.yml -o docker-compose.yml
# docker-compose -p docker-ec2 up -d --force-recreate
docker swarm init
docker stack deploy -c docker-compose-nginx.yml stack
`;

    init.addConfig('configure-cfn', new ec2.InitConfig([

      ec2.InitFile.fromString('/etc/cfn/hooks.d/cfn-auto-reloader.conf', contentStringCfnAutoReloader, {
        mode: '000400',
        owner: 'root',
        group: 'root',
      }),

      ec2.InitFile.fromString('/etc/cfn/cfn-hup.conf', contentStringCfnHup, {
        mode: '000400',
        owner: 'root',
        group: 'root',
      }),

      ec2.InitService.enable('cfn-hup', { serviceRestartHandle: handle }),
    ]));

    init.addConfig('install_docker', new ec2.InitConfig([
      ec2.InitPackage.yum('docker'),
      ec2.InitCommand.shellCommand('usermod -a -G docker ec2-user', { key: 'docker_for_ec2_user' }),
      ec2.InitService.enable('docker'),
    ]));

    // init.addConfig('config_application', new ec2.InitConfig([
    //   ec2.InitFile.fromString('/home/ec2-user/application/.env', contentStringConfigapplication, {
    //     mode: '000400',
    //     owner: 'root',
    //     group: 'root',
    //   }),
    // ]));

    init.addConfig('install_application', new ec2.InitConfig([
      ec2.InitFile.fromString('/home/ec2-user/application/application.sh', contentStringInstallapplication, {
        mode: '000400',
        owner: 'root',
        group: 'root',
      }),
      ec2.InitCommand.shellCommand('sudo sh application.sh', {
        cwd: '/home/ec2-user/application',
        key: 'run_rp',
      }),
    ]));

    init.addConfigSet('application', [
      'configure-cfn',
      'install_docker',
      // 'config_application',
      'install_application',
    ]);

    // const instance;
    new ec2.Instance(this, 'Instance', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpc: this.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      userData,
      init,
    });
  }
}