# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### AdHocApp <a name="AdHocApp" id="django-cdk.AdHocApp"></a>

#### Initializers <a name="Initializers" id="django-cdk.AdHocApp.Initializer"></a>

```typescript
import { AdHocApp } from 'django-cdk'

new AdHocApp(scope: Construct, id: string, props: AdHocAppProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#django-cdk.AdHocApp.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#django-cdk.AdHocApp.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#django-cdk.AdHocApp.Initializer.parameter.props">props</a></code> | <code><a href="#django-cdk.AdHocAppProps">AdHocAppProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="django-cdk.AdHocApp.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="django-cdk.AdHocApp.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="django-cdk.AdHocApp.Initializer.parameter.props"></a>

- *Type:* <a href="#django-cdk.AdHocAppProps">AdHocAppProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#django-cdk.AdHocApp.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="django-cdk.AdHocApp.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#django-cdk.AdHocApp.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="django-cdk.AdHocApp.isConstruct"></a>

```typescript
import { AdHocApp } from 'django-cdk'

AdHocApp.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="django-cdk.AdHocApp.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#django-cdk.AdHocApp.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="django-cdk.AdHocApp.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### AdHocBase <a name="AdHocBase" id="django-cdk.AdHocBase"></a>

#### Initializers <a name="Initializers" id="django-cdk.AdHocBase.Initializer"></a>

```typescript
import { AdHocBase } from 'django-cdk'

new AdHocBase(scope: Construct, id: string, props: AdHocBaseProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#django-cdk.AdHocBase.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#django-cdk.AdHocBase.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#django-cdk.AdHocBase.Initializer.parameter.props">props</a></code> | <code><a href="#django-cdk.AdHocBaseProps">AdHocBaseProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="django-cdk.AdHocBase.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="django-cdk.AdHocBase.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="django-cdk.AdHocBase.Initializer.parameter.props"></a>

- *Type:* <a href="#django-cdk.AdHocBaseProps">AdHocBaseProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#django-cdk.AdHocBase.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="django-cdk.AdHocBase.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#django-cdk.AdHocBase.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="django-cdk.AdHocBase.isConstruct"></a>

```typescript
import { AdHocBase } from 'django-cdk'

AdHocBase.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="django-cdk.AdHocBase.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#django-cdk.AdHocBase.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#django-cdk.AdHocBase.property.alb">alb</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationLoadBalancer</code> | *No description.* |
| <code><a href="#django-cdk.AdHocBase.property.appSecurityGroup">appSecurityGroup</a></code> | <code>aws-cdk-lib.aws_ec2.SecurityGroup</code> | *No description.* |
| <code><a href="#django-cdk.AdHocBase.property.assetsBucket">assetsBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |
| <code><a href="#django-cdk.AdHocBase.property.databaseInstance">databaseInstance</a></code> | <code>aws-cdk-lib.aws_rds.DatabaseInstance</code> | *No description.* |
| <code><a href="#django-cdk.AdHocBase.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#django-cdk.AdHocBase.property.listener">listener</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener</code> | *No description.* |
| <code><a href="#django-cdk.AdHocBase.property.serviceDiscoveryNamespace">serviceDiscoveryNamespace</a></code> | <code>aws-cdk-lib.aws_servicediscovery.PrivateDnsNamespace</code> | *No description.* |
| <code><a href="#django-cdk.AdHocBase.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="django-cdk.AdHocBase.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `alb`<sup>Required</sup> <a name="alb" id="django-cdk.AdHocBase.property.alb"></a>

```typescript
public readonly alb: ApplicationLoadBalancer;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationLoadBalancer

---

##### `appSecurityGroup`<sup>Required</sup> <a name="appSecurityGroup" id="django-cdk.AdHocBase.property.appSecurityGroup"></a>

```typescript
public readonly appSecurityGroup: SecurityGroup;
```

- *Type:* aws-cdk-lib.aws_ec2.SecurityGroup

---

##### `assetsBucket`<sup>Required</sup> <a name="assetsBucket" id="django-cdk.AdHocBase.property.assetsBucket"></a>

```typescript
public readonly assetsBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---

##### `databaseInstance`<sup>Required</sup> <a name="databaseInstance" id="django-cdk.AdHocBase.property.databaseInstance"></a>

```typescript
public readonly databaseInstance: DatabaseInstance;
```

- *Type:* aws-cdk-lib.aws_rds.DatabaseInstance

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="django-cdk.AdHocBase.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---

##### `listener`<sup>Required</sup> <a name="listener" id="django-cdk.AdHocBase.property.listener"></a>

```typescript
public readonly listener: ApplicationListener;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener

---

##### `serviceDiscoveryNamespace`<sup>Required</sup> <a name="serviceDiscoveryNamespace" id="django-cdk.AdHocBase.property.serviceDiscoveryNamespace"></a>

```typescript
public readonly serviceDiscoveryNamespace: PrivateDnsNamespace;
```

- *Type:* aws-cdk-lib.aws_servicediscovery.PrivateDnsNamespace

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="django-cdk.AdHocBase.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---


## Structs <a name="Structs" id="Structs"></a>

### AdHocAppProps <a name="AdHocAppProps" id="django-cdk.AdHocAppProps"></a>

#### Initializer <a name="Initializer" id="django-cdk.AdHocAppProps.Initializer"></a>

```typescript
import { AdHocAppProps } from 'django-cdk'

