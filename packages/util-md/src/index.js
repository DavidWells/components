const { parseMarkdown } = require('./parse')
const { parseFrontmatter } = require('./frontmatter')
const dedentString = require('./utils/dedent')

const FIRST_H1_SETEXT = /^(.*)\n*?===+/
const FIRST_H1_ATX = /^# (.*)/m

function removeLeadingH1(content = '') {
  let finalContent = content
  // Remove Leading h1 if exists
  if (content.startsWith('# ')) {
    finalContent = content.replace(FIRST_H1_ATX, '')
  // Remove heading H1 if ========= setext format
  } else if (content.match(FIRST_H1_SETEXT)) {
    finalContent = content.replace(FIRST_H1_SETEXT, '')
  }
  return finalContent
}

module.exports = {
  parseMarkdown,
  parseFrontmatter,
  removeLeadingH1,
  dedentString
}
