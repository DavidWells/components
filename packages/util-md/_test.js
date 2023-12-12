const fs = require('fs')
const path = require('path')
const util = require('util')
const { parseMarkdown } = require('./src/parse')

function deepLog(myObject, myObjectTwo) {
  let obj = myObject
  if (typeof myObject === 'string') {
    obj = myObjectTwo
    console.log(myObject)
  }
  console.log(util.inspect(obj, false, null, true /* enable colors */))
}

const FILE_PATH = path.join(__dirname, '_test.md')
const fileContents = fs.readFileSync(FILE_PATH, 'utf-8')

deepLog(parseMarkdown(fileContents))
