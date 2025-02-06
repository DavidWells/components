const path = require('path')
const fs = require('fs')
const util = require('util')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('./')
const YAML = require('js-yaml')

let DEBUG = process.argv.includes('--debug') ? true : false
// DEBUG = true
const logger = DEBUG ? deepLog : () => {}

function deepLog(objOrLabel, logVal) {
  let obj = objOrLabel
  if (typeof objOrLabel === 'string') {
    obj = logVal
    const prefix = (arguments.length > 1) ? '> ' : ``
    console.log(`\x1b[33m\n${prefix}${objOrLabel}\x1b[0m`)
  }
  if (typeof obj === 'object') {
    console.log(util.inspect(obj, false, null, true))
    return
  }
  if (arguments.length <= 1) return
  console.log(arguments[1])
}

function testLogger({ label, object, input, output, expected }) {
  const postFix = (label) ? ` - ${label}` : ''
  if (object) {
    logger(`Parsed object${postFix}`, object)
  }
  logger(`Input string${postFix}`, input)
  logger(`Output string${postFix}`, output)
  logger(`Expected string${postFix}`, expected)
  const line = '──────────────────────────────────────────────────────────────────────────────────────────────────────────────────'
  // wrap line in white bold text
  logger(`\x1b[37m\x1b[1m${line}\x1b[0m`)
}

const basic = `
# This is a comment
key: value # Another comment
nested:
  # Comment inside nested structure
  innerKey: innerValue
  deep:
    value: here
    with:
      # Another deep comment
      deepKey: deepValue
`;

const basicCommentsLabel = 'Preserves basic comments in YAML'
test(basicCommentsLabel, async () => {
  const object = parse(basic)
  const result = stringify(object, {
    originalString: basic,
  })
  const expected = basic.trim()
  //*
  testLogger({
    label: basicCommentsLabel,
    object,
    input: basic,
    output: result,
    expected,
  })
  /** */
  assert.is(typeof result, 'string')
  assert.equal(result, expected)
})

const yml2 = `
# opening comment prefixed

# tutorial comment prefixed
tutorial: #nesting level 1
  # before yaml ONE
  - yaml: #nesting level 2 (2 spaces used for indentation)
      name: YAML Ain't Markup Language #string [literal] #nesting level 3 (4 spaces used for indentation)
      type: awesome #string [literal]
      born: 2001 #number [literal]
  # before yaml TWO
  - yaml:
      name: foo # Foo comment
      type: bar
      born: 1999 #word
# trailing comment
# here
`;

const openingCommentLabel = 'Preserves opening comments and nested structure'
test(openingCommentLabel, async () => {
  const object = parse(yml2)
  const result = stringify(object, {
    originalString: yml2,
  })
  const expected = yml2.trim()
  //*
  testLogger({
    label: openingCommentLabel,
    object,
    input: yml2,
    output: result,
    expected,
  })
  /** */
  assert.is(typeof result, 'string')
  assert.equal(result, expected)
})

const yamlMultilineOpener = `
# opening comment prefixed
# With multiple lines
# And a trailing comment

# With splits

# tutorial comment prefixed
tutorial: #nesting level 1
  # before yaml ONE
  - yaml: #nesting level 2 (2 spaces used for indentation)
      name: YAML Ain't Markup Language #string [literal] #nesting level 3 (4 spaces used for indentation)
      type: awesome #string [literal]
      born: 2001 #number [literal]
  # before yaml TWO
  - yaml:
      name: foo # Foo comment
      type: bar
      born: 1999 #word
# trailing comment
# here
`;

const multilineOpenerLabel = 'Handles multiline opening comments with splits'
test(multilineOpenerLabel, async () => {
  const object = parse(yamlMultilineOpener)
  const result = stringify(object, {
    originalString: yamlMultilineOpener,
  })
  const expected = yamlMultilineOpener.trim()
  //*
  testLogger({
    label: multilineOpenerLabel,
    object,
    input: yamlMultilineOpener,
    output: result,
    expected,
  })
  /** */
  assert.is(typeof result, 'string')
  assert.equal(result, expected)
})

