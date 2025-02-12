const { ALL_TAGS_OR_REGEX_PATTERN } = require('./_constants')
const { deepLog } = require('../utils/logger')
const { resolveValue: resolveValueUtil } = require('../utils/resolve')
const { arrayToYaml } = require('./_array-to-yaml')

function resolveValue(item, insideAnotherIntrinsicFn = false) {
  /*
  deepLog('resolveValue input', item)
  /** */
  // if (!item) return item

  let intrinsicFn = null
  if (typeof item === 'object') {
    intrinsicFn = Object.keys(item).find((key) => key.startsWith('Fn::') || key === 'Ref' || key === 'Condition')
  }
  console.log('intrinsicFn', intrinsicFn, Array.isArray(item) ? 'array' : typeof item)
  /*
  deepLog('intrinsicFn', intrinsicFn)
  deepLog('item', item)
  /** */

  if (item && intrinsicFn && Array.isArray(item[intrinsicFn])) {
    return item[intrinsicFn].map((v) => {
      /*
      deepLog('v', v)
      /** */
      return resolveValue(v)
    })
  }

  if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
    return item
  }

  // console.log('item[intrinsicFn]', item[intrinsicFn])

  if (item[intrinsicFn]) {
    if (typeof item[intrinsicFn] === 'object') {
      return resolveValue(item[intrinsicFn], true)
    }

    if (Array.isArray(item[intrinsicFn])) {
      return item[intrinsicFn].map((v) => resolveValue(v))
    }

    return item[intrinsicFn]
  }

  if (Array.isArray(item)) {
    return item.map((v) => resolveValue(v))
  }

  if (typeof item === 'object') {
    console.log('item is an object', item)
    return Object.keys(item).reduce((acc, key) => {
      console.log('key', key, item[key])
      acc[key] = resolveValue(item[key])
      return acc
    }, {})
  }

  /*
  deepLog('item[intrinsicFn]', item[intrinsicFn])
  /** */

  const newLine = ''
  switch (intrinsicFn) {
    case 'Ref':
    case 'Fn::Ref':
      return `${newLine}!Ref ${item[intrinsicFn]}`
    case 'Condition':
      return `!Condition ${item[intrinsicFn]}`
    case 'Fn::Equals':
      return `!Equals [${item[intrinsicFn]}]`
    case 'Fn::Or':
      return `!Or [${item[intrinsicFn]}]`
    case 'Fn::Join':
      return `!Join [${item[intrinsicFn]}]`
    // case 'Fn::GetAZs':
    //   return `!GetAZs ${item[intrinsicFn]}`
    default:
      return item[intrinsicFn] || ''
  }
}

// /"(!Ref [^"]+)"/g
const TAG_IN_DOUBLE_QUOTES_REGEX = new RegExp(`"((!${ALL_TAGS_OR_REGEX_PATTERN}) [^"]+)"`, 'g')
const TAG_IN_SINGLE_QUOTES_REGEX = new RegExp(`'((!${ALL_TAGS_OR_REGEX_PATTERN}) [^']+)'`, 'g')

function stringifyOriginal(originalValue, indent = '', fallback = '') {
  const value = resolveValue(originalValue)
  const newString = JSON.stringify(value)

  /* If string is too long, return the original string */
  if (newString.length > 120) {
    deepLog('originalValue value', originalValue)
    deepLog('value', value)

    return (
      '\n' +
      arrayToYaml(originalValue, indent.length)
        .replace(TAG_IN_DOUBLE_QUOTES_REGEX, '$1')
        .replace(TAG_IN_SINGLE_QUOTES_REGEX, '$1')
    )
  }

  return (
    newString
      /* If intrinsic function is in double quotes, then replace it with the original string */
      .replace(TAG_IN_DOUBLE_QUOTES_REGEX, '$1')
      /* If intrinsic function is in single quotes, then replace it with the original string */
      .replace(TAG_IN_SINGLE_QUOTES_REGEX, '$1')
      /* Add spaces between commas */
      .replace(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/g, ', ')
  )
}

function stringifyOriginalNew(originalValue, indent = '', fallback = '') {
  const value = resolveValueUtil(originalValue)
  console.log('stringifyOriginalNew value', value)
  const newString = JSON.stringify(value)
  console.log('newString', newString)

  let hasSuperBigString = false
  if (Array.isArray(value)) {
    hasSuperBigString = value.find((v) => typeof v === 'string' && (v.length > 120 || v.includes('\n')))
  }
  console.log('hasSuperBigString', hasSuperBigString)

  /* If string is too long, return the original string */
  if (newString.length > 120 || hasSuperBigString) {
    deepLog('originalValue value', originalValue)
    deepLog('value', value)


    const backToOriginal = arrayToYaml(originalValue, indent.length)
    // console.log('indent.length', indent.length)
    // console.log('hasSuperBigString', hasSuperBigString)
    // console.log('backToOriginal', backToOriginal)
    // process.exit(0)

    return '\n' + backToOriginal
  }

  return (
    newString
      /* If intrinsic function is in double quotes, then replace it with the original string */
      .replace(TAG_IN_DOUBLE_QUOTES_REGEX, '$1')
      /* If intrinsic function is in single quotes, then replace it with the original string */
      .replace(TAG_IN_SINGLE_QUOTES_REGEX, '$1')
      /* Add spaces between commas */
      .replace(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/g, ', ')
  )
}

