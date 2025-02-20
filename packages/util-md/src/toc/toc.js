const { generateTocTree } = require('./generate-tree')
const { normalizeLevels } = require('./normalize')
const { processTocTree } = require('./process')


/**
 * @typedef  {object}  TocOptions
 * @property {boolean} [collapse = false] - Collapse toc in <details> pane
 * @property {string}  [collapseText] - Text in expand pane
 * @property {string}  [excludeText] - Text to exclude from toc
 * @property {boolean} [firsth1 = true] - Exclude first heading from toc
 * @property {boolean} [sub = false] - Mark as sub section table of contents
 * @property {number}  [maxDepth = 4] - Max depth of headings to add to toc.
 */


/**
 * Generate a table of contents from a markdown string.
 * @param {string} contents - The markdown string to generate a table of contents from.
 * @param {TocOptions} [opts] - The options for the table of contents.
 * @returns {Object} - An object containing the table of contents tree and the markdown text.
 */
function generateToc(contents, opts = {}) {
  const tree = generateTocTree(contents, opts)
  const text = processTocTree(tree, opts)
  return {
    tree,
    text,
  }
}

module.exports = {
  normalizeLevels,
  processTocTree,
  generateTocTree,
  generateToc,
}
