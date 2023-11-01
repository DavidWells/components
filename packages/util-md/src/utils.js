
function getLineNumberFromMatch(text = '', matches) {
  return getLineCount(text.substr(0, matches.index))
}

function getLines(str = '') {
  return str.split(/\r\n|\r|\n/)
}

function getLineCount(str = '') {
  return getLines(str).length
}

/**
 * Removes the indentation of multiline strings
 * @link https://github.com/victornpb/tiny-dedent/
 * @param  {string} str A template literal string
 * @return {string} A string without the indentation
 */
function removeIndents(str) {
  str = str.replace(/^[ \t]*\r?\n/, '') // remove leading blank line
  const indent = /^[ \t]+/m.exec(str) // detected indent
  console.log('indent', `"${indent}"`)
  if (indent) str = str.replace(new RegExp('^' + indent[0], 'gm'), '') // remove indent
  return str.replace(/(\r?\n)[ \t]+$/, '$1') // remove trailling blank line
}

module.exports = {
  getLines,
  getLineCount,
  getLineNumberFromMatch,
  removeIndents
}