// const originalString = `
// tutorial: #nesting level 1
//   - yaml: #nesting level 2 (2 spaces used for indentation)
//       name: YAML Ain't Markup Language #string [literal] #nesting level 3 (4 spaces used for indentation)
//       type: awesome #string [literal]
//       born: 2001 #number [literal]`
// const originalYamlDoc = yaml.parseDocument(originalString.trim());
// const outputTest = new yaml.Document(originalYamlDoc)
// const outputTestStr = outputTest.toString()
// logger(outputTestStr)

const basicTwo = `
tutorial: #nesting level 1
  - yaml: #nesting level 2 (2 spaces used for indentation)
      name: YAML Ain't Markup Language #string [literal] #nesting level 3 (4 spaces used for indentation)
      type: awesome #string [literal]
      born: 2001 #number [literal]`;

const basicResultLabel =
'Handles comments in a basic yaml string'
test(basicResultLabel, async () => {
  const object = parse(basicTwo);
  const ymlStringResult = stringify(object, {
    originalString: basicTwo,
  })
  const expected = basicTwo.trim()
  //*
  testLogger({
    label: basicResultLabel,
    object,
    input: basicTwo,
    output: ymlStringResult,
    expected,
  })
  /** */
  assert.is(typeof ymlStringResult, 'string')
  assert.equal(ymlStringResult, expected)
})


const simple = `
# comment before
title: Improving Event Listener DX
date: 2023-12-29
description: Making DX of event listeners nice and crisp
slug: improving-event-listener-dx
# comment
settings:
  - type: content
    content: Content here...
tags:
  - wooo
  - rad
  - cool
createdBy: David Wells
createdAt: 2024-03-07T17:56:40.062Z
updatedBy: David Wells
updatedAt: 2024-03-07T23:25:10.015Z
id: bf909406-4212-4d07-b2fb-fa228108683c
`

const tinyYamlLabel = 'Basic Result contains comments'
test(tinyYamlLabel, async () => {
  const object = parse(simple)
  const result = stringify(object, {
    originalString: simple,
  })
  const expected = wrapDateString(simple.trim(), '2023-12-29')
  //*
  testLogger({
    label: tinyYamlLabel,
    object,
    input: simple,
    output: result,
    expected,
  })
  /** */
  assert.is(typeof result, 'string')
  assert.equal(result, expected)
})

const tinyYaml = `
# comment before
# Multiline
title: Improving Event Listener DX
date: 2023-12-29
description: Making DX of event listeners nice and crisp
slug: improving-event-listener-dx
nested:
  foo: bar
  # Comment on nested
  baz: qux
# comment BEFORE settings key
settings: # comment ON settings key
  - type: content
    # Comment BEFORE content key on array item index 0
    content: Content here...
  # BEFORE Comment before array
  - type: content-two
    # Comment BEFORE content key on array item index 1
    content: Content here... # comment on content KEY index 1
    deeperArray:
      - foo
      - bar # comment on DEEP array item
      - baz
tags:
  - wooo
  # wooo
  - rad
  - cool
  # deeper array comment
  - dope
  - okay # Comment on array item
createdBy: David Wells # comment longer here # ending thing
createdAt: 2024-03-07T17:56:40.062Z
updatedBy: David Wells
updatedAt: 2024-03-07T23:25:10.015Z
id: bf909406-4212-4d07-b2fb-fa228108683c
# after comment
# kkfkfkffkjddjjddjdjdjdjdjdjdjdjddjdj

# after comment
`

