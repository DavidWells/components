const util = require('util')

let DEBUG = process.argv.includes('--debug') ? true : false
// DEBUG = true
// JSON = true
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
  console.log(typeof value === 'string' && value.includes('\n') ? `\`${value}\`` : value)
  // isLast && console.log(`\x1b[37m\x1b[1m${'─'.repeat(94)}\x1b[0m\n`)
}

function deepLog() {
  for (let i = 0; i < arguments.length; i++) logValue(arguments[i], i === 0, i === arguments.length - 1)
}

const isGetter = (x, name) => (Object.getOwnPropertyDescriptor(x, name) || {}).get
const isFunction = (x, name) => typeof x[name] === 'function'
const deepFunctions = (x) =>
  x &&
  x !== Object.prototype &&
  Object.getOwnPropertyNames(x)
    .filter((name) => isGetter(x, name) || isFunction(x, name))
    .concat(deepFunctions(Object.getPrototypeOf(x)) || [])
const distinctDeepFunctions = (x) => Array.from(new Set(deepFunctions(x)))
const getMethods = (obj) => distinctDeepFunctions(obj).filter((name) => name !== 'constructor' && !~name.indexOf('__'))


function debugApi(label, item) {
  console.log('──────DEBUG─────────────────────────')
  const itemMethods = getMethods(item)
  for (const method of itemMethods) {
    console.log(`${label} method ${method}`, item[method])
  }
  deepLog(label, item)
  console.log('──────DONE─────────────────────────')
}

module.exports = {
  debugApi,
  deepLog,
}
