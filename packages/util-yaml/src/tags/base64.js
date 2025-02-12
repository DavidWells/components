const {
  getStringSlice,
  escapeStringRegexp,
  enhanceResolverResult,
  hasNewlineOutsideQuotes,
  getTextFromRange,
} = require('./_utils')

/*

!Join Tag Docs:

If parser encounters a FN::Base64 tag, it will skip the resolver function and go right to stringify.

Inside stringify it will receive an array with two items:

```
{
  value: {
    'Fn::Base64': '#!/bin/bash\necho "VPC_ID=${VpcId}"\necho "Region=${AWS::Region}"\n'
  }
}
```



*/

function getBase64Tag(originalString) {
  const Base64Tag = {
    identify: (value) => value && value['Fn::Base64'],
    tag: '!Base64',
    resolve(doc, cst) {
      // deepLog('BASE64 cst', cst)
      // debugApi('BASE64', cst)
      const originalValue = (getStringSlice(originalString, cst.range.start, cst.range.end) || '').trim()
      const YAMLBlock = getTextFromRange(originalString, cst)
      /*
      console.log('YAMLBlock', YAMLBlock)
      // process.exit(1)
      /** */

      const payload = {
        cst: cst,
        originalValue: originalValue,
        valueIsSingleLine: !hasNewlineOutsideQuotes(originalValue),
        YAMLBlock,
        fromResolver: true,
      }

      if (YAMLBlock.trailingNewlines) {
        const returnValue = {
          'Fn::Base64': cst.rawValue.replace(/\n+$/, '') + YAMLBlock.trailingNewlines,
        }
        return enhanceResolverResult(returnValue, payload)
      }

      return enhanceResolverResult({ 'Fn::Base64': cst.rawValue.replace(/\n+$/, '') }, payload)
    },
    stringify(item, ctx, onComment, onChompKeep) {
      console.log('Base64 item', item)
      const value = item.value['Fn::Base64']
      const options = item.value._internals || {}
      console.log('Custom options', item.value._internals)
      console.log('value', value)

      if (options.valueIsSingleLine) {
        return `${value}`
      }

      console.log('options.YAMLBlock', options.YAMLBlock)

      if (typeof value === 'string' && options.fromResolver && value.includes('\n')) {
        const sep = options.YAMLBlock.multilineDetails.matchText || ''
        const content = options.YAMLBlock.multilineDetails.content.replace(/^\n/, ``) || value
        console.log('content', content)
        return `${sep}\n${content}${options.YAMLBlock.trailingNewlines.replace(/\n$/, '')}`
      }

      /* Handle Fn::Base64 syntax */
      if (typeof value === 'string' && value.includes('\n') && !value.includes(ctx.indent)) {
        const lines = value.split('\n')
        const indentedLines = lines.map((line) => `${ctx.indent}${line}`).join('\n')
        return `|\n${indentedLines}`
      }


      console.log('Base64 value', value)
      // return stringifyString({ value }, ctx, onComment, onChompKeep)
      if (typeof value === 'string' && value.includes('\n')) {
        return `|\n${value}`
      }

      return value
    },
  }
  return Base64Tag
}

module.exports = {
  getBase64Tag,
}
