# API Reference

**Classes**

Name|Description
----|-----------
[DjangoCdk](#django-cdk-djangocdk)|*No description*


**Structs**

Name|Description
----|-----------
[DjangoCdkProps](#django-cdk-djangocdkprops)|*No description*



## class DjangoCdk  <a id="django-cdk-djangocdk"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new DjangoCdk(scope: Construct, id: string, props: DjangoCdkProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[DjangoCdkProps](#django-cdk-djangocdkprops)</code>)  *No description*
  * **imageDirectory** (<code>string</code>)  *No description* 
  * **bucketName** (<code>string</code>)  Options to configure a Django CDK project. __*Optional*__
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  *No description* __*Optional*__
  * **webCommand** (<code>Array<string></code>)  *No description* __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**staticFileBucket** | <code>[Bucket](#aws-cdk-aws-s3-bucket)</code> | <span></span>
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | <span></span>



## struct DjangoCdkProps  <a id="django-cdk-djangocdkprops"></a>






Name | Type | Description 
-----|------|-------------
**imageDirectory** | <code>string</code> | <span></span>
**bucketName**? | <code>string</code> | Options to configure a Django CDK project.<br/>__*Optional*__
**vpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | __*Optional*__
**webCommand**? | <code>Array<string></code> | __*Optional*__



