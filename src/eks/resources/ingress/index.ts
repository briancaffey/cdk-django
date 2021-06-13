import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
export interface AppIngressResourcesProps {
  domainName: string;
  cluster: eks.ICluster;
}

export class AppIngressResources extends cdk.Construct {
  public ingressManifest: eks.KubernetesManifest;

  constructor(scope: cdk.Construct, id: string, props: AppIngressResourcesProps) {
    super(scope, id);

    /**
     * Ingress manfiest
     */
    const appIngress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: 'app-ingress',
        namespace: 'app',
        annotations: {
          'kubernetes.io/ingress.class': 'alb',
          'alb.ingress.kubernetes.io/scheme': 'internet-facing',
          'alb.ingress.kubernetes.io/tags': 'Environment=test',
        },
      },
      spec: {
        rules: [
          {
            http: {
              paths: [
                {
                  path: '/',
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: 'api-http',
                      port: {
                        number: 80,
                      },
                    },
                    // for v1beta1, use the following
                    // serviceName: 'api-http',
                    // servicePort: 80,
                  },
                },
              ],
            },
          },
        ],
      },
    };

    this.ingressManifest = props.cluster.addManifest('app-ingress', appIngress);

  }
}

