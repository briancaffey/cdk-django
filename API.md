# API Reference

**Classes**

Name|Description
----|-----------
[DjangoEcs](#django-cdk-djangoecs)|Configures a Django project using ECS Fargate.
[DjangoEks](#django-cdk-djangoeks)|Configures a Django project using EKS.


**Structs**

Name|Description
----|-----------
[DjangoEcsProps](#django-cdk-djangoecsprops)|Options to configure a Django ECS project.
[DjangoEksProps](#django-cdk-djangoeksprops)|Options to configure a Django EKS project.



## class DjangoEcs  <a id="django-cdk-djangoecs"></a>

Configures a Django project using ECS Fargate.

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new DjangoEcs(scope: Construct, id: string, props: DjangoEcsProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[DjangoEcsProps](#django-cdk-djangoecsprops)</code>)  *No description*
  * **imageDirectory** (<code>string</code>)  The location of the Dockerfile used to create the main application image. 
  * **bucketName** (<code>string</code>)  Name of existing bucket to use for media files. __*Optional*__
  * **certificateArn** (<code>string</code>)  Certificate ARN. __*Optional*__
  * **domainName** (<code>string</code>)  Domain name for backend (including sub-domain). __*Optional*__
  * **useCeleryBeat** (<code>boolean</code>)  Used to enable the celery beat service. __*Default*__: false
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  The VPC to use for the application. It must contain PUBLIC, PRIVATE and ISOLATED subnets. __*Optional*__
  * **webCommand** (<code>Array<string></code>)  The command used to run the API web service. __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**cluster** | <code>[Cluster](#aws-cdk-aws-ecs-cluster)</code> | <span></span>
**image** | <code>[ContainerImage](#aws-cdk-aws-ecs-containerimage)</code> | <span></span>
**staticFileBucket** | <code>[Bucket](#aws-cdk-aws-s3-bucket)</code> | <span></span>
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | <span></span>



## class DjangoEks  <a id="django-cdk-djangoeks"></a>

Configures a Django project using EKS.

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new DjangoEks(scope: Construct, id: string, props: DjangoEksProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[DjangoEksProps](#django-cdk-djangoeksprops)</code>)  *No description*
  * **imageDirectory** (<code>string</code>)  The location of the Dockerfile used to create the main application image. 
  * **bucketName** (<code>string</code>)  Name of existing bucket to use for media files. __*Optional*__
  * **certificateArn** (<code>string</code>)  Certificate ARN. __*Optional*__
  * **domainName** (<code>string</code>)  Domain name for backend (including sub-domain). __*Optional*__
  * **useCeleryBeat** (<code>boolean</code>)  Used to enable the celery beat service. __*Default*__: false
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  The VPC to use for the application. It must contain PUBLIC, PRIVATE and ISOLATED subnets. __*Optional*__
  * **webCommand** (<code>Array<string></code>)  The command used to run the API web service. __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**cluster** | <code>[Cluster](#aws-cdk-aws-eks-cluster)</code> | <span></span>
**staticFileBucket** | <code>[Bucket](#aws-cdk-aws-s3-bucket)</code> | <span></span>
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | <span></span>



## struct DjangoEcsProps  <a id="django-cdk-djangoecsprops"></a>


Options to configure a Django ECS project.



Name | Type | Description 
-----|------|-------------
**imageDirectory** | <code>string</code> | The location of the Dockerfile used to create the main application image.
**bucketName**? | <code>string</code> | Name of existing bucket to use for media files.<br/>__*Optional*__
**certificateArn**? | <code>string</code> | Certificate ARN.<br/>__*Optional*__
**domainName**? | <code>string</code> | Domain name for backend (including sub-domain).<br/>__*Optional*__
**useCeleryBeat**? | <code>boolean</code> | Used to enable the celery beat service.<br/>__*Default*__: false
**vpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC to use for the application. It must contain PUBLIC, PRIVATE and ISOLATED subnets.<br/>__*Optional*__
**webCommand**? | <code>Array<string></code> | The command used to run the API web service.<br/>__*Optional*__



## struct DjangoEksProps  <a id="django-cdk-djangoeksprops"></a>


Options to configure a Django EKS project.



Name | Type | Description 
-----|------|-------------
**imageDirectory** | <code>string</code> | The location of the Dockerfile used to create the main application image.
**bucketName**? | <code>string</code> | Name of existing bucket to use for media files.<br/>__*Optional*__
**certificateArn**? | <code>string</code> | Certificate ARN.<br/>__*Optional*__
**domainName**? | <code>string</code> | Domain name for backend (including sub-domain).<br/>__*Optional*__
**useCeleryBeat**? | <code>boolean</code> | Used to enable the celery beat service.<br/>__*Default*__: false
**vpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC to use for the application. It must contain PUBLIC, PRIVATE and ISOLATED subnets.<br/>__*Optional*__
**webCommand**? | <code>Array<string></code> | The command used to run the API web service.<br/>__*Optional*__



