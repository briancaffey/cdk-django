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
# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### AdHocApp <a name="AdHocApp" id="cdk-django.AdHocApp"></a>

#### Initializers <a name="Initializers" id="cdk-django.AdHocApp.Initializer"></a>

```typescript
import { AdHocApp } from 'cdk-django'

new AdHocApp(scope: Construct, id: string, props: AdHocAppProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-django.AdHocApp.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-django.AdHocApp.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.AdHocApp.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-django.AdHocAppProps">AdHocAppProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-django.AdHocApp.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-django.AdHocApp.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-django.AdHocApp.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-django.AdHocAppProps">AdHocAppProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-django.AdHocApp.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-django.AdHocApp.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-django.AdHocApp.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-django.AdHocApp.isConstruct"></a>

```typescript
import { AdHocApp } from 'cdk-django'

AdHocApp.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-django.AdHocApp.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-django.AdHocApp.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-django.AdHocApp.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### AdHocBase <a name="AdHocBase" id="cdk-django.AdHocBase"></a>

#### Initializers <a name="Initializers" id="cdk-django.AdHocBase.Initializer"></a>

```typescript
import { AdHocBase } from 'cdk-django'

new AdHocBase(scope: Construct, id: string, props: AdHocBaseProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-django.AdHocBase.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-django.AdHocBase.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.AdHocBase.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-django.AdHocBaseProps">AdHocBaseProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-django.AdHocBase.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-django.AdHocBase.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-django.AdHocBase.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-django.AdHocBaseProps">AdHocBaseProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-django.AdHocBase.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-django.AdHocBase.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-django.AdHocBase.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-django.AdHocBase.isConstruct"></a>

```typescript
import { AdHocBase } from 'cdk-django'

AdHocBase.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-django.AdHocBase.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-django.AdHocBase.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-django.AdHocBase.property.alb">alb</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationLoadBalancer</code> | *No description.* |
| <code><a href="#cdk-django.AdHocBase.property.albSecurityGroup">albSecurityGroup</a></code> | <code>aws-cdk-lib.aws_ec2.SecurityGroup</code> | *No description.* |
| <code><a href="#cdk-django.AdHocBase.property.appSecurityGroup">appSecurityGroup</a></code> | <code>aws-cdk-lib.aws_ec2.SecurityGroup</code> | *No description.* |
| <code><a href="#cdk-django.AdHocBase.property.assetsBucket">assetsBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |
| <code><a href="#cdk-django.AdHocBase.property.databaseInstance">databaseInstance</a></code> | <code>aws-cdk-lib.aws_rds.DatabaseInstance</code> | *No description.* |
| <code><a href="#cdk-django.AdHocBase.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.AdHocBase.property.listener">listener</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener</code> | *No description.* |
| <code><a href="#cdk-django.AdHocBase.property.serviceDiscoveryNamespace">serviceDiscoveryNamespace</a></code> | <code>aws-cdk-lib.aws_servicediscovery.PrivateDnsNamespace</code> | *No description.* |
| <code><a href="#cdk-django.AdHocBase.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-django.AdHocBase.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `alb`<sup>Required</sup> <a name="alb" id="cdk-django.AdHocBase.property.alb"></a>

```typescript
public readonly alb: ApplicationLoadBalancer;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationLoadBalancer

---

##### `albSecurityGroup`<sup>Required</sup> <a name="albSecurityGroup" id="cdk-django.AdHocBase.property.albSecurityGroup"></a>

```typescript
public readonly albSecurityGroup: SecurityGroup;
```

- *Type:* aws-cdk-lib.aws_ec2.SecurityGroup

---

##### `appSecurityGroup`<sup>Required</sup> <a name="appSecurityGroup" id="cdk-django.AdHocBase.property.appSecurityGroup"></a>

```typescript
public readonly appSecurityGroup: SecurityGroup;
```

- *Type:* aws-cdk-lib.aws_ec2.SecurityGroup

---

##### `assetsBucket`<sup>Required</sup> <a name="assetsBucket" id="cdk-django.AdHocBase.property.assetsBucket"></a>

```typescript
public readonly assetsBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---

##### `databaseInstance`<sup>Required</sup> <a name="databaseInstance" id="cdk-django.AdHocBase.property.databaseInstance"></a>

```typescript
public readonly databaseInstance: DatabaseInstance;
```

- *Type:* aws-cdk-lib.aws_rds.DatabaseInstance

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="cdk-django.AdHocBase.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---

##### `listener`<sup>Required</sup> <a name="listener" id="cdk-django.AdHocBase.property.listener"></a>

