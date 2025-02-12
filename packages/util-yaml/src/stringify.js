const yaml = require('yaml')
const { YAMLMap, YAMLSeq, Scalar } = require('yaml/types')
const { deepLog } = require('./utils/logger')
const { getTags, isIntrinsicFn } = require('./tags/index')
const { extractYamlComments } = require('./extract-comments')
const { ALL_TAGS_OR_REGEX_PATTERN } = require('./tags/_constants')

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

  return fixYamlOutput(finalStr, {
    quoteType: quoteType,
  })
}

const FIX_SINGLE_QUOTE_PATTERN = /^(\s*- )'(.*)':$/gm
const FIX_DOUBLE_QUOTE_PATTERN = /^(\s*- )"(.*)":$/gm
/* Fix all trailing empty spaces on intrinsic function Defs */
const FIX_TRAILING_EMPTY_SPACES = new RegExp(`!(${ALL_TAGS_OR_REGEX_PATTERN})([ \t]*)$`, 'gm')

function fixYamlOutput(yamlString, opts) {
  const { quoteType } = opts

  // Intrinsic functions that are multiline should not have trailing spaces
  yamlString = yamlString.replace(FIX_TRAILING_EMPTY_SPACES, '!$1')
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

module.exports = {
  stringify,
  extractYamlComments,
  isIntrinsicFn,
}
