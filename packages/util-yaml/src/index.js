const yaml = require('yaml')
const { YAMLMap, YAMLSeq, Scalar } = require('yaml/types')
const { stringifyString } = require('yaml/util')
const util = require('util')

let DEBUG = process.argv.includes('--debug') ? true : false
// DEBUG = true
// JSON = true
const logger = DEBUG ? deepLog : () => {}

function logValue(value, isFirst, isLast) {
  const prefix = `${isFirst ? '> ' : ''}`
  if (typeof value === 'object') {
    console.log(`${util.inspect(value, false, null, true)}\n`)
    return
  }
  if (isFirst) {
    console.log(`\n\x1b[33m${prefix}${value}\x1b[0m`)
    return
  }
  console.log(typeof value === 'string' && value.includes('\n') ? `\`${value}\`` : value)
  // isLast && console.log(`\x1b[37m\x1b[1m${'─'.repeat(94)}\x1b[0m\n`)
}

function deepLog() {
  for (let i = 0; i < arguments.length; i++) logValue(arguments[i], i === 0, i === arguments.length - 1)
}

const isGetter = (x, name) => (Object.getOwnPropertyDescriptor(x, name) || {}).get
const isFunction = (x, name) => typeof x[name] === 'function'
const deepFunctions = (x) =>
  x &&
  x !== Object.prototype &&
  Object.getOwnPropertyNames(x)
    .filter((name) => isGetter(x, name) || isFunction(x, name))
    .concat(deepFunctions(Object.getPrototypeOf(x)) || [])
const distinctDeepFunctions = (x) => Array.from(new Set(deepFunctions(x)))
const getMethods = (obj) => distinctDeepFunctions(obj).filter((name) => name !== 'constructor' && !~name.indexOf('__'))

function isQuote(item) {
  return item.type === 'QUOTE_SINGLE' || item.type === 'QUOTE_DOUBLE'
}

function debugApi(label, item) {
  console.log('──────DEBUG─────────────────────────')
  const itemMethods = getMethods(item)
  for (const method of itemMethods) {
    console.log(`${label} method ${method}`, item[method])
  }
  deepLog(label, item)
  console.log('──────DONE─────────────────────────')
}

