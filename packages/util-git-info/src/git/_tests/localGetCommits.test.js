const test = require('ava')
const { formatJSON } = require('../localGetCommits')

test('generates a JSON-like commit message', async (t) => {
  t.deepEqual(formatJSON, '{ "sha": "%H", "parents": "%p", "author": {"name": "%an", "email": "%ae", "date": "%ai" }, "committer": {"name": "%cn", "email": "%ce", "date": "%ci" }, "message": "%f"},')
  const withoutComma = formatJSON.substring(0, formatJSON.length - 1)
  t.notThrows(() => JSON.parse(withoutComma))
})
