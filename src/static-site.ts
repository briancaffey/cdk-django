// https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/static-site/static-site.ts#L113
import * as fs from 'fs';
import * as path from 'path';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';

import * as cdk from '@aws-cdk/core';
import {
  AllowedMethods,
  OriginRequestQueryStringBehavior,
  OriginRequestCookieBehavior,
  OriginRequestHeaderBehavior
} from '@aws-cdk/aws-cloudfront';

export interface StaticSiteProps {

  /**
   * Path to static site distribution directory
   */
  readonly pathToDist: string;

  /**
   * The zoneName of the hosted zone
   */
  readonly zoneName: string;
  /**
   * Domain name for static site (including sub-domain)
   */
  readonly frontendDomainName: string;

  /**
    * Certificate ARN
    */
  readonly certificateArn?: string;

  /**
   *
   * Load Balancer
   *
   * If the backend and the frontend are served on the same site,
   * this is required. CloudFront will act as a proxy, doing
   * path-based routing to the backend load balancer (for example,
   * all requests starting with `/api/*`)
   *
   *
   **/
  readonly loadBalancer?: elbv2.ApplicationLoadBalancer;

  /**
   * Assets bucket
   *
   * Proxy requests to /static and /media to the assets bucket
   */
  readonly assetsBucket?: s3.Bucket;

  /**
  * Public Hosted Zone
  *
  * consider this as a possible prop so that we can
  * share the same HostedZone between multiple stacks
  */
  // readonly publicHostedZone: IHostedZone;
}

/**
 *
 * Construct for a static website hosted with S3 and CloudFront
 *
 * https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/static-site/static-site.ts
 */
export class StaticSite extends cdk.Construct {


