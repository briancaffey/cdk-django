# https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/custom-resource/custom-resource-handler.py
# https://github.com/hashicorp/terraform-provider-aws/blob/main/internal/service/elbv2/listener_rule.go#L969-L1000

def main(event, context):
    import logging as log
    import os

    import boto3
    import cfnresponse
    log.getLogger().setLevel(log.INFO)

    # This needs to change if there are to be multiple resources in the same stack
    physical_id = 'TheOnlyCustomResource'

    try:
        log.info('Input event: %s', event)

        # Check if this is a Create and we're failing Creates
        if event['RequestType'] == 'Create' and event['ResourceProperties'].get('FailCreate', False):
            raise RuntimeError('Create failure requested')

        # Do the thing
        listener_arn = os.environ.get('LISTENER_ARN')

        elbv2 = boto3.client('elbv2')

        # get the priorities for the listener
        response = elbv2.describe_listeners(ListenerArns=[listener_arn])

        next_marker = None
        priorities = []

        while True:
            output = elbv2.describe_rules(ListenerArn=listener_arn, Marker=next_marker)

            for rule in output['Rules']:
                priorities.append(rule['Priority'])

            if output['NextMarker'] == None:
                break

            next_marker = output['NextMarker']

        if len(priorities) == 0:
            return 0

        priorities.sort()

        # get the rules for this listener using boto3
        attributes = {
            'highest_priority': priorities[-1],
        }

        cfnresponse.send(event, context, cfnresponse.SUCCESS, attributes, physical_id)

    except Exception as e:
        log.exception(e)
        # cfnresponse's error message is always "see CloudWatch"
        cfnresponse.send(event, context, cfnresponse.FAILED, {}, physical_id)
