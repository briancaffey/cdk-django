const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'briancaffey',
  authorAddress: 'briancaffey2010@gmail.com',
  cdkVersion: '2.31.1',
  defaultReleaseBranch: 'main',
  name: 'django-cdk',
  repositoryUrl: 'git@github.com:briancaffey/django-cdk.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();