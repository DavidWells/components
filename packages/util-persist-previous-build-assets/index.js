const fs = require('fs').promises
const path = require('path')
const { URL } = require('url')
const download = require('./utils/download')

module.exports = async function persistPreviousBuildAssets({ manifestUrl, outputDir }) {
  const previousManifestPath = path.join(outputDir, 'asset-manifest-stale.json')
  const { origin } = new URL(manifestUrl)
  await download(manifestUrl, previousManifestPath)
  let content
  try {
    content = await fs.readFile(previousManifestPath)
  } catch (err) {
    console.log('No manifest found')
    return
  }
  // Parse manifest
  const manifest = JSON.parse(content)

  if (!manifest.files) {
    console.log(`No files found in manifest ${manifestUrl}`)
    return
  }

  const filesToDownload = Object.keys(manifest.files).reduce((acc, curr) => {
    const filePath = manifest.files[curr]
    if (filePath.match(/js$|css$/)) {
      acc = acc.concat(filePath)
    }
    return acc
  }, [])

  const promises = filesToDownload.map((src) => {
    const savePath = path.join(outputDir, src)
    return download(`${origin}${src}`, savePath)
  })

  await Promise.all(promises)
}
