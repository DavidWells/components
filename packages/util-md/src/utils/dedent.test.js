const { test } = require('uvu')
const assert = require('uvu/assert')
const dedent = require('./dedent')


test('Dedents string', async () => {
  const str = dedent(`
  '''js
  const s = "Inside list"
  alert(s)
  '''
`)
  // deepLog(res)
  assert.equal(str, `
'''js
const s = "Inside list"
alert(s)
'''
`)
})

test('Dedents string', async () => {
  const str = dedent(`
  const s = "Inside list"
  alert(s)
`)
  // deepLog(res)
  assert.equal(str, `
const s = "Inside list"
alert(s)
`)
})

test.run()