function returnOriginalArray(values, indent) {
  return '\n' + values.map((v) => `${indent}${v}`).join('\n')
}

function getTextFromRange(originalYmlStr, cst) {
  console.log(`originalYmlStr`, `"${originalYmlStr}"`)
  const lines = originalYmlStr.split('\n')
  console.log('lines', lines)
  const result = []
  const range = {
    // start: Object.assign({}, cst.rangeAsLinePos.start, { line: cst.rangeAsLinePos.start.line + 1 }),
    // end: Object.assign({}, cst.rangeAsLinePos.end, { line: cst.rangeAsLinePos.end.line + 1 }),
    start: Object.assign({}, cst.rangeAsLinePos.start, { line: cst.rangeAsLinePos.start.line }),
    end: Object.assign({}, cst.rangeAsLinePos.end, { line: cst.rangeAsLinePos.end.line }),
  }
  console.log('range', range)
  let firstLineWithValue = ''
  let isSingleLine = false
  /* If single line, then return the line with the value */
  if (cst.rangeAsLinePos.start.line === cst.rangeAsLinePos.end.line) {
    firstLineWithValue = lines[cst.rangeAsLinePos.start.line - 1]
    isSingleLine = true
    result.push(lines[cst.rangeAsLinePos.start.line - 1])
  } else {
    /* Find multiline value */
    for (let i = range.start.line - 1; i < range.end.line - 1; i++) {
      result.push(lines[i])
      // console.log('lines[i]', lines[i])
      // if line has char, then set firstLineWithValue only once
      if (!firstLineWithValue && lines[i].trim()) {
        firstLineWithValue = lines[i]
      }
    }
  }
  console.log('isSingleLine', isSingleLine)
  console.log('firstLineWithValue', firstLineWithValue)
  console.log('result', result)

  const match = firstLineWithValue.match(/^(\s+)/)
  const indentLength = match ? match[1].length : 0
  const key = (firstLineWithValue.match(/^\s*([a-zA-Z]+):/) || [])[1]
  const indent = match ? match[1] : ''
  const value = getStringSlice(originalYmlStr, cst.range.start, cst.range.end) || ''
  const multilineDetails = getMultilineType(value)
  return {
    tag: cst.tag ? cst.tag.handle + cst.tag.suffix : '',
    key,
    text: result.join('\n'),
    value,
    indent,
    indentLength,
    valueAfterTag: cst.rawValue || cst.strValue,
    multilineDetails,
    trailingNewlines: checkYamlKeySpacing(originalYmlStr, key, indent, isSingleLine),
  }
}

function getStringSlice(str, start, end) {
  return str.slice(start, end)
}

function checkYamlKeySpacing(yaml, key, indent = '', isSingleLine = false) {
  let pattern
  if (isSingleLine) {
    pattern = new RegExp(`^${indent}(${key}):\\s*(.*(?:(?!${key}:)[\\s\\S])*?)(\\n\\s*\\n)?`, 'm')
  } else {
    pattern = new RegExp(`^${indent}(${key}):\\s*(.*\\n(?:(?!${key}:)[\\s\\S])*?)(\\n\\s*\\n)?`, 'm')
  }
  console.log('checkYamlKeySpacing', pattern)
  const hasMatch = yaml.match(pattern)
  // console.log('hasMatch', hasMatch)
  if (hasMatch) {
    const trailing = hasMatch[3] || ''
    // newline count
    const newlineCount = trailing.split('\n').length - 1

    return (
      trailing
        // trim extra newlines
        .replace('\n', '')
        // trim all chars except newlines
        .replace(/[^\n]/g, '')
    )
  }
  return ''
}

function getValueTrailingNewlines(originalString, cst) {
  const originalValue = getStringSlice(originalString, cst.range.start, cst.range.end) || ''
  // get last line of originalValue
  const lastLine = originalValue.split('\n').pop()
  // Create a regex for lastLine
  const hasNewLinePattern = new RegExp(escapeStringRegexp(lastLine) + '(\\n\\s*\\n)', 'm')
  const originalNewLineMatch = yaml.match(hasNewLinePattern)
  const newLinesFound = originalNewLineMatch ? originalNewLineMatch[1].replace(/[^\n]/g, '').replace(/\n/, '') : ''
  const valueHasNewLine = cst.valueRangeContainsNewline
  return newLinesFound
}

