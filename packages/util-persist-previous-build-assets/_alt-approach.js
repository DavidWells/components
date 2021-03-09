const path = require('path')
const got = require('got')
const cheerio = require('cheerio')
const download = require('./utils/download')

/*
Fix for "missing chunks" webpack issue where clients are outdated and chunks 404.
These 404s result in "SyntaxError Unexpected token '<'", "Loading chunk 14 failed." etc.

This will download all compounding JS instead of just the last deployment
*/

async function fixMissingChunks({ baseUrl, outputDirJS, outputDirCSS }) {
  console.log('Persisting previous webpack build files...')
  const response = await got(baseUrl)
  const $ = cheerio.load(response.body)

  const promises = []
  // Download Scripts
  if (outputDirJS) {
    // Grab all JS
    $('script').filter((i, link) => {
      if (typeof link.attribs.src === 'undefined') return false
      return link.attribs.src.includes('.js')
    }).each((i, script) => {
      // Ignore external links
      if (script.attribs.src.startsWith('http')) return
      const fileName = path.basename(script.attribs.src)
      promises.push(
        download(`${baseUrl}${script.attribs.src}`, path.resolve(outputDirJS, fileName))
      )
    })
  }

  // Download CSS
  if (outputDirCSS) {
    // Grab all CSS
    $('link').filter((i, link) => {
      if (typeof link.attribs.href === 'undefined') return false
      return link.attribs.href.includes('.css')
    }).each((i, link) => {
      // Ignore external links
      if (link.attribs.href.startsWith('http')) return
      const fileName = path.basename(link.attribs.href)
      console.log('link.attribs.href', link.attribs.href)
      promises.push(
        download(`${baseUrl}${link.attribs.href}`, path.resolve(outputDirCSS, fileName))
      )
    })
  }

  await Promise.all(promises)
}

module.exports = fixMissingChunks
