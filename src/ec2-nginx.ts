import * as ec2 from '@aws-cdk/aws-ec2';
// import * as ecr from '@aws-cdk/aws-ecr';
// import * as ecrAssets from '@aws-cdk/aws-ecr-assets';
// import * as efs from '@aws-cdk/aws-efs';
// import * as iam from '@aws-cdk/aws-iam';
import * as route53 from '@aws-cdk/aws-route53';
// import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

export interface Ec2NginxProps {

  /**
   * gitRepoUrl repo - defaults to the reference application
   *
   * @default https://github.com/briancaffey/django-step-by-step.git
   */
  readonly gitRepoUrl: string;

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
   * Email address used for requesting certs from Let's Encrypt
   *
   * This email will be used to send reminders about cert renewal
   */
  readonly letsEncryptEmail: string;

  /**
   * Extra Environment Variables to set in the backend container
   */
  // readonly environmentVariables?: { [key: string]: string };
}

export class Ec2Nginx extends cdk.Construct {
  // public staticFileBucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: Ec2NginxProps) {
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

    /**
     * S3 bucket for storing static and media files
     *
     * Static files are public, accessing media files requires authentication through django-storages
     */
    // const assetsBucket = new s3.Bucket(this, 'StaticFileBucket', {
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    // });

    // const bucketPolicyStatement = new iam.PolicyStatement({
    //   actions: ['s3:GetObject'],
    //   resources: [`${assetsBucket.bucketArn}/static/*`],
    // });
    // bucketPolicyStatement.addAnyPrincipal();
    // assetsBucket.addToResourcePolicy(bucketPolicyStatement);

    const stack = cdk.Stack.of(scope);

    const stackName = stack.stackName;
    const stackRegion = stack.region;
    const stackId = stack.stackId;
    // const accountId = cdk.Stack.of(this).account;

    const instanceResourceName = 'Ec2NginxInstance';

    const configSetName = 'application';

