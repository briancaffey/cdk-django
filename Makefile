## ad hoc base cdk commands
ad-hoc-base-synth:
	cdk synth --app='lib/examples/ad-hoc/base/index.js' TestAdHocBaseStack

ad-hoc-base-diff:
	cdk diff --app='./lib/examples/ad-hoc/base/index.js' TestAdHocBaseStack

ad-hoc-base-deploy:
	cdk deploy --app='./lib/examples/ad-hoc/base/index.js' --require-approval never TestAdHocBaseStack

ad-hoc-base-destroy:
	cdk destroy --app='./lib/examples/ad-hoc/base/index.js' --require-approval never TestAdHocBaseStack

## ad hoc app cdk commands
ad-hoc-app-synth:
	cdk synth --app='./lib/examples/ad-hoc/app/index.js' TestAdHocAppStack
