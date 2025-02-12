const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('../src')
const { testLogger } = require('./utils')

const singleLineString =
`# Basic string
UserData: !Base64 'Hello World'
Foo: bar`

test('!Base64 single line', () => {
  const object = parse(singleLineString)
  const result = stringify(object, {
    originalString: singleLineString,
  })
  console.log('result', result)
  assert.equal(result, singleLineString)
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

const multilineString =
`# Multiple lines
UserDataTwo: !Base64 |
  #!/bin/bash
  echo "Hello"
  yum update -y`

test('!Base64 multiline', () => {
  const object = parse(multilineString)
  const result = stringify(object, {
    originalString: multilineString,
  })
  assert.equal(result, multilineString)
})


test('Verbose Fn::Base64 syntax gets transformed to !Base64', () => {
  const input =

`Resources:
  MyVPC:
    Type: AWS::EC2::VPC
    Foo: !Base64 'bar'
    Bar: !Base64 |
      #!/bin/bash
      echo "lol"
    Properties:
      # Comment on EnableDnsSupport
      EnableDnsSupport:
        Fn::Base64: |
          #!/bin/bash
          echo "VPC_ID=$\{VpcId}"
          echo "Region=$\{AWS::Region}"`

  const object = parse(input)
  const result = stringify(object, {
    originalString: input,
  })

  const expected =
`Resources:
  MyVPC:
    Type: AWS::EC2::VPC
    Foo: !Base64 'bar'
    Bar: !Base64 |
      #!/bin/bash
      echo "lol"
    Properties:
      # Comment on EnableDnsSupport
      EnableDnsSupport: !Base64 |
        #!/bin/bash
        echo "VPC_ID=\${VpcId}"
        echo "Region=\${AWS::Region}"`
  console.log('result', result)
  assert.equal(result, expected)
})


const base64Fixtures =
`# Basic string
UserData: !Sub 'Hello World'
# Multiple lines
UserDataTwo: !Base64 |
  #!/bin/bash
  echo "Hello"
  yum update -y


Simple: !Join
  - 'y'
  - - 'x'
  - - 'z'
  - - !Ref StackName

# In a Join
Command: !Join
  - 'y'
  - - !Base64 'Hello'
    - !Base64 'World'
    -  !Join
      - 'x'
      - - !Base64 'bye'
        - !Base64 'joe'
`


const x =
`OtherKey: hi
JoinViaFnArraySyntax:
  Fn::Join:
    - 'y'
    - ['a', 'b', 'c']
JoinViaFnNestedDashSyntax:
  Fn::Join:
    - 'y'
    - - 'x'
      - 'z'
Simple: !Join [ 'y', ['x', 'z', !Ref StackName] ]
# In a Join`

test.only('!Join', () => {
  const object = parse(x)
  const result = stringify(object, {
    originalString: x,
  })
  console.log('result', result)
  assert.equal(result, x)
})


const base64Label = 'Handles Base64 in various formats'
test(base64Label, () => {
  const object = parse(base64Fixtures)
  const result = stringify(object, {
    originalString: base64Fixtures,
  })
  const expected =
`# Basic string
UserData: !Sub 'Hello World'
# Multiple lines
UserDataTwo: !Base64 |
  #!/bin/bash
  echo "Hello"
  yum update -y

Simple: !Join [ 'y', ['x', 'z', !Ref StackName] ]
# In a Join
Command: !Join
  - 'y'
  - - !Base64 'Hello'
    - !Base64 'World'
    -  !Join
      - 'x'
      - - !Base64 'bye'
        - !Base64 'joe'`

  //*
  testLogger({
    label: base64Label,
    object,
    input: base64Fixtures,
    output: result,
    expected,
  })
  /** */
  // process.exit(0)

  assert.equal(result, expected, 'Should handle Base64 in various formats')

  // Test individual cases from parsed object
  const parsed = parse(result)

  // Basic string
  assert.equal(
    parsed.UserData['Fn::Base64'],
    'Hello World',
    'Should handle basic string Base64'
  )

  // Multiple lines
  assert.ok(
    parsed.UserData['Fn::Base64'].includes('#!/bin/bash'),
    'Should handle multiline Base64'
  )

  // Joining with references
  assert.ok(
    parsed.UserData['Fn::Base64']['Fn::Sub'].includes('${AWS::StackName}'),
    'Should handle Base64 with Sub references'
  )

  // In a Join
  assert.ok(
    Array.isArray(parsed.Command['Fn::Join']),
    'Should handle Base64 within Join'
  )
  assert.equal(
    parsed.Command['Fn::Join'][1][0]['Fn::Base64'],
    'Hello',
    'Should handle first Base64 in Join'
  )
  assert.equal(
    parsed.Command['Fn::Join'][1][1]['Fn::Base64'],
    'World',
    'Should handle second Base64 in Join'
  )

  // With variables
  assert.ok(
    parsed.Message['Fn::Base64']['Fn::Sub'],
    'Should handle Base64 with Sub and variables'
  )
  assert.equal(
    parsed.Message['Fn::Base64']['Fn::Sub'][1].Name['Fn::Ref'],
    'UserName',
    'Should handle variable reference in Base64 Sub'
  )
})

test.run()
