// import { readFileSync } from 'fs';
// import * as s3 from '@aws-cdk/aws-s3';
// import * as autoscaling from '@aws-cdk/aws-autoscaling';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecrAssets from '@aws-cdk/aws-ecr-assets';
import * as efs from '@aws-cdk/aws-efs';
import * as iam from '@aws-cdk/aws-iam';
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

  /**
   * The name of the key pair to use for SSH access
   */
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


    const vpc = new ec2.Vpc(scope, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    this.vpc = vpc;

    const efsFileSystem = new efs.FileSystem(this, 'EfsFileSystem', {
      vpc,
    });

    const stack = cdk.Stack.of(scope);

    const stackName = stack.stackName;
    const stackRegion = stack.region;
    const stackId = stack.stackId;
    const accountId = cdk.Stack.of(this).account;

    const instanceResourceName = 'DockerEc2Instance';

    const dockerEc2ConfigSetName = 'application';

    const userDataScript = `
#!/bin/bash -xe
yum update -y aws-cfn-bootstrap # good practice - always do this.
yum update -y
echo "nameserver 8.8.8.8" >> /etc/resolv.conf
echo "nameserver 8.8.4.4" >> /etc/resolv.conf

# mount efs file system to /data
sudo mkdir -p /data/{traefik,postgres,redis,assets,portainer}
echo "${efsFileSystem.fileSystemId}.efs.${stackRegion}.amazonaws.com:/ /data nfs defaults,_netdev 0 0" >> /etc/fstab
sudo mount -fav

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

    /**
     * Application environment variables
     *
     * All of these environment variables will be made accessible to all of the containers in the stack.yml file
     *
     * TODO: append extra environment vars from props.environmentVariables
     */
    const contentStringConfigApplication = `
DEBUG=0
POSTGRES_SERVICE_HOST=postgres
POSTGRES_PASSWORD=postgres
REDIS_SERVICE_HOST=redis
DJANGO_SETTINGS_MODULE=backend.settings.swarm_ec2
`;
    // BUCKET_URL=https://${bucketNamePlaceholder}.s3.${stackRegion}.amazonaws.com
    // SHORT_BUCKET_HOST=${bucketNamePlaceholder}.s3.${stackRegion}.amazonaws.com
    // AWS_REGION=${stackRegion}

    /**
     * This is the backend container that will be used to run the backend Django application
     */
    const backendImage = new ecrAssets.DockerImageAsset(this, 'BackendImage', {
      directory: props.imageDirectory,
    });

    /**
     * Frontend Image
     *
     * This is the image that will be used to run the frontend (nginx with Quasar SPA app)
     *
     * The image needs to be built using the context of the django-step-by-step project root directory
     * The Dockerfile is located in the nginx directory, so this must also be specified
     */
    const frontendImage = new ecrAssets.DockerImageAsset(this, 'FrontendImage', {
      directory: props.frontendImageDirectory,
      file: props.frontendImageDockerfile,
      buildArgs: {
        BACKEND_API_URL: `https://${props.domainName}`,
      },
    });

    /**
     * This script installs the docker stack into the docker swarm cluster using `docker stack deploy`
     *
     * Container image URIs are passed in as environment variables and the EC2 instance has permissions to pull them.
     * The `get-login-password` command is used to authenticate to the ECR repository.
     */
    const contentStringInstallApplication = `
#!/bin/bash
# download the stack.yml file
curl https://raw.githubusercontent.com/briancaffey/django-cdk/dev/src/files/stack.yml -o stack.yml
docker swarm init
docker network create --driver=overlay traefik-public
export DOMAIN_NAME=${props.domainName}
export IMAGE_URI=${backendImage.imageUri}
export FRONTEND_IMAGE_URI=${frontendImage.imageUri}
# login to ecr
aws ecr get-login-password --region ${stackRegion} | docker login --username AWS --password-stdin ${accountId}.dkr.ecr.${stackRegion}.amazonaws.com
docker stack deploy --with-registry-auth -c stack.yml stack

# TODO: run migrations and collectstatic here once the services are up and running
# wait until migrations run
#docker exec $(docker ps -q -f name="backend") python3 manage.py migrate --no-input
#while [ $? -ne 0 ]; do
#    sleep 10
#    echo "waiting for migrations to run"
#    echo "docker ps....."
#    docker ps
#    echo "docker ps..."
#    docker ps -q -f name="backend"
#    docker exec $(docker ps -q -f name="backend") python3 manage.py migrate --no-input
#done

# wait until collectstatic runs
#docker exec $(docker ps -q -f name="backend") python3 manage.py collectstatic --no-input
#while [ $? -ne 0 ]; do
#    sleep 10
#    echo "waiting for collectstatic to run"
#    docker exec $(docker ps -q -f name="backend") python3 manage.py collectstatic --no-input
#done
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
    ]));

    init.addConfig('install_docker', new ec2.InitConfig([
      ec2.InitPackage.yum('docker'),
      ec2.InitService.enable('docker'),
      ec2.InitCommand.shellCommand('usermod -a -G docker ec2-user', { key: 'docker_for_ec2_user' }),
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
      'configure-cfn',
      'install_docker',
      'config_application',
      'install_application',
    ]);

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
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080), 'For debugging');

    efsFileSystem.connections.allowFrom(ec2SecurityGroup, ec2.Port.tcp(2049), 'Allow EFS access');
    /**
     * EBS to to used for storing docker volume data on /data
     *
     * This is currently being replaced on each stack update. How can I make this persistent?
     */
    const blockDeviceVolume = ec2.BlockDeviceVolume.ebs(20, {
      deleteOnTermination: false,
    });

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
      blockDevices: [
        {
          deviceName: '/dev/sda1',
          volume: blockDeviceVolume,
        },
      ],
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

    /**
     * This A Record points the `app.domain.com` Route53 record to the pubic IP of the EC2 instance.
     */
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

    new cdk.CfnOutput(this, 'EfsFileSystemId', {
      value: efsFileSystem.fileSystemId,
    });

    new cdk.CfnOutput(this, 'EfsFileSystemArn', {
      value: efsFileSystem.fileSystemArn,
    });
  }
}