function escapeStringRegexp(string) {
  if (typeof string !== 'string') {
    throw new TypeError('Expected a string')
  }

  // Escape characters with special meaning either inside or outside character sets.
  // Use a simple backslash escape when it's always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns' stricter grammar.
  return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

function enhanceResolverResult(obj, secretData) {
  return new Proxy(obj, {
    get(target, prop) {
      if (prop === '_internals') return secretData
      return target[prop]
    },
  })
}

// Todo remove this
function parseArrayByDashes(input) {
  let result = []
  const lines = input.split('\n').map((l) => l.trim())
  /*
  deepLog('lines', lines)
  /** */

  function cleanValue(line) {
    return line.replace(/^-+\s*/, '').replace(/^-+\s*/, '')
  }

  let currentLevel = result

  for (const line of lines) {
    // Pattern "- -" starts a new level
    if (line.match(/^\s*- -/)) {
      if (!result.length) {
        // First "- -" defines root array items
        currentLevel.push(cleanValue(line))
      } else {
        // Subsequent "- -" creates nested array
        const newLevel = [cleanValue(line)]
        currentLevel.push(newLevel)
        currentLevel = newLevel
      }
    } else {
      // Single "-" adds to current level
      currentLevel.push(cleanValue(line))
    }
  }
  /*
  deepLog('parseArrayByDashes result', result)
  /** */
  return result //.filter(Boolean)
}

function returnOriginalArray(values, indent) {
  return '\n' + values.map((v) => `${indent}${v}`).join('\n')
}

function hasNewlineOutsideQuotes(str) {
  let inQuotes = false
  let quoteChar = null

  for (let i = 0; i < str.length; i++) {
    if ((str[i] === '"' || str[i] === "'") && (!inQuotes || str[i] === quoteChar)) {
      inQuotes = !inQuotes
      quoteChar = inQuotes ? str[i] : null
    } else if (str[i] === '\n' && !inQuotes) {
      return true
    }
  }
  return false
}

/*
// Util Debugger
if (process.argv[1] === __filename) {

  console.log(hasNewlineOutsideQuotes(`
  ljkdkajhakldaskldj

  `))

}
  // process.exit(1)
/** */

const STARTS_WITH_MULTILINE_INDICATOR = new RegExp(`^!(!${ALL_TAGS_OR_REGEX_PATTERN})\\s*`, 'g')


/**
 * Checks if a string uses YAML multiline syntax and returns the type
 * @param {string} value The string to check
 * @returns {Object} Object containing type and properties of the multiline string
 * https://stackoverflow.com/questions/3790454/how-do-i-break-a-string-in-yaml-over-multiple-lines/21699210#21699210
 */
function getMultilineType(value = '') {
  value = value.trim().replace(STARTS_WITH_MULTILINE_INDICATOR, '')
  if (!value || typeof value !== 'string') {
    return { type: 'empty', hasNewline: false }
  }

  // Match YAML multiline indicators with optional chomping and indent in any order
  // Capture groups:
  // 1. style (| or >)
  // 2. first modifier (indent number or chomping indicator)
  // 3. second modifier (indent number or chomping indicator)
  // 4. remaining content
  const match = value.match(/^([|>])((?:\d+|-|\+)?)((?:\d+|-|\+)?)?(.*)$/s)
  if (!match) {
    return { type: 'plain', hasNewline: hasNewlineOutsideQuotes(value) }
  }

  const [fullMatch, style, mod1, mod2, content] = match

  // Get the full indicator text (everything before the content)
  const matchText = fullMatch.slice(0, fullMatch.length - content.length)

  // Determine which modifier is which
  let indent = null
  let chomping = ''

  // Check first modifier
  if (mod1.match(/\d+/)) {
    indent = parseInt(mod1)
  } else if (['-', '+'].includes(mod1)) {
    chomping = mod1
  }

  // Check second modifier if present
  if (mod2) {
    if (mod2.match(/\d+/)) {
      indent = parseInt(mod2)
    } else if (['-', '+'].includes(mod2)) {
      chomping = mod2
    }
  }

  // Map chomping indicators to their meanings
  const chompingMap = {
    '-': 'strip',
    '+': 'keep',
    '': 'clip'
  }

  return {
    matchText,
    type: style === '|' ? 'literal' : 'folded',
    style,
    chompChar: chomping,
    chomping: chompingMap[chomping],
    indent,
    content
  }
}

/**
 * Format a string using YAML multiline syntax
 * @param {string} value The string to format
 * @param {Object} options Formatting options
 * @returns {string} Formatted string
 */
function formatMultiline(value, options = {}) {
  const {
    type = 'literal',
    chomping = 'clip',
    indent = null
  } = options

  if (!value || typeof value !== 'string') {
    return value
  }

  const style = type === 'literal' ? '|' : '>'
  const chompingIndicator = chomping === 'clip' ? ''
    : chomping === 'strip' ? '-'
    : chomping === 'keep' ? '+'
    : ''
  const indentIndicator = indent ? String(indent) : ''

  const indicator = `${style}${chompingIndicator}${indentIndicator}`

  // Add the indicator and preserve the content
  return `${indicator}\n${value}`
}

module.exports = {
  getTextFromRange,
  getStringSlice,
  checkYamlKeySpacing,
  resolveValue,
  stringifyOriginal,
  stringifyOriginalNew,
  escapeStringRegexp,
  enhanceResolverResult,
  parseArrayByDashes,
  returnOriginalArray,
  hasNewlineOutsideQuotes,
  getMultilineType,
  formatMultiline,
}
