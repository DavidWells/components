const path = require('path')
const { persistPreviousBuildAssets, download } = require('./index')

console.log('download', download)

persistPreviousBuildAssets({
  manifestUrl: 'https://share.vendia.net/asset-manifest.json',
  outputDir: path.resolve(__dirname, 'build')
}).then((d) => {
  console.log('Done!', d)
})
