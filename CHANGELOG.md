# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="1.5.1"></a>
## [1.5.1](https://github.com/pie-framework/pie-cli-libs/compare/v1.5.0...v1.5.1) (2018-06-26)


### Bug Fixes

* rm console.log ([0720229](https://github.com/pie-framework/pie-cli-libs/commit/0720229))




<a name="1.5.0"></a>
# [1.5.0](https://github.com/pie-framework/pie-cli-libs/compare/v1.4.0...v1.5.0) (2018-06-26)


### Bug Fixes

* fix accessConfig ([2b2a040](https://github.com/pie-framework/pie-cli-libs/commit/2b2a040))


### Features

* new hash package ([2c59d7b](https://github.com/pie-framework/pie-cli-libs/commit/2c59d7b))




<a name="1.4.0"></a>
# [1.4.0](https://github.com/pie-framework/pie-cli-libs/compare/v1.3.0...v1.4.0) (2018-06-20)


### Features

* add version to Input ([cc81a09](https://github.com/pie-framework/pie-cli-libs/commit/cc81a09))




<a name="1.3.0"></a>
# [1.3.0](https://github.com/pie-framework/pie-cli-libs/compare/v1.2.0...v1.3.0) (2018-06-20)


### Features

* export InstallResult w/ lockfiles ([f5e6d8e](https://github.com/pie-framework/pie-cli-libs/commit/f5e6d8e))




<a name="1.2.0"></a>
# [1.2.0](https://github.com/pie-framework/pie-cli-libs/compare/v1.1.3...v1.2.0) (2018-06-20)


### Bug Fixes

* **yarn:** add more detailed error handling ([3f99c61](https://github.com/pie-framework/pie-cli-libs/commit/3f99c61))


### Features

* install returns `lockFiles.root`, Input contains `version` specifier ([368e40e](https://github.com/pie-framework/pie-cli-libs/commit/368e40e))




<a name="1.1.3"></a>
## [1.1.3](https://github.com/pie-framework/pie-cli-libs/compare/v1.1.2...v1.1.3) (2018-06-20)


### Bug Fixes

* add .npmignore ([73e5576](https://github.com/pie-framework/pie-cli-libs/commit/73e5576))




<a name="1.1.2"></a>
## [1.1.2](https://github.com/PieLabs/pie-cli-libs/compare/v1.1.1...v1.1.2) (2018-02-27)


### Bug Fixes

* **yarn:** add file prefix for local installs ([e378a65](https://github.com/PieLabs/pie-cli-libs/commit/e378a65))
* **yarn:** find windows yarn.cmd if needed ([3e0aa25](https://github.com/PieLabs/pie-cli-libs/commit/3e0aa25))
* **yarn:** fix windows yarn lookup ([67c762e](https://github.com/PieLabs/pie-cli-libs/commit/67c762e))
* **yarn:** fix yarn lock file parsing on windows ([9cb1b58](https://github.com/PieLabs/pie-cli-libs/commit/9cb1b58))




<a name="1.1.1"></a>
## [1.1.1](https://github.com/PieLabs/pie-cli-libs/compare/v1.1.0...v1.1.1) (2018-02-22)


### Bug Fixes

* **build:** build js ([1fd557c](https://github.com/PieLabs/pie-cli-libs/commit/1fd557c))




<a name="1.1.0"></a>
# [1.1.0](https://github.com/PieLabs/pie-cli-libs/compare/v1.0.1...v1.1.0) (2018-02-22)


### Features

* **controller:** return passthrough module id if no controller found. ([6564185](https://github.com/PieLabs/pie-cli-libs/commit/6564185))




<a name="1.0.1"></a>
## [1.0.1](https://github.com/PieLabs/pie-cli-libs/compare/v1.0.0...v1.0.1) (2018-02-16)


### Bug Fixes

* **test:** fix up the tests - add verdaccio to global setup/teardown ([c79eb27](https://github.com/PieLabs/pie-cli-libs/commit/c79eb27))




<a name="1.0.0"></a>
# [1.0.0](https://github.com/PieLabs/pie-cli-libs/compare/v0.2.3...v1.0.0) (2018-02-15)


### Features

* **packages:** Support 1st class packages in a pie definition. ([1324eb4](https://github.com/PieLabs/pie-cli-libs/commit/1324eb4))


### BREAKING CHANGES

* **packages:** `install` now returns `{pkgs: Pkg[], dir: string}`, this new type has all the information a client will need about the installed pkgs.




<a name="0.2.3"></a>
## [0.2.3](https://github.com/PieLabs/pie-cli-libs/compare/v0.2.2...v0.2.3) (2018-01-30)


### Bug Fixes

* **yarn:** no yarn.lock is ok if there are no dependencies ([cbc7e94](https://github.com/PieLabs/pie-cli-libs/commit/cbc7e94))




<a name="0.2.2"></a>
## [0.2.2](https://github.com/PieLabs/pie-cli-libs/compare/v0.2.1...v0.2.2) (2018-01-30)


### Bug Fixes

* **console:** tidy up logging ([a190023](https://github.com/PieLabs/pie-cli-libs/commit/a190023))




<a name="0.2.1"></a>
## [0.2.1](https://github.com/PieLabs/pie-cli-libs/compare/v0.2.0...v0.2.1) (2018-01-29)


### Bug Fixes

* **build:** update build ([90d002b](https://github.com/PieLabs/pie-cli-libs/commit/90d002b))
* **controllers:** fix dir name ([9a26cc3](https://github.com/PieLabs/pie-cli-libs/commit/9a26cc3))
* **install:** only write a package.json if not present ([ccab7cc](https://github.com/PieLabs/pie-cli-libs/commit/ccab7cc))
* **yarn:** optimise build ([3cc265e](https://github.com/PieLabs/pie-cli-libs/commit/3cc265e))
* **yarn:** skip add if not needed ([c1081a0](https://github.com/PieLabs/pie-cli-libs/commit/c1081a0))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/PieLabs/pie-cli-libs/compare/v0.1.1...v0.2.0) (2018-01-29)


### Features

* **api:** export types ([cdd82d3](https://github.com/PieLabs/pie-cli-libs/commit/cdd82d3))




<a name="0.1.1"></a>
## [0.1.1](https://github.com/PieLabs/pie-cli-libs/compare/v0.1.0...v0.1.1) (2018-01-29)


### Bug Fixes

* **readme:** remove old notes ([3472ef8](https://github.com/PieLabs/pie-cli-libs/commit/3472ef8))




<a name="0.1.0"></a>
# 0.1.0 (2018-01-29)


### Features

* **build:** add types ([9421c05](https://github.com/PieLabs/pie-cli-libs/commit/9421c05))
