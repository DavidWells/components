const path = require('path')
const fs = require('fs')
const util = require('util')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('../src')
const YAML = require('js-yaml')
const { testLogger } = require('./utils')

const handleTagsLabel = 'Handles tags'
test(handleTagsLabel, () => {
  const input = `
Conditions:
  IsDev:
    Fn::Equals:
      - Ref: Environment
      - dev
  Deeper:
    IsDev:
      Fn::Equals:
        - Ref: Environment
        - dev
  IsProd:
    !Equals [!Ref Environment, "prod", 'wooo']
  NestedKey:
    TagStyleOr: !Or
      - !Equals [!Ref Environment, 'prod']
      - !Equals [!Ref Environment, 'staging']
`

  const expected =
  `Conditions:
  IsDev: !Equals [!Ref Environment, 'dev']
  Deeper:
    IsDev: !Equals [!Ref Environment, 'dev']
  IsProd: !Equals [!Ref Environment, "prod", 'wooo']
  NestedKey:
    TagStyleOr: !Or
      - !Equals [!Ref Environment, 'prod']
      - !Equals [!Ref Environment, 'staging']`

  const result = stringify(parse(input), {
    originalString: input,
  })

  console.log('result', result)
  /*
  testLogger({
    label: manyTagsLabel,
    input,
    output: result,
    expected,
  })
  /** */

  assert.equal(result, expected)
})

test('FN OR Maintains new line spacing', () => {
  const input = `
Conditions:
  NestedKey:
    TagStyleOr: !Or
      - !Equals [!Ref Environment, 'production']
      - !Equals [!Ref Environment, "staging"]

  MultiLineFnOr:
    Fn::Or:
      - Fn::Equals:
          - Ref: Environment
          - prod
      - Fn::Equals:
          - Ref: Environment
          - foo
`

  const expected =
  `Conditions:
  NestedKey:
    TagStyleOr: !Or
      - !Equals [!Ref Environment, 'production']
      - !Equals [!Ref Environment, "staging"]

  MultiLineFnOr: !Or
    - !Equals [!Ref Environment, 'prod']
    - !Equals [!Ref Environment, 'foo']`

  const result = stringify(parse(input), {
    originalString: input,
  })

  //*
  testLogger({
    label: 'FN OR with equals',
    input,
    output: result,
    expected,
  })
  /** */

  assert.equal(result, expected)
})

test('FN OR Maintains new line spacing with comments', () => {
  const input = `
Conditions:
  NestedKey:
    TagStyleOr: !Or
      - !Equals [!Ref Environment, 'production']
      - !Equals [!Ref Environment, "staging"]


  # comment here
  MultiLineFnOr:
    Fn::Or:
      - Fn::Equals:
          - Ref: Environment
          - prod
      - Fn::Equals:
          - Ref: Environment
          - foo
`

  const expected =
  `Conditions:
  NestedKey:
    TagStyleOr: !Or
      - !Equals [!Ref Environment, 'production']
      - !Equals [!Ref Environment, "staging"]


  # comment here
  MultiLineFnOr: !Or
    - !Equals [!Ref Environment, 'prod']
    - !Equals [!Ref Environment, 'foo']`

  const result = stringify(parse(input), {
    originalString: input,
  })

  //*
  testLogger({
    label: 'FN OR Maintains new line spacing with comments',
    input,
    output: result,
    expected,
  })
  /** */

  assert.equal(result, expected)
})

test.run()
