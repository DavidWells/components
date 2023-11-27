const { parse } = require('oparser')
const { getLineCount, getLineNumberFromMatch } = require('./utils')
const dedentString = require('./utils/dedent')

// https://regex101.com/r/nIlW1U/6
const CODE_BLOCK_REGEX = /^([A-Za-z \t]*)```([A-Za-z]*)?([A-Za-z_ \t="'{}]*)?\n([\s\S]*?)```([A-Za-z \t]*)*$/gm
const CODE_BLOCK_FOUR_REGEX = /^([A-Za-z \t]*)````([A-Za-z]*)?([A-Za-z_ \t="'{}]*)?\n([\s\S]*?)````([A-Za-z \t]*)*$/gm
// https://regex101.com/r/oPKKoC/1
const REMOVE_CODE_BLOCK_REGEX = /^(?:[A-Za-z \t]*)?(```(?:[A-Za-z]*)?\n(?:[\s\S]*?)```)([A-Za-z \t]*)*$/gm
// remove inline `code` blocks
const REMOVE_INLINE_CODE_BLOCK = /`[^`\n]*`/g

// https://regex101.com/r/ydaz8U/1
const THREE_TICK_PATTERN = /^(>(?: >)*)?([A-Za-z \t]*)```([A-Za-z]*)?([A-Za-z_ \t="'{}]*)?\n\s*(`{4,})?\s*([\s\S]*?)(`{4,})?([\s]*?)```([A-Za-z \t]*)*$/gm
const THREE_TILDE_PATTERN = /^(>(?: >)*)?([A-Za-z \t]*)~~~([A-Za-z]*)?([A-Za-z_ \t="'{}]*)?\n\s*(`{4,})?\s*([\s\S]*?)(`{4,})?([\s]*?)~~~([A-Za-z \t]*)*$/gm
const FOUR_TICK_PATTERN = /^(>(?: >)*)?([A-Za-z \t]*)````([A-Za-z]*)?([A-Za-z_ \t="'{}]*)?\n\s*(```)?\s*([\s\S]*?)(```)?([\s]*?)````([A-Za-z \t]*)*$/gm

/**
 * Parse code blocks out of markdown
 * @param {string} text
 * @param {Object} opts
 * @returns {Object}
 * @example
 * const { blocks, errors } = findCodeBlocks(content)
 * console.log('blocks', blocks)
 * console.log('errors', errors)
 */
function findCodeBlocks(text, opts = {}) {
  const { filePath = '', includePositions = true } = opts
  /* Check for 4 tick blocks */
  let fourTickResults = {
    blocks: [],
    errors: []
  }

  /* If text has quad ```` code fences, process internal conflicts first */
  /* Find ```` code blocks */
  if (text.indexOf('````') > -1) {
    fourTickResults = _getCodeBlocks(text, {
      pattern: FOUR_TICK_PATTERN,
      replaceTripleTicks: true
    })
    const cleanBlocks = []
    for (let index = 0; index < fourTickResults.blocks.length; index++) {
      const b = fourTickResults.blocks[index]
      text = text.replace(b.block, b.cleanBlock)
      delete b.cleanBlock
      b.code = fixSpecialChars(b.code)
      cleanBlocks.push(b)
    }
    // console.log('cleanBlocks', cleanBlocks)
  }

  let threeTildeResults = {
    blocks: [],
    errors: []
  }

  /* Find ~~~ code blocks */
  if (text.indexOf('~~~') > -1) {
    threeTildeResults = _getCodeBlocks(text, {
      pattern: THREE_TILDE_PATTERN,
    })
  }

  /* Find ``` code blocks */
  const threeTickResult = _getCodeBlocks(text, {
    filePath,
    includePositions,
    pattern: THREE_TICK_PATTERN
  })

  const blocks = threeTickResult.blocks
    .concat(threeTildeResults.blocks)
    .concat(fourTickResults.blocks)
    .sort((a, b) => {
      if (a.index > b.index) return 1
      if (a.index < b.index) return -1
      return 0
    })

  const errors = threeTickResult.errors
    .concat(threeTildeResults.errors)
    .concat(fourTickResults.errors)
  /* // debug
  console.log('threeTickResult', threeTickResult)
  console.log('threeTildeResults', threeTildeResults)
  console.log('fourTickResults', fourTickResults)
  console.log('allBlocks', blocks)
  console.log('errors', errors)
  /** */
  return {
    blocks,
    errors
  }
}

function replaceSpecialChars(str) {
  return str.replace(/```/g, '&&&')
}

function fixSpecialChars(str) {
  return str.replace(/&&&/g, '```')
}

function _getCodeBlocks(block, opts = {}) {
  const {
    filePath = '',
    includePositions = true,
    dedentCode = true,
    replaceTripleTicks = false,
    pattern
  } = opts
  let matches
  let errors = []
  let blocks = []

  const msg = (filePath) ? ` in ${filePath}` : ''

  while ((matches = pattern.exec(block)) !== null) {
    if (matches.index === pattern.lastIndex) {
      pattern.lastIndex++ // avoid infinite loops with zero-width matches
    }
    const [
      match,
      insideBlockQuote,
      prefix = '',
      syntax,
      props,
      innerTicksOpen = '',
      _content,
      innerTicksClose = '',
      postFix
    ] = matches

    // console.log('insideBlockQuote', insideBlockQuote)
    // console.log('prefix', `"${prefix}"`)

    const innerTicksO = (replaceTripleTicks) ? replaceSpecialChars(innerTicksOpen) : innerTicksOpen
    const innerTicksC = (replaceTripleTicks) ? replaceSpecialChars(innerTicksClose) : innerTicksClose

    let codeContent = _content
    if (insideBlockQuote) {
      // replace leading block quote > > arrows
      codeContent = _content.replace(new RegExp(`^${insideBlockQuote}`, 'gm'), '')
      if (prefix) {
        // trim leading spaces from codeContent if prefix exists
        codeContent = codeContent.replace(new RegExp(`^${prefix}`, ''), '')
      }
    }

    const originalCode = prefix + innerTicksOpen + codeContent + innerTicksClose
    let finalCode = prefix + innerTicksO + codeContent + innerTicksC

    const lineNumber = getLineNumberFromMatch(block, matches)
    let hasError = false
    /* // debug
    console.log(`prefix: "${prefix}"`)
    console.log(`postFix: "${postFix}"`)
    console.log('syntax:', syntax)
    console.log('Content:')
    console.log(finalCode.trim())
    console.log('───────────────────────')
    /** */
    const codeBlock = {}
    if (includePositions) {
      codeBlock.line = lineNumber
      codeBlock.index = matches.index
    }

    if (props) {
      codeBlock.propsRaw = props
      codeBlock.props = parse(props)
    }

    if (syntax) {
      codeBlock.syntax = syntax
    }

    if (insideBlockQuote) {
      codeBlock.prefix = insideBlockQuote + prefix
    }

    codeBlock.block = match

    if (replaceTripleTicks) {
      codeBlock.cleanBlock = match.replace(originalCode, finalCode)
    }

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
      if (dedentCode) {
        /* Trim leading empty newlines */
        finalCode = finalCode.replace(/^(?:[\t ]*(?:\r?\n|\r))+/, '')
        finalCode = dedentString(finalCode)
      }
      codeBlock.code = finalCode.replace(/\s+$/g, '')
      blocks.push(codeBlock)
    }
    /** */
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
  // CODE_BLOCK_REGEX,
  // REMOVE_CODE_BLOCK_REGEX
}