const allCommentsLabel = 'Tiny Result contains all comments'
test(allCommentsLabel, async () => {
  const object = parse(tinyYaml)
  const result = stringify(object, {
    originalString: tinyYaml,
  })
  const expected = wrapDateString(tinyYaml.trim(), '2023-12-29')
  //*
  testLogger({
    label: allCommentsLabel,
    object,
    input: tinyYaml,
    output: result,
    expected,
  })
  /** */
  assert.is(typeof result, 'string')
  assert.equal(result, expected)
})

const largeYaml = `
# comment before
# Multiline
title: Improving Event Listener DX
date: 2023-12-29
description: Making DX of event listeners nice and crisp
slug: improving-event-listener-dx
nested:
  foo: bar
  # Comment on nested
  baz: qux
# comment BEFORE settings key
settings: # comment ON settings key
  - type: content
    # Comment BEFORE content key on array item index 0
    content: Content here...
  # BEFORE Comment before array
  - type: content-two
    # Comment BEFORE content key on array item index 1
    content: Content here... # comment on content KEY index 1
    deeperArray:
      - foo
      - bar # comment on DEEP array item
      - baz
tags:
  - wooo
  # wooo
  - rad
  - cool
  # deeper array comment
  - dope
  - okay # Comment on array item
createdBy: David Wells # comment longer here # ending thing
createdAt: 2024-03-07T17:56:40.062Z
updatedBy: David Wells
updatedAt: 2024-03-07T23:25:10.015Z
id: bf909406-4212-4d07-b2fb-fa228108683c
people:
  - name: John
    age: 30
    hobbies:
      - name: Reading
        duration: 2 hours
      - name: Swimming
        duration: 1 hour
    address:
      street: 123 Main St
      city: Springfield
      country: USA
  - name: Alice
    age: 25
    hobbies:
      - name: Painting
        # Painting comment
        duration: 3 hours
      - name: Cooking
        duration: 2 hours
    address:
      street: 456 Elm St
      city: Lakeside
      country: Canada
company:
  name: XYZ Corp
  employees:
    - name: John Doe
      age: 35
      departments:
        - name: Engineering
          team_lead: Alice
          projects:
            - name: Project A
              # SUPER DEEP COMMENT
              description: Developing new feature set
              status: ongoing
            - name: Project B
              description: Bug fixing and maintenance
              status: completed
        - name: Marketing
          team_lead: Bob
          campaigns:
            - name: Campaign X
              type: Social Media
              status: active
            - name: Campaign Y
              type: Email Marketing
              status: paused
    - name: Alice Smith
      age: 28
      departments:
        - name: Sales
          team_lead: John
          clients:
            - name: Client A
              industry: Retail
              status: active
            - name: Client B
              industry: Technology
              status: inactive
################################
## Stuff
################################
funky: true
# after comment
# kkfkfkffkjddjjddjdjdjdjdjdjdjdjddjdj

# after comment
`

const largeYamlLabel = 'Result contains comments in large YAML'
test(largeYamlLabel, async () => {
  const object = parse(largeYaml)
  const result = stringify(object, {
    originalString: largeYaml,
  })
  const expected = wrapDateString(largeYaml.trim(), '2023-12-29')
  //*
  testLogger({
    label: largeYamlLabel,
    object,
    input: largeYaml,
    output: result,
    expected,
  })
  /** */
  assert.is(typeof result, 'string')
  assert.equal(result, expected)
})

