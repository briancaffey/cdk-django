.PHONY: synth	test	deploy

synth:
	cdk synth --app='./lib/integ.default.js'

deploy:
	cdk deploy --app='./lib/integ.default.js' --force

destroy:
	cdk destroy --app='./lib/integ.default.js'

test:
	npm run test
