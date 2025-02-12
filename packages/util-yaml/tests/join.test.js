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

const deep =
`Array:
  - !Join
    - ''
    - - 'arn:aws:states:'
      - !Join
        - ':'
        - - !Ref AWS::Region
          - !Join
            - '/'
            - - !Ref AWS::AccountId
              - !Join
                - '-'
                - - 'stateMachine'
                  - !Ref Environment
                  - !Ref ServiceName`

test('FN Join CF', () => {

const inputDeepNested =
`Resources:
  DefaultLambdaHanderRoleA44A3BA8:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Statement:
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: apigateway.amazonaws.com
        Version: "2012-10-17"
    Metadata:
      aws:cdk:path: PowerTunerInfraStack/DefaultLambdaHanderRole/Resource
  DefaultLambdaHanderRoleDefaultPolicy40E2D129:
    Type: AWS::IAM::Policy
    Properties:
      PolicyDocument:
        Statement:
          - Action: states:StartExecution
            Effect: Allow
            Resource:
              Fn::Join:
                - ''
                - - 'arn:aws:states:'
                  - Fn::Join:
                      - ':'
                      - - !Ref AWS::Region
                        - Fn::Join:
                            - '/'
                            - - !Ref AWS::AccountId
                              - Fn::Join:
                                  - '-'
                                  - - 'stateMachine'
                                    - !Ref Environment
                                    - !Ref ServiceName`

  const result = stringify(parse(inputDeepNested), {
    originalString: inputDeepNested,
  })

  console.log('result', result)

  const deepNestedExpected =
`Resources:
  DefaultLambdaHanderRoleA44A3BA8:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Statement:
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: apigateway.amazonaws.com
        Version: "2012-10-17"
    Metadata:
      aws:cdk:path: PowerTunerInfraStack/DefaultLambdaHanderRole/Resource
  DefaultLambdaHanderRoleDefaultPolicy40E2D129:
    Type: AWS::IAM::Policy
    Properties:
      PolicyDocument:
        Statement:
          - Action: states:StartExecution
            Effect: Allow
            Resource: !Join
              - ''
              - - 'arn:aws:states:'
                - !Join
                  - ':'
                  - - !Ref AWS::Region
                    - !Join
                      - '/'
                      - - !Ref AWS::AccountId
                        - !Join
                          - '-'
                          - - 'stateMachine'
                            - !Ref Environment
                            - !Ref ServiceName`

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

  //*
  testLogger({
    label: 'join cf',
    input: inputDeepNested,
    output: result,
    expected: deepNestedExpected,
  })
  /** */

  // process.exit(0)

  assert.equal(result, deepNestedExpected)
})


test.skip('DEEEEEEEEP', () => {

const inputDeepNested =
`Resources:
  DefaultLambdaHanderRoleA44A3BA8:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Statement:
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: apigateway.amazonaws.com
        Version: "2012-10-17"
    Metadata:
      aws:cdk:path: PowerTunerInfraStack/DefaultLambdaHanderRole/Resource
  DefaultLambdaHanderRoleDefaultPolicy40E2D129:
    Type: AWS::IAM::Policy
    Properties:
      PolicyDocument:
        Statement:
          - Action: states:StartExecution
            Effect: Allow
            Resource:
              Fn::Join:
                - ''
                - - 'arn:aws:states:'
                  - Fn::Join:
                      - ':'
                      - - !Ref AWS::Region
                        - Fn::Join:
                            - '/'
                            - - !Ref AWS::AccountId
                              - Fn::Join:
                                  - '-'
                                  - - 'stateMachine'
                                    - !Ref Environment
                                    - !Ref ServiceName`

  const result = stringify(parse(inputDeepNested), {
    originalString: inputDeepNested,
  })

  console.log('result', result)

  const deepNestedExpected =
`Resources:
  DefaultLambdaHanderRoleA44A3BA8:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Statement:
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: apigateway.amazonaws.com
        Version: "2012-10-17"
    Metadata:
      aws:cdk:path: PowerTunerInfraStack/DefaultLambdaHanderRole/Resource
  DefaultLambdaHanderRoleDefaultPolicy40E2D129:
    Type: AWS::IAM::Policy
    Properties:
      PolicyDocument:
        Statement:
          - Action: states:StartExecution
            Effect: Allow
            Resource: !Join
              - ''
              - - 'arn:aws:states:'
                - !Join
                  - ':'
                  - - !Ref AWS::Region
                    - !Join
                      - '/'
                      - - !Ref AWS::AccountId
                        - !Join
                          - '-'
                          - - 'stateMachine'
                            - !Ref Environment
                            - !Ref ServiceName`


  //*
  testLogger({
    label: 'join cf',
    input: inputDeepNested,
    output: result,
    expected: deepNestedExpected,
  })
  /** */

  assert.equal(result, deepNestedExpected)
})

test.run()
