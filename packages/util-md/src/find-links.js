const { onlyUnique, isImage, isRelative } = require('./filters')
const { findMarkdownImages } = require('./find-images-md')
const { removeCode } = require('./find-code-blocks')
// Alt https://github.com/MikeKovarik/link-extract

// https://regex101.com/r/In5HtG/3
// const LIVE_LINKS_REGEX = /(?:['"(])((?:https?:\/\/)[\w\d\-_,./?=#%:+&]{3,})/gmi
// https://regex101.com/r/In5HtG/4
const LIVE_LINKS_REGEX = /['"(]((?:https?:\/\/)[\w\d\-_,./?=#%:+&]{3,})|<(\S*:\/\/\S*)>/gmi
// https://regex101.com/r/Nywerx/3
const RELATIVE_LINKS_REGEX = /(src|href|\()=?(['"/])(?!(?:(?:https?|ftp):\/\/|data:))(\.?\/)?([\w\d-_./,?=#%:+&]+)(?:['")])?/gim
// https://regex101.com/r/u2DwY2/2/
const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g
// https://regex101.com/r/UeQ049/2 <https://www.markdownguide.org>
const ANGLE_LINKS = /(<)(\S*[@:]\S*)(>)/g

const RAW_LINK = /^(https?:\/\/[^\s]+)(?:[\s])|[\s](https?:\/\/[^\s]+)(?:[\s])/g

const LINK_PATTERN = /^https?:\/\//

function isLocal(link) {
  return isRelative(link)
}

function isRemote(link) {
  return !isRelative(link)
}

/**
 * @typedef {object} findLinksOpts
 * @property {Record<string,any>} [frontmatter] - Frontmatter data
 * @property {boolean} [unique=true] - ensure links unique
 */

/**
* @typedef {object} findLinksResult
* @property {string[]} links - All images
* @property {string[]} images - All live image links
*/

/**
 * Finds all links in text relative or otherwise
 * @param {string} text
 * @param {findLinksOpts} opts
 * @returns {findLinksResult}
 */
function findLinks(text, opts = {}) {
  const { unique = true, frontmatter } = opts

  const absoluteLinks = findAbsoluteLinks(text)
  const noCode = removeCode(text)
  const relativeLinks = findRelativeLinks(noCode)
  // Naked https:// links in text
  const rawLinks = findRawLinks(text)
  const frontmatterLinks = (frontmatter) ? findLinksInFrontMatter(frontmatter) : []
  // MD image links
  const markdownImages = findMarkdownImages(text)
  // markdown syntax <http://link.com>
  const angleLinks = findAngleLinks(text)

  //*
  console.log('absoluteLinks', absoluteLinks)
  console.log('relativeLinks', relativeLinks)
  console.log('frontmatterLinks', frontmatterLinks)
  console.log('markdownImages', markdownImages)
  console.log('angleLinks', angleLinks)
  console.log('rawLinks', rawLinks)
  /** */

  const foundLinks = frontmatterLinks
    .concat(absoluteLinks)
    .concat(relativeLinks)
    .concat(markdownImages)
    .concat(angleLinks)
    .concat(rawLinks)

  const allLinks = (!unique) ? foundLinks : foundLinks.filter(onlyUnique)

  const _images = markdownImages
  const _links = []
  for (let i = 0; i < allLinks.length; i++) {
    if (isImage(allLinks[i])) {
      _images.push(allLinks[i])
    } else {
      _links.push(allLinks[i])
    }
  }
  // const allImages = normalLinks.filter((link) => isImage(link)).concat(mdLinks)
  // const links = normalLinks.filter((link) => !isImage(link))
  const images = _images.filter(onlyUnique)
  const links = _links.filter(onlyUnique).filter(function(el) {
    return images.indexOf(el) < 0
  })
  // .sort()

  return {
    links,
    images
  }
  /*
    // Old return https://github.com/DavidWells/markdown-magic/blob/b148b4ad3876c4ea07371451d230a5e9cec57ce5/lib/utils/md/find-links.js#L32-L44
    return {
    // all,
    // live,
    // relative,
    // frontmatter: frontmatterLinks,
    links: {
      all: allLink,
      relative: allLink.filter(isLocal),
      live: allLink.filter(isRemote)
    },
    images: {
      all: allImg,
      relative: allImg.filter(isLocal),
      live: allImg.filter(isRemote)
    },
  }
  */
}

function findMarkdownImageLinks(text) {
  let matches
  const imageLinks = []
  while ((matches = MARKDOWN_IMAGE_REGEX.exec(text)) !== null) {
    if (matches.index === MARKDOWN_IMAGE_REGEX.lastIndex) {
      MARKDOWN_IMAGE_REGEX.lastIndex++ // avoid infinite loops with zero-width matches
    }
    const [ match, image, altText ] = matches
    imageLinks.push(image)
  }
  return imageLinks.filter(onlyUnique)
}

/**
 * Finds all links in markdown format <https://foo.com>
 * @param {string} text
 * @returns
 */
function findRawLinks(text) {
  let matches
  let links = []
  while ((matches = RAW_LINK.exec(text)) !== null) {
    if (matches.index === RAW_LINK.lastIndex) {
      RAW_LINK.lastIndex++ // avoid infinite loops with zero-width matches
    }
    // console.log(matches)
    const [ _match, open, link ] = matches
    links.push(link)
  }
  return links.filter(onlyUnique)
}

/**
 * Finds all links in markdown format <https://foo.com>
 * @param {string} text
 * @returns
 */
function findAngleLinks(text) {
  let matches
  const links = []
  while ((matches = ANGLE_LINKS.exec(text)) !== null) {
    if (matches.index === ANGLE_LINKS.lastIndex) {
      ANGLE_LINKS.lastIndex++ // avoid infinite loops with zero-width matches
    }
    const [ match, open, link, close ] = matches
    if (link) {
      links.push(link)
    }
  }
  return links.filter(onlyUnique)
}

/**
 * Finds all links in markdown <a>, <img> and md link format []()
 * @param {string} text
 * @returns
 */
function findAbsoluteLinks(text) {
  let matches
  const links = []
  while ((matches = LIVE_LINKS_REGEX.exec(text)) !== null) {
    if (matches.index === LIVE_LINKS_REGEX.lastIndex) {
      LIVE_LINKS_REGEX.lastIndex++ // avoid infinite loops with zero-width matches
    }
    const [ match, url, bracketLink ] = matches
    links.push(url || bracketLink)
  }
  return links.filter(onlyUnique)
}

/*
Match relative links
<h1 jdjdjjdjd=lksjskljfsdlk="jdjdj">Netlify + FaunaDB &nbsp;&nbsp;&nbsp;
  <a href="https://app.netlify.com/start/deploy?repository=https://github.com/netlify/netlify-faunadb-example&stack=fauna">
  <img src="../../../../img/deploy/lol.svg">
  </a>
</h1>
[link](/my-great-page)
<a href="img/deploy/one.svg">cool</a>
<img src="img/deploy/duplicate.svg" />
<img src="img/deploy/duplicate.svg" >
<img src="/img/deploy/three.svg" />
<img src='/img/deploy/four.svg' />
<img src='./img/deploy/five.svg' />
<img src='../img/deploy/button.svg' />
<img src='../../img/deploy/button.svg' />
<img src="https://www.netlify.com/img/deploy/button.svg" />
<img src="https://www.netlify.com/img/deploy/button.svg" />
![The San Juan Mountains are beautiful!](/assets/images/san-juan-mountains.jpg "San Juan Mountains")
*/

function findRelativeLinks(text) {
  let matches
  const relLinks = []
  while ((matches = RELATIVE_LINKS_REGEX.exec(text)) !== null) {
    if (matches.index === RELATIVE_LINKS_REGEX.lastIndex) {
      RELATIVE_LINKS_REGEX.lastIndex++ // avoid infinite loops with zero-width matches
    }
    // console.log(matches)
    const [ match, _, start, link, x ] = matches
    const one = (start === '/') ? start : ''
    const two = (link === '/') ? link : ''
    relLinks.push(`${one}${two}${x}`)
  }
  return relLinks.filter(onlyUnique)
}

function findLinksInFrontMatter(data) {
  const yamlStrings = traverse(data)
  // console.log('yamlStrings', yamlStrings)
  const linksInYml = yamlStrings.map((string) => {
    if (LINK_PATTERN.test(string)) {
      return [string]
    }
    // console.log('string', string)
    const results = findLinks(string)
    return results.links.concat(results.images)
  })
    .filter((x) => {
      if (x && x.length) {
        return x.length
      }
      return false
    })
    .flat()
  // console.log('linksInYml', linksInYml)
  return linksInYml
}

function traverse(x, arr = []) {
  if (typeof x === 'string') {
    arr.push(x)
  } else if (Array.isArray(x)) {
    traverseArray(x, arr)
  } else if ((typeof x === 'object') && (x !== null)) {
    traverseObject(x, arr)
  }
  return arr
}
function traverseArray(arr, acc) {
  for (let i = 0; i < arr.length; i++) {
    traverse(arr[i], acc)
  }
}
function traverseObject(obj, acc) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      traverse(obj[key], acc)
    }
  }
}

module.exports = {
  findLinks,
  findAbsoluteLinks,
  findRelativeLinks
}