test('Moved key has comment', async () => {
const blockToMove = `
################################
## Stuff
################################
funky: true`

function result(start, dest) {
  return `
# comment before

# funky
${dest}
# Multiline
title: Improving Event Listener DX
date: 2023-12-29
description: Making DX of event listeners nice and crisp
slug: improving-event-listener-dx
nested:
  foo: bar
  # Comment on nested
  baz: qux
# comment BEFORE settings key
settings: # comment ON settings key
  - type: content
    # Comment BEFORE content key on array item index 0
    content: Content here...
  # BEFORE Comment before array
  - type: content-two
    # Comment BEFORE content key on array item index 1
    content: Content here... # comment on content KEY index 1
    deeperArray:
      - foo
      - bar # comment on DEEP array item
      - baz
tags:
  - wooo
  # wooo
  - rad
  - cool
  # deeper array comment
  - dope
  - okay # Comment on array item
createdBy: David Wells # comment longer here # ending thing
createdAt: 2024-03-07T17:56:40.062Z
updatedBy: David Wells
updatedAt: 2024-03-07T23:25:10.015Z
id: bf909406-4212-4d07-b2fb-fa228108683c
people:
  - name: John
    age: 30
    hobbies:
      - name: Reading
        duration: 2 hours
      - name: Swimming
        duration: 1 hour
    address:
      street: 123 Main St
      city: Springfield
      country: USA
  - name: Alice
    age: 25
    hobbies:
      - name: Painting
        # Painting comment
        duration: 3 hours
      - name: Cooking
        duration: 2 hours
    address:
      street: 456 Elm St
      city: Lakeside
      country: Canada
company:
  name: XYZ Corp
  employees:
    - name: John Doe
      age: 35
      departments:
        - name: Engineering
          team_lead: Alice
          projects:
            - name: Project A
              # SUPER DEEP COMMENT
              description: Developing new feature set
              status: ongoing
            - name: Project B
              description: Bug fixing and maintenance
              status: completed
        - name: Marketing
          team_lead: Bob
          campaigns:
            - name: Campaign X
              type: Social Media
              status: active
            - name: Campaign Y
              type: Email Marketing
              status: paused
    - name: Alice Smith
      age: 28
      departments:
        - name: Sales
          team_lead: John
          clients:
            - name: Client A
              industry: Retail
              status: active
            - name: Client B
              industry: Technology
              status: inactive${start}
# after comment
# kkfkfkffkjddjjddjdjdjdjdjdjdjdjddjdj

# after comment
`
}
  const originalString = result(blockToMove, '')
  const object = parse(originalString);
  /* reorder object */
  const newObject = {
    funky: true,
  }
  delete object.funky

  const x = {
    ...newObject,
    ...object,
  }

  const yml = stringify(x, {
    originalString: originalString,
  })
  //*
  logger('original', originalString.trim())
  logger('result', yml)
  const expected = result('', blockToMove).trim()
  const cleanDate = wrapDateString(expected, '2023-12-29')
  logger('expected', expected)
  /** */

  assert.is(typeof yml, 'string')
  assert.equal(yml, cleanDate)
})


const basicThree = `
# before
nice:
  # Comment before one
  - one
  - two # Comment after two
  - three
tutorial: #nesting level 1
  # before wow
  - wow: #nesting level 2 (2 spaces used for indentation)
      foo: YAML Ain't Markup Language #string [literal] #nesting level 3 (4 spaces used for indentation)
      bar: awesome #string [literal]
      baz: 2001 #number [literal]
  # before wow 2
  - wow:
      foo: two #sick
# after`;

const basicThreeLabel = 'Handles nested arrays with comments'
test(basicThreeLabel, () => {
  const object = parse(basicThree)
  const result = stringify(object, {
    originalString: basicThree,
  })
  const expected = basicThree.trim()
  //*
  testLogger({
    label: basicThreeLabel,
    object,
    input: basicThree,
    output: result,
    expected,
  })
  /** */
  assert.is(typeof result, 'string')
  assert.equal(result, expected)
})


