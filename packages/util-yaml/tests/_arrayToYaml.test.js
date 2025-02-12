const { test } = require('uvu')
const assert = require('uvu/assert')
const { arrayToYaml } = require('../src/tags/_array-to-yaml')

test('converts simple array to YAML', () => {
  const input = ['a', 'b', 'c']
  const result = arrayToYaml(input)
  console.log('result', result)
  const expected = `\
- a
- b
- c`
  assert.equal(result, expected)
})

test('handles indentation', () => {
  const input = ['a', 'b', 'c']
  const result = arrayToYaml(input, 2)
  const expected = `\
  - a
  - b
  - c`
  assert.equal(result, expected)
})

test('handles nested arrays', () => {
  const input = ['a', ['b', 'c'], 'd']
  const result = arrayToYaml(input, 2)
  const expected = `\
  - a
  - - b
    - c
  - d`
  assert.equal(result, expected)
})

test('handles objects in arrays', () => {
  const input = [
    'a',
    { Key: 'Name', Value: 'test' },
    'c'
  ]
  const result = arrayToYaml(input, 2)
  console.log('result')
  console.log(result)
  const expected = `\
  - a
  - Key: Name
    Value: test
  - c`
  assert.equal(result, expected)
})

test('handles intrinsic functions', () => {
  const input = [
    'arn:aws:states:',
    { Ref: 'AWS::Region' },
    ':',
    { Ref: 'AWS::AccountId' },
    ':stateMachine:*'
  ]
  const result = arrayToYaml(input, 2)
  const expected = `\
  - arn:aws:states:
  - !Ref AWS::Region
  - :
  - !Ref AWS::AccountId
  - :stateMachine:*`
  assert.equal(result, expected)
})

test('handles empty arrays', () => {
  const input = []
  const result = arrayToYaml(input)
  assert.equal(result, '')
})

test('handles null and undefined values', () => {
  const input = ['a', null, undefined, 'b']
  const result = arrayToYaml(input)
  console.log('result')
  console.log(result)
  const expected = `\
- a
- null
- undefined
- b`
  assert.equal(result, expected)
})

test('handles numbers and booleans', () => {
  const input = [1, true, false, 2.5]
  const result = arrayToYaml(input)
  const expected = `\
- 1
- true
- false
- 2.5`
  assert.equal(result, expected)
})

test('handles complex nested structures', () => {
  const input = [
    'prefix',
    {
      'Fn::Join': [
        '/',
        [
          { Ref: 'AWS::StackName' },
          { 'Fn::Join': ['.', [{ Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }]] }
        ]
      ]
    },
    'suffix'
  ]
  const result = arrayToYaml(input, 2)
  console.log('result')
  console.log(result)
  const expected = `\
  - prefix
  - !Join
    - '/'
    - - !Ref AWS::StackName
      - !Join
        - '.'
        - - !Ref AWS::Region
          - !Ref AWS::AccountId
  - suffix`
  assert.equal(result, expected)
})

test('handles deeply nested arrays (5 levels)', () => {
  const input = [
    'level1',
    [
      'level2-a',
      [
        'level3-a',
        [
          'level4-a',
          [
            'level5-a',
            'level5-b'
          ],
          'level4-b'
        ],
        'level3-b'
      ],
      'level2-b'
    ],
    'level1-end'
  ]
  const result = arrayToYaml(input, 2)
  const expected = `\
  - level1
  - - level2-a
    - - level3-a
      - - level4-a
        - - level5-a
          - level5-b
        - level4-b
      - level3-b
    - level2-b
  - level1-end`
  assert.equal(result, expected)
})

test('handles deeply nested arrays (5 levels) with single quotes', () => {
  const input = [
    'level1',
    [
      'level2\'s-a',
      [
        'level3\'s-a',
        [
          'level4\'s-a',
          [
            'level5\'s-a',
            'level5\'s-b'
          ],
          'level4\'s-b'
        ],
        'level3\'s-b'
      ],
      'level2\'s-b'
    ],
    'level1\'s-end'
  ]
  const result = arrayToYaml(input, 2)
  const expected = `\
  - level1
  - - level2's-a
    - - level3's-a
      - - level4's-a
        - - level5's-a
          - level5's-b
        - level4's-b
      - level3's-b
    - level2's-b
  - level1's-end`
  assert.equal(result, expected)
})

