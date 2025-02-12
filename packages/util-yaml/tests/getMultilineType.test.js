const { test } = require('uvu')
const assert = require('uvu/assert')
const { getMultilineType } = require('../src/tags/_utils')

test('detects literal block style', () => {
  const input = `|
  This is a
  literal block`

  const result = getMultilineType(input)
  assert.equal(result.type, 'literal')
  assert.equal(result.style, '|')
  assert.equal(result.chomping, 'clip')
  assert.equal(result.chompChar, '')
  assert.equal(result.indent, null)
  assert.equal(result.content, '\n  This is a\n  literal block')
})

test('detects folded block style', () => {
  const input = `>
  This is a
  folded block`

  const result = getMultilineType(input)
  assert.equal(result.type, 'folded')
  assert.equal(result.style, '>')
  assert.equal(result.chomping, 'clip')
  assert.equal(result.chompChar, '')
  assert.equal(result.indent, null)
  assert.equal(result.content, '\n  This is a\n  folded block')
})

test('handles chomping indicators', () => {
  const strip = getMultilineType('|-\nstripped\n\n')
  assert.equal(strip.chomping, 'strip')
  assert.equal(strip.chompChar, '-')

  const keep = getMultilineType('|+\nkeep\n\n')
  assert.equal(keep.chomping, 'keep')
  assert.equal(keep.chompChar, '+')

  const clip = getMultilineType('|\nclip\n')
  assert.equal(clip.chomping, 'clip')
  assert.equal(clip.chompChar, '')
})

test('handles indent indicators', () => {
  const input = `|2
    indented
    block`

  const result = getMultilineType(input)
  assert.equal(result.indent, 2)
  assert.equal(result.content, '\n    indented\n    block')
})

test('handles combined indicators', () => {
  const input = `|2-
    indented
    stripped
    block

  `

  const result = getMultilineType(input)
  console.log('result', result)
  assert.equal(result.type, 'literal')
  assert.equal(result.chomping, 'strip')
  assert.equal(result.chompChar, '-')
  assert.equal(result.indent, 2)
})

test('handles combined indicators in alternate order', () => {
  const input = `|-2
    indented
    stripped
    block`

  const result = getMultilineType(input)
  console.log('result', result)
  assert.equal(result.type, 'literal')
  assert.equal(result.chomping, 'strip')
  assert.equal(result.chompChar, '-')
  assert.equal(result.indent, 2)
  assert.equal(result.content, '\n    indented\n    stripped\n    block')
})

test('handles plain strings', () => {
  const inputs = [
    'plain string',
    // '',
    // undefined,
    '  not a block',
    '# comment'
  ]

  inputs.forEach(input => {
    const result = getMultilineType(input)
    assert.equal(result.type, 'plain')
  })
})

test('handles CloudFormation intrinsic functions', () => {
  const inputs = [
    '!Sub |\n  Hello ${Name}',
    '!Join >\n  Hello World',
    '!GetAtt |2\n    Resource.Attribute'
  ]

  inputs.forEach(input => {
    const result = getMultilineType(input)
    assert.ok(['literal', 'folded'].includes(result.type))
    assert.ok(['|', '>'].includes(result.style))
  })
})

test('returns correct matchText for different indicators', () => {
  const cases = [
    { input: '|', expected: '|' },
    { input: '|-', expected: '|-' },
    { input: '|+', expected: '|+' },
    { input: '|2', expected: '|2' },
    { input: '|2-', expected: '|2-' },
    { input: '|-2', expected: '|-2' },
    { input: '>', expected: '>' },
    { input: '>-', expected: '>-' },
    { input: '>2-', expected: '>2-' }
  ]

  cases.forEach(({ input, expected }) => {
    const result = getMultilineType(`${input}\nsome content`)
    assert.equal(result.matchText, expected, `Failed for input: ${input}`)
  })
})

test.run()
