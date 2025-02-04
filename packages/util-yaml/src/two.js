
const yaml = require('yaml');
const { YAMLMap, YAMLSeq, Pair } = require ('yaml')
// TODO upgrade to yaml 2+
// const { YAMLMap, YAMLSeq } = require ('yaml')
// const { YAMLMap, YAMLSeq } = require ('yaml/types')


// const comments = extractYamlComments(yamlDocumentx.trim());
/*
deepLog('comments', comments);
process.exit(1)
/** */

const util = require('util')

function deepLog(objOrLabel, logVal) {
  let obj = objOrLabel
  if (typeof objOrLabel === 'string') {
    obj = logVal
    console.log(objOrLabel)
  }
  console.log(util.inspect(obj, false, null, true))
}

function parse(ymlString = '', opts = {}) {
  return yaml.parse(ymlString.trim(), opts)
}

function stringify(object, {
  originalString = '',
  commentData,
}) {
  const _commentData = (commentData) ? commentData : extractYamlComments(originalString.trim())
  const doc1 = new yaml.Document()
  const contents = doc1.createNode(object);
  /*
  deepLog('thing', contents.items)
  process.exit(1)
  /** */
  /*
  deepLog('comments', _commentData)
  process.exit(1)
  /** */
  if(_commentData && _commentData.comments && _commentData.comments.length) {
    addComments(contents.items, _commentData.comments)
  }

  deepLog('contents', contents)
  process.exit(1)
  /** */
  const doc = new yaml.Document()
  doc.contents = contents
  const newDocString = doc.toString()
  // console.log('newDocString', newDocString)
  const finalStr = newDocString.trim() + (_commentData.trailing || '')
  // console.log('finalStr', finalStr)
  return finalStr
}

/**
 * Parse YAML document and return all comments found.
 * @param {string} yamlDocument - YAML document to parse.
 * @returns {Array} - Array of comments found.
 */
function extractYamlComments(yamlDocument) {
  const doc = yaml.parseDocument(yamlDocument);
  /*
  deepLog('doc', doc);
  process.exit(1)
  /** */
  const comments = [];

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
        const item = itemsToIterate[index];
        const key = item.key;
        const value = item.value || {};
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

        // console.log(`value "${keyPath}" ${index}`, value.items)
        if (value && value.commentBefore) {
          const keyFIX = (item.value instanceof YAMLMap && item.value.items) ? `.${item.value.items[0].key.value}` : ''
          comments.push({
            key: keyPath + keyFIX,
            commentBefore: value.commentBefore,
            // isArray
          })
        }
        if (value && value.comment) {
          console.log('value', item)
          comments.push({
            key: keyPath,
            inValue: true,
            comment: value.comment,
            inKey: item instanceof Pair || value.type === 'PAIR',
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
          // const isSame = typeOfItems.every((x, i, arr) => x === type)
          // console.log(`isSame ${type}`, isSame)
          // searchForComments(value.items, keyPath, (isSame && type !== 'Pair') ? true : false);
          searchForComments(value.items, keyPath, value instanceof YAMLSeq);
        } else if (item && item.items) {
          /*
          console.log('🔴 search nested item', item.items)
          /** */
          searchForComments(item.items, keyPath, false)
        }

        if (item.commentBefore) {
          const val = {
            key: keyPath,
            commentBefore: item.commentBefore,
          }
          if (isArray) {
            // val.isArray = true
            val.index = index
          }
          comments.push(val);
          // continue;
        }

        if (item.comment) {
          const val = {
            key: keyPath,
            comment: item.comment,
            inValue: true,
            inKey: item instanceof Pair || item.type === 'PAIR',
          }
          if (isArray) {
            // val.isArray = true
            val.index = index
          }
          comments.push(val);
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
    trailing
  };
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
    const item = items[index];
    const key = item.key ? item.key.value : '';
    //*
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
    console.log('item instanceof Pair', item instanceof Pair)
    // console.log('item', item)
    if (
      (item instanceof Pair) && item.value && item.value.items || (item.items && item.items.length)
    ) {
      const itemsToUse = (item.value && item.value.items) ? item.value.items : item.items
      console.log('itemsToUse', itemsToUse)
      const numPrefix = isArray ? `[${index}]` : '';
      const keyPostFix = key ? `.${key}` : '';
      const newPrefix = prefix ? `${prefix}${numPrefix}${keyPostFix}`: key;
      // console.log('newPrefix', newPrefix)
      const matchingComments = matches(newPrefix, comments)
      console.log('matchingComments', matchingComments)
      // console.log('matchingCommentsParent', matchingComments)
      applyMatches(matchingComments, item)
      // console.log(`complex ${newPrefix}`, item)
      addComments(itemsToUse, comments, newPrefix, item.value instanceof YAMLSeq);
    } else {
      const numPrefix = isArray ? `[${index}]` : '';
      const keyPostFix = key ? `.${key}` : '';
      const newPrefix = prefix ? `${prefix}${keyPostFix}${numPrefix}`: key;
      console.log(`simple ${newPrefix}`, item)

      // const matchingCommentsParent = comments.filter((c) => c.key === prefix)
      // console.log('matchingCommentsParent', matchingCommentsParent)

      const matchingComments = matches(newPrefix, comments)
      console.log('matchingComments', matchingComments)

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
  console.log('───────────────────────────────')
  console.log('item', item)
  /** */
  matchingComments.forEach((comment) => {
    // console.log('comment', comment)
    if (comment && comment.commentBefore) {
      // const value = comment.commentBefore.split('\\n').join('\n ');
      item.commentBefore = `${comment.commentBefore}`;
    }
    if (comment && comment.comment) {
      // const value = comment.comment.split('\\n').join('\n ');
      if (comment.inKey) {
        // item.comment = `${comment.comment}`;
        item.key.comment = `${comment.comment}`;
      } else if (typeof item.value === 'string') {
        item.comment = `${comment.comment}`;
      } else {
        item.value.comment = `${comment.comment}`;
      }
    }
  })
  //*
  console.log('new item', item)
  console.log('──────DONE─────────────────────────')
  /** */
}

function getTopLevelKeys(yamlString = '') {
  const doc = yaml.parseDocument(yamlString)
  if (doc.contents && doc.contents.items.length > 0) {
    return doc.contents.items.map((item) => item.key.value)
  }
  return []
}

module.exports = {
  parse,
  stringify,
  extractYamlComments,
  getTopLevelKeys,
}
