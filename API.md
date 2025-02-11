# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### EcsApp <a name="EcsApp" id="cdk-django.EcsApp"></a>

#### Initializers <a name="Initializers" id="cdk-django.EcsApp.Initializer"></a>

```typescript
import { EcsApp } from 'cdk-django'

new EcsApp(scope: Construct, id: string, props: EcsAppProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-django.EcsApp.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-django.EcsApp.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.EcsApp.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-django.EcsAppProps">EcsAppProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-django.EcsApp.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-django.EcsApp.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-django.EcsApp.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-django.EcsAppProps">EcsAppProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-django.EcsApp.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-django.EcsApp.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-django.EcsApp.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-django.EcsApp.isConstruct"></a>

```typescript
import { EcsApp } from 'cdk-django'

EcsApp.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-django.EcsApp.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-django.EcsApp.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-django.EcsApp.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### EcsBase <a name="EcsBase" id="cdk-django.EcsBase"></a>

#### Initializers <a name="Initializers" id="cdk-django.EcsBase.Initializer"></a>

```typescript
import { EcsBase } from 'cdk-django'

new EcsBase(scope: Construct, id: string, props: EcsBaseProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-django.EcsBase.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-django.EcsBase.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.EcsBase.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-django.EcsBaseProps">EcsBaseProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-django.EcsBase.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-django.EcsBase.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-django.EcsBase.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-django.EcsBaseProps">EcsBaseProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-django.EcsBase.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-django.EcsBase.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-django.EcsBase.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-django.EcsBase.isConstruct"></a>

```typescript
import { EcsBase } from 'cdk-django'

EcsBase.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-django.EcsBase.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-django.EcsBase.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-django.EcsBase.property.alb">alb</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationLoadBalancer</code> | *No description.* |
| <code><a href="#cdk-django.EcsBase.property.albSecurityGroup">albSecurityGroup</a></code> | <code>aws-cdk-lib.aws_ec2.SecurityGroup</code> | *No description.* |
| <code><a href="#cdk-django.EcsBase.property.appSecurityGroup">appSecurityGroup</a></code> | <code>aws-cdk-lib.aws_ec2.SecurityGroup</code> | *No description.* |
| <code><a href="#cdk-django.EcsBase.property.assetsBucket">assetsBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |
| <code><a href="#cdk-django.EcsBase.property.databaseInstance">databaseInstance</a></code> | <code>aws-cdk-lib.aws_rds.DatabaseInstance</code> | *No description.* |
| <code><a href="#cdk-django.EcsBase.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.EcsBase.property.elastiCacheHostname">elastiCacheHostname</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.EcsBase.property.listener">listener</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener</code> | *No description.* |
| <code><a href="#cdk-django.EcsBase.property.rdsPasswordSecretName">rdsPasswordSecretName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.EcsBase.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-django.EcsBase.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `alb`<sup>Required</sup> <a name="alb" id="cdk-django.EcsBase.property.alb"></a>

```typescript
public readonly alb: ApplicationLoadBalancer;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationLoadBalancer

---

##### `albSecurityGroup`<sup>Required</sup> <a name="albSecurityGroup" id="cdk-django.EcsBase.property.albSecurityGroup"></a>

```typescript
public readonly albSecurityGroup: SecurityGroup;
```

- *Type:* aws-cdk-lib.aws_ec2.SecurityGroup

---

##### `appSecurityGroup`<sup>Required</sup> <a name="appSecurityGroup" id="cdk-django.EcsBase.property.appSecurityGroup"></a>

```typescript
public readonly appSecurityGroup: SecurityGroup;
```

- *Type:* aws-cdk-lib.aws_ec2.SecurityGroup

---

##### `assetsBucket`<sup>Required</sup> <a name="assetsBucket" id="cdk-django.EcsBase.property.assetsBucket"></a>

```typescript
public readonly assetsBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---

##### `databaseInstance`<sup>Required</sup> <a name="databaseInstance" id="cdk-django.EcsBase.property.databaseInstance"></a>

```typescript
public readonly databaseInstance: DatabaseInstance;
```

- *Type:* aws-cdk-lib.aws_rds.DatabaseInstance

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="cdk-django.EcsBase.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---

##### `elastiCacheHostname`<sup>Required</sup> <a name="elastiCacheHostname" id="cdk-django.EcsBase.property.elastiCacheHostname"></a>

```typescript
public readonly elastiCacheHostname: string;
```

- *Type:* string

---

##### `listener`<sup>Required</sup> <a name="listener" id="cdk-django.EcsBase.property.listener"></a>

