const chalk = require('safe-chalk')
const isColor = require('is-color')
const { isHex } = require('is-color')
const rgbHex = require('rgb-hex')

// Hot reload webpack files for PostCSS
module.exports = function printColors(variables = {}) {
  if (!variables) {
    return
  }
  console.log('CSS variables:')
  console.log(variables)
  console.log('Colors:')
  Object.keys(variables).forEach((key) => {
    const val = variables[key]
    if (val && typeof val === 'string' && isColor(val)) {
      const color = (isHex(val)) ? val : `#${rgbHex(val)}`
      console.log(`${chalk.hex(color).bold('████████████')}  $${key} - ${val}`)
    }
  })
  console.log('👆 CSS variables usable via ${nameOfThing} in css files') // eslint-disable-line
}
