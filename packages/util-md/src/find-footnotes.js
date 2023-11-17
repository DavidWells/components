

// https://regex101.com/r/LMO5lc/9
const FOOTNOTE_REGEX = /^[ \t]*\[\^([^\]]*)\]:\s+(["']?[^\n]*["']?)?(?:[^\n])*\n((?:^[ \n\t]{2,}.*\n+)*)/gm

function findFootnotes(block) {
  let matches
  const footnotes = []
  while ((matches = FOOTNOTE_REGEX.exec(block)) !== null) {
    if (matches.index === FOOTNOTE_REGEX.lastIndex) {
      FOOTNOTE_REGEX.lastIndex++ // avoid infinite loops with zero-width matches
    }
    const [ _match, id, opening, trailing ] = matches
    const trailingContent = (trailing) ? `\n${dedentString(trailing)}` : ''
    footnotes.push({
      id,
      content: opening + trailingContent
    })
  }
  return footnotes
}

/**
 * Removes the indentation of multiline strings
 * @link https://github.com/victornpb/tiny-dedent/
 * @param  {string} str A template literal string
 * @return {string} A string without the indentation
 */
function dedentString(str) {
  str = str.replace(/^[ \t]*\r?\n/, '') // remove leading blank line
  let indent = /^[ \t]+/m.exec(str) // detected indent
  if (indent) str = str.replace(new RegExp('^' + indent[0], 'gm'), '') // remove indent
  return str.replace(/(\r?\n)[ \t]+$/, '$1') // remove trailling blank line
}

module.exports = {
  findFootnotes,
  FOOTNOTE_REGEX
}
