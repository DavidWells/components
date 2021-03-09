const path = require('path')
const persistPreviousBuildAssets = require('./index')

persistPreviousBuildAssets({
  manifestUrl: 'https://site.com/asset-manifest.json',
  outputDir: path.resolve(__dirname, 'build')
}).then(() => {
  console.log('Done!')
})
