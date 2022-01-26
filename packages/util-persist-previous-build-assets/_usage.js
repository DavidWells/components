const path = require('path')
const { persistPreviousBuildAssets, download } = require('./index')

persistPreviousBuildAssets({
  manifestUrl: 'https://share.vendia.net/asset-manifest.json',
  outputDir: path.resolve(__dirname, 'build'),
  debug: true,
}).then((d) => {
  console.log('Done!', d)
})
