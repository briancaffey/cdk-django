import { awscdk, release } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Brian Caffey',
  authorEmail: 'briancaffey2010@gmail.com',
  projenrcTs: true,
  projenrcTsOptions: {
    filename: '.projenrc.ts',
  },
  authorAddress: '',
  authorUrl: 'https://briancaffey.github.io',
  license: 'MIT',
  copyrightOwner: 'Brian Caffey',
  cdkVersion: '2.49.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-django',
  repositoryUrl: 'git@github.com:briancaffey/cdk-django.git',

  // Automation
  githubOptions: {
    // projenCredentials: github.GithubCredentials.fromApp(),
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: ['feat', 'fix', 'chore', 'docs', 'ci'],
      },
    },
  },
  // https://github.com/projen/projen/issues/1941
  bundledDeps: ['@types/jest@27.4.1'],
  majorVersion: 1,
  releaseTrigger: {
    isContinuous: false,
  } as release.ReleaseTrigger,

  // ignore
  gitignore: ['cdk.out', 'notes', 'app.yml', 'base.yml', 'cdk.context.json'],
  npmignore: [
    '.npmrc',
    '.nvmrc',
    '.versionrc',
    '.gitattributes',
    '*.tgz',
    '*.gz',
    '*.zip',
    'cdk.out',
    '.cdk.staging',
    '/examples',
    'PUBLISHING.md',
    '.vscode',
    '.projenrc.ts',
    'projenrc',
    '/images',
    'API.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
  ],
  description: 'CDK construct library for building Django applications on AWS with ECS Fargate',
  packageName: 'cdk-django',
});

// release only via manual trigger
project.release?.publisher?.publishToGit({
  changelogFile: 'dist/dist/changelog.md',
  versionFile: 'dist/dist/version.txt',
  releaseTagFile: 'dist/dist/releasetag.txt',
  projectChangelogFile: 'CHANGELOG.md',
  gitBranch: 'main',
});
project.tryFindObjectFile('.github/workflows/release.yml')?.addToArray(
  'jobs.release.steps',
  {
    name: 'Publish tag',
    run: 'npx projen publish:git',
  },
);

project.synth();