test('Respects indent and lineWidth options', () => {
  const input = `
longArray:
  - this is a very long array item that should wrap based on the lineWidth setting we provide to the stringify function
  - this is another long item that should also wrap when it exceeds the specified line width value
deepObject:
  level1:
    level2:
      level3:
        key: value`

  // Test with small lineWidth and larger indent
  const result = stringify(parse(input), {
    originalString: input,
    lineWidth: 40,
    indent: 2
  })
  // console.log('result', result)
  // Verify indentation is 4 spaces
  assert.ok(result.includes('\n    level2:'))

  // Verify line wrapping around 40 chars
  const lines = result.split('\n')
  const longLines = lines.filter(line => line.trim().startsWith('-'))

  // Each wrapped line should be around 40 chars or less (with some tolerance for word boundaries)
  longLines.forEach(line => {
    // console.log('line', line)
    assert.ok(line.length <= 50, `Line too long: ${line}`)
  })

  // Test with larger lineWidth
  const resultWide = stringify(parse(input), {
    originalString: input,
    lineWidth: 120,
    indent: 2
  })
  // console.log('resultWide', resultWide)
  // Verify lines are not wrapped with larger lineWidth
  const wideLines = resultWide.split('\n')
  const longWideLines = wideLines.filter(line => line.trim().startsWith('-'))

  // Lines should be longer now since they won't wrap
  assert.ok(longWideLines.some(line => line.length > 50))
})

const indentOptionsLabel = 'Respects indent and lineWidth options'
test(indentOptionsLabel, () => {
  const input = `
longArray:
  - this is a very long array item that should wrap based on the lineWidth setting we provide to the stringify function
  - this is another long item that should also wrap when it exceeds the specified line width value
deepObject:
  level1:
    level2:
      level3:
        key: value`

  const result = stringify(parse(input), {
    originalString: input,
    lineWidth: 40,
    indent: 2
  })

  const expectedSkinny =
`longArray:
  - this is a very long array item that
    should wrap based on the lineWidth
    setting we provide to the stringify
    function
  - this is another long item that
    should also wrap when it exceeds the
    specified line width value
deepObject:
  level1:
    level2:
      level3:
        key: value`

  //*
  testLogger({
    label: indentOptionsLabel + ' - lineWidth 40',
    input,
    output: result,
    expected: expectedSkinny,
  })
  /** */

  const resultWide = stringify(parse(input), {
    originalString: input,
    lineWidth: 120,
    indent: 2
  })


  const expectedLong =
`longArray:
  - this is a very long array item that should wrap based on the lineWidth setting we provide to the stringify function
  - this is another long item that should also wrap when it exceeds the specified line width value
deepObject:
  level1:
    level2:
      level3:
        key: value`

  //*
  testLogger({
    label: indentOptionsLabel + ' - lineWidth 120',
    input,
    output: resultWide,
    expected: expectedLong,
  })
  /** */

  assert.ok(result.includes('\n    level2:'))

  assert.equal(result, expectedSkinny)
  assert.equal(resultWide, expectedLong)

  const lines = result.split('\n')
  const longLines = lines.filter(line => line.trim().startsWith('-'))
  longLines.forEach(line => {
    assert.ok(line.length <= 50, `Line too long: ${line}`)
  })

  const wideLines = resultWide.split('\n')
  const longWideLines = wideLines.filter(line => line.trim().startsWith('-'))
  assert.ok(longWideLines.some(line => line.length > 50))
})

const dateWrappingLabel = 'Wraps dates like "2012-10-17" when singleQuoteStrings is true'
test(dateWrappingLabel, () => {
  const input = `
version: 2012-10-17
name: test
deep:
  - key: value
  - date: 2023-01-01
`
  const result = stringify(parse(input), {
    originalString: input,
    singleQuoteStrings: true,
  })

  //*
  testLogger({
    label: dateWrappingLabel,
    input,
    output: result,
  })
  /** */

  assert.ok(result.includes(`version: '2012-10-17'`))
  assert.ok(result.includes(`name: 'test'`))
  assert.ok(result.includes(`date: '2023-01-01'`))
})

