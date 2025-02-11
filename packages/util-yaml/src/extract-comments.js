const yaml = require('yaml')
const { YAMLMap, YAMLSeq, Scalar } = require('yaml/types')

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

const MATCH_LEADING_COMMENTS = /^([ \t]*#.*(?:\r?\n|\r|$)|[ \t]*(?:\r?\n|\r|$))*/

function getOpeningComments(yaml) {
  return yaml.match(/^((?:#.*|[ \t]*)(?:\r?\n|\r|$))+/)
  return yaml.match(/^([ \t]*#.*(?:\r?\n|\r|$)|[ \t]*(?:\r?\n|\r|$))*/)
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

module.exports = {
  extractYamlComments,
}
