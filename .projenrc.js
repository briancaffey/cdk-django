const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'briancaffey',
  authorAddress: 'briancaffey2010@gmail.com',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'django-cdk',
  repositoryUrl: 'git@github.com:briancaffey/django-cdk.git',
  // jestOptions: {
  //   jestVersion: '^27.0.0', // 28 requires a later typescript version
  // },
  bundledDeps: ['@types/jest@27.4.1'],

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();