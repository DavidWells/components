const path = require('path')
const fs = require('fs')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { findFootnotes } = require('./find-footnotes')

const FILE_WITH_LINKS = path.join(__dirname, '../fixtures/file-with-footnotes.md')

function read(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

test('find footnotes', async () => {
  const footnotes = findFootnotes(read(FILE_WITH_LINKS))
  //*
  console.log('footnotes', footnotes)
  /** */

  /* Has reference links */
  assert.equal(footnotes, [
    { id: '1', content: 'This is the first footnote.' },
    {
      id: '2',
      content: "Here's one with multiple paragraphs and code.\n" +
      'Indent paragraphs to include them in the footnote.\n' +
      '\n' +
      '`{ my code }`\n' +
      '\n' +
      'Add as many paragraphs as you like.\n' +
      '\n'
    },
    {
      id: '3',
      content: "Here's one with multiple paragraphs and code.\n" +
      'Indent paragraphs to include them in the footnote.\n' +
      '\n' +
      '  `{ my code }`\n' +
      '\n' +
      '  Add as many paragraphs as you like.\n' +
      '\n'
    },
    { id: '4', content: 'This is the fourth footnote.' }
  ])
})

test.run()
