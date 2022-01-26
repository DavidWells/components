const fs = require('fs')
const path = require('path')
const got = require('got')
const mkdirp = require('mkdirp')

// eslint-disable-next-line promise/param-names
const fileExists = (s) => new Promise(r => fs.access(s, fs.F_OK, e => r(!e)))

module.exports = async function download({
  downloadUrl,
  outputPath,
  force,
  debug
}) {
  const dirName = path.dirname(outputPath)
  if (!force) {
    const existsAlready = await fileExists(outputPath)
    // Ignore download if we already have file
    if (existsAlready) {
      if (debug) console.log(`◉  File already exists: ${path.basename(dirName)}/${path.basename(outputPath)}`)
      return downloadUrl
    }
  }
  // Ensure dir
  await mkdirp(path.dirname(outputPath))

  return new Promise((resolve, reject) => {
    got.stream(downloadUrl)
      .on('error', err => {
        console.log(`Error on ${downloadUrl}`)
        reject(err)
      })
      .pipe(fs.createWriteStream(outputPath))
      .on('error', err => {
        console.log(`Error on ${downloadUrl}`)
        reject(err)
      })
      .on('finish', () => {
        console.log(`✓ File downloaded ${downloadUrl}`)
        console.log(`  → ${outputPath.replace(process.cwd(), '')}`)
        resolve({
          url: downloadUrl,
          filePath: outputPath
        })
      })
  })
}
