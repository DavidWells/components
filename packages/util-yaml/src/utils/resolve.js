const { ALL_TAGS_OR_REGEX_PATTERN } = require('../tags/_constants')
const { cleanValue } = require('../tags/_clean-value')

/**
 * Deeply resolves CloudFormation intrinsic functions in objects and arrays
 * @param {*} value - Value to resolve
 * @param {Object} options - Options for resolution
 * @param {boolean} options.insideAnotherIntrinsicFn - Whether we're inside another intrinsic function
 * @returns {*} Resolved value
 */
function resolveValue(value, options = {}) {
  // Handle null/undefined
  if (!value) return value

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => resolveValue(item, options))
  }

  // Handle objects
  if (typeof value === 'object') {
    // Find CloudFormation intrinsic function key
    const fnKey = Object.keys(value).find(key =>
      key === 'Ref' || key.startsWith('Fn::')
    )

    if (fnKey) {
      const fnValue = value[fnKey]

      // Handle nested objects/arrays inside the function
      const resolvedFnValue = resolveValue(fnValue, {
        ...options,
        insideAnotherIntrinsicFn: true
      })

      // Convert to short form
      switch (fnKey) {
        case 'Ref':
          return cleanValue(`!Ref ${resolvedFnValue}`)
        case 'Fn::Sub': {
          if (Array.isArray(resolvedFnValue)) {
            const [template, variables] = resolvedFnValue
            // Handle variables object
            const resolvedVars = Object.entries(variables).reduce((acc, [key, val]) => {
              acc[key] = resolveValue(val, options)
              return acc
            }, {})
            return ['!Sub', template, resolvedVars]
          }
          return cleanValue(`!Sub ${resolvedFnValue}`)
        }
        case 'Fn::Join': {
          if (Array.isArray(resolvedFnValue)) {
            const [delimiter, items] = resolvedFnValue
            const formattedItems = items.map(item => {
              if (typeof item === 'string' && !item.startsWith('!')) {
                return JSON.stringify(item)
              }
              return resolveValue(item, options)
            })
            return cleanValue(`!Join [${JSON.stringify(delimiter)}, [${formattedItems.join(',')}]]`)
          }
          return cleanValue(`!Join ${resolvedFnValue}`)
        }
        default: {
          const tagName = fnKey.replace('Fn::', '')
          if (Array.isArray(resolvedFnValue)) {
            const formattedArray = resolvedFnValue.map(item => {
              if (typeof item === 'string' && !item.startsWith('!')) {
                return JSON.stringify(item)
              }
              return resolveValue(item, options)
            })
            return cleanValue(`!${tagName} [${formattedArray.join(', ')}]`)
          }
          return cleanValue(`!${tagName} ${resolvedFnValue}`)
        }
      }
    }

    // Recursively resolve object values
    return Object.entries(value).reduce((acc, [key, val]) => {
      acc[key] = resolveValue(val, options)
      return acc
    }, {})
  }

  // Return primitives as-is
  return cleanValue(value)
}

/**
 * Check if a value contains any CloudFormation intrinsic functions
 */
function hasIntrinsicFn(value) {
  if (!value) return false

  const pattern = new RegExp(`(Ref|Fn::(${ALL_TAGS_OR_REGEX_PATTERN}))`)
  const str = JSON.stringify(value)
  return pattern.test(str)
}

module.exports = {
  resolveValue,
  hasIntrinsicFn
}
