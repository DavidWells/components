const { test } = require('uvu')
const assert = require('uvu/assert')
const { resolveValue, hasIntrinsicFn } = require('../src/utils/resolve')
const { testLogger } = require('./utils')

test('resolves basic Ref', () => {
  const input = { 'Fn::Ref': 'MyVPC' }
  const result = resolveValue(input)
  assert.equal(result, '!Ref MyVPC')
})

test('resolves nested functions', () => {
  const input = {
    'Fn::Join': [
      '',
      [
        'arn:aws:states:',
        { 'Fn::Ref': 'AWS::Region' },
        ':',
        { 'Fn::Ref': 'AWS::AccountId' },
        ':stateMachine:*'
      ]
    ]
  }
  const result = resolveValue(input)
  // console.log('result', result)
  // process.exit(0)
  assert.equal(
    result,
    '!Join ["", [ "arn:aws:states:", !Ref AWS::Region, ":", !Ref AWS::AccountId, ":stateMachine:*" ] ]'
  )
})

test('resolves Sub with variables', () => {
  const input = {
    'Fn::Sub': [
      '#!/bin/bash\necho "VPC_ID=${VpcId}"\necho "Region=${AWS::Region}"\n',
      { VpcId: { 'Fn::Ref': 'MyVPC' } }
    ]
  }
  const result = resolveValue(input)
  console.log('result', result)
  assert.equal(
    result[0],
    '!Sub'
  )
  assert.equal(
    result[1],
    '#!/bin/bash\necho "VPC_ID=${VpcId}"\necho "Region=${AWS::Region}"\n'
  )
  assert.equal(
    result[2].VpcId,
    '!Ref MyVPC'
  )
})

test('detects intrinsic functions', () => {
  assert.ok(hasIntrinsicFn({ 'Fn::Ref': 'MyVPC' }))
  assert.ok(hasIntrinsicFn({
    Prop: { 'Fn::GetAtt': ['Resource', 'Arn'] }
  }))
  assert.ok(!hasIntrinsicFn({ foo: 'bar' }))
  assert.ok(!hasIntrinsicFn(['a', 'b', 'c']))
})

test('resolves deeply nested joins', () => {
  const input = [
    '',
    [
      'arn:aws:states:',
      {
        'Fn::Join': [
          ':',
          [
            { 'Fn::Ref': 'AWS::Region' },
            {
              'Fn::Join': [
                '/',
                [
                  { 'Fn::Ref': 'AWS::AccountId' },
                  {
                    'Fn::Join': [
                      '-',
                      [
                        'stateMachine',
                        { 'Fn::Ref': 'Environment' },
                        { 'Fn::Ref': 'ServiceName' }
                      ]
                    ]
                  }
                ]
              ]
            }
          ]
        ]
      }
    ]
  ]

  const result = resolveValue(input)


  const expected =
  [
    '',
    [
      'arn:aws:states:',
      '!Join [":", [ !Ref AWS::Region, !Join ["/", [ !Ref AWS::AccountId, !Join ["-", [ "stateMachine", !Ref Environment, !Ref ServiceName ] ] ] ] ] ]'
    ]
  ]

  //*
  testLogger({
    label: 'deeply nested joins',
    input,
    output: result,
    expected: expected
  })
  /** */


  assert.equal(result, expected, 'result should match expected')

  // Verify the structure
  assert.equal(result[0], '')
  assert.equal(result[1][0], 'arn:aws:states:')

  // Verify the nested joins are properly resolved
  const joinStr = result[1][1]
  assert.ok(joinStr.includes('!Join [":',))
  assert.ok(joinStr.includes('!Ref AWS::Region'))
  assert.ok(joinStr.includes('!Join ["/',))
  assert.ok(joinStr.includes('!Ref AWS::AccountId'))
  assert.ok(joinStr.includes('!Join ["-",'))
  assert.ok(joinStr.includes('!Ref Environment'))
  assert.ok(joinStr.includes('!Ref ServiceName'))
})

test.run()
