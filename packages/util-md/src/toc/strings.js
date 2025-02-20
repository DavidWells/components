function escapeRegexString(string) {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string')
	}
	// Escape characters with special meaning either inside or outside character sets.
	// Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
	return string
		.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
		.replace(/-/g, '\\x2d')
}

function singleLinePattern(text) {
  /* (\s+)?-(.*)\[Usage\]\(.*\) */
  return new RegExp(`\(\\s+\)?-(.*)\\[${text}\\]\\(.*\\)`, 'i')
}

function excludeTocItem(str, excludeText) {
  const matchTextEscaped = escapeRegexString(excludeText)
  /* (\s+)?-(.*)\[Usage\]\(.*\) */
  const regex = singleLinePattern(matchTextEscaped) // new RegExp(`\(\\s+\)?-(.*)\\[${matchTextEscaped}\\]\\(.*\\)`, 'i')
  /* /(\s+)?-(.*)\[Usage\]\(.*\)(\n\s+(.*))+/im */
  const nestedRegex = new RegExp(`\(\\s+\)?-(.*)\\[${matchTextEscaped}\\]\\(.*\\)\(\\n\\s+\(.*\)\)+`, 'i')

  const hasNested = nestedRegex.exec(str)
  if (!hasNested) {
    return str.replace(regex, '')
  }
  // Count indentation of spaces
  const numberOfSpaces = (hasNested[1] || '').replace(/\n/g, '').length
  const subItems = numberOfSpaces + 1
  // Update regex to only remove sub items
  const nestedRegexSpaces = new RegExp(`\(\\s+\)?-(.*)\\[${matchTextEscaped}\\]\\(.*\\)\(\\n\\s{${subItems},}\(.*\)\)+`, 'i')
  // console.log('nestedRegexSpaces', nestedRegexSpaces)
  // If exclude value has nested sections remove them as well.
  str = str.replace(nestedRegexSpaces, '')
  str = str.replace(regex, '')
  return str
}

module.exports = {
  singleLinePattern,
  excludeTocItem,
}
