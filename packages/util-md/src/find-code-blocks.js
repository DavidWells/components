const { parse } = require('oparser')
const { getLineCount, getLineNumberFromMatch } = require('./utils')

// https://regex101.com/r/nIlW1U/6
const CODE_BLOCK_REGEX = /^([A-Za-z \t]*)```([A-Za-z]*)?([A-Za-z_ \t="'{}]*)?\n([\s\S]*?)```([A-Za-z \t]*)*$/gm
const CODE_BLOCK_FOUR_REGEX = /^([A-Za-z \t]*)````([A-Za-z]*)?([A-Za-z_ \t="'{}]*)?\n([\s\S]*?)````([A-Za-z \t]*)*$/gm
// https://regex101.com/r/oPKKoC/1
const REMOVE_CODE_BLOCK_REGEX = /^(?:[A-Za-z \t]*)?(```(?:[A-Za-z]*)?\n(?:[\s\S]*?)```)([A-Za-z \t]*)*$/gm
// remove inline `code` blocks
const REMOVE_INLINE_CODE_BLOCK = /`[^`\n]*`/g

/**
 * Parse code blocks out of markdown
 * @param {string} block
 * @param {Object} opts
 * @returns {Object}
 * @example
 * const { blocks, errors } = findCodeBlocks(content)
 * console.log('blocks', blocks)
 * console.log('errors', errors)
 */
function findCodeBlocks(block, opts = {}) {
  const { filePath = '', includePositions } = opts
  const threeTicksResult = getBlocks(block, {
    filePath,
    includePositions,
    pattern: CODE_BLOCK_REGEX
  })

  /* If no possible conflicting brackets return early */
  if (block.indexOf('````') === -1) {
    return threeTicksResult
  }

  /* Check for nested codeblocks with 4 backticks */
  const fourTicksResult = getBlocks(block, {
    filePath,
    includePositions,
    pattern: CODE_BLOCK_FOUR_REGEX
  })
  const fourTicks = fourTicksResult.blocks
  const threeTicks = threeTicksResult.blocks
  /* */
  if (fourTicks && fourTicks.length) {
    /* Loop over matches and replace */
    for (let i = 0; i < fourTicks.length; i++) {
      const codeBlock = fourTicks[i]
      // console.log('codeBlock', codeBlock)
      /* Loop over 3 ``` matches and replace with correct contents */
      for (let n = 0; n < threeTicks.length; n++) {
        /* If match, replace original with correct code block */
        if (threeTicks[n].block.trim() === codeBlock.code) {
          threeTicksResult.blocks[n] = codeBlock
        }
      }
    }
  }
  return threeTicksResult
}

function getBlocks(block, opts = {}) {
  const { filePath = '', includePositions, pattern } = opts
  let matches
  let errors = []
  let blocks = []

  const msg = (filePath) ? ` in ${filePath}` : ''
  while ((matches = pattern.exec(block)) !== null) {
    if (matches.index === pattern.lastIndex) {
      pattern.lastIndex++ // avoid infinite loops with zero-width matches
    }
    const [ match, prefix, syntax, props, content, postFix ] = matches
    const lineNumber = getLineNumberFromMatch(block, matches)
    let hasError = false
    /* // debug
    console.log(`prefix: "${prefix}"`)
    console.log(`postFix: "${postFix}"`)
    console.log('syntax:', syntax)
    console.log('Content:')
    console.log(content.trim())
    console.log('───────────────────────')
    /** */
    const codeBlock = {}
    if (includePositions) {
      codeBlock.line = lineNumber
      codeBlock.index = matches.index
    }

    if (props) {
      codeBlock.props = parse(props)
    }

    if (syntax) {
      codeBlock.syntax = syntax
    }

    codeBlock.block = match

    /* Validate code blocks */
    if (prefix && prefix.match(/\S/)) {
      hasError = true
      errors.push({
        line: lineNumber,
        index: matches.index,
        message: `Prefix "${prefix}" not allowed on line ${lineNumber}. Fix the code block${msg}.`,
        block: match
      })
    }
    if (postFix && postFix.match(/\S/)) {
      hasError = true
      const line = lineNumber + (getLineCount(match) - 1)
      errors.push({
        line,
        index: matches.index + match.length,
        message: `Postfix "${postFix}" not allowed on line ${line}. Fix the code block${msg}.`,
        block: match
      })
    }

    if (!hasError) {
      codeBlock.code = content.trim()
      blocks.push(codeBlock)
    }
  }

  return {
    errors,
    blocks
  }
}

function removeCode(text = '') {
  return text
    .replace(REMOVE_CODE_BLOCK_REGEX, '')
    .replace(REMOVE_INLINE_CODE_BLOCK, '')
}

module.exports = {
  findCodeBlocks,
  removeCode,
  CODE_BLOCK_REGEX,
  REMOVE_CODE_BLOCK_REGEX
}
