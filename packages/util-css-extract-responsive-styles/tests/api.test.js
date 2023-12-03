const path = require('path')
const extractMediaQueries = require('../src')

async function runPostBuild() {
  const buildHash = 'xyz'
  const BUILD_DIR = path.join(__dirname, 'fixtures')

  await extractMediaQueries({
    // buildDir: BUILD_DIR,
    outputPath: path.join(BUILD_DIR, `responsive-${buildHash}.css`),
    pattern: `${BUILD_DIR}/**/**.css`,
    // ignore: [
    //   `${BUILD_DIR}/responsive`
    // ],
    debug: true,
    // silent: true,
  })
}

runPostBuild()
