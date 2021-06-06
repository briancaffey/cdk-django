import * as ecrAssets from '@aws-cdk/aws-ecr-assets';
import * as eks from '@aws-cdk/aws-eks';
import * as cdk from '@aws-cdk/core';

interface WebResourcesProps {
  env: {[key: string]: string}[];
  cluster: eks.ICluster;
  backendImage: ecrAssets.DockerImageAsset;
  namespace: string;
  webCommand: string[];
}

/**
 * This construct provides the Kubernetes manifests for the Django web application
 *
 * It includes a service and a deployment manifest that share some common names and labels
 *
 * The service is references by the Ingress object called `app-ingress`
 *
 */
export class WebResources extends cdk.Construct {

  public serviceManifest: any;
  public deploymentManifest: any;

  constructor(scope: cdk.Construct, id: string, props: WebResourcesProps) {
    super(scope, id);

    const name = 'api-http';
    const selector = { app: name };

    const webDeploymentManifest: any = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        namespace: props.namespace,
        name,
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: selector,
        },
        template: {
          metadata: {
            labels: selector,
          },
          spec: {
            containers: [
              {
                name,
                image: props.backendImage.imageUri,
                env: props.env,
                args: props.webCommand,
                ports: [
                  {
                    containerPort: 8000,
                    name: 'http',
                  },
                ],
              },
            ],
            restartPolicy: 'Always',
          },
        },
      },
    };

    const webServiceManifest: any = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        labels: selector,
        name,
        namespace: props.namespace,
      },
      spec: {
        selector,
        ports: [
          {
            port: 80,
            targetPort: 8000,
            protocol: 'TCP',
          },
        ],
      },
    };

    this.deploymentManifest = webDeploymentManifest;
    this.serviceManifest = webServiceManifest;
  }
}