function getRawArrayLines(cst) {
  return cst.items.map((item, i) => {
    // if (item.type === 'FLOW_SEQ') {
    //   return item.items.map(item => item.value)
    // }

    // If last item and cst.includesTrailingLines is true, then add a trailing line
    if (i === cst.items.length - 1 && cst.includesTrailingLines) {
      return item.rawValue + '\n'
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

function checkYamlKeySpacing(yaml, key) {
  const pattern = new RegExp(`^(${key}):\\s*(.*\\n(?:(?!${key}:)[\\s\\S])*?)(\\n{2,})`, 'm')
  return pattern.test(yaml)
}

function escapeStringRegexp(string) {
  if (typeof string !== 'string') {
    throw new TypeError('Expected a string')
  }

  // Escape characters with special meaning either inside or outside character sets.
  // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
  return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

function getTags(originalString) {
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
        const result = getRawArrayLines(cst)

        deepLog('OR result', result)
        return { 'Fn::Or': result }
      },
      // Stringify !Or
      stringify(item, ctx, onComment, onChompKeep) {
        const indent = ctx.indent || '  ' // Default to 2 spaces if not set
        const value = item.value && item.value['Fn::Or']
        const testValue = resolveValue(item.value)
        //*
        deepLog('OR value', value)
        deepLog('NEW OR VALUE', testValue)
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
        // deepLog('JOIN cst', cst)
        debugApi('JOIN', cst)

        const find = checkYamlKeySpacing(originalString, 'Command')

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

        console.log('result', result)
        // process.exit(0)
        return {
          'Fn::Join': result,
        }
      },
      stringify(item, ctx, onComment, onChompKeep) {
        const indent = ctx.indent || '  ' // Default to 2 spaces if not set
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
          const lastItemHasNewLine = values[values.length - 1].includes('\n')
          // console.log('lastItemHasNewLine', lastItemHasNewLine)
          // process.exit(0)
          const addNewLine = lastItemHasNewLine ? '\n' : ''
          return `[ ${test.delimiter}, [${test.items.filter(Boolean).join(', ')}] ]${addNewLine}`
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
function returnOriginalArray(values, indent) {
  return '\n' + values.map((v) => `${indent}${v}`).join('\n')
}

function getStringSlice(str, start, end) {
  return str.slice(start, end)
}

function parse(ymlString = '', opts = {}) {
  // Set custom tags globally
  yaml.defaultOptions.customTags = getTags(ymlString)
  return yaml.parse(ymlString.trim(), opts)
}

function stringify(
  object,
  {
    originalString = '',
    commentData,
    indent = 2,
    lineWidth = 120,
    singleQuoteStrings = false,
    doubleQuoteStrings = false,
    defaultForceQuoteType = 'QUOTE_DOUBLE', // 'PLAIN' / 'QUOTE_SINGLE' / 'QUOTE_DOUBLE'
  },
) {
  // Set custom tags globally
  yaml.defaultOptions.customTags = getTags(originalString)
  // Set the line width for string folding
  yaml.scalarOptions.str.fold.lineWidth = lineWidth

  const _commentData = commentData ? commentData : extractYamlComments(originalString.trim())
  deepLog('commentData', _commentData)
  const doc = new yaml.Document({
    indent,
    version: '1.2',
  })

  const contents = yaml.createNode(object)

  /*
  const cleanItems = removeSchemaFromNodes(contents.items)
  deepLog('contents', cleanItems)
  /** */

  if (_commentData && _commentData.comments && _commentData.comments.length) {
    addComments(contents.items, _commentData.comments)
  }

  let quoteType = ''
  if (singleQuoteStrings) {
    quoteType = 'QUOTE_SINGLE'
  } else if (doubleQuoteStrings) {
    quoteType = 'QUOTE_DOUBLE'
  }

  /* Update string values */
  contents.items = quoteStringValues(contents.items, undefined, {
    defaultForceQuoteType: defaultForceQuoteType || quoteType || 'QUOTE_DOUBLE',
    quoteType,
  })

  doc.contents = contents

  const newDocString = doc.toString()
  const finalStr = (_commentData.opening || '') + newDocString.trim() + (_commentData.trailing || '')

  /*
  const cleanItems = removeSchemaFromNodes(contents.items)
  deepLog('contents', cleanItems)
  /** */

  return fixYaml(finalStr, {
    quoteType: quoteType,
  })
}

const FIX_SINGLE_QUOTE_PATTERN = /^(\s*- )'(.*)':$/gm
const FIX_DOUBLE_QUOTE_PATTERN = /^(\s*- )"(.*)":$/gm
const FIX_TRAILING_EMPTY_SPACES = /(!Or|!Join|!Cidr)([ \t]*)$/gm

function fixYaml(yamlString, opts) {
  const { quoteType } = opts

  // Intrinsic functions that are multiline should not have trailing spaces
  yamlString = yamlString.replace(FIX_TRAILING_EMPTY_SPACES, '$1')
  // Fix colliding multiline comments https://regex101.com/r/1EIWQd/1
  yamlString = yamlString.replace(/#FIXME(!([A-Za-z0-9_-]*))\s*(#.*)((\n\s*)!\2\s*)/gm, '$1 $3$5')

  let pattern
  if (!quoteType) {
    pattern = FIX_DOUBLE_QUOTE_PATTERN
  }
  if (quoteType === 'QUOTE_SINGLE') {
    return yamlString.replace(FIX_DOUBLE_QUOTE_PATTERN, `$1'$2':`)
  }
  if (!pattern) return yamlString
  return yamlString.replace(pattern, '$1$2:')
}

function isDate(value) {
  return value && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)
}

function chooseQuoteType(value, opts) {
  const { defaultForceQuoteType, quoteType } = opts
  const dateQuoteType = quoteType !== 'PLAIN' ? quoteType : defaultForceQuoteType
  if (isDate(value)) {
    return quoteType || defaultForceQuoteType
  }
  return isDate(value) ? dateQuoteType : quoteType
}

function quoteStringValues(items, parentNode = {}, opts) {
  if (!items) return items

  return items.map((item) => {
    /*
    console.log('───────────────────────────────')
    console.log('item', item)
    console.log('parentNode', parentNode)
    /** */

    /* Quote array values */
    if (
      item.value &&
      typeof item.value === 'string'
      // && Object.keys(item).length === 1
    ) {
      // item.key.type = 'PLAIN'
      const quoteType = chooseQuoteType(item.value, opts)
      const isInArray = parentNode && parentNode.value instanceof YAMLSeq

      if (isInArray && !quoteType) {
        return item
      }
      if (quoteType) {
        item.type = quoteType
      }
      return item
    }

    // console.log('item', item)
    if (item.key && typeof item.key.value === 'string' && item.value && item.value instanceof YAMLMap) {
      const parentIsMap = parentNode && parentNode.value && parentNode.value instanceof YAMLMap
      const parentIsSeq = parentNode && parentNode.value && parentNode.value instanceof YAMLSeq
      const hasMapAsValue = item.value && item.value instanceof YAMLMap
      /*
      console.log('───────────────────────────────')
      console.log('parentNode', parentNode)
      console.log('item', item)
      console.log('parentIsMap', parentIsMap)
      console.log('parentIsSeq', parentIsSeq)
      /** */

      const quoteType = chooseQuoteType(item.value, opts)
      // console.log('quoteType', quoteType)
      if (quoteType && !parentIsMap && !hasMapAsValue) {
        item.key.type = quoteType
      }

      item.value.items = quoteStringValues(item.value.items, item, opts)
      // process.exit(1)
      return item
    }
    // Handle scalar values directly
    if (item.type === 'SCALAR' && typeof item.value === 'string') {
      const quoteType = chooseQuoteType(item.value, opts)
      if (quoteType) {
        item.type = quoteType
      }
      return item
    }
    // Handle pair values
    if (item.type === 'PAIR') {
      // If value is a scalar with string value, quote it
      if (item.value && item.value.value && typeof item.value.value === 'string') {
        const quoteType = chooseQuoteType(item.value.value, opts)
        if (quoteType) {
          item.value.type = quoteType
        }
      }
      // If value is a YAMLMap or YAMLSeq, process its items
      if (item.value && item.value.items) {
        item.value.items = quoteStringValues(item.value.items, item, opts)
      }
    }

    // Process nested items
    if (item.items) {
      item.items = quoteStringValues(item.items, item, opts)
    }

    return item
  })
}

const MATCH_LEADING_COMMENTS = /^([ \t]*#.*(?:\r?\n|\r|$)|[ \t]*(?:\r?\n|\r|$))*/

function getOpeningComments(yaml) {
  return yaml.match(/^((?:#.*|[ \t]*)(?:\r?\n|\r|$))+/)
  return yaml.match(/^([ \t]*#.*(?:\r?\n|\r|$)|[ \t]*(?:\r?\n|\r|$))*/)
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

/**
 * Parse YAML document and return all comments found.
 * @param {string} yamlDocument - YAML document to parse.
 * @returns {Array} - Array of comments found.
 */
function extractYamlComments(yamlDocument) {
  /*
  deepLog('doc', doc)
  /** */
  let opening = ''
  let cleanMatch = ''
  let openingCommentsSeparatedByNewline = false
  const openingComments = yamlDocument.match(/^((?:#.*|[ \t]*)(?:\r?\n|\r|$))+/)
  if (openingComments) {
    cleanMatch = openingComments[1].replace(/^#/, '')
    openingCommentsSeparatedByNewline = cleanMatch.trim() === ''
    // console.log('cleanMatch', `"${cleanMatch}"`)
    /* remove leading # from each line */
    opening = openingComments[0]
      .split('\n')
      .map((line) => line.replace(/^#/, ''))
      .join('\n')
    // console.log('opening', opening)
    // process.exit(1)
  }

  const doc = yaml.parseDocument(yamlDocument)
  /*
  deepLog('doc', doc);
  // process.exit(1)
  // commentBefore
  /** */
  const comments = []

  // Function to recursively search for comments
  function searchForComments(node, path = '', isArray) {
    let itemsToIterate
    if (node && node.contents && node.contents.items) {
      itemsToIterate = node.contents.items
    } else if (node && node.items) {
      itemsToIterate = node.items
    } else {
      itemsToIterate = node
    }
    if (itemsToIterate && itemsToIterate.length) {
      // console.log('itemsToIterate', itemsToIterate)

      for (let index = 0; index < itemsToIterate.length; index++) {
        const item = itemsToIterate[index]
        // console.log('item', item)
        const key = item.key
        const value = item.value || {}
        const keyVal = item.key && item.key.value ? `.${item.key.value}` : ''
        let numPrefix = ''
        // console.log('───────────────────────────────')
        // console.log('isArray', isArray)
        // console.log('item', item)
        if (
          isArray
          // && (item.type === 'MAP' || item.type))
        ) {
          numPrefix = `[${index}]`
        }
        const keyPath = path ? `${path}${numPrefix}${keyVal}` : item.key.value
        // console.log('key', key)

        if (item.commentBefore) {
          const isFirstItem = index === 0
          if (isFirstItem) {
            // console.log('item.commentBefore', item.commentBefore)
            // console.log("cleanMatch", cleanMatch)
            if (!openingCommentsSeparatedByNewline) {
              const remainder = item.commentBefore.replace(cleanMatch, '')
              // console.log('remainder', remainder)
              item.commentBefore = item.commentBefore.replace(remainder, '')
              if (!item.commentBefore && cleanMatch) {
                item.commentBefore = cleanMatch.replace(/\n$/g, '')
              }
              // console.log('after item.commentBefore', item.commentBefore)
              // // console.log('match', match)
              // console.log('before opening', opening)
              opening = removeCommentLine(opening, cleanMatch)
            }
            //opening = `${opening.replace(cleanMatch, '')}`
            // console.log('opening', `"${opening}"`)
            // console.log('doubleNewlinesInString', doubleNewlinesInString)
            // // prefix all opening lines that have values with a #. Exclude empty lines
            opening = opening
              .split('\n')
              .map((line) => (line.trim() ? `#${line}` : line))
              .join('\n')
            // console.log('opening', `"${opening}"`)
            // process.exit(1)
          }

          const val = {
            key: keyPath,
            commentBefore: item.commentBefore,
            via: 'item.commentBefore',
          }
          if (isArray) {
            // val.isArray = true
            val.index = index
          }
          comments.push(val)
          // continue;
        }

        // console.log(`value "${keyPath}" ${index}`, value.items)
        if (value && value.commentBefore) {
          // console.log('value.commentBefore', value)
          let keyFIX = ''
          if (value instanceof YAMLSeq) {
            /* Add comment above start of the array */
            keyFIX = `[0]`
          } else if (value instanceof YAMLMap) {
            keyFIX = `.${value.items[0].key.value}`
          }

          if (value.tag) {
            const val = {
              key: keyPath + keyFIX,
              comment: value.commentBefore,
              inValue: true,
              afterTag: true,
              inKey: item.type === 'PAIR',
              tag: value.tag,
              via: 'value.comment.tag',
            }
            comments.push(val)
          } else {
            comments.push({
              key: keyPath + keyFIX,
              commentBefore: value.commentBefore,
              value: value,
              tag: value.tag,
              via: 'value.commentBefore',
              // isArray
            })
          }
        }
        if (value && value.comment) {
          comments.push({
            key: keyPath,
            inValue: true,
            comment: value.comment,
            inKey: value.type === 'PAIR',
            via: 'value.comment',
            // isArray,
          })
        }

        /* Get nested comments */
        // console.log('hit')
        if (value && value.items) {
          /*
          console.log('🟢 search nested', value.items)
          /** */
          // const typeOfItems = value.items.map(x => x.constructor.name)
          // const type = typeOfItems[0]
          // const isSame = typeOfItems.every((x, i, arr) => x === quoteType)
          // console.log(`isSame ${type}`, isSame)
          // searchForComments(value.items, keyPath, (isSame && type !== 'Pair') ? true : false);
          searchForComments(value.items, keyPath, value instanceof YAMLSeq)
        } else if (item && item.items) {
          /*
          console.log('🔴 search nested item', item.items)
          /** */
          searchForComments(item.items, keyPath, false)
        }

        if (item.comment) {
          const val = {
            key: keyPath,
            comment: item.comment,
            inValue: true,
            inKey: item.type === 'PAIR',
            tag: item.tag,
            via: 'item.comment',
          }
          if (isArray) {
            // val.isArray = true
            val.index = index
          }
          comments.push(val)
          // continue;
        }
      }
    }
  }

  // Start searching for comments from the root
  searchForComments(doc)

  const trailing = findTrailingComments(yamlDocument)
  /*
  console.log('trailing', trailing)
  /** */

  return {
    comments,
    opening,
    trailing,
  }
}

function removeCommentLine(str, prefix) {
  const pat = new RegExp(`.*${prefix}.*\n*`, 'g')
  // console.log('pat', pat)
  return str.replace(pat, '')
}

const TRAILING_COMMENTS = /(\n#([^\n]+))*\n*$/
function findTrailingComments(yamlDocument = '', results = []) {
  const matches = yamlDocument.match(TRAILING_COMMENTS)
  if (matches && matches[0]) {
    const clean = yamlDocument.replace(TRAILING_COMMENTS, '')
    results.push(matches[0])
    return findTrailingComments(clean, results)
  }
  return results.reverse().join('')
}

function addComments(items, comments, prefix = '', isArray) {
  for (let index = 0; index < items.length; index++) {
    const item = items[index]
    const key = item.key ? item.key.value : ''
    /*
    console.log('key', key)
    /** */

    /*
    // If object like
    if (item instanceof YAMLMap) {
      console.log("MAP", item)
    // If array like
    } else if (item instanceof YAMLSeq) {
      console.log("SEQ",  item)
    }
    /** */

    // console.log('item', item)
    if ((item.type === 'PAIR' && item.value && item.value.items) || (item.items && item.items.length)) {
      const itemsToUse = item.value && item.value.items ? item.value.items : item.items
      const numPrefix = isArray ? `[${index}]` : ''
      const keyPostFix = key ? `.${key}` : ''
      const newPrefix = prefix ? `${prefix}${numPrefix}${keyPostFix}` : key
      // console.log('newPrefix', newPrefix)
      const matchingComments = matches(newPrefix, comments)
      // console.log('matchingCommentsParent', matchingComments)
      applyMatches(matchingComments, item)
      // console.log(`complex ${newPrefix}`, item)
      addComments(itemsToUse, comments, newPrefix, item.value instanceof YAMLSeq)
    } else {
      const numPrefix = isArray ? `[${index}]` : ''
      const keyPostFix = key ? `.${key}` : ''
      const newPrefix = prefix ? `${prefix}${keyPostFix}${numPrefix}` : key
      // console.log(`simple ${newPrefix}`, item)

      // const matchingCommentsParent = comments.filter((c) => c.key === prefix)
      // console.log('matchingCommentsParent', matchingCommentsParent)

      const matchingComments = matches(newPrefix, comments)
      // console.log('matchingComments', matchingComments)

      applyMatches(matchingComments, item)

      // matchingComments.forEach((comment) => {
      //   if (comment && comment.commentBefore) {
      //     // const value = comment.commentBefore.split('\\n').join('\n ');
      //     item.commentBefore = `${comment.commentBefore}`;
      //   }
      //   if (comment && comment.comment) {
      //     // console.log('item',item)
      //     // const value = comment.comment.split('\\n').join('\n ');
      //     //item.value.value = `${item.value.value} ${comment.comment}`;
      //     if (typeof item.value === 'string') {
      //       item.comment = `${comment.comment}`;
      //     } else {
      //       item.value.comment = `${comment.comment}`;
      //     }
      //     // console.log('new item', item)
      //   }
      // })
    }
  }
}

function matches(prefix, comments) {
  return comments.filter((c) => c.key === prefix)
}

function applyMatches(matchingComments, item) {
  /*
  deepLog('───────────────────────────────')
  deepLog('item', item)
  deepLog('new item', item)
  deepLog('──────DONE─────────────────────────')
  /** */
  matchingComments.forEach((comment) => {
    // console.log('comment', comment)
    if (comment && comment.commentBefore) {
      // const value = comment.commentBefore.split('\\n').join('\n ');
      item.commentBefore = `${comment.commentBefore}`
    }
    if (comment && comment.comment) {
      // const value = comment.comment.split('\\n').join('\n ');
      if (comment.afterTag) {
        item.comment = `FIXME${comment.tag} #${comment.comment}`
      } else if (comment.inKey) {
        item.comment = `${comment.comment}`
      } else if (typeof item.value === 'string') {
        item.comment = `${comment.comment}`
      } else {
        item.value.comment = `${comment.comment}`
      }
    }
  })
  /*
  console.log('new item', item)
  console.log('──────DONE─────────────────────────')
  ** */
}

function deepLog(objOrLabel, logVal) {
  let obj = objOrLabel
  if (typeof objOrLabel === 'string') {
    obj = logVal
    console.log(objOrLabel)
  }
  console.log(util.inspect(obj, false, null, true))
}

function getTopLevelKeys(yamlString = '') {
  const doc = yaml.parseDocument(yamlString)
  if (doc.contents && doc.contents.items.length > 0) {
    return doc.contents.items.map((item) => item.key.value)
  }
  return []
}

function removeSchemaFromNodes(items) {
  if (!items) return items

  return items.map((item) => {
    // Create a copy without schema
    const cleanItem = { ...item }
    delete cleanItem.schema

    // Clean key and value if they exist
    if (cleanItem.key && cleanItem.key.schema) {
      delete cleanItem.key.schema
    }
    if (cleanItem.value) {
      if (cleanItem.value.schema) {
        delete cleanItem.value.schema
      }
      // Recursively clean items in value
      if (cleanItem.value.items) {
        cleanItem.value.items = removeSchemaFromNodes(cleanItem.value.items)
      }
    }
    // Clean items in the item itself
    if (cleanItem.items) {
      cleanItem.items = removeSchemaFromNodes(cleanItem.items)
    }
    return cleanItem
  })
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

module.exports = {
  parse,
  stringify,
  extractYamlComments,
  getTopLevelKeys,
  isIntrinsicFn,
}
