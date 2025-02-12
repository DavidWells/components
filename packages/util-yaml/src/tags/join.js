const { deepLog, debugApi } = require('../utils/logger')
const {
  getTextFromRange,
  getStringSlice,
  checkYamlKeySpacing,
  resolveValue,
  stringifyOriginal,
  escapeStringRegexp,
  parseArrayByDashes,
  returnOriginalArray,
  stringifyOriginalNew,
  enhanceResolverResult,
} = require('./_utils')
const { resolveValue: resolveValueUtil } = require('../utils/resolve')
const { stringifyString } = require('yaml/util')

/*

!Join Tag Docs:

If parser encounters a FN::Join tag, it will skip the resolver function and go right to stringify.

Inside stringify it will receive an array with two items:

```
[
  '', // The first item is the join delimiter.
  [   // The second item is the array of items to join.
    'arn:aws:states:',
    { Ref: 'AWS::Region' },
    ':',
    { Ref: 'AWS::AccountId' },
    ':stateMachine:*'
  ]
]
```

For example,

```
SimpleTwo:
  Fn::Join:
    - 'y'
    - ['a', 'b', 'c']

# or

# Style 2 (using nested hyphens)
Fn::Join:
  - 'y'
  - - 'x'
    - 'z'
```


Resolves to
```
{
  value: { 'Fn::Join': [ 'y', [ 'a', 'b', 'c' ] ] }
}
``

---

If parser encounters a !Join tag, it will run the resolver function and then the stringify function.

The resolver function is our custom logic to return a value to later stringify back into YAML.

*/

function getJoinTag(originalString) {
  const JoinTag = {
    identify: (value, key, tag) => {
      return value && value['Fn::Join']
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
    // Resolver only runs when it finds a !Join tag. It does not run for Fn::Join
    resolve(doc, cst) {
      // return cst.items
      deepLog('JOIN cst', cst)
      // debugApi('JOIN', cst)

      const YAMLBlock = getTextFromRange(originalString, cst)
      // deepLog('ORIGINAL YAML BLOCK', originalYAMLBlock)
      // process.exit(0)

      return enhanceResolverResult({ 'Fn::Join': cst.rawValue }, {
        cst,
        fromResolver: true,
        YAMLBlock
      })

      const originalYAMLBlock = getTextFromRange(originalString, cst)
      deepLog('Join originalYAMLBlock', originalYAMLBlock)

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

      /* Handle !Join with no items */
      if (!cst.items) {
        return {
          'Fn::Join': '',
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

      console.log('JOIN result', result)
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
      console.log('ctx.foobar', item)
      debugApi('JOIN ITEM in stringify', item)
      // process.exit(0)

      /* If original item is from FN:JOIN, then return the original array */
      if (originalItem.length === 2 && Array.isArray(originalItem[1])) {
        const x = stringifyOriginalNew(originalItem, indent, item.toString())
        // console.log('stringifyOriginalNew', x)
        // process.exit(0)
        return x
      }

      /*
    deepLog('JOIN item', item)
    /** */
      const values = resolveValue(item.value)
      //*
      deepLog('Join values', values)
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
  }

  return JoinTag
}

module.exports = {
  getJoinTag,
}
