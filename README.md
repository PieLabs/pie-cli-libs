# pie-cli-libs

Some libraries used by [pie-cli][cli].

# install

```shell
yarn install
./node_modules/.bin/lerna bootstrap


## The integration testing for the install needs to have some test elements installed...
scripts/install-test-elements
```

| cmd                                        | description                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| `yarn build`                               | builds                                                                       |
| `yarn unit`                                | unit tests                                                                   |
| `./node_modules/.bin/jest --runInBand int` | integration tests (can't run via yarn cos of issue setting the npm registry) |
| `yarn release`                             | release                                                                      |

# build

See the build for the packages

## publish

```
git checkout master
git merge develop
lerna publish --conventional-commits
```

[cli]: github.com/PieLabs/pie-cli
