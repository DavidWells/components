const path = require('path')
const fs = require('fs')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { findCodeBlocks } = require('./find-code-blocks')
const { parseFrontmatter } = require('./frontmatter')

const FILE_WITH_CODE = path.join(__dirname, '../fixtures/file-with-code.md')
const FILE_WITH_CODE_TILDE = path.join(__dirname, '../fixtures/file-with-code-tilde.md')
const FILE_WITH_HTML_CODE = path.join(__dirname, '../fixtures/file-with-html-code.md')

function read(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

test('findCodeBlocks ```', async () => {
  const code = findCodeBlocks(read(FILE_WITH_CODE))
  //*
  console.log('code', code)
  /** */

  assert.is(typeof code, 'object')
  assert.is(Array.isArray(code.blocks), true)
  assert.is(Array.isArray(code.errors), true)

  // Nested code fence works
  assert.equal(code.blocks[2], {
    line: 24,
    index: 397,
    syntax: 'md',
    block: "````md\n```javascript\nconsole.log('test')\n```\n````",
    code: "```javascript\nconsole.log('test')\n```"
  })
})

test('findCodeBlocks html', async () => {
  const code = findCodeBlocks(read(FILE_WITH_HTML_CODE))
  /*
  console.log('html code', code)
  /** */
  // Nested code fence works
  assert.equal(code.blocks[0], {
    line: 16,
    index: 321,
    syntax: 'html',
    block: '```html\n' +
        '<p align="center">\n' +
        '  <img width="460" height="300" src="https://picsum.photos/460/300" />\n' +
        '</p>\n' +
        '```',
    code: '<p align="center">\n' +
        '  <img width="460" height="300" src="https://picsum.photos/460/300" />\n' +
        '</p>'
  })
})

test('findCodeBlocks with ~~~', async () => {
  const code = findCodeBlocks(read(FILE_WITH_CODE_TILDE))
  /*
  console.log('code', code)
  /** */

  assert.is(typeof code, 'object')
  assert.is(Array.isArray(code.blocks), true)
  assert.is(Array.isArray(code.errors), true)

  // Nested code fence works
  assert.equal(code.blocks[0], {
    line: 16,
    index: 321,
    syntax: 'md',
    block: '~~~md\nFour tick box\n~~~',
    code: 'Four tick box'
  })

  assert.equal(code.blocks[1], {
    line: 20,
    index: 346,
    propsRaw: ' prop=here',
    props: {
      prop: 'here'
    },
    syntax: 'javascript',
    block: "~~~javascript prop=here\nconsole.log('test')\n~~~",
    code: "console.log('test')"
  })
})

test.run()
