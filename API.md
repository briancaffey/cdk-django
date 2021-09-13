# API Reference

**Classes**

Name|Description
----|-----------
[DjangoEcs](#django-cdk-djangoecs)|Configures a Django project using ECS Fargate.
[DjangoEks](#django-cdk-djangoeks)|Configures a Django project using EKS.
[S3BucketResources](#django-cdk-s3bucketresources)|Construct that configures an S3 bucket.
[StaticSite](#django-cdk-staticsite)|Construct for a static website hosted with S3 and CloudFront.


**Structs**

Name|Description
----|-----------
[DjangoEcsProps](#django-cdk-djangoecsprops)|Options to configure a Django ECS project.
[DjangoEksProps](#django-cdk-djangoeksprops)|Options to configure a Django EKS project.
[S3BucketProps](#django-cdk-s3bucketprops)|Properties for the S3 bucket.
[StaticSiteProps](#django-cdk-staticsiteprops)|*No description*



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
  * **apiDomainName** (<code>string</code>)  Domain name for backend (including sub-domain). __*Optional*__
  * **bucketName** (<code>string</code>)  Name of existing bucket to use for media files. __*Optional*__
  * **certificateArn** (<code>string</code>)  Certificate ARN. __*Optional*__
  * **useCeleryBeat** (<code>boolean</code>)  Used to enable the celery beat service. __*Default*__: false
  * **useEcsExec** (<code>boolean</code>)  This allows you to exec into the backend API container using ECS Exec. __*Default*__: false
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  The VPC to use for the application. It must contain PUBLIC, PRIVATE and ISOLATED subnets. __*Optional*__
  * **webCommand** (<code>Array<string></code>)  The command used to run the API web service. __*Optional*__
  * **zoneName** (<code>string</code>)  *No description* __*Optional*__



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



## class S3BucketResources  <a id="django-cdk-s3bucketresources"></a>

Construct that configures an S3 bucket.

Use this construct when you want to host Django media files
in S3 but you are not using AWS for hosting your main Django app.

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new S3BucketResources(scope: Construct, id: string, props: S3BucketProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[S3BucketProps](#django-cdk-s3bucketprops)</code>)  *No description*
  * **bucketName** (<code>string</code>)  The name of the S3 bucket. __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**bucketName**? | <code>string</code> | __*Optional*__



## class StaticSite  <a id="django-cdk-staticsite"></a>

Construct for a static website hosted with S3 and CloudFront.

https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/static-site/static-site.ts

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new StaticSite(scope: Construct, id: string, props: StaticSiteProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[StaticSiteProps](#django-cdk-staticsiteprops)</code>)  *No description*
  * **frontendDomainName** (<code>string</code>)  Domain name for static site (including sub-domain). 
  * **pathToDist** (<code>string</code>)  Path to static site distribution directory. 
  * **zoneName** (<code>string</code>)  The zoneName of the hosted zone. 
  * **certificateArn** (<code>string</code>)  Certificate ARN. __*Optional*__




## struct DjangoEcsProps  <a id="django-cdk-djangoecsprops"></a>


Options to configure a Django ECS project.



Name | Type | Description 
-----|------|-------------
**imageDirectory** | <code>string</code> | The location of the Dockerfile used to create the main application image.
**apiDomainName**? | <code>string</code> | Domain name for backend (including sub-domain).<br/>__*Optional*__
**bucketName**? | <code>string</code> | Name of existing bucket to use for media files.<br/>__*Optional*__
**certificateArn**? | <code>string</code> | Certificate ARN.<br/>__*Optional*__
**useCeleryBeat**? | <code>boolean</code> | Used to enable the celery beat service.<br/>__*Default*__: false
**useEcsExec**? | <code>boolean</code> | This allows you to exec into the backend API container using ECS Exec.<br/>__*Default*__: false
**vpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC to use for the application. It must contain PUBLIC, PRIVATE and ISOLATED subnets.<br/>__*Optional*__
**webCommand**? | <code>Array<string></code> | The command used to run the API web service.<br/>__*Optional*__
**zoneName**? | <code>string</code> | __*Optional*__



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



## struct S3BucketProps  <a id="django-cdk-s3bucketprops"></a>


Properties for the S3 bucket.



Name | Type | Description 
-----|------|-------------
**bucketName**? | <code>string</code> | The name of the S3 bucket.<br/>__*Optional*__



## struct StaticSiteProps  <a id="django-cdk-staticsiteprops"></a>






Name | Type | Description 
-----|------|-------------
**frontendDomainName** | <code>string</code> | Domain name for static site (including sub-domain).
**pathToDist** | <code>string</code> | Path to static site distribution directory.
**zoneName** | <code>string</code> | The zoneName of the hosted zone.
**certificateArn**? | <code>string</code> | Certificate ARN.<br/>__*Optional*__



