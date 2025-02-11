const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('./')
const { testLogger } = require('../tests/utils')

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
        - !Base64 'joe'
`

  console.log('result', result)

  /*
  testLogger({
    label: base64Label,
    object,
    input: base64Fixtures,
    output: result,
    expected,
  })
  /** */

  assert.equal(result, expected)

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
