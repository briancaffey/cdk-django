# Django CDK

## About this construct library

`cdk-django` is a library for deploying Django applications to AWS using ECS Fargate.

`cdk-django` aims to demonstrate best-practices for building web applications in AWS cloud. Executing the code in this project will build cloud resources such as networks, servers and databases that power a web application that can run securely on the public internet.

You don't need to use this library directly in your code. It is recommended that you use this repo as a guide. It includes common patterns that are used when working with Infrastructure as Code.

### Companion application

This project has a companion repo that contains a Django (Python) web application backend and a Nuxt.js frontend site (server-rendered Vue.js written in TypeScript). This project can be found here:

[https://github.com/briancaffey/django-step-by-step/](https://github.com/briancaffey/django-step-by-step/)

### Related projects

This project is has been written with the two other main Infrastructure as Code tools: Terraform and Pulumi. You can find these repos here:

- [terraform-aws-django](https://github.com/briancaffey/terraform-aws-django)
- [pulumi-aws-django](https://github.com/briancaffey/pulumi-aws-django)

## Project structure

There are two main constructs the build resources for the different stacks:

- `base`
- `app`

The `base` stack deploys long-lived resources that shouldn't need to be updated frequently, these include:

- VPC
- ElastiCache
- S3
- Security Groups
- Load balancer
- RDS

The `app` stack deploys resources primarily for ECS services that run the application processes, these include:

- ECS cluster for the environment
- web-facing services (for running gunicorn and for running the frontend UI app)
- celery worker for asynchronous task processing
- celery beat for scheduled tasks
- management_command for running migrations and other "pre-update" tasks (collectstatic, loading fixtures, etc.)
- All backend environment variables are configured here (shared between all backend services)
- Route 53 record for the environment (e.g. `<env_name>.example.com`)
- IAM resources (this might be able to be moved to the base stack)

### Local Examples

It is best to deploy cloud infrastructure with automated pipelines that execute Infrastructure as Code. For testing and development you can deploy locally.

The `Makefile` in this repo documents the commands to create and destroy infrastructure for the `base` and `app` stacks. For example:

```
# TODO update this example
```

## Companion application

To see how `terraform-aws-django` can be used, have a look at [https://github.com/briancaffey/django-step-by-step](https://github.com/briancaffey/django-step-by-step).

This companion repo includes two main components: a Django application (backend) and a Nuxt.js application (frontend)

### Django backend application features

- email-based authentication flow (confirmation email + forgot password)
- microblog app (users can write posts with text and images, like posts)
- chat app (a simple OpenAI API wrapper)

### Nuxt.js frontend client features

- Vue 3, Nuxt v3.15
- SSR
- shadcn
- tailwindcss
- pinia
- composables

This construct library focuses on security, best practices, scalability, flexibility and cost-efficiency.

## Maintaining this repo

Make sure you are on the most recent version of CDK:

```
npm i -g aws-cdk
```

This project is managed by [`projen`](https://github.com/projen/projen). To update the application, run the following:

```
npx projen upgrade
```

Update [CDK version](https://github.com/aws/aws-cdk/releases) in `.projenrc.ts` and then run:

```
npx projen
```

Run `npx projen watch` in one terminal. In another terminal, export AWS credentials and then run commands in the `Makefile`.
