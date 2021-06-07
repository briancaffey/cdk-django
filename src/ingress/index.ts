export const appIngress = {
  // TODO: update this after upgrading to kubernetes version 1.22
  apiVersion: 'networking.k8s.io/v1beta1',
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
                serviceName: 'api-http',
                servicePort: 80,
              },
            },
          ],
        },
      },
    ],
  },
};
