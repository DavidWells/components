const path = require('path')
const fs = require('fs')
const util = require('util')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('../src')
const YAML = require('js-yaml')
const { testLogger } = require('./utils')

const manyTagsLabel = 'Handles many tags'
test(manyTagsLabel, () => {
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

const inputa =
`Deeper:
  Simple: !GetAZs us-east-1
  Test:
    Fn::GetAZs:
      Ref: "AWS::Region"`


const input = `
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

test.run()
