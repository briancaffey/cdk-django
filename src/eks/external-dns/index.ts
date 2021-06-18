import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as route53 from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';

/**
 * Props used to deploy external-dns to cluster
 */
export interface ExternalDnsProps {
  domainName: string;
  cluster: eks.ICluster;
  hostedZone: route53.IHostedZone;
}

export class ExternalDns extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: ExternalDnsProps) {
    super(scope, id);

    /**
     * Namespace in which external-dns is deployed
     */
    const ns = 'external-dns';
    const externalDnsNamespace = props.cluster.addManifest('external-dns-ns', {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: ns,
      },
    });

    /**
     * Service account for external-dns
     */
    const externalDNSServiceAccount = props.cluster.addServiceAccount(ns, {
      name: ns,
      namespace: ns,
    });


    /**
     * Policies that will allow
     */
    const r53ListPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'route53:ListHostedZones',
        'route53:ListResourceRecordSets',
      ],
      resources: ['*'],
    });
    const r53UpdateRecordPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'route53:ChangeResourceRecordSets',
      ],

      resources: [props.hostedZone!.hostedZoneArn!],
    });
    externalDNSServiceAccount.addToPrincipalPolicy(r53ListPolicy);
    externalDNSServiceAccount.addToPrincipalPolicy(r53UpdateRecordPolicy!);

    /**
     * Bitnami Helm chart for external-dns
     */
    const externalDnsChart = new eks.HelmChart(scope, 'external-dns', {
      cluster: props.cluster,
      namespace: ns,
      wait: true,
      release: 'external-dns',
      chart: 'external-dns',
      repository: 'https://charts.bitnami.com/bitnami',
      values: {
        serviceAccount: {
          create: false,
          name: ns,
        },
        namespace: 'external-dns',
        provider: 'aws',
        // podAnnotations: {
        //   'app.kubernetes.io/managed-by': 'Helm',
        // },
        aws: {
          zoneType: 'public',
        },
        txtOwnerId: props.hostedZone.hostedZoneId,
        domainFilters: [
          props.hostedZone.zoneName,
        ],
      },
    });

    /**
     * The namespace that we deploy this chart into must be deployed before deploying the chart and service account
     */
    externalDnsChart.node.addDependency(externalDnsNamespace);
    externalDNSServiceAccount.node.addDependency(externalDnsNamespace);


  }
}