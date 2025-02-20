const { test } = require('uvu')
const assert = require('uvu/assert')
const { makeSlug, smartSlugger } = require('./slugger')

test('makeSlug - basic slugification', () => {
  assert.is(makeSlug('Hello World'), 'hello-world')
  assert.is(makeSlug('Hello  World'), 'hello--world')
  assert.is(makeSlug('hello-world'), 'hello-world')
  assert.is(makeSlug('fs.rename(oldPath, newPath, [callback])'), 'fsrenameoldpath-newpath-callback')
  assert.is(makeSlug(''), '')
  assert.is(makeSlug(), '')
})

test('makeSlug - strips special characters', () => {
  assert.is(makeSlug('Hello! World?'), 'hello-world')
  assert.is(makeSlug('Hello (World)'), 'hello-world')
  assert.is(makeSlug('Hello & World'), 'hello--world')
  assert.is(makeSlug('Hello@World'), 'helloworld')
  assert.is(makeSlug('Hello/World'), 'helloworld')
})

test('makeSlug - handles numbers', () => {
  assert.is(makeSlug('Chapter 1'), 'chapter-1')
  assert.is(makeSlug('1. Introduction'), '1-introduction')
  assert.is(makeSlug('Version 2.0.1'), 'version-201')
})

test('smartSlugger - basic usage', () => {
  const slugger = smartSlugger()
  assert.is(slugger('Hello World'), 'hello-world')
  assert.is(slugger('Different Text'), 'different-text')
})

test('smartSlugger - handles duplicates', () => {
  const slugger = smartSlugger()
  assert.is(slugger('Hello World'), 'hello-world')
  assert.is(slugger('Hello World'), 'hello-world-1')
  assert.is(slugger('Hello World'), 'hello-world-2')
  assert.is(slugger('Hello World 1'), 'hello-world-1-1')
  assert.is(slugger('Hello World 1'), 'hello-world-1-2')
  assert.is(slugger('Hello World 1 2'), 'hello-world-1-2-1')
  assert.is(slugger('Hello World 1 2'), 'hello-world-1-2-2')
  assert.is(slugger('Hello World 2'), 'hello-world-2-1')
  assert.is(slugger('Hello World 2'), 'hello-world-2-2')
  assert.is(slugger('Hello World 2 1'), 'hello-world-2-1-1')
  assert.is(slugger('Hello World 2 1'), 'hello-world-2-1-2')
  assert.is(slugger('Hello World 3'), 'hello-world-3')
})

test('smartSlugger - custom function', () => {
  const customSlugger = (text) => text.toLowerCase().replace(/\s+/g, '_')
  const slugger = smartSlugger(customSlugger)

  assert.is(slugger('Hello World'), 'hello_world')
  assert.is(slugger('Hello World'), 'hello_world-1')
})

test('smartSlugger - maintains separate counters', () => {
  const slugger = smartSlugger()
  assert.is(slugger('Hello World'), 'hello-world')
  assert.is(slugger('Different Text'), 'different-text')
  assert.is(slugger('Hello World'), 'hello-world-1')
  assert.is(slugger('Different Text'), 'different-text-1')
})

test.run()
