const yaml = require('yaml')

const { deepLog } = require('./utils/logger')
const { getTags } = require('./tags')

function parse(ymlString = '', opts = {}) {
  // Set custom tags globally
  yaml.defaultOptions.customTags = getTags(ymlString)
  return yaml.parse(ymlString.trim(), opts)
}

function getTopLevelKeys(yamlString = '') {
  const doc = yaml.parseDocument(yamlString)
  if (doc.contents && doc.contents.items.length > 0) {
    return doc.contents.items.map((item) => item.key.value)
  }
  return []
}

module.exports = {
  parse,
  getTopLevelKeys,
}
