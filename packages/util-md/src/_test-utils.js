const util = require('util')

function removeIndexFromObj(obj) {
  const { index, children, ...rest } = obj
  if (children && children.length > 0) {
    rest.children = children.map(removeIndexFromObj)
  }
  return rest
}

function clearIndexValues(arr) {
  return arr.map(removeIndexFromObj)
}

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
  // isLast && console.log(`\x1b[37m\x1b[1m${'─'.repeat(94)}\x1b[0m\n`)
}

function deepLog() {
  for (let i = 0; i < arguments.length; i++) logValue(arguments[i], i === 0, i === arguments.length - 1)
}

module.exports = {
  deepLog,
  removeIndexFromObj,
  clearIndexValues,
}
