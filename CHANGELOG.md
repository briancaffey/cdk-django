
## [1.8.2](https://github.com/briancaffey/cdk-django/compare/v1.8.1...v1.8.2) (2025-02-16)


### Bug Fixes

* **ecs:** fix capacity provider association dependency issue when destroying stacks ([b413f4a](https://github.com/briancaffey/cdk-django/commit/b413f4afe1180fb43e4e244e92b0c584aad1b2f0))

## [1.8.1](https://github.com/briancaffey/cdk-django/compare/v1.8.0...v1.8.1) (2025-02-14)


### Bug Fixes

* **ecs:** fix dependencies in ecs app stack ([42af37a](https://github.com/briancaffey/cdk-django/commit/42af37a923bd3d9f90b21288d6e3c7c58edd2aaa))

## [1.8.0](https://github.com/briancaffey/cdk-django/compare/v1.7.0...v1.8.0) (2025-02-14)


### Features

* **s3:** move s3 bucket resources to separate construct ([ffc4213](https://github.com/briancaffey/cdk-django/commit/ffc4213325ceadedb4fe7ecb8901f1a918988133))


### Bug Fixes

* **ecs:** fix error with dependencies between service and cluster capacity provider when destroying app stack ([6f9b875](https://github.com/briancaffey/cdk-django/commit/6f9b875f7489f94a22e974e4c0316c0d250bb50b))
* **lint:** run eslint ([ef91308](https://github.com/briancaffey/cdk-django/commit/ef913084d7ddd6026d1633fa5f423486b2764412))

## [1.7.0](https://github.com/briancaffey/cdk-django/compare/v1.6.0...v1.7.0) (2025-02-11)


### Features

* **cdk:** bump cdk version to v2.177.0 ([4ae4218](https://github.com/briancaffey/cdk-django/commit/4ae42186930e24d0ac7294eaed1f6760f2cf3b02))
* **examples:** remove ad hoc and prod examples to align with other iac library structures ([e853f96](https://github.com/briancaffey/cdk-django/commit/e853f96547d60cd8d7b90abfe6783b3ecc1c9307))


### Bug Fixes

* **docs:** add section to readme about the release process ([61c0cd7](https://github.com/briancaffey/cdk-django/commit/61c0cd7de1a2790a627d1fcd0989b7123ac52f43))
* **docs:** generate docs with yarn build ([bb6b55a](https://github.com/briancaffey/cdk-django/commit/bb6b55a94700b45b4d2d5369e11d264945af950c))
* **docs:** sync readme with other iac library readmes and updated cdk version ([cbdefd7](https://github.com/briancaffey/cdk-django/commit/cbdefd755e38aa1d3848b0db0fcb36586cc20181))
* **docs:** update readme ([7092e87](https://github.com/briancaffey/cdk-django/commit/7092e87cb74a53c212f9c2b88029816093d3be24))
* **lint:** run eslint ([c8030f9](https://github.com/briancaffey/cdk-django/commit/c8030f94d9e208bb4238a4fd43eab2e79cb2940a))
* **misc:** various fixes to fix base and app stack deployments with cdk ([5e43b09](https://github.com/briancaffey/cdk-django/commit/5e43b093f6bbc12f942e25a2e478e0a533b283c9))

## [1.6.0](https://github.com/briancaffey/cdk-django/compare/v1.5.0...v1.6.0) (2025-01-26)


### Features

* **upgrade:** run projen upgrade, fix issue with jest types ([2778840](https://github.com/briancaffey/cdk-django/commit/2778840534d3f050f7b2f1149d26505a12f3b3a4))


### Bug Fixes

* **release:** debug broken release ([ce27e83](https://github.com/briancaffey/cdk-django/commit/ce27e83424970210c43d5ca8f73947c1da603c4a))

## [1.5.0](https://github.com/briancaffey/cdk-django/compare/v1.4.0...v1.5.0) (2024-05-02)


### Features

* **docgen:** upgrade docgen version to fix release ([db818f6](https://github.com/briancaffey/cdk-django/commit/db818f61b726466428c7407c1b8f5e93a32c2eb9))
* **upgrade:** upgrade projen and cdk versions ([fd6afd0](https://github.com/briancaffey/cdk-django/commit/fd6afd09727c17f8a12108196bfafa908e9d9ed5))


### Bug Fixes

* **typo:** fix typo ([4167100](https://github.com/briancaffey/cdk-django/commit/41671003fcc7d3badc6af29610a31df3c928f5df))

## [1.4.0](https://github.com/briancaffey/cdk-django/compare/v1.3.0...v1.4.0) (2024-03-10)


### Features

* **cdk:** fixes for base - app compatibility ([9888efb](https://github.com/briancaffey/cdk-django/commit/9888efbd55da0c9bc330ff6ee2e8b7ccb3de103b))
* **cdk:** upgrade cdk version, refactor ad-hoc example directory ([7bf723b](https://github.com/briancaffey/cdk-django/commit/7bf723b609ef7caf5534dea10edfee9c5f8c5bf1))
* **gha:** add github action for service update ([b0820a3](https://github.com/briancaffey/cdk-django/commit/b0820a35b89390b1884715d2cef448fbeb179598))
* **s3:** fix bucket permissions ([e648a7b](https://github.com/briancaffey/cdk-django/commit/e648a7bc2c11bf66b754ff422cb8b26af50916f7))

## [1.3.0](https://github.com/briancaffey/cdk-django/compare/v1.2.1...v1.3.0) (2024-02-25)


### Features

* **project:** upgrade projen ([0ba65a6](https://github.com/briancaffey/cdk-django/commit/0ba65a6b6205cbdbc1f5546a6b30f8c2ecd3d135))

### [1.2.1](https://github.com/briancaffey/cdk-django/compare/v1.2.0...v1.2.1) (2023-01-12)


### Bug Fixes

* **upgrade-main:** revert to using default github auth method ([fbe84ca](https://github.com/briancaffey/cdk-django/commit/fbe84ca048c9bcc69983628664127de535eddd5d))

## [1.2.0](https://github.com/briancaffey/cdk-django/compare/v1.1.0...v1.2.0) (2023-01-05)


### Features

* **context:** added context for both ad hoc base and app constructs, clean up and refactor app constructs ([6c40d08](https://github.com/briancaffey/cdk-django/commit/6c40d084d652f96c9c53b6a6603f52467cb72088))
* **docs:** regenerate docs with doc gen ([05cff0f](https://github.com/briancaffey/cdk-django/commit/05cff0fe3429183ff0a10fc414f4063e3410dc6c))

## [1.1.0](https://github.com/briancaffey/cdk-django/compare/v1.0.0...v1.1.0) (2023-01-04)


### Features

* **projenrc:** make updates to release mechanism and other settings changes in projenrc.ts ([5804110](https://github.com/briancaffey/cdk-django/commit/58041106c6605f882708ad563eeebaf4b193f3e3))
* **projenrcts:** ts file for .projenrc.ts ([228a901](https://github.com/briancaffey/cdk-django/commit/228a901e0bae4ba6ffd95ab433f1e9fd045f2024))

### [0.0.12](https://github.com/briancaffey/cdk-django/compare/v0.0.11...v0.0.12) (2022-12-18)


### Features

* **release:** change release trigger to use manual releases ([09f430b](https://github.com/briancaffey/cdk-django/commit/09f430bd6064477a195fc1d88a117495ad4330ce))

### [0.0.11](https://github.com/briancaffey/cdk-django/compare/v0.0.10...v0.0.11) (2022-12-18)


### Features

* **celery:** add celery services ([9f0a6c0](https://github.com/briancaffey/cdk-django/commit/9f0a6c0dd3799deb6957954e3d7ae51eacfd3b21))

### [0.0.11](https://github.com/briancaffey/cdk-django/compare/v0.0.10...v0.0.11) (2022-12-18)


### Features

* **celery:** add celery services ([9f0a6c0](https://github.com/briancaffey/cdk-django/commit/9f0a6c0dd3799deb6957954e3d7ae51eacfd3b21))

