// vendored from https://github.com/paulmelnikow/chainsmoker
const micromatch = require('micromatch')
const mapValues = require('lodash.mapvalues')

const isExclude = p => p.startsWith('!')

module.exports = function chainsmoker(keyedPaths) {
  function matchPatterns(patterns) {
    return mapValues(keyedPaths, paths => {
      const excludePatterns = patterns.filter(p => isExclude(p))
      const includePatterns = patterns.filter(p => !isExclude(p))
      const included = includePatterns.reduce((accum, pattern) => {
        return accum.concat(micromatch.match(paths, pattern))
      }, [])
      return excludePatterns.reduce((accum, pattern) => {
        return micromatch.match(accum, pattern)
      }, included)
    })
  }
  function finalize(keyedPaths) {
    const foundFiles = Object.keys(keyedPaths).reduce((acc, key) => {
      acc[`${key}Files`] = keyedPaths[key]
      return acc
    }, {})
    return Object.assign(
      Object.assign({}, mapValues(keyedPaths, paths => paths.length > 0)),
      foundFiles,
      {
        getKeyedPaths: () => keyedPaths
      }
    )
  }
  return (...patterns) => finalize(matchPatterns(patterns))
}
