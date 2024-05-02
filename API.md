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
| <code><a href="#cdk-django.AdHocBase.property.elastiCacheHostname">elastiCacheHostname</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.AdHocBase.property.listener">listener</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener</code> | *No description.* |
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

##### `elastiCacheHostname`<sup>Required</sup> <a name="elastiCacheHostname" id="cdk-django.AdHocBase.property.elastiCacheHostname"></a>

```typescript
public readonly elastiCacheHostname: string;
```

- *Type:* string

---

##### `listener`<sup>Required</sup> <a name="listener" id="cdk-django.AdHocBase.property.listener"></a>

```typescript
public readonly listener: ApplicationListener;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener

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
| <code><a href="#cdk-django.AdHocAppProps.property.elastiCacheHost">elastiCacheHost</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-django.AdHocAppProps.property.listener">listener</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener</code> | *No description.* |
| <code><a href="#cdk-django.AdHocAppProps.property.rdsInstance">rdsInstance</a></code> | <code>aws-cdk-lib.aws_rds.DatabaseInstance</code> | *No description.* |
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

##### `elastiCacheHost`<sup>Required</sup> <a name="elastiCacheHost" id="cdk-django.AdHocAppProps.property.elastiCacheHost"></a>

```typescript
public readonly elastiCacheHost: string;
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



