export const appIngress = {
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
              },
            },
          ],
        },
      },
    ],
  },
};
