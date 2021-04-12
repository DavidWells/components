const { save, get } = require('quick-persist')

async function saveHash(hash) {
  if (!hash) {
    throw new Error('No hash provided')
  }
  return save({ previousBuildHash: hash })
}

async function getHash() {
  return get('previousBuildHash')
}

module.exports = class PersistBuildHashWebpackPlugin {
  apply(compiler) {
    // Specify the event hook to attach to
    compiler.hooks.emit.tapAsync('PersistBuildHashWebpackPlugin', (compilation, callback) => {
      // Save build hash
      saveHash(compilation.hash).then(() => callback())
    })
  }
}

module.exports.saveHash = saveHash

module.exports.getHash = getHash