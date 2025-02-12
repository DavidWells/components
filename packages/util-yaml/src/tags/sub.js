const { stringifyString } = require('yaml/util')
const { resolveValue, enhanceResolverResult, stringifyOriginalNew, getTextFromRange } = require('./_utils')
const { resolveValue: resolveValueUtil } = require('../utils/resolve')
const { deepLog } = require('../utils/logger')

/*

Input
[
  '#!/bin/bash\necho "VPC_ID=${VpcId}"\necho "Region=${AWS::Region}"\n',
  { VpcId: { 'Fn::Ref': 'MyVPC' } }
]

*/


function getSubTag(originalString) {
  const SubTag = {
    identify: (value) => value && value['Fn::Sub'],
    tag: '!Sub',
    resolve(doc, cst) {
      console.log('cst.strValue', cst.strValue)

      const YAMLBlock = getTextFromRange(originalString, cst)
      // deepLog('ORIGINAL YAML BLOCK', originalYAMLBlock)
      // process.exit(0)

      return enhanceResolverResult({ 'Fn::Sub': cst.rawValue }, {
        cst,
        fromResolver: true,
        YAMLBlock
      })
    },
    stringify(item, ctx, onComment, onChompKeep) {
      const indent = ctx.indent || '  ' // Default to 2 spaces if not set
      const value = item.value['Fn::Sub']
      const options = item.value._internals || {}
      console.log('Custom options', item.value._internals)
      console.log('value', value)

      const resolvedValue = resolveValueUtil(value, options)
      const isString = typeof resolvedValue === 'string'
      console.log('resolvedValue', resolvedValue)
      console.log(`typeof resolvedValue`, typeof resolvedValue)


      /* If original item is from FN:JOIN, then return the original array */
      if (Array.isArray(resolvedValue)) {
        const x = stringifyOriginalNew(resolvedValue, indent)
        console.log('stringifyOriginalNew', x)
        // process.exit(0)
        return x
      }

      if (isString && options.fromResolver && !resolvedValue.includes('\n')) {
        return `${value}`
      }

      if (options.valueIsSingleLine) {
        return `${value}`
      }

      if (isString && options.fromResolver && resolvedValue.includes('\n')) {
        const sep = options.YAMLBlock.multilineDetails.matchText || ''
        const content = options.YAMLBlock.multilineDetails.content.replace(/^\n/, ``) || value
        return `${sep}\n${content}`
      }

      if (isString && resolvedValue.includes('\n')) {
        return `\n${indent}${value}`
      }

      return stringifyString({ value: item.value['Fn::Sub'] }, ctx, onComment, onChompKeep)
    },
  }
  return SubTag
}

module.exports = {
  getSubTag,
}
