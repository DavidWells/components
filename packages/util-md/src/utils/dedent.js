

function dedent(text = '', minIndent) {
  // Split the string into lines and find the minimum common leading whitespace
  const lines = text.split('\n')

  let min = minIndent || Number.MAX_VALUE
  for (const line of lines) {
    if (line.trim().length === 0) continue // Skip empty lines
    const leadingWhitespace = line.match(/^\s*/)[0]
    min = Math.min(min, leadingWhitespace.length)
  }
  // Dedent the lines by removing the common leading whitespace
  const dedentedLines = lines.map(line => line.slice(min))
  // Join the dedented lines back into a single string
  return dedentedLines.join('\n')
}

/*
const x = `
Cool

    \`\`\`
    chill
    \`\`\``

console.log(dedent(x))
/** */

module.exports = dedent
