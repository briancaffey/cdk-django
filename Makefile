.PHONY: synth	test	deploy	diff	coverage

synth:
	cdk synth --app='./lib/integ.default.js'

deploy:
	cdk deploy --app='./lib/integ.default.js' --force

destroy:
	cdk destroy --app='./lib/integ.default.js'

diff:
	cdk diff --app='./lib/integ.default.js'

build:
	npm run build

build-deploy: build	deploy

## -- EKS Targets --

synth-eks:
	cdk synth --app='./lib/integ.django-eks.js';

deploy-eks:
	cdk deploy --app='./lib/integ.django-eks.js';

destroy-eks:
	cdk destroy --app='./lib/integ.django-eks.js';

diff-eks:
	cdk diff --app='./lib/integ.django-eks.js';

test:
	npm run test

## Show coverage report in browser
coverage:
	python3 -m http.server 8002 -d coverage/lcov-report