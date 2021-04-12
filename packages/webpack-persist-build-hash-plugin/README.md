# webpack-persist-build-hash

Persist webpack build hash for use in pre/post build scripts or other plugins.

## Install

```
npm install webpack-persist-build-hash -D
```

## Usage

```js
const PersistBuildHashWebpackPlugin = require('webpack-persist-build-hash')

// ... webpack plugins
plugins: webpackConfig.plugins.concat([
  // Automatically save build hash
  new PersistBuildHashWebpackPlugin(),
])
```

Getting the hash value before builds or post build

```js
const { getHash } = require('webpack-persist-build-hash')

async function postBuild() {
  const hash = await getHash()
  console.log('Build hash')
}
```