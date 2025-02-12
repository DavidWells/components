const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('../src')
const { testLogger } = require('./utils')

const singleLineString =
`# Basic string
UserData: !Sub 'Hello World'
UserDataTwo:
  Fn::Sub:
    - |
      #!/bin/bash
      echo "VPC_ID=$\{VpcId}"
      echo "Region=$\{AWS::Region}"

    # comment
    - VpcId:
        !Ref MyVPC
      NoWay: 'bar'
# comment
Foo: bar`

test('!Sub test', () => {
  const object = parse(singleLineString)
  const result = stringify(object, {
    originalString: singleLineString,
  })
  console.log('result', result)

  const expected =
`# Basic string
UserData: !Sub 'Hello World'
UserDataTwo: !Sub
  - |
    #!/bin/bash
    echo "VPC_ID=$\{VpcId}"
    echo "Region=$\{AWS::Region}"

  - VpcId: !Ref MyVPC
    NoWay: bar
# comment
Foo: bar`

  testLogger({
    label: '!Sub test',
    object,
    input: singleLineString,
    output: result,
    expected,
  })

  assert.equal(result, expected)
})

const singleLineStringWithOtherProp =
`# Basic string
UserData: !Base64 'Hello World'
Foo: bar`

test('!Base64 single line with other prop', () => {
  const object = parse(singleLineStringWithOtherProp)
  const result = stringify(object, {
    originalString: singleLineStringWithOtherProp,
  })
  console.log('result', result)
  assert.equal(result, singleLineStringWithOtherProp)
})

const singleLineStringWithNewline =
`# Basic string
UserData: !Base64 'Hello World'

Foo: bar`

test('!Base64 single line with newline', () => {
  const object = parse(singleLineStringWithNewline)
  const result = stringify(object, {
    originalString: singleLineStringWithNewline,
  })
  console.log('result', result)
  assert.equal(result, singleLineStringWithNewline)
})

const multiLineStringWithLambda =
`Resources:
  MyLambdaFunction:
    Type: AWS::Lambda::Function
    Properties:
      Code:
        ZipFile: !Sub |
          exports.handler = async (event) => {
            console.log('Stack name: \${AWS::StackName}')
            console.log('Region: \${AWS::Region}')
            console.log('Bucket: \${BucketName}')
            return {
              statusCode: 200,
              body: JSON.stringify({ bucket: '\${BucketName}' })
            }
          }


      Environment:
        Variables:
          BUCKET_NAME: !Ref BucketName`

test.only('!Sub multi line with lambda', () => {
  const object = parse(multiLineStringWithLambda)
  const result = stringify(object, {
    originalString: multiLineStringWithLambda,
  })
  console.log('result', result)
  assert.equal(result, multiLineStringWithLambda)
})

const multiLineString =
`# Basic string
SubWithSingleQuotes: !Sub 'Hello World'
SubWithDoubleQuotes: !Sub "Hello Bobby"
SubWithSingleQuoteRef: !Sub 'Hello $\{AWS::StackName}'
SubWithDoubleQuoteRef: !Sub "Hello $\{AWS::StackName}"
SubWithNoQuotes: !Sub \${AWS::StackName}-processor
MultiLineSub:
  FunctionName: !Sub
    - \${StackName}-\${Environment}-processor-\${CustomName}
    - Environment: prod
      # with comments
      StackName: !Ref AWS::StackName
      CustomName: rad
MultiLineSubWithSingleQuotes:
  FunctionName: !Sub
    - '\${StackName}-\${Environment}-processor-\${CustomName}'
    - Environment: prod
      StackName: !Ref AWS::StackName
      CustomName: nice
MultiLineSubWithDoubleQuotes:
  FunctionName: !Sub
    - "\${StackName}-\${Environment}-processor-\${CustomName}"
    - Environment: prod
      StackName: !Ref AWS::StackName
      CustomName: cool
MultiLineArraySub: !Sub
  - |
    #!/bin/bash
    echo "Stack: \${StackName}"
    echo "Environment: \${Env}"
    aws s3 cp s3://\${BucketName}/config.json /etc/config.json
Resources:
  MyLambdaFunction:
    Type: AWS::Lambda::Function
    Properties:
      Code:
        ZipFile: !Sub |
          exports.handler = async (event) => {
            console.log('Stack name: \${AWS::StackName}')
            console.log('Region: \${AWS::Region}')
            console.log('Bucket: \${BucketName}')
            return {
              statusCode: 200,
              body: JSON.stringify({ bucket: '\${BucketName}' })
            }
          }
      Environment:
        Variables:
          BUCKET_NAME: !Ref BucketName`

test('!Sub multi line', () => {
  const object = parse(multiLineString)
  const result = stringify(object, {
    originalString: multiLineString,
  })
  console.log('result', result)
  assert.equal(result, multiLineString)
})

test.run()
