.PHONY: synth	test	deploy	diff	coverage

## -- ECS Targets --

## synthesize ECS project
synth:
	cdk synth --app='./lib/integ.default.js'

## deploy ECS project
deploy-ecs:
	cdk deploy --app='./lib/integ.default.js' --force

## destroy ECS project
destroy-ecs:
	cdk destroy --app='./lib/integ.default.js'

## diff ECS project
diff-ecs:
	cdk diff --app='./lib/integ.default.js'

## -- EKS Targets --

## synthesize EKS project
synth-eks:
	cdk synth --app='./lib/integ.django-eks.js';

## deploy EKS project
deploy-eks:
	cdk deploy --app='./lib/integ.django-eks.js';

## destroy EKS project
destroy-eks:
	cdk destroy --app='./lib/integ.django-eks.js';

## diff for EKS project
diff-eks:
	cdk diff --app='./lib/integ.django-eks.js';

## run all tests for projen project
test:
	npm run test

## show coverage report in browser
coverage:
	python3 -m http.server 8002 -d coverage/lcov-report