const path = require('path')
const fs = require('fs')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { findLinks } = require('./find-links')
const { parseFrontmatter } = require('./frontmatter')

const FRONTMATTER = path.join(__dirname, '../fixtures/file-with-frontmatter.md')
const HIDDEN_FRONTMATTER = path.join(__dirname, '../fixtures/file-with-hidden-frontmatter.md')

function read(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

test('Find frontmatter', async () => {
  const frontmatter = parseFrontmatter(read(FRONTMATTER))
  console.log('frontmatter', frontmatter)
  assert.is(typeof frontmatter.data, 'object')
})

test.only('Find hidden frontmatter', async () => {
  const frontmatter = parseFrontmatter(read(HIDDEN_FRONTMATTER))
  console.log('frontmatter', frontmatter)
  assert.is(typeof frontmatter.data, 'object')
})

test.run()