```typescript
public readonly listener: ApplicationListener;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener

---

##### `rdsPasswordSecretName`<sup>Required</sup> <a name="rdsPasswordSecretName" id="cdk-django.EcsBase.property.rdsPasswordSecretName"></a>

```typescript
public readonly rdsPasswordSecretName: string;
```

- *Type:* string

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="cdk-django.EcsBase.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---


## Structs <a name="Structs" id="Structs"></a>

### EcsAppProps <a name="EcsAppProps" id="cdk-django.EcsAppProps"></a>

#### Initializer <a name="Initializer" id="cdk-django.EcsAppProps.Initializer"></a>

```typescript
import { EcsAppProps } from 'cdk-django'

const ecsAppProps: EcsAppProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-django.EcsAppProps.property.alb">alb</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer</code> | *No description.* |
| <code><a href="#cdk-django.EcsAppProps.property.appSecurityGroup">appSecurityGroup</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup</code> | *No description.* |
| <code><a href="#cdk-django.EcsAppProps.property.assetsBucket">assetsBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |
| <code><a href="#cdk-django.EcsAppProps.property.baseStackName">baseStackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.EcsAppProps.property.companyName">companyName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.EcsAppProps.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.EcsAppProps.property.elastiCacheHost">elastiCacheHost</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.EcsAppProps.property.listener">listener</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener</code> | *No description.* |
| <code><a href="#cdk-django.EcsAppProps.property.rdsInstance">rdsInstance</a></code> | <code>aws-cdk-lib.aws_rds.DatabaseInstance</code> | *No description.* |
| <code><a href="#cdk-django.EcsAppProps.property.rdsPasswordSecretName">rdsPasswordSecretName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.EcsAppProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |

---

##### `alb`<sup>Required</sup> <a name="alb" id="cdk-django.EcsAppProps.property.alb"></a>

```typescript
public readonly alb: IApplicationLoadBalancer;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer

---

##### `appSecurityGroup`<sup>Required</sup> <a name="appSecurityGroup" id="cdk-django.EcsAppProps.property.appSecurityGroup"></a>

```typescript
public readonly appSecurityGroup: ISecurityGroup;
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup

---

##### `assetsBucket`<sup>Required</sup> <a name="assetsBucket" id="cdk-django.EcsAppProps.property.assetsBucket"></a>

```typescript
public readonly assetsBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---

##### `baseStackName`<sup>Required</sup> <a name="baseStackName" id="cdk-django.EcsAppProps.property.baseStackName"></a>

```typescript
public readonly baseStackName: string;
```

- *Type:* string

---

##### `companyName`<sup>Required</sup> <a name="companyName" id="cdk-django.EcsAppProps.property.companyName"></a>

```typescript
public readonly companyName: string;
```

- *Type:* string

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="cdk-django.EcsAppProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---

##### `elastiCacheHost`<sup>Required</sup> <a name="elastiCacheHost" id="cdk-django.EcsAppProps.property.elastiCacheHost"></a>

```typescript
public readonly elastiCacheHost: string;
```

- *Type:* string

---

##### `listener`<sup>Required</sup> <a name="listener" id="cdk-django.EcsAppProps.property.listener"></a>

```typescript
public readonly listener: ApplicationListener;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener

---

##### `rdsInstance`<sup>Required</sup> <a name="rdsInstance" id="cdk-django.EcsAppProps.property.rdsInstance"></a>

```typescript
public readonly rdsInstance: DatabaseInstance;
```

- *Type:* aws-cdk-lib.aws_rds.DatabaseInstance

---

##### `rdsPasswordSecretName`<sup>Required</sup> <a name="rdsPasswordSecretName" id="cdk-django.EcsAppProps.property.rdsPasswordSecretName"></a>

```typescript
public readonly rdsPasswordSecretName: string;
```

- *Type:* string

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="cdk-django.EcsAppProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---

### EcsBaseProps <a name="EcsBaseProps" id="cdk-django.EcsBaseProps"></a>

#### Initializer <a name="Initializer" id="cdk-django.EcsBaseProps.Initializer"></a>

```typescript
import { EcsBaseProps } from 'cdk-django'

const ecsBaseProps: EcsBaseProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-django.EcsBaseProps.property.certificateArn">certificateArn</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.EcsBaseProps.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |

---

##### `certificateArn`<sup>Required</sup> <a name="certificateArn" id="cdk-django.EcsBaseProps.property.certificateArn"></a>

```typescript
public readonly certificateArn: string;
```

- *Type:* string

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="cdk-django.EcsBaseProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---



