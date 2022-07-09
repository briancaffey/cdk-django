import * as eks from 'aws-cdk-lib/aws-eks';
import * as cdk from 'aws-cdk-lib/core';

/**
 * Props for AppIngressResources, used for annotating ingress with ACM cert ARN and domain name
 */
export interface AppIngressResourcesProps {
  /**
   * Domain name that will be created by external-dns
   */
  domainName: string;

  /**
   * EKS Cluster
   */
  cluster: eks.ICluster;

  /**
   * ACM Certificate that is either generated in the main stack or looked up by ARN
   */
  certificateArn?: string;
}

export class AppIngressResources extends cdk.Construct {
  public ingressManifest: eks.KubernetesManifest;

  constructor(scope: cdk.Construct, id: string, props: AppIngressResourcesProps) {
    super(scope, id);

    /**
     * Annotations for use with or with ACM Certificate
     */
    let annotations = {
      'kubernetes.io/ingress.class': 'alb',
      'alb.ingress.kubernetes.io/scheme': 'internet-facing',
      'alb.ingress.kubernetes.io/tags': 'Environment=test',
    };

    /**
     * Set up the annotations for use with ACM certificate
     */
    if (props.certificateArn) {
      Object.assign(annotations, {
        'alb.ingress.kubernetes.io/certificate-arn': props.certificateArn,
        'alb.ingress.kubernetes.io/ssl-policy': 'ELBSecurityPolicy-TLS-1-2-Ext-2018-06',
        'alb.ingress.kubernetes.io/listen-ports': '[{"HTTP": 80}, {"HTTPS": 443}]',
        'alb.ingress.kubernetes.io/actions.ssl-redirect': '{"Type": "redirect", "RedirectConfig": { "Protocol": "HTTPS", "Port": "443", "StatusCode": "HTTP_301"}}',
        'external-dns.alpha.kubernetes.io/hostname': props.domainName,
      });
    }

    /**
     * Ingress manfiest
     */
    const appIngress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: 'app-ingress',
        namespace: 'app',
        annotations,
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

