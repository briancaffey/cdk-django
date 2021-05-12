.PHONY: synth	test	deploy	diff

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

test:
	npm run test
