.PHONY: test	coverage	watch	describe-stacks
.PHONY: ecs-synth	ecs-deploy	ecs-destroy	ecs-diff
.PHONY: eks-synth	eks-deploy	eks-destroy	eks-diff	eks-delete-stack

# These Makefile targets are for common development tasks and testing constructs
# Run `make watch` before running these commands

## -- ECS Targets --

## synthesize ECS project
ecs-synth:
	cdk synth --app='./lib/integ/integ.django-ecs.js'

## deploy ECS project
ecs-deploy:
	cdk deploy --app='./lib/integ/integ.django-ecs.js'

## destroy ECS project
ecs-destroy:
	cdk destroy --app='./lib/integ/integ.django-ecs.js'

## diff ECS project
ecs-diff:
	cdk diff --app='./lib/integ/integ.django-ecs.js'

## -- EKS Targets --

## synthesize EKS project
eks-synth:
	cdk synth --app='./lib/integ/integ.django-eks.js';

## deploy EKS project
eks-deploy:
	cdk deploy --app='./lib/integ/integ.django-eks.js';

## destroy EKS project
eks-destroy:
	cdk destroy --app='./lib/integ/integ.django-eks.js';

## diff for EKS project
eks-diff:
	cdk diff --app='./lib/integ/integ.django-eks.js';

## useful for deleting the stack if it rolls back the stack cannot be automatically deleted by CDK
eks-delete-stack:
	aws cloudformation delete-stack --stack-name DjangoEksStack

## describe CloudFormation stacks in the AWS account
describe-stacks:
	aws cloudformation describe-stacks | jq

## watch
watch:
	npm run watch

## run all tests for projen project
test:
	npm run test

## show coverage report in browser
coverage:
	python3 -m http.server 8002 -d coverage/lcov-report