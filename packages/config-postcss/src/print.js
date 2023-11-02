const safeChalk = require('safe-chalk')
const isColor = require('is-color')
const { isHex } = require('is-color')
const rgbHex = require('rgb-hex')

const args = (process.argv && process.argv[2]) ? process.argv[2] : ''
const DISABLE_COLORS = (args.indexOf('--json') > -1) || process.env.NO_COLORS
const chalk = safeChalk(DISABLE_COLORS)

// Hot reload webpack files for PostCSS
function printVariables(variables = {}) {
  if (!variables) {
    return
  }
  console.log()
  console.log(chalk.bold('CSS variables:'))
  Object.keys(variables).forEach((key) => {
    const val = variables[key]
    if (val && typeof val === 'string') {
      console.log(`$${key} - ${val}`)
    }
  })
  console.log()
  console.log(chalk.bold('Colors:'))
  printColors(variables)
  console.log()
  console.log('👆 CSS variables usable via ${nameOfThing} in css files') // eslint-disable-line
}

// Hot reload webpack files for PostCSS
function printColors(variables = {}) {
  if (!variables) {
    return
  }
  const colors = []
  Object.keys(variables).forEach((key) => {
    const value = variables[key]
    if (value && typeof value === 'string' && isColor(value)) {
      const color = (isHex(value)) ? value : `#${rgbHex(value)}`
      colors.push({ key, value, color })
    }
  })
  colors.forEach(({ key, value, color }) => {
    console.log(`${chalk.hex(color).bold('████████████')}  $${key} - ${value}`)
  })
  return colors
}

module.exports = {
  printVariables,
  printColors
}
