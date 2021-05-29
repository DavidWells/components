const { test } = require('uvu')
const assert = require('uvu/assert')
const postcss = require('postcss')
const dedent = require('dedent')

const { getPostCSSConfig } = require('../src')
// const variable = require('./src/_variables')
// const mixins = require('./src/_mixins')

const defaultPostCSSPlugins = getPostCSSConfig({
  variables: {
    blue: 'blue-value',
    nice: 'yellow',
  },
  // mixins: mixins
})

async function processCss(input, expected, plugins) {
  const testPlugins = plugins || defaultPostCSSPlugins
  const result = await postcss(testPlugins).process(dedent(input))
  console.log('result', result.css)
  return [ result.css, dedent(expected) ]
}

test('exports function', () => {
  assert.type(getPostCSSConfig, 'function')
})

test('returns array', () => {
  const postCssPlugins = getPostCSSConfig({
    variables: {
      blue: 'blue-value',
      nice: 'yellow',
    },
  })
  assert.is(Array.isArray(postCssPlugins), true)
})

test('next returns object', () => {
  const postCssPlugins = getPostCSSConfig({
    isNext: true,
    variables: {
      blue: 'blue-value',
      nice: 'yellow',
    },
    // mixins: mixins
  })
  assert.type(postCssPlugins, 'object')
  assert.is(Array.isArray(postCssPlugins), false)
})

test('Processes nested & variables', async () => {
  const input = `
  $localVar: 'cool';
  .foo {
    .nested {
      color: red;
    }
  }
  .bar {
    color: $localVar;
  }
  .parent .foo { color: $blue; }
  `
  const output = `
  .foo .nested {
      color: red;
    }
  .bar {
    color: 'cool';
  }
  .parent .foo { color: blue-value; }`
  const [ result, expected ] = await processCss(input, output)
  assert.equal(result, expected, 'valid css output')
})

test('Math works', async () => {
  const input = `
  $navHeight: 80px;
  .foo {
    content: 'resolve(strip(16cm))';
    font-size: resolve(2 * 8px);
    margin: resolve(4px + resolve(2 * 3px));
    height: resolve($navHeight - 20px);
    padding: resolve(10px + (2px * 3));
  }`
  const output = `
  .foo {
    content: '16';
    font-size: 16px;
    margin: 10px;
    height: 60px;
    padding: 16px;
  }`
  const [ result, expected ] = await processCss(input, output)
  assert.equal(result, expected, 'valid css output')
})

// Exec tests
test.run()