    const userDataScript = `
#!/bin/bash -xe
yum update -y aws-cfn-bootstrap # good practice - always do this.
yum update -y
echo "nameserver 8.8.8.8" >> /etc/resolv.conf
echo "nameserver 8.8.4.4" >> /etc/resolv.conf

/opt/aws/bin/cfn-init -v --stack ${stackId} --resource ${instanceResourceName} --configsets ${configSetName} --region ${stackRegion}
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

    const installPythonString = `
#!/bin/bash
sudo amazon-linux-extras install -y epel
sudo yum -y update
sudo yum groupinstall "Development Tools" -y
sudo yum install openssl-devel libffi-devel bzip2-devel -y
gcc --version
sudo yum install wget -y
sudo mkdir -p /opt/python3.9/
sudo chown -R $USER:$USER /opt/python3.9/
wget https://www.python.org/ftp/python/3.9.9/Python-3.9.9.tgz -P /opt/python3.9
cd /opt/python3.9/
tar xvf Python-3.9.9.tgz
sudo chown -R $USER:$USER Python-3.9.9
cd Python-3.9.9/
./configure --enable-optimizations
sudo make altinstall
/usr/local/bin/python3.9 --version
/usr/local/bin/pip3.9 --version
`;
    init.addConfig('install_python39', new ec2.InitConfig([
      ec2.InitFile.fromString('/opt/install_python39.sh', installPythonString, {
        mode: '000755',
        owner: 'root',
        group: 'root',
      }),

      ec2.InitCommand.shellCommand('sudo sh install_python39.sh', {
        cwd: '/opt',
        key: 'install_python39',
      }),
    ]));

    init.addConfig('install_nginx', new ec2.InitConfig([
      ec2.InitCommand.shellCommand('sudo amazon-linux-extras install -y nginx1'),
      ec2.InitCommand.shellCommand('sudo service nginx start'),
    ]));

    init.addConfig('install_git', new ec2.InitConfig([
      ec2.InitCommand.shellCommand('sudo yum install git -y'),
      ec2.InitCommand.shellCommand('git version'),
    ]));

    const gitRepo = props.gitRepoUrl ?? 'https://github.com/briancaffey/django-step-by-step.git';
    /**
     * This script installs the application and starts it
     */
    const contentStringInstallApplication = `
#!/bin/bash

# https://computingforgeeks.com/install-latest-python-on-centos-linux/
/usr/local/bin/python3.9 --version

# clone git repo
sudo mkdir -p /opt/www
sudo chown -R $USER /opt/www
git clone ${gitRepo} /opt/www

# cd to backend directory
cd /opt/www/backend

/usr/local/bin/python3.9 -m venv .venv

sudo /opt/www/backend/.venv/bin/python3.9 -m pip install --upgrade pip
sudo /opt/www/backend/.venv/bin/pip3.9 install -r /opt/www/backend/requirements.txt
`;

    init.addConfig('install_application', new ec2.InitConfig([
      ec2.InitFile.fromString('/opt/application.sh', contentStringInstallApplication, {
        mode: '000400',
        owner: 'root',
        group: 'root',
      }),
      ec2.InitCommand.shellCommand('sudo sh application.sh', {
        cwd: '/opt',
        key: 'install_and_run_application',
      }),
    ]));

    const installCertbotString = `
#!/bin/bash

# https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/SSL-on-amazon-linux-2.html#letsencrypt

sudo wget -r --no-parent -A 'epel-release-*.rpm' https://dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/
sudo rpm -Uvh dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/epel-release-*.rpm
sudo yum-config-manager --enable epel*
sudo yum install -y certbot

# https://eff-certbot.readthedocs.io/en/stable/using.html#standalone
sudo certbot certonly --standalone -n -d ${props.domainName} --email ${props.letsEncryptEmail} --agree-tos --redirect --hsts
`;

    init.addConfig('install_certbot', new ec2.InitConfig([
      // certbot needs to use port 80 when using the --standalone flag
      ec2.InitCommand.shellCommand('sudo service nginx stop'),
      ec2.InitCommand.shellCommand(installCertbotString, {
        key: 'install_certbot',
      }),
    ]));

    // /etc/systemd/system/gunicorn.service
    const configureGunicornString = `
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
Type=notify
User=ec2-user
Group=ec2-user
WorkingDirectory=/opt/www/backend
Environment="DJANGO_SETTINGS_MODULE=backend.settings.swarm_ec2"
Environment="S3_BUCKET_NAME=test"
ExecStart=/opt/www/backend/.venv/bin/gunicorn -b 127.0.0.1:8000 backend.wsgi
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
`;

    init.addConfig('configure_gunicorn', new ec2.InitConfig([
      ec2.InitFile.fromString('/etc/systemd/system/gunicorn.service', configureGunicornString, {
        mode: '000755',
        owner: 'root',
        group: 'root',
      }),
      ec2.InitCommand.shellCommand('sudo service gunicorn start'),
      ec2.InitCommand.shellCommand('sudo service gunicorn status'),
    ]));

    const nginxConfigString = `
access_log /var/log/nginx/access.log;
error_log /var/log/nginx/error.log;

server {
  listen 80;
  server_name ${props.domainName};
  location / {
    # Redirect any http requests to https
    return 301 https://$server_name$request_uri;
  }
}

server {
  listen 443 ssl;
  server_name ${props.domainName};

  # SSL configuration using Let's Encrypt
  ssl_certificate /etc/letsencrypt/live/${props.domainName}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/${props.domainName}/privkey.pem;

  add_header Strict-Transport-Security “max-age=31536000”;
  location ~ ^/(admin|api|graphql) {
    proxy_pass http://127.0.0.1:8000;
  }
}
`;

    init.addConfig('configure_nginx', new ec2.InitConfig([
      ec2.InitFile.fromString(`/etc/nginx/conf.d/${props.domainName}.conf`, nginxConfigString, {
        mode: '000755',
        owner: 'root',
        group: 'root',
      }),
      ec2.InitCommand.shellCommand('sudo service nginx start', {
        key: 'restart_nginx',
      }),
    ]));

    init.addConfigSet('application', [
      'configure-cfn',
      // 'install_redis',
      // 'install_postgres',
      'install_python39',
      'install_nginx',
      'install_git',
      'install_application',
      'install_certbot',
      'configure_gunicorn',
      'configure_nginx',
    ]);

    const ec2SecurityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description: 'Allow SSH and HTTP access',
      securityGroupName: 'NginxEc2SecurityGroup',
      allowAllOutbound: true,
    });

    // allow SSH access to the ec2SecurityGroup
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH access');
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP access');
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS access');

    const instance = new ec2.Instance(this, instanceResourceName, {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      keyName: props.keyName,
      securityGroup: ec2SecurityGroup,
      userData,
      init,
      initOptions: {
        configSets: ['application'],
        timeout: cdk.Duration.minutes(15),
        includeUrl: true,
      },
    });

    // allow the EC2 instance to access the S3 bucket - static and media files
    // assetsBucket.grantReadWrite(instance.role);

    const hostedZone = route53.HostedZone.fromLookup(scope, 'hosted-zone', {
      domainName: props.zoneName,
    });

    /**
     * This A Record points the `app.domain.com` Route53 record to the pubic IP of the EC2 instance.
     */
    new route53.ARecord(this, 'ARecordEc2Nginx', {
      zone: hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromIpAddresses(instance.instancePublicIp),
    });

    /**
     * CfnOutput values - these values are provided for GitHub Actions
     *
     * Some CfnOutput values are provided for developer convenience.
     */

    // Use this command to SSH to the machine
    new cdk.CfnOutput(this, 'Ec2InstanceSshCommand', {
      description: 'Use this command to SSH to the machine',
      value: `ssh -i "~/.ssh/${props.keyName}.pem" ec2-user@${instance.instancePublicDnsName}`,
    });

    // public IP of the EC2 instance
    new cdk.CfnOutput(this, 'Ec2PublicIpAddress', {
      value: instance.instancePublicIp.toString(),
      exportName: 'Ec2PublicIpAddress',
    });

    // hostname
    new cdk.CfnOutput(this, 'ApplicationHostName', {
      value: props.domainName,
      exportName: 'ApplicationHostName',
    });

    // url
    new cdk.CfnOutput(this, 'ApplicationUrl', {
      value: `https://${props.domainName}`,
      exportName: 'ApplicationUrl',
    });
  }
}