  constructor(scope: cdk.Construct, id: string, props: StaticSiteProps) {
    super(scope, id);

    // const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'cloudfront-OAI', {
    //   comment: `OAI for ${id}`,
    // });

    // this S3 bucket will contain the static site assets
    const staticSiteBucket = new s3.Bucket(this, 'StaticSiteBucket', {
      bucketName: props.frontendDomainName,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      // blockPublicAccess: s3.BlockPublicAccess.
      publicReadAccess: true,
      // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // staticSiteBucket.addToResourcePolicy(new iam.PolicyStatement({
    //   actions: ['s3:GetObject'],
    //   resources: [staticSiteBucket.arnForObjects('*')],
    //   principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
    // }));

    const hostedZone = route53.HostedZone.fromLookup(scope, 'Zone', {
      // be careful here - the domainName is the zoneName, not the domain name which could be a subdomain
      domainName: props.zoneName,
    });

    // create the certificate if it doesn't exist or look up the certificate from props.certificateArn
    let certificate;
    if (props.certificateArn) {
      certificate = acm.Certificate.fromCertificateArn(scope, 'Certificate', props.certificateArn);
    } else {
      certificate = new DnsValidatedCertificate(scope, 'Certificate', {
        domainName: props.frontendDomainName,
        hostedZone,
      });
    }

    // const originConfigs = [];

    /**
     * CloudFront Origins
     *
     * 1. Static site origin
     * 2. Static assets origin
     * 3. Load balancer origin
     *
     */

    // // static site origin
    // const staticSiteOrigin = {
    //   s3OriginSource: {
    //     s3BucketSource: staticSiteBucket,
    //     originAccessIdentity: cloudfrontOAI,
    //   },
    //   behaviors: [{
    //     isDefaultBehavior: true,
    //     compress: true,
    //     allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
    //   }],
    // };
    // originConfigs.push(staticSiteOrigin);

    // // if there is a S3 Bucket prop passed to the static site construct,
    // // create a fileStorageOrigin
    // if (props.assetsBucket ?? false) {
    //   const fileStorageOrigin = {
    //     s3OriginSource: {
    //       s3BucketSource: props.assetsBucket!,
    //       originAccessIdentity: cloudfrontOAI,
    //     },
    //     behaviors: ["/static/*", "/media/*"].map(path => {
    //       return {
    //         isDefaultBehavior: false,
    //         compress: false,
    //         allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
    //         forwardedValues: { "query_string": true },
    //         pathPattern: path,
    //         minTtl: cdk.Duration.seconds(0),
    //         defaultTtl: cdk.Duration.seconds(0),
    //         maxTtl: cdk.Duration.seconds(0),
    //       }
    //     }),
    //   }
    //   originConfigs.push(fileStorageOrigin);
    // }

    // // load balancer origin
    // if (props.loadBalancer ?? false) {

    //   // TODO: set this as a config option with a default
    //   const pathPatterns = ['/api/*', '/graphql/*', '/admin/*'];

    //   const behaviors = pathPatterns.map(path => {
    //     return {
    //       allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
    //       forwardedValues: {
    //         "queryString": true,
    //         "cookies": { forward: "all" },
    //         "headers": ["*"],
    //       },
    //       pathPattern: path,
    //       // minTtl: cdk.Duration.seconds(0),
    //       // defaultTtl: cdk.Duration.seconds(0),
    //       // maxTtl: cdk.Duration.seconds(0),
    //     }
    //   });

    //   const loadBalancerOrigin = {
    //     customOriginSource: {
    //       domainName: props.loadBalancer!.loadBalancerDnsName,
    //       originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
    //     },
    //     behaviors,
    //   };
    //   originConfigs.push(loadBalancerOrigin);
    // }


    // // create the cloudfront web distribution
    // this.distribution = new cloudfront.CloudFrontWebDistribution(this, 'StaticSiteDistribution', {
    //   aliasConfiguration: {
    //     acmCertRef: certificate.certificateArn,
    //     names: [props.frontendDomainName],
    //     sslMethod: cloudfront.SSLMethod.SNI,
    //     securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
    //   },
    //   originConfigs,
    //   // viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(certificate),
    // });

    const bucketOrigin = new origins.S3Origin(staticSiteBucket);

    // distribution with S3Origin default behavior
    const distribution = new cloudfront.Distribution(scope, 'SiteDistribution', {

      certificate,
      domainNames: [props.frontendDomainName],
      comment: 'Static Site web distribution',

      // TODO: set this as a config option with a default
      defaultBehavior: {
        origin: bucketOrigin,
        allowedMethods: AllowedMethods.ALLOW_ALL,
      },
    });

    // load balancer origin
    if (props.loadBalancer ?? false) {
      const albOrigin = new origins.LoadBalancerV2Origin(props.loadBalancer!);
      const pathPatterns = ['api', 'graphql', 'admin'];
      pathPatterns.forEach(path => {
        distribution.addBehavior(`/${path}/*`, albOrigin, {
          originRequestPolicy: new cloudfront.OriginRequestPolicy(scope, `${path}-origin-request-policy`, {
            comment: 'API origin request policy',
            cookieBehavior: OriginRequestCookieBehavior.all(),
            headerBehavior: OriginRequestHeaderBehavior.all(),
            queryStringBehavior: OriginRequestQueryStringBehavior.all(),
          }),
          cachePolicy: new cloudfront.CachePolicy(scope, `${path}-origin-cache-policy`, {
            minTtl: cdk.Duration.seconds(0),
            maxTtl: cdk.Duration.seconds(0),
            defaultTtl: cdk.Duration.seconds(0),
          }),
          compress: false,
          allowedMethods: AllowedMethods.ALLOW_ALL,
        });
      })
    };

    // Route /static/* to the assets bucket
    if (props.assetsBucket ?? false) {
      const assetsOrigin = new origins.S3Origin(props.assetsBucket!);
      distribution.addBehavior('/static/*', assetsOrigin, {
        originRequestPolicy: new cloudfront.OriginRequestPolicy(scope, 'assets-origin-request-policy', {
          comment: 'static origin request policy',
          cookieBehavior: OriginRequestCookieBehavior.all(),
          headerBehavior: OriginRequestHeaderBehavior.all(),
          queryStringBehavior: OriginRequestQueryStringBehavior.all(),
        }),
        cachePolicy: new cloudfront.CachePolicy(scope, 'assets-origin-cache-policy', {
          minTtl: cdk.Duration.seconds(0),
          maxTtl: cdk.Duration.seconds(0),
          defaultTtl: cdk.Duration.seconds(0),
        }),
      });

      distribution.addBehavior('/media/*', assetsOrigin, {
        originRequestPolicy: new cloudfront.OriginRequestPolicy(scope, 'media-origin-request-policy', {
          comment: 'media origin request policy',
          cookieBehavior: OriginRequestCookieBehavior.all(),
          headerBehavior: OriginRequestHeaderBehavior.all(),
          queryStringBehavior: OriginRequestQueryStringBehavior.all(),
        }),
        cachePolicy: new cloudfront.CachePolicy(scope, 'media-origin-cache-policy', {
          minTtl: cdk.Duration.seconds(0),
          maxTtl: cdk.Duration.seconds(0),
          defaultTtl: cdk.Duration.seconds(0),
        }),
      });
    };

    // https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/aws-cloudfront/test/distribution.test.ts#L840

    // // set forwarded values using escape hatch
    // const cfnDist = distribution.node.defaultChild as CfnDistribution;


    // cfnDist.addPropertyOverride('DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity');
    // cfnDist.addPropertyOverride('DistributionConfig.Origins.1.ForwardedValues.Headers', ['*']);
    // cfnDist.addPropertyOverride('DistributionConfig.Origins.1.ForwardedValues.Cookies', { forward: "all" });
    // cfnDist.addPropertyOverride('DistributionConfig.Origins.1.ForwardedValues.QueryString', true);

    // if there is a directory called in the pathToDist directory, create a new S3 Deployment
    if (fs.existsSync(path.join(process.cwd(), props.pathToDist))) {
      console.log('creating bucket distribution');
      // create a new S3 Deployment
      new s3Deployment.BucketDeployment(scope, 'BucketDeployment', {
        sources: [s3Deployment.Source.asset(path.join(process.cwd(), props.pathToDist))],
        destinationBucket: staticSiteBucket,
        distribution: distribution,
        distributionPaths: ['/*'],
      });
    }

    // create the A Record that will point to the CloudFront distribution
    new route53.ARecord(scope, 'RecordTarget', {
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      zone: hostedZone,
      // note that the recordName must end with a period (.)
      recordName: `${props.frontendDomainName}.`,
    });
  }
}