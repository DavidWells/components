const path = require('path')
const fs = require('fs')
const util = require('util')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('./')
const YAML = require('js-yaml')

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

test('FN OR with equals', () => {
  const input = `
Conditions:
  Spaz:
    IsMultiAZ: !Or
      - !Equals [!Ref Environment, 'prod']
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
      - !Equals [!Ref Environment, 'prod']
      - !Equals [!Ref Environment, "staging"]
  IsMultiAZ: !Or
    - !Equals [!Ref Environment, 'prod']
    - !Equals [!Ref Environment, 'foo']`

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

test('FN Join', () => {
  const input =
`ShortJoinMultiline: !Join # comment
  - "/"
  - - "fold"
  - - "bar"
  - - "more"`

  const expected =
`ShortJoinMultiline: !Join # comment
  [ "/", [ "fold",  "bar",  "more"] ]`

  const result = stringify(parse(input), {
    originalString: input,
  })

  console.log('result', result)
  assert.equal(result, expected)

    const inputTwo =
`# leading comment
ShortJoinMultiline: !Join
  - "/"
  - - "fold"
  - - "bar"
  - - "more"`

  const expectedTwo =
`# leading comment
ShortJoinMultiline: !Join [ "/", [ "fold",  "bar",  "more"] ]`

  const resultTwo = stringify(parse(inputTwo), {
    originalString: inputTwo,
  })

  console.log('resultTwo', resultTwo)
  assert.equal(resultTwo, expectedTwo)
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
  ShortJoin: !Join ["-", ["foo", "bar"]]
  ShortJoinWithRef: !Join ["-", ["foo", "bar", !Ref Environment]]
  # With comments
  ShortJoinMultiline: !Join [ "/", [ "fold",  "bar",  "more"] ]
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

const manyTagsLabel = 'Handles many tags'
test.only(manyTagsLabel, () => {
  const inputx = `
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

const inputy =
`AWSTemplateFormatVersion: '2010-09-09'
Conditions:
  IsDev:
    Fn::Equals:
      - Ref: Environment
      - dev`

const input =
`Deeper:
  Simple: !GetAZs us-east-1
  Test:
    Fn::GetAZs:
      Ref: "AWS::Region"`


const inputxx = `
AWSTemplateFormatVersion: '2010-09-09'
Conditions:
  IsDev:
    Fn::Equals:
      - Ref: Environment
      - dev
  IsMultiAZTwo:
    Fn::Or:
      - Fn::Equals:
          - Ref: Environment
          - dev
      - Fn::Equals:
          - Ref: Environment
          - staging
  IsProd: !Equals [!Ref Environment, 'prod']
  IsMultiAZ: !Or
    - !Equals [!Ref Environment, 'prod']
    - !Equals [!Ref Environment, 'staging']

Resources:
  MyVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Cidr
        - !Ref BaseIP
        - 2
        - 8

  MyLoadBalancer:
    Type: AWS::ElasticLoadBalancing::LoadBalancer
    Condition: !Condition IsProd
    Ref: !Ref Testing
    Properties:
      AvailabilityZones: !GetAZs 'us-east-1'
      UserData: !Base64 |
        #!/bin/bash
        yum update -y
  # with
  MyDBInstance: #comments
    Type: AWS::RDS::DBInstance
    Properties:
      DBName: !ImportValue SharedDBName
  `

  const expected = `AWSTemplateFormatVersion: "2010-09-09"
Conditions:
  IsDev: !Equals [!Ref Environment, 'dev']
  IsMultiAZTwo: !Or
    - !Equals [!Ref Environment, 'dev']
    - !Equals [!Ref Environment, 'staging']
  IsProd: !Equals [!Ref Environment, 'prod']
  IsMultiAZ: !Or
    - !Equals [!Ref Environment, 'prod']
    - !Equals [!Ref Environment, 'staging']

Resources:
  MyVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Cidr
        - !Ref BaseIP
        - 2
        - 8

  MyLoadBalancer:
    Type: AWS::ElasticLoadBalancing::LoadBalancer
    Condition: !Condition IsProd
    Ref: !Ref Testing
    Properties:
      AvailabilityZones: !GetAZs us-east-1
      UserData: !Base64 |
        #!/bin/bash
        yum update -y
  # with
  MyDBInstance: #comments
    Type: AWS::RDS::DBInstance
    Properties:
      DBName: !ImportValue SharedDBName`

  const result = stringify(parse(input), {
    originalString: input,
  })

  console.log('result', result)
  //process.exit(0)

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


function wrapDateString(str, date, quoteType = `"`)  {
  const pattern = new RegExp(`${date}`, 'g')
  return str.replace(pattern, `${quoteType}${date}${quoteType}`)
}


function read(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

// function deepLog(objOrLabel, logVal) {
//   let obj = objOrLabel
//   if (typeof objOrLabel !== 'object') {
//     obj = logVal
//     const prefix = (arguments.length > 1) ? '> ' : ``
//     console.log(`\x1b[33m\n${prefix}${objOrLabel}\x1b[0m`)
//   }
//   if (typeof obj === 'object') {
//     console.log(util.inspect(obj, false, null, true))
//     return
//   }
//   if (arguments.length <= 1) return
//   console.log(arguments[1])
// }

function logValue(value, isFirst, isLast) {
  const prefix = `${isFirst ? '> ' : ''}`
  if (typeof value === 'object') {
    console.log(`${prefix}${util.inspect(value, false, null, true)}\n`)
    return
  }
  if (isFirst) {
    console.log(`\n\x1b[33m${prefix}${value}\x1b[0m`)
    return
  }
  console.log((typeof value === 'string' && value.includes('\n')) ? `\`${value}\`` : value)
  // isLast && console.log(`\x1b[37m\x1b[1m${'─'.repeat(94)}\x1b[0m\n`)
}

function deepLog() {
  for (let i = 0; i < arguments.length; i++) logValue(arguments[i], i === 0, i === arguments.length - 1)
}

test.run()
