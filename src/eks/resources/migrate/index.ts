import * as ecrAssets from '@aws-cdk/aws-ecr-assets';
import * as eks from '@aws-cdk/aws-eks';
import * as cdk from '@aws-cdk/core';

interface MigrateJobProps {
  env: {[key: string]: string}[];
  cluster: eks.ICluster;
  backendImage: ecrAssets.DockerImageAsset;
  namespace: string;
}

export class MigrateJob extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: MigrateJobProps) {
    super(scope, id);

    const migrateJobManifest: any = {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        namespace: props.namespace,
        name: 'django-migrate',
      },
      spec: {
        template: {
          spec: {
            serviceAccountName: 'pod-service-account',
            containers: [
              {
                name: 'migrate',
                image: props.backendImage.imageUri,
                env: props.env,
                args: ['python3', 'manage.py', 'migrate'],
              },
            ],
            restartPolicy: 'Never',
          },
        },
      },
    };

    props.cluster.addManifest('migrate-job', migrateJobManifest);

  }
}