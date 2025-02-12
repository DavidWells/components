const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('../src')
const { testLogger, deepLog } = require('./utils')

test.only('Verbose Syntax', () => {
const inpuxt =

`Resources:
  MyVPC:
    Type: AWS::EC2::VPC
    Foo: !Base64 'bar'
    Bar: !Base64 |
      #!/bin/bash
      echo "lol"
    Properties:
      EnableDnsSupport:
        Fn::Base64: |
          #!/bin/bash
          echo "VPC_ID=$\{VpcId}"
          echo "Region=$\{AWS::Region}"`

const input =
`
AWSTemplateFormatVersion: '2010-09-09'
Parameters:
  Environment:
    Type: String
    Default: dev
  CidrBlock:
    Type: String
    Default: 10.0.0.0/16

Mappings:
  EnvironmentMap:
    dev:
      instanceType: t3.micro
    prod:
      instanceType: t3.small

Resources:
  MyVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Ref CidrBlock
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value:
            Fn::Join:
              - '-'
              - - 'vpc'
                - !Ref Environment

  MySubnets:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId:
        !Ref MyVPC
      CidrBlock:
        Fn::Select:
          - 0
          - Fn::Cidr:
              - !Ref CidrBlock
              - 2
              - 8

  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType:
        Fn::FindInMap:
          - EnvironmentMap
          - !Ref Environment
          - instanceType
      ImageId:
        Fn::ImportValue: LatestAmiId
      UserData:
        Fn::Base64:
          Fn::Sub:
            - |
              #!/bin/bash
              echo "VPC_ID=$\{VpcId}"
              echo "Region=$\{AWS::Region}"
            - VpcId:
                !Ref MyVPC

  MyLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name:
        Fn::Split:
          - '/'
          - Fn::GetAtt:
              - MyInstance
              - PrivateDnsName

  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName:
        Fn::Transform:
          Name: 'String'
          Parameters:
            InputString:
              Fn::Join:
                - '-'
                - - 'bucket'
                  - !Ref AWS::Region
                  - !Ref AWS::AccountId
            Operation: 'Lower'

Outputs:
  VpcId:
    Value: !Ref MyVPC
`

  const result = stringify(parse(input), {
    originalString: input,
  })

  console.log('result', result)
  process.exit(0)

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
    input,
    output: result,
    expected,
  })
  /** */
  assert.equal(result, expected)
})

test.run()
