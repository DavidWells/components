const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
// eslint-disable-next-line promise/param-names
const fileExists = (s) => new Promise((r) => fs.access(s, fs.F_OK, (e) => r(!e)))

const TEMP_CACHE_FILE = path.join(__dirname, '.cache')

async function save(newData, filePath = TEMP_CACHE_FILE) {
  const existingContents = await get()
  const data = { ...existingContents, ...newData }
  await writeFile(filePath, JSON.stringify(data))
  return data
}

async function get(key, filePath = TEMP_CACHE_FILE) {
  let contents = '{}'
  if (await fileExists(filePath)) {
    contents = await readFile(filePath, 'utf-8')
  }
  const data = JSON.parse(contents)
  if (!key) return data
  return dotProp(data, key)
}

// via https://github.com/developit/dlv
function dotProp(obj, key, def, p, undef) { // eslint-disable-line
  key = key.split ? key.split('.') : key
  for (p = 0; p < key.length; p++) {
    obj = obj ? obj[key[p]] : undef
  }
  return obj === undef ? def : obj
}

module.exports = {
  save,
  get
}
