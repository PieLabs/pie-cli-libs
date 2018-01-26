# installer

For installing dependencies of a [pie][p] item.

## requirements

This package requires yarn `^1.3.2`. add as a dependency?


##

config: 

```javascript
{
  /** 
    * elements is a mapping between a custom element name and it's package.
    * on the left side is the name of the custom element that'll be used.
    * on the right side is the npm style dependency look up.
    * > NOTE: The npm package name does not need to match the element name, they'll be associated with each other.
    */

  elements: {
    'el-one': '../..', //where ../.. is an npm package called located 2 directories above
    'el-two': '^1.0.0', //looks for an npm package called 'el-two'
    'el-three': '@scope/name@^2.0.1' //looks for an npm package '@scope/name@^2.0.1`
    'el-four': 'user/repo#v2.0.0' // github repo
  },
  models: [
    { id: '1', element: 'el-one', ...}
  ]
}
```

Using the above [pie][p] `item` definition, the install will install the dependencies needed and will return information on the installation.

The installation directory will look like so: 

```shell
root
├── .configure   
│   ├── node_modules # configure dependencies in here
│   └── package.json
├── .controllers
│   ├── node_modules # controller dependencies in here
│   └── package.json
├── node_modules # player dependencies in here
└── package.json
```

It'll return an array of objects similar to: 
```javascript
{
  "element": "text-entry",
  "isLocal": true,
  "isPackage": true,
  "main": {
    "dir": "/Users/edeustace/dev/github/PieElements/pie-elements/packages/text-entry/docs/demo/.pie",
    "moduleId": "@pie-elements/text-entry",
    "tag": "text-entry"
  },
  "src": "../..",
  "controller": {
    "dir": "/Users/edeustace/dev/github/PieElements/pie-elements/packages/text-entry/docs/demo/.pie/.controller",
    "moduleId": "@pie-elements/text-entry-controller"
  },
  "configure": {
    "dir": "/Users/edeustace/dev/github/PieElements/pie-elements/packages/text-entry/docs/demo/.pie/.configurue",
    "moduleId": "@pie-elements/text-entry-configure",
    "tag": "text-entry-configure"
  }
}
```


### notes .

Yarn builds the lock file like: 
```
"@pie-elements/text-entry@file:../../..":
  version "0.2.2"
  dependencies:
    "@pie-libs/pie-player-events" "^0.0.1"
    "@pie-libs/render-ui" "^0.1.4"
    debug "^3.0.1"
    lodash "^4.17.4"
    material-ui "^1.0.0-beta.27"
    material-ui-icons "^1.0.0-beta.17"
    react "^15.6.1"
    react-addons-css-transition-group "^15.6.0"
    react-dom "^15.6.1"
    react-number-format PieElements/react-number-format#feature/bad-input
```
which has enough info to wire this module back to the element.


[pie]: http://pie-framework.org