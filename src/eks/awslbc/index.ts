import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

// eslint-disable-next-line
const request = require('sync-request');
// eslint-disable-next-line
const yaml = require('js-yaml');


export interface AwsLoadBalancerControllerProps {
  readonly cluster: eks.Cluster;
}

export class AwsLoadBalancerController extends cdk.Construct {

  public chart: eks.HelmChart;

  constructor(scope: cdk.Construct, id: string, props: AwsLoadBalancerControllerProps) {
    super(scope, id);

    // Adopted from comments in this issue: https://github.com/aws/aws-cdk/issues/8836
    const albServiceAccount = props.cluster.addServiceAccount('aws-alb-ingress-controller-sa', {
      name: 'aws-load-balancer-controller',
      namespace: 'kube-system',
    });

    const awsAlbControllerPolicyUrl = 'https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.2.0/docs/install/iam_policy.json';
    const policyJson = request('GET', awsAlbControllerPolicyUrl).getBody('utf8');
    ((JSON.parse(policyJson)).Statement as any[]).forEach(statement => {
      albServiceAccount.addToPrincipalPolicy(iam.PolicyStatement.fromJson(statement));
    });

    // AWS Load Balancer Controller Helm Chart
    // https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/deploy/installation/#summary

    // AWS Application Load Balancer Controller Helm Chart CRDs
    // These must be installed before installing the Helm Chart because CDK
    // installs the Helm chart with `helm upgrade` which does not
    // automatically install CRDs
    // This should be equivalent to Step 2:
    // kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"

    const awslbcCrdsUrl = 'https://raw.githubusercontent.com/aws/eks-charts/master/stable/aws-load-balancer-controller/crds/crds.yaml';
    const awslbcCrdsYaml = request('GET', awslbcCrdsUrl).getBody('utf8');
    const awslbcCrdsObjects = yaml.loadAll(awslbcCrdsYaml);

    new eks.KubernetesManifest(this, 'alb-custom-resource-definition', {
      cluster: props.cluster,
      manifest: awslbcCrdsObjects,
      overwrite: true,
      prune: true,
    });

    // The following is equivalent to:
    // helm repo add eks https://aws.github.io/eks-charts
    // helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=<cluster-name> --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-controller

    this.chart = new eks.HelmChart(scope, 'alb-ingress-controller', {
      cluster: props.cluster,
      wait: true,
      chart: 'aws-load-balancer-controller',
      repository: 'https://aws.github.io/eks-charts',
      // Note: the chart version 1.2.0 will install version 2.2.0 of the Helm Chart
      // https://github.com/aws/eks-charts/blob/master/stable/aws-load-balancer-controller/Chart.yaml
      version: '1.2.0',
      namespace: 'kube-system',
      values: {
        clusterName: props.cluster.clusterName,
        serviceAccount: {
          create: false,
          name: 'aws-load-balancer-controller',
        },
      },
    });
  }
}
