const path = require('path')
const { get } = require('quick-persist')
const extractMediaQueries = require('../')

async function runPostBuild() {
  const buildHash = (await get('hash')) || 'xyz'
  const BUILD_DIR = path.join(__dirname, '../build')

  await extractMediaQueries({
    buildDirectory: BUILD_DIR,
    outputPath: path.join(BUILD_DIR, `static/css/responsive-${buildHash}.css`),
    debug: true
  })
}

runPostBuild()