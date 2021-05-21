import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
import * as ecrAssets from '@aws-cdk/aws-ecr-assets';
// import * as logs from '@aws-cdk/aws-logs';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
// import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';
// import { RdsPostgresInstance } from './database';
// import { ElastiCacheCluster } from './elasticache';
import {
  ApplicationVpc
} from './vpc';


export interface DjangoEksProps {
  /**
   * Options to configure a Django CDK project
   */

  /**
   * Name of existing bucket to use for media files
   *
   * This name will be auto-generated if not specified
   */
  readonly bucketName ? : string;

  /**
   * The VPC to use for the application. It must contain
   * PUBLIC, PRIVATE and ISOLATED subnets
   *
   * A VPC will be created if this is not specified
   */
  readonly vpc ? : ec2.IVpc;

  /**
   * The location of the Dockerfile used to create the main
   * application image. This is also the context used for building the image.
   *
   * TODO: set image and context path separately.
   */
  readonly imageDirectory: string;

  /**
   * The command used to run the API web service.
   */
  readonly webCommand ? : string[];

  /**
   * Used to enable the celery beat service.
   *
   * @default false
   */
  readonly useCeleryBeat ? : boolean;

}


export class DjangoEks extends cdk.Construct {

  public staticFileBucket: s3.Bucket;
  public vpc: ec2.IVpc;
  public cluster: eks.Cluster;


  constructor(scope: cdk.Construct, id: string, props: DjangoEksProps) {
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

    // allow all account users to assume this role in order to admin the cluster
    const mastersRole = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal(),
    });

    /**
     * EKS cluster
     */
    this.cluster = new eks.Cluster(this, "MyEksCluster", {
      version: eks.KubernetesVersion.V1_19,
      vpc: this.vpc,
      mastersRole,
      defaultCapacity: 0,
    });

    this.cluster.addManifest('nginx-namespace', {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: 'app',
      },
    });

    this.cluster.addFargateProfile('fargateProfileApp', {
      selectors: [{
        namespace: 'app'
      }],
    });
    
    // https://stackoverflow.com/a/63787574/6084948
    const containerImage = new ecrAssets.DockerImageAsset(scope, 'backendImage', {
      directory: props.imageDirectory,
    });

    // this.cluster.addHelmChart('awsLoadBalancerController', {
    //   namespace: 'kube-system',
    //   chart: 'aws-load-balancer-controller',
    // });

    const nginxDeployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        namespace: 'app',
        name: 'nginx-deployment',
        labels: {
          app: 'nginx',
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'nginx',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'nginx',
            },
          },
          spec: {
            containers: [{
              name: 'nginx',
              image: 'nginx:1.14.2',
              resources: {
                requests: {
                  memory: "64Mi",
                  cpu: "250m"
                },
                limits: {
                  memory: "128Mi",
                  cpu: "500m",
                }
              },
              ports: [{
                containerPort: 80,
              }]
            }]
          }
        }
      }
    };

    const nginxSvc = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: 'nginx-service',
        namespace: 'app',
      },
      spec: {
        type: 'NodePort',
        selector: {
          app: 'nginx',
        },
        ports: [
          {
            port: 80,
            targetPort: 80,
            nodePort: 30008,
          }
        ]
      },
    };

    const apiDeployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        namespace: 'app',
        name: 'api',
        labels: {
          app: 'api',
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'api',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'api',
            },
          },
          spec: {
            containers: [{
              image: containerImage.imageUri,
              args: props.webCommand,
              name: 'backend-image',
              resources: {
                requests: {
                  memory: "64Mi",
                  cpu: "250m"
                },
                limits: {
                  memory: "128Mi",
                  cpu: "500m",
                }
              },
              ports: [{
                containerPort: 8000,
              }]
            }]
          }
        }
      }
    };

    this.cluster.addManifest('nginx-deployment', nginxDeployment);
    this.cluster.addManifest('nginx-service', nginxSvc);

    this.cluster.addManifest('api-deployment', apiDeployment);

    // or, option2: use `addHelmChart`
    // cluster.addHelmChart('NginxIngress', {
    //   chart: 'nginx-ingress',
    //   repository: 'https://helm.nginx.com/stable',
    //   namespace: 'kube-system'
    // });

    //   this.cluster.addFargateProfile('')

    /**
     * Secret used for RDS postgres password
     */
    //   this.secret = new secretsmanager.Secret(scope, 'dbSecret', {
    //     secretName: 'dbSecret',
    //     description: 'secret for rds',
    //   });

    /**
     * Container image used in web API, celery worker and management task containers
     */
    //   this.image = new ecs.AssetImage(props.imageDirectory);

    //   const database = new RdsPostgresInstance(scope, 'RdsPostgresInstance', {
    //     vpc: this.vpc,
    //     secret: this.secret,
    //   });


    /**
     * A security group in the VPC for our application (ECS Fargate services and tasks)
     * Allow the application services to access the RDS security group
     */
    //   const appSecurityGroup = new ec2.SecurityGroup(scope, 'appSecurityGroup', {
    //     vpc: this.vpc,
    //   });

    //   const elastiCacheRedis = new ElastiCacheCluster(scope, 'ElastiCacheCluster', {
    //     vpc: this.vpc,
    //     appSecurityGroup,
    //   });

    //   const environment: { [key: string]: string } = {
    //     AWS_STORAGE_BUCKET_NAME: staticFilesBucket.bucketName,
    //     POSTGRES_SERVICE_HOST: database.rdsPostgresInstance.dbInstanceEndpointAddress,
    //     POSTGRES_PASSWORD: this.secret.secretValue.toString(),
    //     DEBUG: '0',
    //     DJANGO_SETTINGS_MODULE: 'backend.settings.production',
    //     REDIS_SERVICE_HOST: elastiCacheRedis.elastiCacheCluster.attrRedisEndpointAddress,
    //   };

    // TODO see how ALB logs work for EKS when the ALB is created through an ingress resource
    //   const albLogsBucket = new s3.Bucket(scope, `${id}-alb-logs`);

    //   albfs.loadBalancer.logAccessLogs(albLogsBucket);

    /**
     * Allows the app security group to communicate with the RDS security group
     */
    //   database.rdsSecurityGroup.addIngressRule(appSecurityGroup, ec2.Port.tcp(5432));

    /**
     * Grant the task defintion read-write access to static files bucket
     */
    //   staticFilesBucket.grantReadWrite(albfs.taskDefinition.taskRole);
  }
}