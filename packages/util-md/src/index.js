const { parseMarkdown } = require('./parse')
const { parseFrontmatter } = require('./frontmatter')
const { generateToc } = require('./toc')
const dedentString = require('./utils/dedent')

const FIRST_H1_ATX = /^# (.*)/
const FIRST_H1_SETEXT = /^(.*)\n?===+/
const FIRST_H1_HTML = /^<h1\b([^>]*)>*(?:>([\s\S]*?)<\/h1>)/

function removeLeadingH1(content = '') {
  let finalContent = content.trim()
  // Remove Leading h1 if exists
  if (content.startsWith('# ')) {
    finalContent = content.replace(FIRST_H1_ATX, '')
  // Remove heading H1 if ========= setext format
  } else if (content.match(FIRST_H1_SETEXT)) {
    finalContent = content.replace(FIRST_H1_SETEXT, '')
  // Remove heading H1 if ========= <h1>format</h1>
  } else if (content.match(FIRST_H1_HTML)) {
    finalContent = content.replace(FIRST_H1_HTML, '')
  }
  return finalContent
}

module.exports = {
  parseMarkdown,
  parseFrontmatter,
  generateToc,
  removeLeadingH1,
  dedentString,
}
