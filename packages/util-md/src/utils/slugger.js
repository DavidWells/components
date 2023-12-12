function makeSlug(text = '') {
  const re = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g
  return text
    .replace(/[^a-z0-9 -_\t]*/gi, '')
    .trim()
    .toLowerCase()
    .replace(re, '')
    .replace(/\s/g, '-')
}

function smartSlugger(customFn) {
  const occurrences = {}
  const slugFn = (typeof customFn === 'function') ? customFn : makeSlug
  return (text) => {
    const slug = slugFn(text)
    occurrences[slug] = (typeof occurrences[slug] === 'undefined') ? 0 : occurrences[slug] + 1
    return (occurrences[slug] === 0) ? slug : `${slug}-${occurrences[slug]}`
  }
}

module.exports = {
  makeSlug,
  smartSlugger
}
