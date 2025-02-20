// Alt https://github.com/technote-space/anchor-markdown-header/blob/master/src/index.ts

function makeSlug(text = '') {
  const STRIP_CHARS = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g

  return text
    .replace(/[^a-z0-9 -_\t]*/gi, '')
    .trim()
    .toLowerCase()
    .replace(STRIP_CHARS, '')
    .replace(/\s/g, '-')
}

function smartSlugger(customFn) {
  const usedSlugs = new Set()
  const occurrences = {}
  const slugFn = (typeof customFn === 'function') ? customFn : makeSlug

  return (text) => {
    const slug = slugFn(text)

    if (!usedSlugs.has(slug)) {
      usedSlugs.add(slug)
      occurrences[slug] = 0
      return slug
    }

    if (!occurrences[slug]) {
      occurrences[slug] = 0
    }

    occurrences[slug] = occurrences[slug] + 1
    const newSlug = `${slug}-${occurrences[slug]}`
    usedSlugs.add(newSlug)
    return newSlug
  }
}

module.exports = {
  makeSlug,
  smartSlugger
}