const defaultQuoteLabel = 'Wraps dates like "2012-10-17" uses default quote type'
test(defaultQuoteLabel, () => {
  const input = `
version: 2012-10-17
name: test
count: 42
enabled: true
deep:
  - key: value
  - date: 2023-01-01
  - number: 123
`
  const result = stringify(parse(input), {
    originalString: input,
  })

  //*
  testLogger({
    label: defaultQuoteLabel,
    input,
    output: result,
  })
  /** */

  // Strings should be quoted
  assert.ok(result.includes('version: "2012-10-17"'))
  assert.ok(result.includes('name: test'))
  assert.ok(result.includes('date: "2023-01-01"'))

  // Numbers and booleans should not be quoted
  assert.ok(result.includes('count: 42'))
  assert.ok(result.includes('enabled: true'))
  assert.ok(result.includes('number: 123'))
})

const preserveTypesLabel = 'Can quote strings while preserving other types'
test(preserveTypesLabel, () => {
  const input = `
Resources:
  Wow:
    - cool
    - rad
    - awesome
  Policy:
    Version: 2012-10-17
  # A CloudFormation loop on the Route53Records for each subdomain
  Fn::ForEach::Route53RecordSet:
    - "RecordSetLogicalId"
    - !Ref pSourceSubDomainList
    - Jamba\${RecordSetLogicalId}:
        Type: AWS::Route53::RecordSet
        Properties:
          HostedZoneId: !Ref pR53ZoneId
          Name: !Sub \${RecordSetLogicalId}.\${pSourceNakedDomain}
          TTL: 60
          Type: A
          AliasTarget:
            HostedZoneId: "Z2FDTNDATAQYW2" # Hosted zone ID for CloudFront
            DNSName: !GetAtt CloudFrontDistribution.DomainName
`
  const expected =
`Resources:
  Wow:
    - cool
    - rad
    - awesome
  Policy:
    Version: "2012-10-17"
  # A CloudFormation loop on the Route53Records for each subdomain
  Fn::ForEach::Route53RecordSet:
    - RecordSetLogicalId
    - !Ref pSourceSubDomainList
    - Jamba\${RecordSetLogicalId}:
        Type: AWS::Route53::RecordSet
        Properties:
          HostedZoneId: !Ref pR53ZoneId
          Name: !Sub \${RecordSetLogicalId}.\${pSourceNakedDomain}
          TTL: 60
          Type: A
          AliasTarget:
            HostedZoneId: Z2FDTNDATAQYW2 # Hosted zone ID for CloudFront
            DNSName: !GetAtt CloudFrontDistribution.DomainName`

  const result = stringify(parse(input), {
    originalString: input,
  })

  //*
  testLogger({
    label: preserveTypesLabel,
    input,
    output: result,
    expected,
  })
  /** */

  assert.equal(result, expected)
})

const stub =
`
# comment before
# Multiline
title: Improving Event Listener DX
date: 2023-12-29
description: Making DX of event listeners nice and crisp
slug: improving-event-listener-dx
nested:
  foo: bar
  # Comment on nested
  baz: qux
# comment BEFORE settings key
settings: # comment ON settings key
  - type: content
    # Comment BEFORE content key on array item index 0
    content: Content here...
  # BEFORE Comment before array
  - type: content-two
    # Comment BEFORE content key on array item index 1
    content: Content here... # comment on content KEY index 1
    deeperArray:
      - foo
      - bar # comment on DEEP array item
      - baz
`

const singleQuoteLabel = 'Wraps string values in single quotes'
test(singleQuoteLabel, () => {
  const expected =
`# comment before
# Multiline
title: 'Improving Event Listener DX'
date: '2023-12-29'
description: 'Making DX of event listeners nice and crisp'
slug: 'improving-event-listener-dx'
nested:
  foo: 'bar'
  # Comment on nested
  baz: 'qux'
# comment BEFORE settings key
settings: # comment ON settings key
  - type: 'content'
    # Comment BEFORE content key on array item index 0
    content: 'Content here...'
  # BEFORE Comment before array
  - type: 'content-two'
    # Comment BEFORE content key on array item index 1
    content: 'Content here...' # comment on content KEY index 1
    deeperArray:
      - 'foo'
      - 'bar' # comment on DEEP array item
      - 'baz'`

  const result = stringify(parse(stub), {
    originalString: stub,
    singleQuoteStrings: true
  })

  //*
  testLogger({
    label: singleQuoteLabel,
    input: stub,
    output: result,
    expected,
  })
  /** */

  assert.equal(result, expected)
})

