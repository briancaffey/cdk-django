import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';


export interface IrsaProps {
  readonly cluster: eks.Cluster;
}

/**
 * Pod Role setup with IRSA (IAM Roles for Service Accounts)
 * https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts-technical-overview.html
 */
export class Irsa extends cdk.Construct {

  public podRole: iam.Role;

  constructor(scope: cdk.Construct, id: string, props: IrsaProps) {
    super(scope, id);

    const POD_SERVICE_ACCOUNT_NAME = 'pod-service-account';
    const oidcProviderId = props.cluster.openIdConnectProvider.openIdConnectProviderIssuer;

    /**
     * The Principal that will assume the podRole
     */
    const federatedPrincipal = new iam.FederatedPrincipal(
      props.cluster.openIdConnectProvider.openIdConnectProviderArn,
      {
        StringEquals: new cdk.CfnJson(scope, 'FederatedPrincipalCondition', {
          value: {
            [`${oidcProviderId}:aud`]: 'sts.amazonaws.com',
            [`${oidcProviderId}:sub`]: `system:serviceaccount:app:${POD_SERVICE_ACCOUNT_NAME}`,
          },
        }),
      }, 'sts:AssumeRoleWithWebIdentity',
    );

    /**
     * Setup a new IAM Role that will be used by Pods to access Secrets Manager, S3, etc.
     */
    this.podRole = new iam.Role(scope, 'podRole', {
      assumedBy: federatedPrincipal,
    });

    const podServiceAccount = {
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: {
        name: POD_SERVICE_ACCOUNT_NAME,
        namespace: 'app',
        annotations: {
          'eks.amazonaws.com/role-arn': this.podRole.roleArn,
        },
      },
    };

    /**
     * Apply the service account manfiest that will be used by pods running the application
     */
    props.cluster.addManifest('pod-service-account', podServiceAccount);

  }
}
