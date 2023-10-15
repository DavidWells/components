const path = require('path')
const fs = require('fs')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { findCodeBlocks } = require('./find-code-blocks')
const { parseFrontmatter } = require('./frontmatter')

const FILE_WITH_CODE = path.join(__dirname, '../fixtures/file-with-code.md')

function read(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

test('findCodeBlocks', async () => {
  const code = findCodeBlocks(read(FILE_WITH_CODE))
  // console.log('code', code)
  /*
  console.log('frontmatter', frontmatter)
  /** */
  assert.is(typeof code, 'object')
  assert.is(Array.isArray(code.blocks), true)
  assert.is(Array.isArray(code.errors), true)
})

test.run()
