# Django CDK Construct

This is a high-level construct for setting up a Django project on AWS using:

- AWS CDK
- ECS Fargate
- CloudFront
- RDS (postgres)
- ElastiCache (redis)
- Celery
- React/Vue SPA Frontend

## Resources

https://dev.to/aws-builders/a-beginner-s-guide-to-create-aws-cdk-construct-library-with-projen-5eh4

### `.projenrc.js`

- Add `cdkDependencies` that will be used in the construct.

Run `npx projen` to propagate changes

### Add npm deploy token to GitHub secrets

- Create an access token on [npmjs.com](https://npmjs.com)
- Add `NPM_TOKEN` to GitHub project secrets

### Release process

Create a tag `v*` and the run the following:

```
yarn bump --release-as 0.0.3
```

```
git push --follow-tags origin main
```

### Deploy a sample application to CDK using the construct locally

```
cdk deploy --app="./lib/integ.default.js
```

### Destroy the sample application

```
cdk destroy --app="./lib/integ.default.js
```

## Notes on using AWS Load Balancer Controller in EKS

[https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/deploy/installation/](https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/deploy/installation/)

[https://docs.aws.amazon.com/cdk/api/latest/python/aws_cdk.aws_eks/FargateCluster.html](https://docs.aws.amazon.com/cdk/api/latest/python/aws_cdk.aws_eks/FargateCluster.html)

> The cluster is created with a default Fargate Profile that matches the “default” and “kube-system” namespaces. You can add additional profiles using addFargateProfile.

GitHub issue about CDK support for AWS Load Balancer Controller: [https://github.com/aws/aws-cdk/issues/8836](https://github.com/aws/aws-cdk/issues/8836)

# https://www.stacksimplify.com/aws-eks/aws-fargate/learn-to-run-kubernetes-workloads-on-aws-eks-and-aws-fargate-serverless-part-1/


## EKS Best Practices

[https://aws.github.io/aws-eks-best-practices/](https://aws.github.io/aws-eks-best-practices/)