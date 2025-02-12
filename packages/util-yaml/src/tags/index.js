const { stringifyString } = require('yaml/util')
const { deepLog, debugApi } = require('../utils/logger')
const { getJoinTag } = require('./join')
const { getBase64Tag } = require('./base64')
const { getSubTag } = require('./sub')
const {
  getTextFromRange,
  getStringSlice,
  checkYamlKeySpacing,
  resolveValue,
  escapeStringRegexp,
  enhanceResolverResult,
} = require('./_utils')

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
        // console.log('Ref item', item)
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
        // console.log('Condition item', item)
        return stringifyString({ value: item.value['Fn::Condition'] }, ctx, onComment, onChompKeep)
      },
    },
    // Handle !Sub
    getSubTag(originalString),
    // Handle !GetAZs
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
    getBase64Tag(originalString),
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

        // const details = findTrailingNewslines(originalString, cst)

        // deepLog('OR details', details)

        // if (originalYAMLBlock.key === 'NICEEEEEEEEEEEEEEEE') {
        //   process.exit(0)
        // }

        // check if originalValue has a trailing newline
        const hasTrailingNewline = originalValueBlock.match(/\s*\n\s*$/)
        deepLog('OR hasTrailingNewline', hasTrailingNewline)
        const result = getRawArrayLines(cst, originalYAMLBlock.trailingNewlines)

        deepLog('OR resolve result', result)
        // return { 'Fn::Or': result }
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
    getJoinTag(originalString),
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


function getRawArrayLines(cst, hasTrailingNewline = '') {
  return cst.items.map((item, i) => {
    const isLastItem = i === cst.items.length - 1
    // if (item.type === 'FLOW_SEQ') {
    //   return item.items.map(item => item.value)
    // }
    if (isLastItem && hasTrailingNewline) {
      return item.rawValue + hasTrailingNewline
    }

    if (typeof hasTrailingNewline !== 'undefined' && hasTrailingNewline === '') {
      return item.rawValue
    }

    // If last item and cst.includesTrailingLines is true, then add a trailing line
    if (i === cst.items.length - 1 && cst.includesTrailingLines) {
      return item.rawValue + hasTrailingNewline
    }

    return item.rawValue
  })
}

function quotify(v = '') {
  if (v.includes('!')) {
    return v
  }
  return !v.match(/^['"]/) && !v.match(/['"]$/) ? `'${v}'` : v
}

function isQuote(item) {
  return item.type === 'QUOTE_SINGLE' || item.type === 'QUOTE_DOUBLE'
}

module.exports = {
  getTags,
  isIntrinsicFn
}
