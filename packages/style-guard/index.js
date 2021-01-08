const ENV = process && process.env && process.env.NODE_ENV

module.exports = function styleGuard (styles, cssFile, srcFile, varName = '') {
  if (ENV !== 'development' || typeof Proxy === 'undefined') {
    return styles
  }
  // Else return new proxy to catch undefined references
  return new Proxy(styles, {
    get: (obj, prop, receiver) => {
      if (!obj || typeof obj !== 'object') {
        throw new Error('No styles found')
      }
      if (!obj[prop]) {
        const key = (Object.keys(obj) || [])[0]
        const name = (obj[key] || '').replace(/(__.*)/, '')
        const srcFileMsg = (srcFile) ? `\n● Reference to '${varName}.${prop}' in "${srcFile}" missing` : ''
        const cssFileMsg = (cssFile) ? ` from css file '${cssFile}'` : ` in ${name}`
        const locationMsg = (varName) ? ` from '${varName}' object` : ''
        const msg = `Style Guard Error!\n● CSS class '.${prop}' missing${locationMsg}${srcFileMsg}${cssFileMsg}`
        throw new Error(msg)
      }
      return obj[prop]
    }
  })
}