const adHocAppProps: AdHocAppProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#django-cdk.AdHocAppProps.property.alb">alb</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer</code> | *No description.* |
| <code><a href="#django-cdk.AdHocAppProps.property.appSecurityGroup">appSecurityGroup</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup</code> | *No description.* |
| <code><a href="#django-cdk.AdHocAppProps.property.assetsBucket">assetsBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |
| <code><a href="#django-cdk.AdHocAppProps.property.backendVersion">backendVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#django-cdk.AdHocAppProps.property.baseStackName">baseStackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#django-cdk.AdHocAppProps.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#django-cdk.AdHocAppProps.property.frontendVersion">frontendVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#django-cdk.AdHocAppProps.property.listener">listener</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener</code> | *No description.* |
| <code><a href="#django-cdk.AdHocAppProps.property.rdsInstance">rdsInstance</a></code> | <code>aws-cdk-lib.aws_rds.DatabaseInstance</code> | *No description.* |
| <code><a href="#django-cdk.AdHocAppProps.property.serviceDiscoveryNamespace">serviceDiscoveryNamespace</a></code> | <code>aws-cdk-lib.aws_servicediscovery.PrivateDnsNamespace</code> | *No description.* |
| <code><a href="#django-cdk.AdHocAppProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |
| <code><a href="#django-cdk.AdHocAppProps.property.djangoSettingsModule">djangoSettingsModule</a></code> | <code>string</code> | *No description.* |

---

##### `alb`<sup>Required</sup> <a name="alb" id="django-cdk.AdHocAppProps.property.alb"></a>

```typescript
public readonly alb: IApplicationLoadBalancer;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer

---

##### `appSecurityGroup`<sup>Required</sup> <a name="appSecurityGroup" id="django-cdk.AdHocAppProps.property.appSecurityGroup"></a>

```typescript
public readonly appSecurityGroup: ISecurityGroup;
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup

---

##### `assetsBucket`<sup>Required</sup> <a name="assetsBucket" id="django-cdk.AdHocAppProps.property.assetsBucket"></a>

```typescript
public readonly assetsBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---

##### `backendVersion`<sup>Required</sup> <a name="backendVersion" id="django-cdk.AdHocAppProps.property.backendVersion"></a>

```typescript
public readonly backendVersion: string;
```

- *Type:* string

---

##### `baseStackName`<sup>Required</sup> <a name="baseStackName" id="django-cdk.AdHocAppProps.property.baseStackName"></a>

```typescript
public readonly baseStackName: string;
```

- *Type:* string

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="django-cdk.AdHocAppProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---

##### `frontendVersion`<sup>Required</sup> <a name="frontendVersion" id="django-cdk.AdHocAppProps.property.frontendVersion"></a>

```typescript
public readonly frontendVersion: string;
```

- *Type:* string

---

##### `listener`<sup>Required</sup> <a name="listener" id="django-cdk.AdHocAppProps.property.listener"></a>

```typescript
public readonly listener: ApplicationListener;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ApplicationListener

---

##### `rdsInstance`<sup>Required</sup> <a name="rdsInstance" id="django-cdk.AdHocAppProps.property.rdsInstance"></a>

```typescript
public readonly rdsInstance: DatabaseInstance;
```

- *Type:* aws-cdk-lib.aws_rds.DatabaseInstance

---

##### `serviceDiscoveryNamespace`<sup>Required</sup> <a name="serviceDiscoveryNamespace" id="django-cdk.AdHocAppProps.property.serviceDiscoveryNamespace"></a>

```typescript
public readonly serviceDiscoveryNamespace: PrivateDnsNamespace;
```

- *Type:* aws-cdk-lib.aws_servicediscovery.PrivateDnsNamespace

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="django-cdk.AdHocAppProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---

##### `djangoSettingsModule`<sup>Optional</sup> <a name="djangoSettingsModule" id="django-cdk.AdHocAppProps.property.djangoSettingsModule"></a>

```typescript
public readonly djangoSettingsModule: string;
```

- *Type:* string

---

### AdHocBaseProps <a name="AdHocBaseProps" id="django-cdk.AdHocBaseProps"></a>

#### Initializer <a name="Initializer" id="django-cdk.AdHocBaseProps.Initializer"></a>

```typescript
import { AdHocBaseProps } from 'django-cdk'

const adHocBaseProps: AdHocBaseProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#django-cdk.AdHocBaseProps.property.certificateArn">certificateArn</a></code> | <code>string</code> | *No description.* |
| <code><a href="#django-cdk.AdHocBaseProps.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |

---

##### `certificateArn`<sup>Required</sup> <a name="certificateArn" id="django-cdk.AdHocBaseProps.property.certificateArn"></a>

```typescript
public readonly certificateArn: string;
```

- *Type:* string

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="django-cdk.AdHocBaseProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---



