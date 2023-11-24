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

function findMinIndent(string) {
  const match = string.match(/^[ \t]*(?=\S)/gm)
  if (!match) return 0
  return match.reduce((r, a) => Math.min(r, a.length), Infinity)
}

function indentString(string, count = 1, options = {}) {
  const {
    indent = ' ',
    includeEmptyLines = false
  } = options
  if (count === 0) return string
  const regex = includeEmptyLines ? /^/gm : /^(?!\s*$)/gm
  return string.replace(regex, indent.repeat(count))
}

const pre = `<pre class="language-md" style="background-color:#fff;--shiki-dark-bg:#282A36;color:#24292e;--shiki-dark:#F8F8F2" tabindex="0"><code class="language-md"><span class="line"><span style="color:#24292E;--shiki-dark:#50FA7B">'''bash</span></span>
<span class="line"><span style="color:#6F42C1;--shiki-dark:#50FA7B">npm</span><span style="color:#032F62;--shiki-dark:#F1FA8C"> run</span><span style="color:#032F62;--shiki-dark:#F1FA8C"> inside</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#50FA7B">'''</span></span></code></pre>`

test('Indent string', async () => {
  // const str = indentString(pre.replace(/<span class="line">/, '<span class="line">\n'), 2)
  const str = indentString(pre, 2)

  console.log('str')
  console.log(`"${str}"`)
  assert.equal(str, `  <pre class="language-md" style="background-color:#fff;--shiki-dark-bg:#282A36;color:#24292e;--shiki-dark:#F8F8F2" tabindex="0"><code class="language-md"><span class="line"><span style="color:#24292E;--shiki-dark:#50FA7B">'''bash</span></span>
  <span class="line"><span style="color:#6F42C1;--shiki-dark:#50FA7B">npm</span><span style="color:#032F62;--shiki-dark:#F1FA8C"> run</span><span style="color:#032F62;--shiki-dark:#F1FA8C"> inside</span></span>
  <span class="line"><span style="color:#24292E;--shiki-dark:#50FA7B">'''</span></span></code></pre>`)
})

test.run()
