/**
 * https://github.com/zmrl010/dedented/
 * Remove leading indentation from multi-line string while preserving
 * visual consistency with the original string.
 *
 * @param templateStrings - template literal(s) to interpolate
 * @param args - 0 or more arguments that are results of expressions
 * interpolated within the template strings (using `${expression}`)
 *
 * @returns string with indentation stripped
 */
module.exports = function dedent(templateStrings, ...args) {
  let strings = [templateStrings].flat()
  // remove up to 1 line trailing whitespace
  strings[strings.length - 1] = strings[strings.length - 1].replace(/\r?\n([\t ]*)$/, '')
  // find highest common indentation (HCI)
  const indentLengths = strings.flatMap((value) => {
    const matches = value.match(/\n([\t ]+|(?!\s).)/g)
    if (!matches) {
      return []
    }
    return matches.map((match) => {
      const check = match.match(/[\t ]/g)
      if (check) return check.length
      return 0
    })
  })
  // remove the HCI from all strings
  if (indentLengths.length) {
    const pattern = new RegExp(`\n[\t ]{${Math.min(...indentLengths)}}`, 'g')
    strings = strings.map((str) => str.replace(pattern, '\n'))
  }
  // remove leading whitespace
  strings[0] = strings[0].replace(/^\r?\n/, '')
  return interpolate(strings, args)
}

function interpolate(strings, args) {
  let result = strings[0]
  for (let i = 0; i < args.length; i++) {
    const indentation = readIndentation(result)
    let indentedArg = args[i]
    if (typeof indentedArg === 'string' && indentedArg.includes('\n')) {
      indentedArg = String(indentedArg)
        .split('\n')
        .map((str, i) => (i === 0 ? str : `${indentation}${str}`))
        .join('\n')
    }
    result += indentedArg + strings[i + 1]
  }
  return result
}

function readIndentation(value) {
  const match = value.match(/(?:^|\n)( *)$/)
  if (match) {
    return match[1]
  }
  return ''
}