const handleDoubleQuoteStringValuesLabel = 'Handles double quote string values'
test(handleDoubleQuoteStringValuesLabel, () => {

  const expected =
`# comment before
# Multiline
title: "Improving Event Listener DX"
date: "2023-12-29"
description: "Making DX of event listeners nice and crisp"
slug: "improving-event-listener-dx"
nested:
  foo: "bar"
  # Comment on nested
  baz: "qux"
# comment BEFORE settings key
settings: # comment ON settings key
  - type: "content"
    # Comment BEFORE content key on array item index 0
    content: "Content here..."
  # BEFORE Comment before array
  - type: "content-two"
    # Comment BEFORE content key on array item index 1
    content: "Content here..." # comment on content KEY index 1
    deeperArray:
      - "foo"
      - "bar" # comment on DEEP array item
      - "baz"`

  const object = parse(stub)
  const result = stringify(object, {
    originalString: stub,
    doubleQuoteStrings: true
  })

  //*
  testLogger({
    label: handleDoubleQuoteStringValuesLabel,
    object,
    input: stub,
    output: undefined,
    expected,
  })
  /** */

  assert.equal(result, expected)
})


function testDump(input) {
  const obj = YAML.load(input, { schema: getCfnSchema() })
  console.log('obj', obj)
  const resultx = YAML.dump(obj, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    noArrayIndent: false,
    flowStyle: false,
    styles: {
      '!!null': 'empty',
      '!!str': 'plain'
    },
    quotingType: '"',  // Use double quotes instead of single quotes
    forceQuotes: false, //  quote when necessary
    schema: getCfnSchema() // Add schema here
  })

  console.log('resultx', resultx)
  return resultx
}

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

function getCfnSchema() {
  // Define CloudFormation tags schema
  const cfnTags = [
    new yaml.Type('!Ref', {
      kind: 'scalar',
      construct: function(data) {
        return { 'Ref': data }
      }
    }),
    new yaml.Type('!Sub', {
      kind: 'scalar',
      construct: function(data) {
        return { 'Fn::Sub': data }
      }
    }),
    new yaml.Type('!GetAtt', {
      kind: 'scalar',
      construct: function(data) {
        return { 'Fn::GetAtt': data.split('.') }
      }
    }),
    new yaml.Type('!Join', {
      kind: 'sequence',
      construct: function(data) {
        return { 'Fn::Join': data }
      }
    }),
    new yaml.Type('!Select', { kind: 'sequence' }),
    new yaml.Type('!Split', { kind: 'sequence' }),
    new yaml.Type('!FindInMap', { kind: 'sequence' }),
    new yaml.Type('!If', { kind: 'sequence' }),
    new yaml.Type('!Not', { kind: 'sequence' }),
    new yaml.Type('!Equals', { kind: 'sequence' }),
    new yaml.Type('!And', { kind: 'sequence' }),
    new yaml.Type('!Or', { kind: 'sequence' }),
    new yaml.Type('!Base64', { kind: 'scalar' }),
    new yaml.Type('!Cidr', { kind: 'sequence' }),
    new yaml.Type('!Transform', { kind: 'mapping' }),
    new yaml.Type('!ImportValue', { kind: 'scalar' }),
    new yaml.Type('!GetAZs', { kind: 'scalar' }),
    new yaml.Type('!Condition', { kind: 'scalar' })
  ]

  // Create custom schema with CloudFormation tags
  return yaml.DEFAULT_SCHEMA.extend(cfnTags)
}


test.run()
