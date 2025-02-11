const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('../src')
const { testLogger } = require('./utils')

const arrayFixtures = `
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

const arrayLabel = 'Handles nested arrays and joins'
test(arrayLabel, () => {
  const object = parse(arrayFixtures)
  const result = stringify(object, {
    originalString: arrayFixtures,
  })
  const expected = arrayFixtures.trim()

  //*
  testLogger({
    label: arrayLabel,
    object,
    input: arrayFixtures,
    output: result,
    expected,
  })
  /** */

  assert.equal(result, expected)

  // Test individual cases from parsed object
  const parsed = parse(result)

  // Simple Join
  assert.equal(
    parsed.Simple['Fn::Join'][0],
    'y',
    'Should preserve join delimiter'
  )
  assert.ok(
    Array.isArray(parsed.Simple['Fn::Join'][1]),
    'Should have array of items to join'
  )
  assert.equal(
    parsed.Simple['Fn::Join'][1][0],
    'x',
    'Should handle simple string in join'
  )
  assert.equal(
    parsed.Simple['Fn::Join'][1][2]['Fn::Ref'],
    'StackName',
    'Should handle Ref in join'
  )

  // Complex Join
  const command = parsed.Command['Fn::Join']
  assert.equal(command[0], 'y', 'Should preserve outer join delimiter')
  assert.ok(Array.isArray(command[1]), 'Should have array of items to join')

  // First level Base64s
  assert.equal(
    command[1][0]['Fn::Base64'],
    'Hello',
    'Should handle first Base64'
  )
  assert.equal(
    command[1][1]['Fn::Base64'],
    'World',
    'Should handle second Base64'
  )

  // Nested Join
  const nestedJoin = command[1][2]['Fn::Join']
  assert.equal(
    nestedJoin[0],
    'x',
    'Should preserve nested join delimiter'
  )
  assert.equal(
    nestedJoin[1][0]['Fn::Base64'],
    'bye',
    'Should handle Base64 in nested join'
  )
  assert.equal(
    nestedJoin[1][1]['Fn::Base64'],
    'joe',
    'Should handle Base64 in nested join'
  )
})

test.run()
