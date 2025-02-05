const yaml = require('yaml')

/**
 * Extracts comments from YAML content and maps them to their corresponding keys
 * @param {string} yamlString - The YAML content to parse
 * @param {string} [prefix] - Optional prefix for the keys
 * @returns {Map<string, string>} Map of element IDs to their associated comments
 */
function extractYamlComments(yamlString, prefix = '') {
  const commentsMap = new Map()

  // Capture opening comments
  const openingComments = yamlString.match(/^\s*(#[^\n]*\n\s*)*(?=[^#\s])/)?.[0]
  if (openingComments) {
    const comments = openingComments
      .split('\n')
      .map(line => line.match(/#(.+)/)?.[1])
      .filter(Boolean)
      .join('\n')
    if (comments) {
      commentsMap.set('', { before: comments })
    }
  }

  // Capture trailing comments
  const trailingComments = yamlString.match(/\n\s*(#[^\n]*\n\s*)*$/)?.[0]
  if (trailingComments) {
    const comments = trailingComments
      .split('\n')
      .map(line => line.match(/#(.+)/)?.[1])
      .filter(Boolean)
      .join('\n')
    if (comments) {
      commentsMap.set('', {
        ...commentsMap.get('') || {},
        after: comments
      })
    }
  }

  const document = yaml.parseDocument(yamlString)

  function normalizeKey(prefix, key) {
    return (prefix ? prefix + "." : "") + key.toString().replace(/\./g, '\\.')
  }

  function addComment(key, comment, type, via, node) {
    comment = comment // .trim()
    console.log(`Adding ${type} comment "${comment}" to key "${key}" via ${via}`, node)
    let commentObj = commentsMap.get(key) || {}
    if (type === 'before') {
      commentObj.before = comment
    } else if (type === 'inline') {
      commentObj.comment = comment
    }
    commentsMap.set(key, commentObj)
  }

  function parseNodeComment(key, node, firstComment) {
    if (yaml.isPair(node)) {
      // Handle the pair's key comments first
      if (node.key.comment) {
        addComment(key, node.key.comment, 'inline', 'pair', node)
      }

      // Then handle the value's comments
      const normalizedKey = normalizeKey(key, node.key.value)
      if (firstComment) addComment(normalizedKey, firstComment, 'before', 'pair first comment', node)
      if (node.key.commentBefore) addComment(normalizedKey, node.key.commentBefore, 'before', 'pair key comment before', node)
      if (node.value.comment) addComment(normalizedKey, node.value.comment, 'inline', 'pair value comment', node)

      parseNodeComment(normalizedKey, node.value, node.value.commentBefore)

    } else if (yaml.isSeq(node)) {
      node.items.forEach((mapNode, i) => {
        const seqKey = normalizeKey(key, i)
        if (mapNode.commentBefore) {
          addComment(seqKey, mapNode.commentBefore, 'before','seq', node)
        }
        parseNodeComment(seqKey, mapNode, i === 0 ? firstComment : undefined)
      })
    } else if (yaml.isMap(node)) {
      node.items.forEach((mapNode, i) => {
        parseNodeComment(key, mapNode, i === 0 ? firstComment : undefined)
      })
    } else if (yaml.isScalar(node)) {
      if (firstComment) addComment(key, firstComment, 'before','scalar', node)
      if (node.commentBefore) addComment(key, node.commentBefore, 'before','scalar', node)
      if (node.comment) addComment(key, node.comment, 'inline','scalar', node)
    }
  }

  // Handle top-level items
  document.contents.items.forEach((node, i) => {
    // For top-level pairs, we need to handle their comments specially
    if (yaml.isPair(node)) {
      const key = node.key.value
      if (node.key.comment) {
        addComment(key, node.key.comment, 'inline')
      }
      parseNodeComment(key, node.value, node.value.commentBefore)
    } else {
      parseNodeComment(prefix, node)
    }
  })

  return commentsMap
}

const yml2 = `
# prefixed

# comment prefixed
tutorial: #nesting level 1
  # before yaml ONE
  - yaml: #nesting level 2 (2 spaces used for indentation)
      name: YAML Ain't Markup Language #string [literal] #nesting level 3 (4 spaces used for indentation)
      type: awesome #string [literal]
      born: 2001 #number [literal]
  # before yaml TWO
  - yaml:
      name: foo # Foo comment
      type: bar
      born: 1999 #word
# trailing comment
# here
`;

const yml = `
# This is a comment
foo: bar # This is a comment two
what: nice # hello
`
console.log(extractYamlComments(yml2))

module.exports = extractYamlComments
