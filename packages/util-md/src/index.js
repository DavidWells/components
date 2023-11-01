const { parseMarkdown } = require('./parse')
const { parseFrontmatter } = require('./frontmatter')
const dedentString = require('./utils/dedent')

const FIRST_H1_UNDERSCORE = /^(.*)\n*?===+/
const FIRST_H1_HASH = /^# (.*)/m

function removeLeadingH1(content = '') {
  let finalContent = content
  // Remove Leading h1 if exists
  if (content.startsWith('# ')) {
    finalContent = content.replace(FIRST_H1_HASH, '')
  // Remove heading H1 if ========= format
  } else if (content.match(FIRST_H1_UNDERSCORE)) {
    finalContent = content.replace(FIRST_H1_UNDERSCORE, '')
  }
  return finalContent
}

module.exports = {
  parseMarkdown,
  parseFrontmatter,
  removeLeadingH1,
  dedentString
}
