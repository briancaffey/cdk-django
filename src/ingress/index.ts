export const appIngress = {
  apiVersion: 'extensions/v1beta1',
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
                serviceName: 'nginx-service',
                servicePort: 80,
              },
            },
          ],
        },
      },
    ],
  },
};