test('handles deeply nested arrays (5 levels) with double quotes', () => {
  const input = [
    'level1',
    [
      'level2"s-a',
      [
        'level3"s-a',
        [
          'level4"s-a',
          [
            'level5"s-a',
            'level5"s-b'
          ],
          'level4"s-b'
        ],
        'level3"s-b'
      ],
      'level2"s-b'
    ],
    'level1"s-end'
  ]
  const result = arrayToYaml(input, 2)
  const expected = `\
  - level1
  - - level2"s-a
    - - level3"s-a
      - - level4"s-a
        - - level5"s-a
          - level5"s-b
        - level4"s-b
      - level3"s-b
    - level2"s-b
  - level1"s-end`
  assert.equal(result, expected)
})

test('handles single quotes', () => {
  const input = [
    'no quotes',
    'single\'s quote',
    'multiple\'s \'quotes\'',
    'quote at end\'',
    '\'quote at start',
    '\'quotes\' in \'middle\''
  ]
  const result = arrayToYaml(input, 2)
  const expected = `\
  - no quotes
  - single's quote
  - multiple's 'quotes'
  - quote at end'
  - 'quote at start
  - 'quotes' in 'middle'`
  assert.equal(result, expected)
})

test('handles double quotes', () => {
  const input = [
    'no quotes',
    'double"s quote',
    'multiple"s "quotes"',
    'quote at end"',
    '"quote at start',
    '"quotes" in "middle"'
  ]
  const result = arrayToYaml(input, 2)
  const expected = `\
  - no quotes
  - double"s quote
  - multiple"s "quotes"
  - quote at end"
  - "quote at start
  - "quotes" in "middle"`
  assert.equal(result, expected)
})

test('handles single quotes in arrays', () => {
  const input = [
    "no quotes",
    "single's quote",
    "multiple's 'quotes'",
    "quote at end'",
    "'quote at start",
    "'quotes' in 'middle'"
  ]
  const result = arrayToYaml(input, 2, { quoteType: 'single' })
  const expected = `\
  - 'no quotes'
  - 'single\\'s quote'
  - 'multiple\\'s \\'quotes\\''
  - 'quote at end\\''
  - '\\'quote at start'
  - '\\'quotes\\' in \\'middle\\''`

  console.log('expected')
  console.log(expected)
  assert.equal(result, expected)
})

test('handles double quotes in arrays', () => {
  const input = [
    'no quotes',
    'double"s quote',
    'multiple"s "quotes"',
    'quote at end"',
    '"quote at start',
    '"quotes" in "middle"'
  ]
  const result = arrayToYaml(input, 2, { quoteType: 'double' })
  const expected = `\
  - "no quotes"
  - "double\\"s quote"
  - "multiple\\"s \\"quotes\\""
  - "quote at end\\""
  - "\\"quote at start"
  - "\\"quotes\\" in \\"middle\\""`
  assert.equal(result, expected)
})

test('handles mixed quotes in arrays', () => {
  const input = [
    'single\'s quote',
    'double"s quote',
    'mixed\'s and "double" quotes',
    'no quotes',
    'quotes at end\'',
    'quotes at "start"'
  ]
  const result = arrayToYaml(input, 2)
  const expected = `\
  - single's quote
  - double"s quote
  - mixed's and "double" quotes
  - no quotes
  - quotes at end'
  - quotes at "start"`
  assert.equal(result, expected)
})

test('handles deeply nested objects in arrays', () => {
  const input = [
    'start',
    {
      TopLevel: 'value',
      Nested: {
        SecondLevel: 'value2',
        Array: ['a', 'b', 'c'],
        DeepNested: {
          ThirdLevel: 'value3',
          Numbers: [1, 2, 3],
          Mixed: {
            String: 'value4',
            Number: 42,
            Boolean: true,
            RefExample: { Ref: 'MyResource' },
            JoinExample: { 'Fn::Join': ['/', ['a', 'b', 'c']] },
            SubExample: { 'Fn::Sub': '${AWS::Region}' }
          }
        }
      },
      EndLevel: 'end'
    },
    'finish'
  ]
  const result = arrayToYaml(input, 2)
  console.log('result')
  console.log(result)
  const expected = `\
  - start
  - TopLevel: value
    Nested:
      SecondLevel: value2
      Array:
        - a
        - b
        - c
      DeepNested:
        ThirdLevel: value3
        Numbers:
          - 1
          - 2
          - 3
        Mixed:
          String: value4
          Number: 42
          Boolean: true
          RefExample: !Ref MyResource
          JoinExample: !Join
            - '/'
            - - a
              - b
              - c
          SubExample: !Sub "\${AWS::Region}"
    EndLevel: end
  - finish`
  assert.equal(result, expected)
})

test.run()
