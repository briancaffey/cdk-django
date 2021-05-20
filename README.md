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

# https://www.stacksimplify.com/aws-eks/aws-fargate/learn-to-run-kubernetes-workloads-on-aws-eks-and-aws-fargate-serverless-part-1/