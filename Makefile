## ad hoc base cdk commands
ad-hoc-base-synth:
	cdk synth --app='lib/examples/ad-hoc/index.js' -e ExampleAdHocBaseStack

ad-hoc-base-diff:
	cdk diff --app='./lib/examples/ad-hoc/index.js' -e ExampleAdHocBaseStack

ad-hoc-base-deploy:
	cdk deploy --app='./lib/examples/ad-hoc/index.js' -e ExampleAdHocBaseStack

ad-hoc-base-deploy-approve:
	cdk deploy --app='./lib/examples/ad-hoc/index.js' --require-approval never -e ExampleAdHocBaseStack

ad-hoc-base-destroy:
	yes | cdk destroy --app='./lib/examples/ad-hoc/index.js' -e ExampleAdHocBaseStack

## ad hoc app cdk commands
ad-hoc-app-synth:
	cdk synth --app='./lib/examples/ad-hoc/index.js' -e ExampleAdHocAppStack

ad-hoc-app-diff:
	cdk diff --app='./lib/examples/ad-hoc/index.js' -e ExampleAdHocAppStack

ad-hoc-app-deploy:
	cdk deploy --app='./lib/examples/ad-hoc/index.js' -e ExampleAdHocAppStack

# TODO: make sure this includes all services including beat
ad-hoc-app-delete-services:
	export AWS_PAGER=''
	aws ecs delete-service --cluster alpha-cluster --service alpha-web-ui --force
	aws ecs delete-service --cluster alpha-cluster --service alpha-default-worker --force
	aws ecs delete-service --cluster alpha-cluster --service alpha-gunicorn --force
	aws ecs delete-service --cluster alpha-cluster --service alpha-ecs-exec --force

ad-hoc-app-destroy:	ad-hoc-app-delete-services
	cdk destroy --verbose --app='./lib/examples/ad-hoc/index.js' -e ExampleAdHocAppStack
