const { stringifyString } = require('yaml/util')
const { deepLog, debugApi } = require('./utils/logger')

function getTags(originalString) {
  // return []
  // Define CloudFormation tags
  const cfnTags = [
    // Handle !Ref
    {
      identify: (value) => value && value['Fn::Ref'],
      tag: '!Ref',
      resolve(doc, cst) {
        return { 'Fn::Ref': cst.strValue }
      },
      stringify(item, ctx, onComment, onChompKeep) {
        console.log('Ref item', item)
        return stringifyString({ value: item.value['Fn::Ref'] }, ctx, onComment, onChompKeep)
      },
    },
    // Handle !Condition
    {
      identify: (value) => value && value['Fn::Condition'],
      tag: '!Condition',
      resolve(doc, cst) {
        /*
        deepLog('Condition cst', cst)
        debugApi('Condition', cst)
        /** */
        return { 'Fn::Condition': cst.strValue }
      },
      stringify(item, ctx, onComment, onChompKeep) {
        console.log('Condition item', item)
        return stringifyString({ value: item.value['Fn::Condition'] }, ctx, onComment, onChompKeep)
      },
    },
    {
      identify: (value) => value && value['Fn::Sub'],
      tag: '!Sub',
      resolve(doc, cst) {
        return { 'Fn::Sub': cst.strValue }
      },
      stringify(item, ctx, onComment, onChompKeep) {
        return stringifyString({ value: item.value['Fn::Sub'] }, ctx, onComment, onChompKeep)
      },
    },
    {
      identify: (value) => value && value['Fn::GetAZs'],
      tag: '!GetAZs',
      resolve(doc, cst) {
        return { 'Fn::GetAZs': cst.strValue }
      },
      stringify(item, ctx, onComment, onChompKeep) {
        const indent = ctx.indent || '  '
        const value = resolveValue(item.value)
        /* if reference, then return a new line */
        if (isIntrinsicFn(value)) {
          return `\n${indent}${value}`
        }
        return stringifyString({ value: value }, ctx, onComment, onChompKeep)
      },
    },
    {
      identify: (value) => value && value['Fn::GetAtt'],
      tag: '!GetAtt',
      resolve(doc, cst) {
        return { 'Fn::GetAtt': cst.strValue.split('.') }
      },
      stringify(item, ctx, onComment, onChompKeep) {
        return stringifyString(
          {
            value: item.value['Fn::GetAtt'].join('.'),
          },
          ctx,
          onComment,
          onChompKeep,
        )
      },
    },
    // Handle base64
    {
      identify: (value) => value && value['Fn::Base64'],
      tag: '!Base64',
      resolve(doc, cst) {
        // console.log('BASE64 cst', cst.strValue)
        // deepLog('BASE64 cst', cst)
        // debugApi('BASE64', cst)
        const originalValue = (getStringSlice(originalString, cst.range.start, cst.range.end) || '').trim()
        // get last line of originalValue
        const lastLine = originalValue.split('\n').pop()
        console.log('lastLine', lastLine)
        // Create a regex for lastLine
        const hasNewLinePattern = new RegExp(escapeStringRegexp(lastLine) + '(\\s{2,})', 'm')
        console.log('hasNewLinePattern', hasNewLinePattern)
        const originalNewLineMatch = originalString.match(hasNewLinePattern)
        console.log('Has new line pattern', Boolean(originalNewLineMatch))
        if (originalNewLineMatch) {
          return {
            'Fn::Base64': cst.rawValue.replace(/\n+$/, '') + '\n',
          }
        }
        // console.log('cst.includesTrailingLines', cst.includesTrailingLines)
        // replace trailing empty lines
        const valueHasNewLine = cst.valueRangeContainsNewline
        if (valueHasNewLine) {
          return {
            'Fn::Base64': cst.rawValue.replace(/\n+$/, ''),
          }
        }

        return {
          'Fn::Base64': cst.rawValue, // .replace(/\n+$/, '')
        }
      },
      stringify(item, ctx, onComment, onChompKeep) {
        const value = item.value['Fn::Base64']
        // return stringifyString({ value }, ctx, onComment, onChompKeep)
        if (typeof value === 'string' && value.includes('\n')) {
          return `|\n${value}`
        }
        return value + '\n'
      },
    },
    // Handle !ImportValue
    {
      identify: (value) => value && value['Fn::ImportValue'],
      tag: '!ImportValue',
      resolve(doc, cst) {
        return { 'Fn::ImportValue': cst.strValue }
      },
      stringify(item, ctx, onComment, onChompKeep) {
        return stringifyString(
          {
            value: item.value['Fn::ImportValue'],
          },
          ctx,
          onComment,
          onChompKeep,
        )
      },
    },
    // HANDLE !Or
    {
      identify: (value) => value && value['Fn::Or'],
      tag: '!Or',
      resolve(doc, cst) {
        deepLog('OR cst', cst)
        debugApi('OR debugApi', cst)

        const originalYAMLBlock = getTextFromRange(originalString, cst)
        deepLog('OR originalYAMLBlock', originalYAMLBlock)

        const originalValueBlock = (getStringSlice(originalString, cst.range.start, cst.range.end) || '')// .trim()
        deepLog('OR originalValueBlock', originalValueBlock)

        const details = findTrailingNewslines(originalString, cst)

        deepLog('OR details', details)

        if (originalYAMLBlock.key === 'NICEEEEEEEEEEEEEEEE') {
          process.exit(0)
        }

        // check if originalValue has a trailing newline
        const hasTrailingNewline = originalValue.match(/\s*\n\s*$/)
        deepLog('OR hasTrailingNewline', hasTrailingNewline)
        const result = getRawArrayLines(cst, (hasTrailingNewline) ? true : false)

        deepLog('OR resolve result', result)
        return { 'Fn::Or': result }
        return { 'Fn::Or': result }
      },
      // Stringify !Or
      stringify(item, ctx, onComment, onChompKeep) {
        const indent = ctx.indent || '  ' // Default to 2 spaces if not set
        const value = item.value && item.value['Fn::Or']
        const testValue = resolveValue(item.value)
        //*
        deepLog(`OR item.value['Fn::Or']`, value)
        deepLog(`OR resolveValue`, testValue)
        /** */

        // return returnOriginalArray(testValue, indent)

        if (testValue && Array.isArray(testValue)) {
          const args = testValue.map((v) => {
            console.log('v', v)
            // if (v && v.Ref) {
            //   return `${indent}- !Ref ${v.Ref}`
            // }
            if (typeof v === 'string') {
              return `${indent}${v}`
            }

            return `${indent}- !Equals [${v.map(quotify).join(', ')}]`
          })
          return `\n${args.join('\n')}`
        }

        if (Array.isArray(value)) {
          const indentSize = ctx.indentAtStart || 0
          const prefix = indent.repeat(indentSize / indent.length)
          // console.log('prefix', `"${prefix}"`)
          // console.log('indentSize', indentSize)
          // console.log('indent', `"${indent}"`)
          const args = value.map((v) => {
            const testValue = resolveValue((v && v.value) || v)
            console.log('RETURN VALUE', testValue)
            if (v && v.Ref) {
              return `${indent}- !Ref ${v.Ref}`
            }
            if (typeof v === 'string' && v.includes('!')) {
              return `${indent}${v}`
            }
            return `${indent}${typeof v === 'string' ? `'${v}'` : v}`
          })
          return `\n${args.join('\n')}`
        }

        console.log('final item', item)
        return stringifyString({ value: value }, ctx, onComment, onChompKeep)
      },
    },
    // HANDLE !Equals
    {
      identify: (value) => value && value['Fn::Equals'],
      tag: '!Equals',
      resolve(doc, cst) {
        if (!cst) return null
        deepLog('cst', cst)
        // Handle flow sequence type
        if (cst.type === 'FLOW_SEQ') {
          // Filter out the brackets and commas, only get the actual values
          const values = cst.items
            .filter((item) => isQuote(item) || item.type === 'PLAIN')
            .map((item) => {
              deepLog('!Equals item', item)
              const tag = item.tag ? item.tag.handle + item.tag.suffix + ' ' : ''
              // For quoted strings, use the raw value between quotes
              // if (isQuote(item)) {
              //   // Use the valueRange directly from the item
              //   console.log('item.strValue',  item.strValue)
              //   return item.valueRange ? item.strValue || item.value : null
              // }
              // For plain values (like !Ref), use the strValue
              return tag + item.rawValue
            })
          return { 'Fn::Equals': values }
        }

        // Handle object format
        if (cst.value && typeof cst.value === 'object' && cst.value['Fn::Equals']) {
          return cst.value
        }

        // Handle scalar type
        if (cst.strValue) {
          return { 'Fn::Equals': cst.strValue }
        }

        return null
      },
      stringify(item, doc, onComment, onChompKeep) {
        deepLog('!Equals stringify item', item)
        const value = item.value && item.value['Fn::Equals']
        if (Array.isArray(value)) {
          const args = value.map((v) => {
            console.log('v', v)
            if (v && v.Ref) {
              return `!Ref ${v.Ref}`
            }
            if (typeof v === 'string' && v.includes('!')) {
              return v
            }
            // string and not surrounded by single or double quotes
            return typeof v === 'string' && !v.match(/^['"]/) && !v.match(/['"]$/) ? `'${v}'` : v
          })
          return `[${args.join(', ')}]`
        }
        return value
      },
    },
    // HANDLE !Join
    {
      identify: (value, key, tag) => {
        if (value && value['Fn::Join']) {
          const string = JSON.stringify(value['Fn::Join'])
          console.log('MATCH', string)
          const totalLength = value['Fn::Join'].reduce((acc, v) => acc + v.length, 0)
          if (totalLength < 20) {
            return true
          }
          return true
        }
        return false
      },
      tag: '!Join',
      resolve(doc, cst) {

        // return cst.items
        // deepLog('JOIN cst', cst)
        debugApi('JOIN', cst)
        const originalValue = (getStringSlice(originalString, cst.range.start, cst.range.end) || '').trim()
        console.log('originalValue', originalValue)


        const findKeyPattern = new RegExp(`^([a-zA-Z]+):\\s*${escapeStringRegexp(originalValue)}`, 'm')
        console.log('findKeyPattern', findKeyPattern)
        const findKey = originalString.match(findKeyPattern)

        let trailingNewLines = ''
        if (findKey) {
          const key = findKey[1]
          console.log('key', key)
          const findTrailingNewlines = checkYamlKeySpacing(originalString, key)
          if (findTrailingNewlines) {
            trailingNewLines = findTrailingNewlines
            // console.log('trailingNewLines', trailingNewLines)
            // process.exit(0)
          }
        }


        const result = cst.items
          .filter((item) => item.rawValue)
          .map((item) => {
            const tag = item.tag ? item.tag.handle + item.tag.suffix + ' ' : ''
            const value = tag + item.rawValue
            return value // .replace(/^- -/, '-')
          })
          .filter(Boolean)

        if (cst.includesTrailingLines) {
          // result.push('\n')
        }

        if (trailingNewLines) {
          result.push(trailingNewLines)
        }

        console.log('result', result)
        // ctx.foobar = 'foobar'
        // process.exit(0)
        return {
          'Fn::Join': result,
        }
      },
      stringify(item, ctx, onComment, onChompKeep) {
        const indent = ctx.indent || '  ' // Default to 2 spaces if not set
        const originalItem = item.value && item.value['Fn::Join']
        console.log('originalItem', originalItem)
        // console.log('ctx.foobar', item)
        // process.exit(0)

        /*
        deepLog('JOIN item', item)
        /** */
        const values = resolveValue(item.value)
        /*
        deepLog('values', values)
        /** */
        const test = values.reduce(
          (acc, v, i) => {
            // console.log('v', `${v}`)
            if (i === 0) {
              acc.delimiter = v.replace(/^- /, '')
            } else {
              acc.items = acc.items.concat(parseArrayByDashes(v))
            }
            return acc
          },
          {
            delimiter: '',
            items: [],
          },
        )

        const totalLength = values.reduce((acc, v) => acc + v.length, 0)

        console.log('test', test)
        /* If !Join has sub arrays, then return the original array */
        if (test.items && test.items.some((v) => Array.isArray(v))) {
          return returnOriginalArray(values, indent)
        }

        if (test.items && totalLength < 120) {
          const lastItemHasNewLine = originalItem[originalItem.length - 1].includes('\n')
          // console.log('lastItemHasNewLine',  `"${values[values.length - 1]}"`)
          // process.exit(0)
          console.log('test.items', test.items)
          const addNewLine = lastItemHasNewLine ? originalItem[originalItem.length - 1] : ''
          const isWrappedInBrackets = test.items.some((v) => v.startsWith('[') && v.endsWith(']'))
          const joinItems = isWrappedInBrackets ? test.items.join(', ') : `[${test.items.filter(Boolean).join(', ')}]`
          console.log('addNewLine', addNewLine)
          return `[ ${test.delimiter}, ${joinItems} ]${addNewLine}`
        }

        return returnOriginalArray(values, indent)
      },
    },

    {
      identify: (value) => value && value['Fn::Cidr'],
      tag: '!Cidr',
      resolve(doc, cst) {
        // deepLog('Cidr cst', cst)
        //process.exit(0)
        if (cst.type === 'SEQ') {
          return {
            'Fn::Cidr': getRawArrayLines(cst),
          }
        }
        return { 'Fn::Cidr': cst.strValue }
      },
      stringify(item, ctx, onComment, onChompKeep) {
        const value = item.value['Fn::Cidr']
        if (Array.isArray(value)) {
          const items = value.map((v) => {
            if (v && v.Ref) {
              return `- !Ref ${v.Ref}`
            }
            return `${v}`
          })
          return `\n${ctx.indent}${items.join('\n' + ctx.indent)}`
        }
        return yaml.stringify(value)
      },
    },
    // {
    //   identify: value => value && value['Fn::Condition'],
    //   tag: '!Condition',
    //   resolve(doc, cst) {
    //     return { 'Fn::Condition': cst.strValue }
    //   },
    //   stringify(item, ctx, onComment, onChompKeep) {
    //     return item.value['Fn::Condition']
    //   }
    // },
    // {
    //   identify: value => value && value['Fn::GetAZs'],
    //   tag: '!GetAZs',
    //   resolve(doc, cst) {
    //     return { 'Fn::GetAZs': cst.strValue }
    //   },
    //   stringify(item, ctx, onComment, onChompKeep) {
    //     return item.value['Fn::GetAZs']
    //   }
    // },
  ]
  return cfnTags
}

function getTextFromRange(text, cst) {
  const lines = text.split('\n')
  const result = []
  const range = {
    start: Object.assign({}, cst.rangeAsLinePos.start, { line: cst.rangeAsLinePos.start.line + 1 }),
    end: Object.assign({}, cst.rangeAsLinePos.end, { line: cst.rangeAsLinePos.end.line + 1 })
  }
  let firstLineWithValue
  for (let i = range.start.line - 1; i < range.end.line - 1; i++) {
    result.push(lines[i])
    // if line has char, then set firstLineWithValue only once
    if (!firstLineWithValue && lines[i].trim()) {
      firstLineWithValue = lines[i]
    }
  }

  const match = firstLineWithValue.match(/^(\s+)/)
  const indentLength = match ? match[1].length : 0
  const key = (firstLineWithValue.match(/^\s*([a-zA-Z]+):/) || [])[1]
  const indent = match ? match[1] : ''

  return {
    tag: cst.tag ? cst.tag.handle + cst.tag.suffix : '',
    key,
    text: result.join('\n'),
    value: getStringSlice(text, cst.range.start, cst.range.end) || '',
    indent,
    indentLength,
    valueAfterTag: cst.rawValue || cst.strValue,
    trailingNewlines: checkYamlKeySpacing(text, key, indent)
  }
}

function findTrailingNewslines(originalString, cst) {
  let trailingNewLines = ''
  const originalValue = (getStringSlice(originalString, cst.range.start, cst.range.end) || '').trim()
  // console.log('originalValue', originalValue)

  const findKeyPattern = new RegExp(`^([a-zA-Z]+):\\s*${escapeStringRegexp(originalValue)}`, 'm')
  console.log('findKeyPattern', findKeyPattern)
  const findKey = originalString.match(findKeyPattern)
  let key = null
  if (findKey) {
    key = findKey[1]
    // console.log('key', key)
    const findTrailingNewlines = checkYamlKeySpacing(originalString, key)
    if (findTrailingNewlines) {
      trailingNewLines = findTrailingNewlines
      // console.log('trailingNewLines', trailingNewLines)
      // process.exit(0)
    }
  }
  return {
    trailingNewLines,
    key,
    originalValue,
  }
}

/**
 * Check if string is a CloudFormation intrinsic function
 * @param {string} str String to check
 * @returns {boolean} True if string is an intrinsic function
 */
function isIntrinsicFn(str) {
  if (!str || typeof str !== 'string') return false

  // List of CloudFormation intrinsic functions
  const intrinsicFns = [
    '!Ref',
    '!Sub',
    '!GetAtt',
    '!Join',
    '!Select',
    '!Split',
    '!FindInMap',
    '!GetAZs',
    '!ImportValue',
    '!Condition',
    '!Equals',
    '!And',
    '!Or',
    '!Not',
    '!If',
    '!Base64',
    '!Cidr',
  ]

  // Check if string starts with any of the intrinsic functions
  return intrinsicFns.some((fn) => str.trim().startsWith(fn))
}

function getRawArrayLines(cst, hasTrailingNewline) {
  return cst.items.map((item, i) => {
    const isLastItem = i === cst.items.length - 1
    // if (item.type === 'FLOW_SEQ') {
    //   return item.items.map(item => item.value)
    // }
    if (hasTrailingNewline && isLastItem) {
      return item.rawValue + '\n'
    }

    if (typeof hasTrailingNewline !== 'undefined' && hasTrailingNewline === false) {
      return item.rawValue
    }

    // If last item and cst.includesTrailingLines is true, then add a trailing line
    if (i === cst.items.length - 1 && cst.includesTrailingLines) {
      return item.rawValue + hasTrailingNewline
    }

    return item.rawValue
  })
}

function resolveValue(item, insideAnotherIntrinsicFn = false) {
  /*
  deepLog('resolveValue input', item)
  /** */
  if (!item) return item

  let intrinsicFn = null
  if (typeof item === 'object') {
    intrinsicFn = Object.keys(item).find((key) => key.startsWith('Fn::') || key === 'Ref' || key === 'Condition')
  }

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

  if (typeof item === 'string') {
    return item
  }

  if (typeof item[intrinsicFn] === 'object') {
    return resolveValue(item[intrinsicFn], true)
  }

  /*
  deepLog('item[intrinsicFn]', item[intrinsicFn])
  /** */

  const newLine = ''
  switch (intrinsicFn) {
    case 'Ref':
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

function quotify(v = '') {
  if (v.includes('!')) {
    return v
  }
  return !v.match(/^['"]/) && !v.match(/['"]$/) ? `'${v}'` : v
}

function checkYamlKeySpacing(yaml, key, indent = '') {
  const pattern = new RegExp(`^${indent}(${key}):\\s*(.*\\n(?:(?!${key}:)[\\s\\S])*?)(\\n{2,})`, 'm')
  console.log('checkYamlKeySpacing', pattern)
  const hasMatch = yaml.match(pattern)
  // console.log('hasMatch', hasMatch)
  if (hasMatch) {
    // newline count
    const newlineCount = hasMatch[3].split('\n').length - 1
    // console.log('newlineCount', newlineCount)
    return hasMatch[3].replace('\n', '')
  }
  return ''
}

function isQuote(item) {
  return item.type === 'QUOTE_SINGLE' || item.type === 'QUOTE_DOUBLE'
}

function escapeStringRegexp(string) {
  if (typeof string !== 'string') {
    throw new TypeError('Expected a string')
  }

  // Escape characters with special meaning either inside or outside character sets.
  // Use a simple backslash escape when it's always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns' stricter grammar.
  return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

function returnOriginalArray(values, indent) {
  return '\n' + values.map((v) => `${indent}${v}`).join('\n')
}

function getStringSlice(str, start, end) {
  return str.slice(start, end)
}


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

module.exports = {
  getTags,
  isIntrinsicFn
}
