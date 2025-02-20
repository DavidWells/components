/* Recursively filter out ToC section */
function filterSection(array, filterFn) {
  return array.reduce((acc, curr) => {
    if (curr.children && curr.children.length) {
      curr.children = filterSection(curr.children, filterFn)
    }
    if (curr.hasOwnProperty('text')) {
      const shouldFilter = processFilter(curr, filterFn)
      // console.log('shouldFilter', shouldFilter, curr.text)
      if (shouldFilter) {
        // console.log('filtering', curr.text)
        return acc
      }
      // console.log('not filtering', curr.text)
    }
    acc = acc.concat(curr)
    return acc
  }, [])
}

function processFilter(curr, filterFn) {
  if (typeof filterFn === 'string') {
    return (filterFn[0] === '#') ? curr.match === filterFn : curr.text === filterFn
  } else if (typeof filterFn === 'function') {
    const result = filterFn(curr)
    return (typeof result === 'undefined') ? false : !result
  } else if (filterFn instanceof RegExp) {
    return filterFn.test(curr.text) || filterFn.test(curr.match)
  } else if (Array.isArray(filterFn)) {
    return filterFn.some((f) => processFilter(curr, f))
  }
  return false
}

module.exports = {
  filterSection,
}
