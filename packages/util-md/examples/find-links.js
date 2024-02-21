const fs = require('fs')
const path = require('path')
const util = require('util')
const { parseMarkdown } = require('./src/parse')
const { findLinks } = require('./src/find-links')

function deepLog(myObject, myObjectTwo) {
  let obj = myObject
  if (typeof myObject === 'string') {
    obj = myObjectTwo
    console.log(myObject)
  }
  console.log(util.inspect(obj, false, null, true /* enable colors */))
}

const FILE_PATH = path.join(__dirname, 'big-file.md')
const fileContents = fs.readFileSync(FILE_PATH, 'utf-8')

deepLog(findLinks(fileContents))
