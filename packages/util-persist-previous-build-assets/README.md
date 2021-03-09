# persist-previous-build-assets

Fix for "missing chunks" webpack issue where clients are outdated and chunks are 404ing.

These 404s result in "SyntaxError Unexpected token '<'", "Loading chunk 14 failed." etc.

> TLDR; this package downloads previous manifest assets & adds them to your build dir

## Why

When a new hashed deploymend goes out to hosting providers like Netlify, the previous hashed JS/CSS files aren't included in that "live site". This means if a user is on your site while you do a deployment, they could encounter 404 errors from stale webpack files no longer existing.

This package makes certain the previous build artifacts are added to the latest deployment.

## Install

```bash
npm install persist-previous-build-assets -D
```

## Usage

Add to a pre or post build script

```json
{
  "name": "your-pkg-json",
  "scripts": {
    "build": "react-scripts build",
    "postbuild": "node ./persist-previous-assets.js",
  },
}
```

This will run the below code when `npm run build` is executed before `build` is done.

```js
// persist-previous-assets.js
const path = require('path')
const persistPreviousBuildAssets = require('persist-previous-build-assets')

persistPreviousBuildAssets({
  manifestUrl: 'https://site.com/asset-manifest.json',
  outputDir: path.resolve(__dirname, 'build')
}).then(() => {
  console.log('Done!')
})
```

## Other Solutions

[See this article for additional ways to address this problem](https://imrecsige.dev/garden/how-to-solve-missing-chunk-code-splitting-errors-after-deploy/)
