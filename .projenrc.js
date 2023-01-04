const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'briancaffey',
  authorAddress: 'briancaffey2010@gmail.com',
  cdkVersion: '2.49.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-django',
  repositoryUrl: 'git@github.com:briancaffey/cdk-django.git',
  // https://github.com/projen/projen/issues/1941
  bundledDeps: ['@types/jest@27.4.1'],
  gitignore: ['cdk.out', 'notes', 'app.yml', 'base.yml', 'cdk.context.json'],
  majorVersion: 1,

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();