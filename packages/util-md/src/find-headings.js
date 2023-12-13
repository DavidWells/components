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
      index: 1,
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
    const heading = {
      text: finalText.trim(),
      match: _match,
      level: finalLevel,
      index: matches.index
    }
    if (options.maxDepth >= finalLevel && shouldNotFilter(heading, options.filter)) {
      headings.push(heading)
    }
  }
  return headings
}

function makeToc(content = '', opts = {}) {
  const options = Object.assign({}, defaultTocOptions, opts)
  const headings = findHeadings(content, options)

  if (!headings.length) {
    return []
  }

  const firstHeading = headings[0]
  if (!firstHeading) {
    return []
  }

  const slugFn = smartSlugger()
  const navigation = []
  const base = +firstHeading.level

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
    const newLevel = +heading.level - base
    const location = findLocation(navigation, newLevel)
    location.push({
      level: newLevel,
      index: heading.index,
      text: heading.text,
      slug: slugFn(heading.text),
      match: heading.match,
    })
  }

  if (!options.filterSection) {
    return navigation
  }

  return filterSection(navigation, options.filterSection)
}

/* Recursively filter out ToC section */
function filterSection(array, filterFn) {
  return array.reduce((acc, curr) => {
    if (curr.children && curr.children.length) {
      curr.children = filterSection(curr.children, filterFn)
    }
    if (filterFn(curr)) {
      acc = acc.concat(curr)
    }
    return acc
  }, [])
}

function shouldNotFilter(heading, predicate) {
  return (typeof predicate === 'function') ? predicate(heading) : true
}

module.exports = {
  findHeadings,
  makeToc,
}
