const path = require('path')
const fs = require('fs')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { parseFrontmatter } = require('./frontmatter')

const FRONTMATTER = path.join(__dirname, '../fixtures/file-with-frontmatter.md')
const FRONTMATTER_AND_CONTENT = path.join(__dirname, '../fixtures/file-with-frontmatter-and-content.md')
const HIDDEN_FRONTMATTER = path.join(__dirname, '../fixtures/file-with-hidden-frontmatter.md')
const NO_FRONTMATTER = path.join(__dirname, '../fixtures/file-with-no-frontmatter.md')

function read(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

test('Find frontmatter no content', async () => {
  const content = read(FRONTMATTER)
  const frontmatter = parseFrontmatter(content)
  /*
  console.log('frontmatter', frontmatter)
  /** */
  assert.is(typeof frontmatter.data, 'object')
  assert.equal(frontmatter.content, '')
  assert.equal(frontmatter.content, content.replace(frontmatter.frontMatterRaw, ''))
  assert.equal(frontmatter.data.components, [
    { type: 'PageHeading', heading: 'Nice', subHeading: 'Add it' },
    {
      type: 'content',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur\n' +
        '\n' +
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur'
    },
    {
      type: 'content',
      content: 'More content\n\n<ComponentXyz  />\n\nstuff\n\n---'
    },
    { type: 'content', content: 'Even more content' }
  ])
})

test('Find frontmatter and content', async () => {
  const content = read(FRONTMATTER_AND_CONTENT)
  const frontmatter = parseFrontmatter(content)
  /*
  console.log('frontmatter', frontmatter)
  /** */
  assert.is(typeof frontmatter.data, 'object')
  assert.equal(frontmatter.content, content.replace(frontmatter.frontMatterRaw + '\n', ''))
})

test('Find hidden frontmatter', async () => {
  const content = read(HIDDEN_FRONTMATTER)
  const frontmatter = parseFrontmatter(content)
  /*
  console.log('frontmatter', frontmatter)
  /** */
  assert.is(typeof frontmatter.data, 'object')
  assert.equal(frontmatter.content, content.replace(frontmatter.frontMatterRaw + '\n', ''))
})

test('No frontmatter', async () => {
  const content = read(NO_FRONTMATTER)
  const frontmatter = parseFrontmatter(content)
  /*
  console.log('frontmatter', frontmatter)
  /** */
  assert.is(typeof frontmatter.data, 'object')
  assert.equal(frontmatter.data, {})
  assert.equal(frontmatter.content, content)
})

test.run()
