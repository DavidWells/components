// vendored from https://github.com/paulmelnikow/chainsmoker
const micromatch = require('micromatch')
// const mapValues = require('lodash.mapvalues')

const isExclude = p => p.startsWith('!')

module.exports = function chainsmoker(keyedPaths) {
  return (...globPatterns) => {
    const patterns = globPatterns.flatMap((glob) => glob)
    const excludePatterns = patterns.filter(p => isExclude(p))
    const includePatterns = patterns.filter(p => !isExclude(p))

    const matches = {}
    Object.keys(keyedPaths).forEach((key) => {
      const paths = keyedPaths[key]
      const included = includePatterns.reduce((acc, pattern) => {
        return acc.concat(micromatch.match(paths, pattern))
      }, [])
      matches[key] = excludePatterns.reduce((acc, pattern) => {
        return micromatch.match(acc, pattern)
      }, included)
    })
    /* previous with lodash
    const matches = mapValues(keyedPaths, paths => {
      const excludePatterns = patterns.filter(p => isExclude(p))
      const includePatterns = patterns.filter(p => !isExclude(p))
      const included = includePatterns.reduce((acc, pattern) => {
        return acc.concat(micromatch.match(paths, pattern))
      }, [])
      return excludePatterns.reduce((acc, pattern) => {
        return micromatch.match(acc, pattern)
      }, included)
    })
    */
    // console.log('matches', matches)
    return finalize(matches)
  }
}

function finalize(keyedPaths) {
  const values = {}
  Object.keys(keyedPaths).forEach((key) => {
    values[key] = keyedPaths[key].length > 0
    values[`${key}Files`] = keyedPaths[key]
  })
  return Object.assign(values, {
    getKeyedPaths: () => keyedPaths
  })
}
