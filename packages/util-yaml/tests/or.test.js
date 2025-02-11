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
  Spaz:
    IsMultiAZ: !Or
      - !Equals [!Ref Environment, 'prod']
      - !Equals [!Ref Environment, 'staging']
`

  const expected =
  `Conditions:
  IsDev: !Equals [!Ref Environment, 'dev']
  Deeper:
    IsDev: !Equals [!Ref Environment, 'dev']
  IsProd: !Equals [!Ref Environment, "prod", 'wooo']
  Spaz:
    IsMultiAZ: !Or
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

test.only('FN OR with equals', () => {
  const input = `
Conditions:
  Spaz:
    deep:
      Rad: !Or
        - !Equals [!Ref Environment, 'production']
        - !Equals [!Ref Environment, "staging"]
    # chill
    NICEEEEEEEEEEEEEEEE: !Or
      - !Equals [!Ref Environment, 'production']
      - !Equals [!Ref Environment, "staging"]
  IsMultiAZ:
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
  Spaz:
    IsMultiAZ: !Or
      - !Equals [!Ref Environment, 'production']
      - !Equals [!Ref Environment, "staging"]
  IsMultiAZ: !Or
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

test.run()
