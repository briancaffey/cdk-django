# base stack
ecs-base-synth:
	cdk synth --app='lib/examples/ecs/index.js' -e ExampleEcsBaseStack

ecs-base-diff:
	cdk diff --app='./lib/examples/ecs/index.js' -e ExampleEcsBaseStack

ecs-base-deploy:
	cdk deploy --app='./lib/examples/ecs/index.js' -e ExampleEcsBaseStack

ecs-base-deploy-approve:
	cdk deploy --app='./lib/examples/ecs/index.js' --require-approval never -e ExampleEcsBaseStack

ecs-base-destroy:
	yes | cdk destroy --app='./lib/examples/ecs/index.js' -e ExampleEcsBaseStack

# app stack
ecs-app-synth:
	cdk synth --app='./lib/examples/ecs/index.js' -e ExampleEcsAppStack

ecs-app-diff:
	cdk diff --app='./lib/examples/ecs/index.js' -e ExampleEcsAppStack

ecs-app-deploy:
	cdk deploy --app='./lib/examples/ecs/index.js' -e ExampleEcsAppStack

# TODO: make sure this includes all services including beat
ecs-app-delete-services:
	export AWS_PAGER=''
	aws ecs delete-service --cluster alpha-cluster --service alpha-web-ui --force
	aws ecs delete-service --cluster alpha-cluster --service alpha-default-worker --force
	aws ecs delete-service --cluster alpha-cluster --service alpha-gunicorn --force
	aws ecs delete-service --cluster alpha-cluster --service alpha-ecs-exec --force

ecs-app-destroy:	ecs-app-delete-services
	cdk destroy --verbose --app='./lib/examples/ecs/index.js' -e ExampleEcsAppStack