```typescript
public readonly listener: ApplicationListener;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener

---

##### `serviceDiscoveryNamespace`<sup>Required</sup> <a name="serviceDiscoveryNamespace" id="cdk-django.AdHocBase.property.serviceDiscoveryNamespace"></a>

```typescript
public readonly serviceDiscoveryNamespace: PrivateDnsNamespace;
```

- *Type:* aws-cdk-lib.aws_servicediscovery.PrivateDnsNamespace

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="cdk-django.AdHocBase.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---


## Structs <a name="Structs" id="Structs"></a>

### AdHocAppProps <a name="AdHocAppProps" id="cdk-django.AdHocAppProps"></a>

#### Initializer <a name="Initializer" id="cdk-django.AdHocAppProps.Initializer"></a>

```typescript
import { AdHocAppProps } from 'cdk-django'

const adHocAppProps: AdHocAppProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-django.AdHocAppProps.property.alb">alb</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer</code> | *No description.* |
| <code><a href="#cdk-django.AdHocAppProps.property.appSecurityGroup">appSecurityGroup</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup</code> | *No description.* |
| <code><a href="#cdk-django.AdHocAppProps.property.assetsBucket">assetsBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |
| <code><a href="#cdk-django.AdHocAppProps.property.baseStackName">baseStackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.AdHocAppProps.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.AdHocAppProps.property.listener">listener</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener</code> | *No description.* |
| <code><a href="#cdk-django.AdHocAppProps.property.rdsInstance">rdsInstance</a></code> | <code>aws-cdk-lib.aws_rds.DatabaseInstance</code> | *No description.* |
| <code><a href="#cdk-django.AdHocAppProps.property.serviceDiscoveryNamespace">serviceDiscoveryNamespace</a></code> | <code>aws-cdk-lib.aws_servicediscovery.PrivateDnsNamespace</code> | *No description.* |
| <code><a href="#cdk-django.AdHocAppProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |

---

##### `alb`<sup>Required</sup> <a name="alb" id="cdk-django.AdHocAppProps.property.alb"></a>

```typescript
public readonly alb: IApplicationLoadBalancer;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer

---

##### `appSecurityGroup`<sup>Required</sup> <a name="appSecurityGroup" id="cdk-django.AdHocAppProps.property.appSecurityGroup"></a>

```typescript
public readonly appSecurityGroup: ISecurityGroup;
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup

---

##### `assetsBucket`<sup>Required</sup> <a name="assetsBucket" id="cdk-django.AdHocAppProps.property.assetsBucket"></a>

```typescript
public readonly assetsBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---

##### `baseStackName`<sup>Required</sup> <a name="baseStackName" id="cdk-django.AdHocAppProps.property.baseStackName"></a>

```typescript
public readonly baseStackName: string;
```

- *Type:* string

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="cdk-django.AdHocAppProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---

##### `listener`<sup>Required</sup> <a name="listener" id="cdk-django.AdHocAppProps.property.listener"></a>

```typescript
public readonly listener: ApplicationListener;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener

---

##### `rdsInstance`<sup>Required</sup> <a name="rdsInstance" id="cdk-django.AdHocAppProps.property.rdsInstance"></a>

```typescript
public readonly rdsInstance: DatabaseInstance;
```

- *Type:* aws-cdk-lib.aws_rds.DatabaseInstance

---

##### `serviceDiscoveryNamespace`<sup>Required</sup> <a name="serviceDiscoveryNamespace" id="cdk-django.AdHocAppProps.property.serviceDiscoveryNamespace"></a>

```typescript
public readonly serviceDiscoveryNamespace: PrivateDnsNamespace;
```

- *Type:* aws-cdk-lib.aws_servicediscovery.PrivateDnsNamespace

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="cdk-django.AdHocAppProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---

### AdHocBaseProps <a name="AdHocBaseProps" id="cdk-django.AdHocBaseProps"></a>

#### Initializer <a name="Initializer" id="cdk-django.AdHocBaseProps.Initializer"></a>

```typescript
import { AdHocBaseProps } from 'cdk-django'

const adHocBaseProps: AdHocBaseProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-django.AdHocBaseProps.property.certificateArn">certificateArn</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.AdHocBaseProps.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |

---

##### `certificateArn`<sup>Required</sup> <a name="certificateArn" id="cdk-django.AdHocBaseProps.property.certificateArn"></a>

```typescript
public readonly certificateArn: string;
```

- *Type:* string

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="cdk-django.AdHocBaseProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---



