const test = require('ava')
const { formatJSON } = require('./localGetCommits')

test('generates a JSON-like commit message', async (t) => {
  t.deepEqual(formatJSON, '{ "sha": "%H", "parents": "%p", "author": {"name": "%an", "email": "%ae" }, "committer": {"name": "%cn", "email": "%ce" }, "subject": "%s", "sanitizedSubject": "%f", "body": "%b", "authoredOn": "%aI", "committedOn": "%cI"},')
  const withoutComma = formatJSON.substring(0, formatJSON.length - 1)
  t.notThrows(() => JSON.parse(withoutComma))
})
