/* Recursively filter out ToC section */
function filterSection(array, matcher) {
  return array.reduce((acc, tocItem) => {
    if (tocItem.children && tocItem.children.length) {
      tocItem.children = filterSection(tocItem.children, matcher)
    }
    if (tocItem.hasOwnProperty('text')) {
      const shouldFilter = checkItem(tocItem, matcher)
      // console.log('shouldFilter', shouldFilter, tocItem.text)
      if (shouldFilter) {
        // console.log('filtering', tocItem.text)
        return acc
      }
      // console.log('not filtering', tocItem.text)
    }
    acc = acc.concat(tocItem)
    return acc
  }, [])
}

function checkItem(tocItem, matcher) {
  if (typeof matcher === 'string') {
    return (matcher[0] === '#') ? tocItem.match === matcher : tocItem.text === matcher
  } else if (typeof matcher === 'function') {
    const result = matcher(tocItem)
    return (typeof result === 'undefined') ? false : !result
  } else if (matcher instanceof RegExp) {
    return matcher.test(tocItem.text) || matcher.test(tocItem.match)
  } else if (Array.isArray(matcher)) {
    return matcher.some((f) => checkItem(tocItem, f))
  } else if (typeof matcher === 'object' && matcher.match) {
    const check = checkItem(tocItem, matcher.match)
    if (typeof matcher.index === 'number') {
      // Check if index within range of 10 characters
      return check && (tocItem.index >= (matcher.index - 5) && tocItem.index <= (matcher.index + 5))
    }
    return check
  }
  return false
}

module.exports = {
  filterSection,
  checkItem,
}
