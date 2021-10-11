/**
 *
 * This is a high-level construct that demonstrates
 * how to use the static site CloudFrontWebDistribution
 * together with the ECS Stack.
 *
 * CloudFront allows for both the static site and
 * the `/api` calls to be served from the same
 * domain (app.example.com, for example).
 *
 * This would be a good setup if you are using a Vue or React
 * static website (such as an SPA) and your Django app's
 * REST API uses either JWT (with HttpOnly refresh token)
 * or Session-based API authentication.
 *
 * If you are using a Vue app and a Django app and don't mind
 * storing JWT on the browser's localStorage, you can also use this
 * approach, but you can also setup the frontend and backend on
 * different domains.
 *
 **/

import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';
import { DjangoEcs, StaticSite } from './index';

/**
 * Django and Vue application stack props
 */
export interface DjangoVueProps {
  /**
   * Certificate ARN for looking up the Certificate to use for CloudFront and ALB
   */
  readonly certificateArn?: string;

  readonly domainName: string;

  readonly zoneName: string;


}

/**
 *
 * Construct for projects using Django backend and static site for frontend
 */
export class DjangoVue extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: DjangoVueProps) {
    super(scope, id);

    let certificate;
    if (props.certificateArn) {
      certificate = acm.Certificate.fromCertificateArn(scope, 'Cert', process.env.CERTIFICATE_ARN!);
    } else {
      certificate = new acm.DnsValidatedCertificate(scope, 'Cert', {
        domainName: props.domainName,
        hostedZone: route53.HostedZone.fromLookup(scope, 'HostedZone', {
          domainName: props.zoneName,
        }),
      });
    }

    const apiBackend = new DjangoEcs(scope, 'DjangoEcsSample', {
      imageDirectory: './test/django-step-by-step/backend',
      webCommand: ['./scripts/start_prod.sh'],
      useCeleryBeat: true,
      apiDomainName: process.env.API_DOMAIN_NAME,
      zoneName: process.env.ZONE_NAME,
      useEcsExec: true,
      frontendUrl: process.env.FRONTEND_URL,
      certificateArn: certificate.certificateArn,
      environmentVariables: {
        EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
        EMAIL_PORT: process.env.EMAIL_PORT || '1025',
        EMAIL_HOST_USER: process.env.EMAIL_HOST_USER || 'app@domain.com',
        EMAIL_HOST_PASSWORD: process.env.EMAIL_HOST_PASSWORD || 'password',
        // comma separated list of admin email addresses
        ADMINS: process.env.ADMINS || 'superuser@email.com,admin@email.com,',
      },
    });

    new StaticSite(scope, 'StaticSiteSample', {
      frontendDomainName: props.domainName,
      pathToDist: 'test/django-step-by-step/quasar-app/dist/pwa',
      zoneName: props.zoneName,
      loadBalancer: apiBackend.loadBalancer,
      assetsBucket: apiBackend.staticFileBucket,
      certificateArn: certificate.certificateArn,
    });

    new cdk.CfnOutput(this, 'loadBalancerName', { value: apiBackend.loadBalancer.loadBalancerDnsName });

  };
};
