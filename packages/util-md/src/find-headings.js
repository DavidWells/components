const { removeCode } = require('./find-code-blocks')
const { smartSlugger } = require('./utils/slugger')
const { findCodeBlocks } = require('./find-code-blocks')

// https://regex101.com/r/kTr3aa/2 Matches both Setext vs atx Header Styles
const HEADINGS = /^(#{1,6})\s+(.*)|\n\n( *\S[\S ]*)\n([=]{4,})|\n\n( *\S[\S ]*)\n([-]{4,})$/gm
// https://regex101.com/r/kTr3aa/10
const HEADING_WITH_HTML = /^(?:(#{1,6})\s+(.*))$|(?:\n\n( *\S[\S ]*)\n([=]{3,}))|(?:\n\n( *\S[\S ]*)\n([-]{3,})|(?:<(h([1-6]))\b([^>]*)>*(?:>([\s\S]*?)<\/\7>)))/gmi

const BEGINS_WITH_SETEXT = /^(?:(?:\n?( *\S[\S ]*)\n([=]{3,}))|(?:\n?( *\S[\S ]*)\n([-]{3,})))/

const defaultOptions = {
  maxDepth: 6,
  // includeHtmlHeaders: true,
}

const defaultTocOptions = {
  includeHtmlHeaders: true,
}
/**
 * Get markdown headings
 */
function findHeadings(text, userOpts = {}) {
  let matches
  let headings = []
  const options = Object.assign({}, defaultOptions, userOpts)

  /* Remove conflicting code block content */
  const code = (options.codeBlocks) ? options.codeBlocks : findCodeBlocks(text)
  // console.log('code', code)
  if (code && code.blocks && code.blocks.length) {
    for (let i = 0; i < code.blocks.length; i++) {
      const item = code.blocks[i]
      const cleanCode = item.block.replace(/[-#=<>]/g, 'X')
      text = text.replace(item.block, cleanCode)
    }
  }

  // Handle Begins with setext header case....
  const leadingSetext = text.match(BEGINS_WITH_SETEXT)
  if (leadingSetext) {
    const [ _match, setextH1Text, setextH1, setextH2Text, setextH2 ] = leadingSetext
    const level = (setextH1Text) ? 1 : 2
    const headerText = setextH1Text || setextH2Text || ''
    const firstHeading = {
      text: headerText.trim(),
      match: _match,
      level: level,
    }
    if (!options.excludeIndex) {
      firstHeading.index = 1
    }
    if (options.maxDepth >= level && shouldNotFilter(firstHeading, options.filter)) {
      headings.push(firstHeading)
    }
  }

  const PATTERN = (options.includeHtmlHeaders) ? HEADING_WITH_HTML : HEADINGS
  /* Loop over headings */
  while ((matches = PATTERN.exec(text)) !== null) {
    if (matches.index === PATTERN.lastIndex) {
      PATTERN.lastIndex++ // avoid infinite loops with zero-width matches
    }
    const [
      _match,
      level, // 1
      text, // 2
      setextH1Text, // 3
      _setextH1, // 4
      setextH2Text, // 5
      _setextH2, // 6
      htmlTag, // 7
      htmlLevel, // 8
      _htmlAttributes, // 9
      htmlText, // 10
    ] = matches

    /*
    console.log('level', level)
    console.log('text', text)
    console.log('setextH1Text', setextH1Text)
    console.log('setextH2Text', setextH2Text)
    console.log('htmlTag', htmlTag)
    /** */

    let finalText = text || ''
    let finalLevel
    if (!level) {
      finalText = setextH1Text || setextH2Text || htmlText
      if (setextH1Text) {
        finalLevel = 1
      } else if (setextH2Text) {
        finalLevel = 2
      } else if (htmlTag) {
        finalLevel = Number(htmlLevel)
      }
    } else {
      finalLevel = level.length
    }
    // console.log(`finalText ${finalLevel}`, finalText)
    const heading = {
      text: finalText.trim(),
      match: _match,
      level: finalLevel,
      // index: matches.index
    }
    if (!options.excludeIndex) {
      heading.index = matches.index
    }
    if (options.maxDepth >= finalLevel && shouldNotFilter(heading, options.filter)) {
      headings.push(heading)
    }
  }
  return headings
}

function makeToc(contents, opts = {}) {
  const options = Object.assign({}, defaultTocOptions, opts)
  let content = (contents || '').trim()


  const matchTextEscaped = '.*?'
  // /^#{1}\s+(.*)/
  const OPENING_MD_HEADING = new RegExp(`^#{1,6}\\s*\\[?${matchTextEscaped}\\]?(?:.*)?`)
  // /^<(h[1-6])[^>]*>.*?<\/\1>/
  const OPENING_HTML_HEADING = /^<(h[1-6])[^>]*>.*?<\/\1>/
  // new RegExp(`^<h1\\b[^>]*>[\\s]*?(${matchTextEscaped})[\\s]*?<\\/h1>`, 'gim')
  // /^(.*)\n={3,}/
  const OPENING_SETEXT_HEADING = new RegExp(`^(${matchTextEscaped})\n={3,}`)

  const openingHeadingMD = content.match(OPENING_MD_HEADING)
  const openingHeadingHTML = content.match(OPENING_HTML_HEADING)
  const openingHeadingSetext = content.match(OPENING_SETEXT_HEADING)

  let openingHeading = ''
  if (opts.trimLeadingHeading) {
    // Remove first heading
    if (openingHeadingMD) {
      content = content.replace(OPENING_MD_HEADING, '').trim()
      openingHeading = openingHeadingMD[0]
    } else if (openingHeadingHTML) {
      content = content.replace(OPENING_HTML_HEADING, '').trim()
      openingHeading = openingHeadingHTML[0]
    } else if (openingHeadingSetext) {
      content = content.replace(OPENING_SETEXT_HEADING, '').trim()
      openingHeading = openingHeadingSetext[0]
    }
  }

  /*
  console.log('openingHeading', openingHeading)
  // console.log(content)
  process.exit(1)
  /** */

  const headings = findHeadings(content, options)
  // console.log('headings', headings)
  // process.exit(1)

  if (!headings.length) {
    return []
  }

  const firstHeading = headings[0]
  if (!firstHeading) {
    return []
  }

  const slugFn = smartSlugger()
  const navigation = []
  const base = 0 // +firstHeading.level
  // console.log('base', base)

  function findLocation(navigation, depth) {
    if (depth <= 0) {
      return navigation
    }
    let loc = navigation[navigation.length - 1]
    if (!loc) {
      loc = { children: [] }
      navigation.push(loc)
    } else if (!loc.children) {
      loc.children = []
    }
    return findLocation(loc.children, depth - 1)
  }

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]
    if (!heading.text) {
      continue
    }
    // Min level is 0
    const newLevel = +heading.level - base
    // const realNewLevel = (newLevel < 0) ? 0 : newLevel
    const location = findLocation(navigation, newLevel)
    const leaf = {
      level: newLevel,
      // index: heading.index,
      text: heading.text,
      slug: slugFn(heading.text),
      match: heading.match,
    }
    if (!options.excludeIndex) {
      leaf.index = heading.index
    }
    location.push(leaf)
  }

  const result = flattenToc((options.filterSection) ? filterSection(navigation, options.filterSection) : navigation)

  if (options.normalizeTocLevels) {
    return normalizeTocLevels(result)
  }

  return result
}

function flattenToc(arr) {
  const result = []

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]

    if (!item.match && item.children) {
      const processedChildren = flattenToc(item.children)
      for (let j = 0; j < processedChildren.length; j++) {
        result.push(processedChildren[j])
      }
    } else {
      if (item.children && item.children.length > 0) {
        item.children = flattenToc(item.children)
      }
      result.push(item)
    }
  }

  return result
}

/* Recursively filter out ToC section */
function filterSection(array, filterFn) {
  return array.reduce((acc, curr) => {
    if (curr.children && curr.children.length) {
      curr.children = filterSection(curr.children, filterFn)
    }
    if (curr.hasOwnProperty('text') && !filterFn(curr)) {
      return acc
    }
    acc = acc.concat(curr)
    return acc
  }, [])
}

function shouldNotFilter(heading, predicate) {
  return (typeof predicate === 'function') ? predicate(heading) : true
}

/**
 * Recursively adjusts the level of each item and its children.
 *
 * @param {Array} items - The array of items to adjust.
 * @param {number} shift - The amount to shift each level by.
 */
function adjustLevels(items, shift) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    item.level = shift

    // If the item has children, adjust their levels recursively
    if (item.children) {
      adjustLevels(item.children, shift + 1)
    }
  }
}

/**
 * Adjusts top-level items with a level of 2 to 1, and recursively shifts other levels accordingly.
 *
 * @param {Array} items - The array of items to adjust.
 */
function normalizeTocLevels(items) {
  // Get lowest level of all items
  let minLevel = items.reduce((min, item) => Math.min(min, item.level), Infinity)

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // Shift top-level items with a level of 2 to level 1
    if (item.level > minLevel) {
      const shift = minLevel
      item.level = shift

      // Adjust levels of children recursively
      if (item.children) {
        adjustLevels(item.children, shift + 1)
      }
    }
  }
  return items
}

module.exports = {
  findHeadings,
  makeToc,
  normalizeTocLevels,
}
