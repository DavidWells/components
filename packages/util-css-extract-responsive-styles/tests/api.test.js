const fs = require('fs').promises
const path = require('path')
const extractMediaQueries = require('../src')

async function runPostBuild() {
  const buildHash = ''
  const postFix = (buildHash) ? `-${buildHash}` : ''
  const BUILD_DIR = path.join(__dirname, 'fixtures')
  const BUILD_CSS_DIR = path.join(__dirname, 'fixtures', 'css')
  const BUILD_CSS_TEMP_DIR = path.join(__dirname, 'fixtures', 'temp-css')

  await copyDir(BUILD_CSS_DIR, BUILD_CSS_TEMP_DIR)

  await extractMediaQueries({
    // buildDir: BUILD_DIR,
    outputPath: path.join(BUILD_DIR, `responsive${postFix}.css`),
    pattern: `${BUILD_CSS_TEMP_DIR}/**/**.css`,
    // ignore: [
    //   `${BUILD_DIR}/responsive`
    // ],
    debug: true,
    // silent: true,
  })
}

async function createDir(directoryPath, recursive = true) {
  return fs.mkdir(directoryPath, { recursive: recursive }).catch((e) => {})
}
async function copyDir(src, dest, recursive = true) {
  await createDir(dest, recursive)
  const filePaths = await fs.readdir(src)
  await Promise.all(filePaths.map(async (item) => {
    const srcPath = path.join(src, item)
    const destPath = path.join(dest, item)
    const itemStat = await fs.lstat(srcPath)
    if (itemStat.isFile()) {
      return fs.copyFile(srcPath, destPath)
    }
    if (!recursive) return
    return copyDir(srcPath, destPath, recursive)
  }))
}

runPostBuild()
