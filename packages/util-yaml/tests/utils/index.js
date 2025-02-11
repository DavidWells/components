const util = require('util')

let DEBUG = process.argv.includes('--debug') ? true : false
DEBUG = true
const logger = DEBUG ? deepLog : () => {}

function logValue(value, isFirst, isLast) {
  const prefix = `${isFirst ? '> ' : ''}`
  if (typeof value === 'object') {
    console.log(`${util.inspect(value, false, null, true)}\n`)
    return
  }
  if (isFirst) {
    console.log(`\n\x1b[33m${prefix}${value}\x1b[0m`)
    return
  }
  console.log((typeof value === 'string' && value.includes('\n')) ? `\`${value}\`` : value)
}

function deepLog() {
  for (let i = 0; i < arguments.length; i++) logValue(arguments[i], i === 0, i === arguments.length - 1)
}

function testLogger({ label, object, input, output, expected }) {
  const postFix = (label) ? ` - ${label}` : ''
  if (object) {
    logger(`Parsed object${postFix}`, object)
  }
  logger(`Input string${postFix}`, input)
  logger(`Output string${postFix}`, output)
  logger(`Expected string${postFix}`, expected)
  const line = '──────────────────────────────────────────────────────────────────────────────────────────────────────────────'
  // wrap line in white bold text
  logger(`\x1b[37m\x1b[1m${line}\x1b[0m`)
}

module.exports = {
  testLogger,
  deepLog,
  logger
}
