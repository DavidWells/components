const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('../src')
const { testLogger, deepLog } = require('./utils')

const joinLabel = 'Handles basic Join with comments'
test(joinLabel, () => {
  const input =
`ShortJoinMultiline: !Join # comment
  - "/"
  - - "fold"
  - - "bar"
  - - "more"`

  const expected =
`ShortJoinMultiline: !Join # comment
  [ "/", ["fold", "bar", "more"] ]`

  const result = stringify(parse(input), {
    originalString: input,
  })

  //*
  testLogger({
    label: joinLabel,
    input,
    output: result,
    expected,
  })
  /** */

  assert.equal(result, expected, 'Should handle basic Join with comments')
})

const joinWithCommentsLabel = 'Handles Join with leading and trailing comments'
test(joinWithCommentsLabel, () => {
  const input =
`# leading comment
ShortJoinMultiline: !Join
  - "/"
  - - "fold"
  - - "bar"
  - - "more"
# trailing comment`

  const expected =
`# leading comment
ShortJoinMultiline: !Join [ "/", ["fold", "bar", "more"] ]
# trailing comment`

  const result = stringify(parse(input), {
    originalString: input,
  })

  //*
  testLogger({
    label: joinWithCommentsLabel,
    input,
    output: result,
    expected,
  })
  /** */

  assert.equal(result, expected, 'xxxShould handle Join with leading comments')
})

const joinWithCommentsAfterTag = 'Handles Join with leading comments after tag'
test(joinWithCommentsAfterTag, () => {
  const input =
`# leading comment
ShortJoinMultiline: !Join # comment
  - "/"
  - - "fold"
  - - "bar"
  - - "more"
# trailing comment`

  const expected =
`# leading comment
ShortJoinMultiline: !Join # comment
  [ "/", ["fold", "bar", "more"] ]
# trailing comment`

  const result = stringify(parse(input), {
    originalString: input,
  })

  //*
  testLogger({
    label: joinWithCommentsLabel,
    input,
    output: result,
    expected,
  })
  /** */

  assert.equal(result, expected, 'Should handle Join with leading comments')
})


const joinWithCommentsAfterArray = 'Handles Join with leading comments after array'
test.skip(joinWithCommentsAfterArray, () => {
  const input =
`# leading comment
ShortJoinMultiline: !Join # comment
  - "/"
  - - "fold" # comment on key
  - - "bar"
  - - "more"
# trailing comment`

  const expected =
`# leading comment
ShortJoinMultiline: !Join # comment
  - "/"
  - - "fold" # comment on key
  - - "bar"
  - - "more"
# trailing comment`

  const result = stringify(parse(input), {
    originalString: input,
  })

  //*
  testLogger({
    label: joinWithCommentsLabel,
    input,
    output: result,
    expected,
  })
  /** */

  assert.equal(result, expected, 'Should handle Join with leading comments')
})

test('ref', () => {
  const input =
`Conditions:
  ShortJoin: !Join ["-", ["foo", "bar"]]
  ShortJoinWithRef: !Join ["-", ["foo", "bar", !Ref Environment]]`

  const result = stringify(parse(input), {
    originalString: input,
  })

  const expected =
`Conditions:
  ShortJoin: !Join [ "-", ["foo", "bar"] ]
  ShortJoinWithRef: !Join [ "-", ["foo", "bar", !Ref Environment] ]`

  //*
  testLogger({
    label: 'ref',
    input,
    output: result,
    expected,
  })
  /** */

  assert.equal(result, expected)
})

test('FN Join', () => {
  const shortInput =
`Conditions:
  ShortJoinWithRef: !Join ["-", "foo", "bar", !Ref Environment]`
const input =
`Conditions:
  ShortJoin: !Join ["-", ["foo", "bar"]]
  ShortJoinWithRef: !Join ["-", ["foo", "bar", !Ref Environment]]
  # With comments
  ShortJoinMultiline: !Join
    - "/"
    - - "fold"
    - - "bar"
    - - "more"
  LongJoinMultiline: !Join
    - "-"
    - - "fold"
    - - "bar"
    - - "more"
    - - "lines"
    - - "fold"
    - - !Ref Environment
    - - "more"
    - - "lines"
    - - "fold"
    - - "bar"
    - - "more"
  JoinedCondition: !Join
  - ""
  - - !Join
      - "-"
      - - !Ref Environment
        - !Join
          - "/"
          - - !Ref AWS::StackName
            - !Join
              - "."
              - - !Ref AWS::Region
                - !Ref AWS::AccountId`

  const result = stringify(parse(input), {
    originalString: input,
  })

  console.log('result', result)

  const expected =
`Conditions:
  ShortJoin: !Join [ "-", ["foo", "bar"] ]
  ShortJoinWithRef: !Join [ "-", ["foo", "bar", !Ref Environment] ]
  # With comments
  ShortJoinMultiline: !Join [ "/", ["fold", "bar", "more"] ]
  LongJoinMultiline: !Join
    - "-"
    - - "fold"
    - - "bar"
    - - "more"
    - - "lines"
    - - "fold"
    - - !Ref Environment
    - - "more"
    - - "lines"
    - - "fold"
    - - "bar"
    - - "more"
  JoinedCondition: !Join
    - ""
    - - !Join
      - "-"
      - - !Ref Environment
        - !Join
          - "/"
          - - !Ref AWS::StackName
            - !Join
              - "."
              - - !Ref AWS::Region
                - !Ref AWS::AccountId`

  assert.equal(result, expected)
})

test.run()
