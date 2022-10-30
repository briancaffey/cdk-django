# Django CDK

## About this construct library

`cdk-django` is a construct library for AWS Cloud Development Kit (CDK) that I wrote to learn more about infrastructure as code. It it focuses on showing how to build AWS infrastructure to support Django applications. I recommend that you only use this construct library as a reference for your own applications.

There are four major constructs in this library:

- ad hoc base
- ad hoc app
- prod base
- prod app

Ad hoc environments (or on-demand environments) are application environments that teams use internally for testing, QA, internal demos, etc. Multiple ad hoc environments build on top of a single "an hoc base" environment that provides shared resources such as:

- VPC
- security groups
- IAM roles
- Load balancer
- RDS instance

The ad hoc environments themselves consist of :

- ECS cluster
- task definitions
- ECS services
- Route 53 record
- target groups
- listener rules

I wrote about ad hoc environments in an article on my blog here: [https://briancaffey.github.io/2022/03/27/ad-hoc-developer-environments-for-django-with-aws-ecs-terraform-and-github-actions](https://briancaffey.github.io/2022/03/27/ad-hoc-developer-environments-for-django-with-aws-ecs-terraform-and-github-actions).

The prod base and prod app constructs are used for setting up infrastructure for production environments.

I have written a very similar library that will deploy almost the exact same infrastructure (both for ad hoc and production environments) using Terraform which can be found here: [https://github.com/briancaffey/terraform-aws-django](https://github.com/briancaffey/terraform-aws-django). The directory structures for these two repositories are very similar. `cdk-django` is published to npm and `terraform-aws-django` is published to the Terraform registry.

This construct library focuses on security, best practices, scalability, flexibility and cost-efficiency.

## Companion Django application

I developed this construct library together with a sample reference Django application that I wrote for learning, testing and experimentation. This Django application is a simple blogging application called **μblog**. This repo for μblog can be found here: [https://github.com/briancaffey/django-step-by-step](https://github.com/briancaffey/django-step-by-step).

This repo shows how to set up local development environments using docker and docker-compose, and also contains multiple GitHub Actions workflows that demonstrate how to use `cdk-django` to build and deploy the applications using CI/CD automation. There are GitHub Actions workflows for both `cdk-django` and `terraform-aws-django`.

## Important points

Here are some highlights of the features of this library:

### Serverless infrastructure, containerized application

The Django application is packaged into a docker container and runs on ECS Fargate, a serverless runtime that abstracts the operating system. This gives up our control over the underlying operating system that runs our application's containers, but it also enforces best practices for security and scalability.

### Access patterns

This application demonstrates how development teams can access both the application server and the database using AWS Systems Manager (SSM). This removes the need to manage overhead associated with SSH and allows for access to be controlled through IAM roles.

This follows AWS best practices for access patterns. EcsExec can be used in production for "break glass" scenarios where engineers may need to open an interactive shell that provides access to the application.

Port forwarding patterns are demonstrated to show how tools like DBeaver can be used to directly connect to the database over a secure Bastion Host placed in a private subnet.

### Scalability

This construct library demonstrates how to apply autoscaling to our ECS services so we that we can scale in and out horizontally as needed by adding or removing instances in response to load on our application.


### Safe Operations

Another major focus of this project is to show best practices for secure and safe application operations and change management. This includes patterns for safely rolling out both infrastructure updates and application updates with zero downtime.

### Cost efficiency

The production environment is quite expensive to run compared to other alternatives, so it may not be a best fit for all organizations and development teams. ECS Fargate is more expensive for comparable amounts of compute that be purchased using EC2 instances.

Ad hoc environments take advantage of Fargate Spot instances which are less expensive than regular Fargate instances. Similar to EC2 spot instances, this allows us to use "left-over" compute resources at a discount with the caveat that the instances may be shut down for rescheduling by AWS at any time (with a 2 minute warning).

## Redeploying package

Old versions have been removed. The package was deleted from npm and is being re-published.