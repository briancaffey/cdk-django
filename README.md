# Django CDK Construct Library

This is a CDK construct library for deploying Django applications on AWS.

High-level constructs are available for deploying applications with the following AWS compute services:

- ECS (near complete)
- EKS (in progress)
- Lambda (planned)

To use one of the constructs you need to provide:

- A path to the root of your Django project
- The location of the `Dockerfile` used to build your application's image (for EKS and ECS) relative to your Django project's root directory
- The commands used to start the process that run your application:
    - web server process (required)
    - celery (optional)
    - celery beat (optional)
- Options for how to run the application and which additional services your application requires 

This project uses the AWS CDK and is written in TypeScript, so the options for each construct are defined by TypeScript Interfaces. See [API.md](/API.md) for automatically-generated documentation on the interfaces for each construct.

The construct library is published both to `npm` and `PyPI`, so you can use it in CDK projects that are written in TypeScript or Python.

## Features

The constructs provides everything you will need for your backend including: 

- VPC (Subnets, Security Groups, AZs, NAT Gateway)
- Load Balancer
- ACM Certificates (for TLS)
- Route53 Records
- RDS (postgres)
- ElastiCache (redis)

## Using the constructs

This repository includes sample CDK applications that use the libraries. 

### EKS

Here's an example from `src/integ.django-eks.ts`:

```ts
import * as cdk from '@aws-cdk/core';
import { DjangoEks } from './index';

const env = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  account: process.env.AWS_ACCOUNT_ID,
};

const app = new cdk.App();
const stack = new cdk.Stack(app, 'DjangoEks', { env });

const construct = new DjangoEks(stack, 'Cdk-Sample-Lib', {
  imageDirectory: './test/django-step-by-step/backend',
  webCommand: [
    './scripts/start_prod.sh',
  ],
});

/**
 * Add tagging for this construct and all child constructs
 */
cdk.Tags.of(construct).add('stack', 'MyStack');
```

This sample application (and others defined in the `integ.*.ts` files in this repo) can be easily deployed for testing purposes with targets defined in the `Makefile`. To deploy the above application, you can run:

```
npm run build
make deploy-eks
```

Destroy the application with: 

```
make destroy-eks
```

This assumes that you have credentials configured in your AWS CLI with sufficient permissions and that you have [bootstrapped your AWS account](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html). You will also need to have docker CLI configured in order for CDK to build images and push them to ECR.

### ECS

The ECS construct uses the `ApplicationLoadBalancedFargateService` construct from `@aws-cdk/aws-ecs-patterns`. This is a powerful abstraction that handles a lot of the networking requirements for the construct. 

## Key differences between ECS and EKS constructs

The ECS and EKS constructs aim to do the same thing: deploy containerized applications to AWS.

### Container orchestration

The ECS constructs uses Amazon's proprietary, closed-source container orchestration tool called ECS. The EKS construct uses an [open source distribution of Kubernetes](https://github.com/aws/eks-distro) called Amazon EKS Distro (EKS-D).

### Load Balancer

Another important difference from an infrastructure and Infrastructure as Code (IaC) perspective is the use of Application Load Balancers (ALBs).

> The load balancer distributes incoming application traffic across multiple targets, such as EC2 instances, in multiple Availability Zones. 

The ECS and EKS constructs go about provisioning ALBs differently. In the ECS construct, the `ApplicationLoadBalancedFargateService` in the CDK code results in CloudFormation code that requests an application load balancer. 

The EKS construct does not directly request an ALB. Instead, it installs the [AWS Load Balancer Controller](https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html), [an open source project](https://github.com/kubernetes-sigs/aws-load-balancer-controller), using a Helm chart. This controller satisfies Kubernetes Ingress resources by provisioning Application Load Balancers. The contruct defines a Kubernetes Ingress object which, when deployed to the EKS cluster, causes the AWS Load Balancer Controller to provision an ALB. You can read more about Kubernetes Controllers [here](https://kubernetes.io/docs/concepts/architecture/controller/#direct-control).

The Ingress object defined in the construct uses [annotations](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/) that the controller processes when provisioning the ALB. A list of all supported annotations can be found [here on the AWS Load Balancer Controller website](https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/annotations/#annotations)

### Compute

One other important difference between the two constructs is the type of compute used to run the container workloads. The ECS construct uses Fargate, a serverless computer offering from AWS. The EKS construct uses EC2 instances for the worker nodes of the EKS cluster. It is possible to use Fargate with EKS, but AWS currently recommends not using Fargate for sensitive workloads on EKS.

## projen

This project uses [projen](https://github.com/projen/projen).

> projen synthesizes project configuration files such as package.json, tsconfig.json, .gitignore, GitHub Workflows, eslint, jest, etc from a well-typed definition written in JavaScript.

## Development

For development of this library, a sample Django application is included as a git submodule in `test/django-step-by-step`. This Django project is used when deploying the application, and can be replaced with your own project for testing purposes.

## Current Development Efforts

This project is under active development. Here are some of the things that I'm curently working on:

- [x] Deploy sample nginx application to test AWS Load Balancer Controller
- [ ] Pass ACM ARN to Ingress annotation
- [ ] Use Fargate Profile to deploy application on Fargate
- [ ] Configure the rest of the Django application components for the EKS construct (web, celery, RDS, ElastiCache, S3 buckets, permissions)
- [ ] Split constructs into `eks`, `ecs` and `common` directories to keep code DRY
- [ ] Build constructs for each component
- [ ] Consider using managed DB services in production environments and in-cluster services for non-production environments (external services) 
- [ ] Configure application secrets. 
- [ ] Use secrets manager secrets (boto3) for accessing secrets in products
- [ ] Look into logging and observability tools that can be used in the project (EFK, Jaeger, etc.)
- [ ] Go over this Kubernetes checklist: [https://www.weave.works/blog/production-ready-checklist-kubernetes](https://www.weave.works/blog/production-ready-checklist-kubernetes)
- [ ] Add comments to EKS resources docgen
- [ ] Add snapshot tests and refactor the application
- [ ] Add unit tests
- [ ] Consider using cdk8s or cdk8s+ for manifest declarations
- [ ] User the `dockerImageAssets` construct to define the Django project image to be used in the sample application
- [ ] 