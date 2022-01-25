const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')
const { URL } = require('url')
const download = require('./utils/download')

function hash(str) {
  return crypto.createHash('md5').update(str).digest('hex')
}

async function persistPreviousBuildAssets({
  manifestUrl,
  outputDir
}) {
  const previousManifestPath = path.join(outputDir, `asset-manifest-stale-${hash(manifestUrl)}.json`)
  const { origin } = new URL(manifestUrl)

  // download new manifest. Force download with true
  await download({
    downloadUrl: manifestUrl,
    outputPath: previousManifestPath,
    force: true
  })

  let content
  try {
    content = await fs.readFile(previousManifestPath)
  } catch (err) {
    console.log('No manifest found')
    return
  }
  // Parse manifest
  const manifest = JSON.parse(content)

  const manifestContents = manifest.files || manifest

  if (!manifestContents) {
    console.log(`No files found in manifest ${manifestUrl}`)
    return
  }

  const filesToDownload = Object.keys(manifestContents).reduce((acc, curr) => {
    const filePath = manifestContents[curr]
    if (filePath.match(/js$|css$/)) {
      acc = acc.concat(filePath)
    }
    return acc
  }, [])

  const promises = filesToDownload.map((src) => {
    const outputPath = path.join(outputDir, src)
    const downloadUrl = `${origin}${src}`
    return download({ downloadUrl, outputPath })
  })

  const info = await Promise.all(promises)
  return {
    manifestUrl,
    manifestFile: previousManifestPath,
    files: info
  }
}

module.exports = {
  download,
  persistPreviousBuildAssets
}
