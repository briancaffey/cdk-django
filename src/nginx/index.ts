export const nginxDeployment = {
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
          // Resources can be used when working with Fargate profiles in the EKS cluster
          // resources: {
          //   requests: {
          //     memory: "64Mi",
          //     cpu: "250m"
          //   },
          //   limits: {
          //     memory: "128Mi",
          //     cpu: "500m",
          //   }
          // },
          ports: [{
            containerPort: 80,
          }],
        }],
      },
    },
  },
};

export const nginxService = {
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
        protocol: 'TCP',
      },
    ],
  },
};