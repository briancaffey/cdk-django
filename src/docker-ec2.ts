// import { readFileSync } from 'fs';
import * as ec2 from '@aws-cdk/aws-ec2';
// import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as ecrAssets from '@aws-cdk/aws-ecr-assets';
import * as iam from '@aws-cdk/aws-iam';
// import * as s3 from '@aws-cdk/aws-s3';
import * as route53 from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';

export interface DockerEc2Props {

  /**
   * Path to the Dockerfile
   */
  readonly imageDirectory: string;

  /**
   * Frontend Image directory (nginx, quasar-app)
   */
  readonly frontendImageDirectory: string;

  /**
   * Frontend Image Dockerfile
   */
  readonly frontendImageDockerfile: string;

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
    const accountId = cdk.Stack.of(this).account;

    console.log(stackName);
    console.log(stackRegion);
    console.log(stackId);
    console.log(accountId);

    const instanceResourceName = 'DockerEc2Instance';

    const dockerEc2ConfigSetName = 'application';

    const userDataScript = `
#!/bin/bash -xe
yum update -y aws-cfn-bootstrap # good practice - always do this.
yum update -y
echo "nameserver 8.8.8.8" >> /etc/resolv.conf
echo "nameserver 8.8.4.4" >> /etc/resolv.conf
/opt/aws/bin/cfn-init -v --stack ${stackId} --resource ${instanceResourceName} --configsets ${dockerEc2ConfigSetName} --region ${stackRegion}
/opt/aws/bin/cfn-signal -e $? --stack ${stackId} --resource ${instanceResourceName} --region ${stackRegion}
/opt/aws/bin/cfn-hup
`;

    const userData = ec2.UserData.custom(userDataScript);


    const config = new ec2.InitConfig([]);
    const init = ec2.CloudFormationInit.fromConfig(config);

    const contentStringCfnAutoReloader = `
[cfn-auto-reloader-hook]
triggers=post.update
path=Resources.${instanceResourceName}.Metadata.AWS::CloudFormation::Init
action=/opt/aws/bin/cfn-init -v --stack ${stackName} --resource ${instanceResourceName} --region ${stackRegion}
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

    //TODO: add these later
    const contentStringConfigApplication = `
DEBUG=0
POSTGRES_SERVICE_HOST=postgres
POSTGRES_PASSWORD=postgres
REDIS_SERVICE_HOST=redis
DJANGO_SETTINGS_MODULE=backend.settings.swarm_ec2
`;
    // DATABASE_NAME=${props.dbName ?? 'postgres'}
    // DATABASE_USER=${props.dbUser ?? 'postgres'}
    // DATABASE_PASSWORD=${props.dbPassword ?? 'postgres'}
    // BUCKET_URL=https://${bucketNamePlaceholder}.s3.${stackRegion}.amazonaws.com
    // SHORT_BUCKET_HOST=${bucketNamePlaceholder}.s3.${stackRegion}.amazonaws.com
    // AWS_REGION=${stackRegion}
    // BUCKET_ACCESS_KEY=${s3UserKey.ref}
    // BUCKET_SECRET_KEY=${s3UserKey.attrSecretAccessKey}

    // define a container image
    const backendImage = new ecrAssets.DockerImageAsset(this, 'BackendImage', {
      directory: props.imageDirectory,
    });

    const frontendImage = new ecrAssets.DockerImageAsset(this, 'FrontendImage', {
      directory: props.frontendImageDirectory,
      file: props.frontendImageDockerfile,
      buildArgs: {
        BACKEND_API_URL: `https://${props.domainName}`,
      },
    });

    const contentStringInstallApplication = `
#!/bin/bash
# download the stack.yml file
curl https://raw.githubusercontent.com/briancaffey/django-cdk/docker-swarm/src/files/stack.yml -o stack.yml
docker swarm init
docker network create --driver=overlay traefik-public
export DOMAIN_NAME=${props.domainName}
export IMAGE_URI=${backendImage.imageUri}
export FRONTEND_IMAGE_URI=${frontendImage.imageUri}
# login to ecr
aws ecr get-login-password --region ${stackRegion} | docker login --username AWS --password-stdin ${accountId}.dkr.ecr.${stackRegion}.amazonaws.com
docker stack deploy --with-registry-auth -c stack.yml stack
`;

    // init.addConfig('configure-cfn', new ec2.InitConfig([

    //   ec2.InitService.enable('cfn-hup', { serviceRestartHandle: handle }),
    // ]));

    init.addConfig('install_docker', new ec2.InitConfig([
      ec2.InitPackage.yum('docker'),
      ec2.InitService.enable('docker'),
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
      ec2.InitCommand.shellCommand('usermod -a -G docker ec2-user', { key: 'docker_for_ec2_user' }),
    ]));

    init.addConfig('install_compose', new ec2.InitConfig([
      ec2.InitCommand.shellCommand('curl -L https://github.com/docker/compose/releases/download/1.20.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose', { key: 'compose_for_ec2_user1' }),
      ec2.InitCommand.shellCommand('chmod +x /usr/local/bin/docker-compose', { key: 'compose_for_ec2_user2' }),
      ec2.InitCommand.shellCommand('ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose', { key: 'compose_for_ec2_user3' }),
    ]));

    init.addConfig('config_application', new ec2.InitConfig([
      ec2.InitFile.fromString('/home/ec2-user/application/.env', contentStringConfigApplication, {
        mode: '000400',
        owner: 'root',
        group: 'root',
      }),
    ]));

    init.addConfig('install_application', new ec2.InitConfig([
      ec2.InitFile.fromString('/home/ec2-user/application/application.sh', contentStringInstallApplication, {
        mode: '000400',
        owner: 'root',
        group: 'root',
      }),
      ec2.InitCommand.shellCommand('sudo sh application.sh', {
        cwd: '/home/ec2-user/application',
        key: 'run_docker_compose',
      }),
    ]));

    init.addConfigSet('application', [
      'install_docker',
      'install_compose',
      'config_application',
      'install_application',
    ]);

    console.log(userData);
    console.log(init);

    const ec2SecurityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: this.vpc,
      description: 'Allow SSH and HTTP access',
      securityGroupName: 'DockerEc2SecurityGroup',
      allowAllOutbound: true,
    });

    // allow SSH access to the ec2SecurityGroup
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH access');
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP access');
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS access');

    // const instance;
    const instance = new ec2.Instance(this, instanceResourceName, {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpc: this.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      keyName: props.keyName,
      securityGroup: ec2SecurityGroup,
      userData,
      init,
      initOptions: {
        configSets: ['application'],
        timeout: cdk.Duration.minutes(10),
        includeUrl: true,
      },
    });

    // add AmazonEC2ContainerRegistryReadOnly role to the instance
    instance.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'),
    );

    // allow the EC2 instance to access the ECR repositories (TODO: figure out if this is needed)
    backendImage.repository.grantPull(instance.role);
    frontendImage.repository.grantPull(instance.role);

    const hostedZone = route53.HostedZone.fromLookup(scope, 'hosted-zone', {
      domainName: props.zoneName,
    });

    new route53.ARecord(this, 'ARecordEc2Docker', {
      zone: hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromIpAddresses(instance.instancePublicIp),
    });

    // Output values

    // Use this command to SSH to the machine
    new cdk.CfnOutput(this, 'Ec2InstanceSshCommand', {
      value: `ssh -i "~/.ssh/${props.keyName}.pem" ec2-user@${instance.instancePublicDnsName}`,
    });

    // site url
    new cdk.CfnOutput(this, 'SiteUrl', {
      value: `https://${props.domainName}`,
    });
  }
}