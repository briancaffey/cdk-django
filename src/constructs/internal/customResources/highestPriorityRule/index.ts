import { readFileSync } from 'fs';
import * as path from 'path';
import { CustomResource, Duration } from 'aws-cdk-lib';
import { ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { InlineCode, Runtime, SingletonFunction } from 'aws-cdk-lib/aws-lambda';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export interface HighestPriorityRuleProps {
  listener: ApplicationListener;
}

export class HighestPriorityRule extends Construct {
  public readonly priority: number;

  constructor(scope: Construct, id: string, props: HighestPriorityRuleProps) {
    super(scope, id);

    const fn = new SingletonFunction(this, 'Function', {
      uuid: 'highest-priority-rule',
      code: new InlineCode(readFileSync(path.join(__dirname, 'custom-resource-handler.py'), { encoding: 'utf-8' })),
      handler: 'index.main',
      timeout: Duration.seconds(100),
      runtime: Runtime.PYTHON_3_9,
      environment: {
        LISTENER_ARN: props.listener.listenerArn,
      },
    });

    const provider = new Provider(this, 'Provider', {
      onEventHandler: fn,
    });

    const resource = new CustomResource(this, 'Resource', {
      serviceToken: provider.serviceToken,
      properties: props,
    });

    this.priority = parseInt(resource.getAtt('Response').toString());
  }
}