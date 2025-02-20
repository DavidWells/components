const { test } = require('uvu')
const assert = require('uvu/assert')
const { excludeTocItem, singleLinePattern } = require('./strings')

test('singleLinePattern creates correct regex pattern', () => {
  const pattern = singleLinePattern('Usage')
  assert.instance(pattern, RegExp)
  assert.ok(pattern.test('- [Usage](./usage.md)'))
  assert.ok(pattern.test('  - [Usage](./docs/usage.md)'))
  assert.not.ok(pattern.test('- [Install](./install.md)'))
})

test('excludeTocItem removes simple TOC item', () => {
  const toc = `
- [Install](./install.md)
- [Usage](./usage.md)
- [API](./api.md)
`
  const result = excludeTocItem(toc, 'Usage')
  const expected = `
- [Install](./install.md)
- [API](./api.md)
`
  assert.equal(result.trim(), expected.trim())
})

test('excludeTocItem removes nested TOC items', () => {
  const toc = `
- [Install](./install.md)
- [Usage](./usage.md)
  - [Basic](./usage/basic.md)
  - [Advanced](./usage/advanced.md)
- [API](./api.md)
`
  const result = excludeTocItem(toc, 'Usage')
  const expected = `
- [Install](./install.md)
- [API](./api.md)
`
  assert.equal(result.trim(), expected.trim())
})

test('excludeTocItem preserves other nested items', () => {
  const toc = `
- [Install](./install.md)
  - [Requirements](./install/requirements.md)
- [Usage](./usage.md)
  - [Basic](./usage/basic.md)
- [API](./api.md)
  - [Methods](./api/methods.md)
`
  const result = excludeTocItem(toc, 'Usage')
  const expected = `
- [Install](./install.md)
  - [Requirements](./install/requirements.md)
- [API](./api.md)
  - [Methods](./api/methods.md)
`
  assert.equal(result.trim(), expected.trim())
})

test('excludeTocItem preserves other nested items deeper than 1 level', () => {
  const toc = `
- [Install](./install.md)
  - [Requirements](./install/requirements.md)
- [Usage](./usage.md)
  - [Basic](./usage/basic.md)
  - [Wow](./usage/wow.md)
- [API](./api.md)
  - [Methods](./api/methods.md)
`
  const result = excludeTocItem(toc, 'Basic')
  const expected = `
- [Install](./install.md)
  - [Requirements](./install/requirements.md)
- [Usage](./usage.md)
  - [Wow](./usage/wow.md)
- [API](./api.md)
  - [Methods](./api/methods.md)
`
  assert.equal(result.trim(), expected.trim())
})

test('excludeTocItem handles different indentation levels', () => {
  const toc = `
- [Install](./install.md)
- [Usage](./usage.md)
    - [Basic](./usage/basic.md)
      - [Simple](./usage/basic/simple.md)
    - [Advanced](./usage/advanced.md)
- [API](./api.md)
`
  const result = excludeTocItem(toc, 'Usage')
  const expected = `
- [Install](./install.md)
- [API](./api.md)
`
  assert.equal(result.trim(), expected.trim())
})

test('excludeTocItem is case insensitive', () => {
  const toc = `
- [Install](./install.md)
- [USAGE](./usage.md)
  - [Basic](./usage/basic.md)
- [API](./api.md)
`
  const result = excludeTocItem(toc, 'usage')
  const expected = `
- [Install](./install.md)
- [API](./api.md)
`
  assert.equal(result.trim(), expected.trim())
})

test.run()
