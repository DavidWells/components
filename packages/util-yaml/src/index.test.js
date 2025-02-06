const path = require('path')
const fs = require('fs')
const util = require('util')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('./')
const YAML = require('js-yaml')

const FRONTMATTER = path.join(__dirname, '../fixtures/file-with-frontmatter.md')
const HIDDEN_FRONTMATTER = path.join(__dirname, '../fixtures/file-with-hidden-frontmatter.md')

const DEBUG = true
const logger = DEBUG ? console.log : () => {}

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


test('Basic Result contains comments', async () => {
  const object = parse(basic.trim());
  debug(basic)
  /*
  logger('object', object)
  /** */

  const yml = stringify(object, {
    originalString: basic,
  })
  //*
  logger('basic', basic.trim())
  logger('yml', yml)
  /** */
  assert.is(typeof yml, 'string')
  assert.equal(yml, basic.trim())
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

test('Yaml with opening comment', async () => {
  const object = parse(yml2.trim());
  debug(yml2)
  /*
  logger('object', object)
  /** */

  const yml = stringify(object, {
    originalString: yml2,
  })
  //*
  logger('original', yml2.trim())
  logger('output', yml)
  /** */
  assert.is(typeof yml, 'string')
  assert.equal(yml, yml2.trim())
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

test('yamlMultilineOpener', async () => {
  const object = parse(yamlMultilineOpener.trim());
  debug(yamlMultilineOpener)
  /*
  logger('object', object)
  /** */

  const result = stringify(object, {
    originalString: yamlMultilineOpener,
  })
  //*
  logger('original', yamlMultilineOpener.trim())
  logger('result', result)
  /** */
  assert.is(typeof result, 'string')
  assert.equal(result, yamlMultilineOpener.trim())
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

test('Basic Result contains comments two', async () => {
  // const doc = yaml.parseDocument(basicTwo.trim());
  // deepLog('doc', doc.contents)

  // process.exit(1)
  /** */
  const object = parse(basicTwo.trim());
  /*
  logger('object', object)
  /** */

  const yml = stringify(object, {
    originalString: basicTwo,
  })
  //*
  logger('basic', basicTwo.trim())
  logger('yml', yml)
  /** */
  assert.is(typeof yml, 'string')
  assert.equal(yml, basicTwo.trim())
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

test('Basic Result contains comments', async () => {
  const object = parse(simple.trim());
  /*
  logger('object', object)
  /** */

  const yml = stringify(object, {
    originalString: simple,
  })
  /*
  logger('simple', simple.trim())
  logger('yml', yml)
  /** */
  assert.is(typeof yml, 'string')
  const cleanDate = nudgeDate(simple.trim(), '2023-12-29')
  assert.equal(yml, cleanDate)
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

test('Tiny Result contains comments', async () => {
  const object = parse(tinyYaml.trim());
  /*
  logger('object', object)
  /** */

  const yml = stringify(object, {
    originalString: tinyYaml,
  })
  /*
  logger('simple', simple.trim())
  logger('yml', yml)
  /** */
  assert.is(typeof yml, 'string')
  const cleanDate = nudgeDate(tinyYaml.trim(), '2023-12-29')
  assert.equal(yml, cleanDate)
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

test('Result contains comments', async () => {
  const object = parse(largeYaml.trim());
  const yml = stringify(object, {
    originalString: largeYaml,
  })
  /*
  logger('original', largeYaml.trim())
  logger('yml', yml)
  process.exit(1)
  /** */
  assert.is(typeof yml, 'string')
  const cleanDate = nudgeDate(largeYaml.trim(), '2023-12-29')
  // console.log('cleanDate', cleanDate)
  assert.equal(yml, cleanDate)
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
  const object = parse(originalString.trim());
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
  const cleanDate = nudgeDate(expected, '2023-12-29')
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


test('basicThree', () => {
  const object = parse(basicThree.trim());
  const yml = stringify(object, {
    originalString: basicThree,
  })

  logger('original', basicThree.trim())
  logger('result', yml)
  /** */
  assert.is(typeof yml, 'string')
  assert.equal(yml, basicThree.trim())
})


function read(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}


function deepLog(objOrLabel, logVal) {
  let obj = objOrLabel
  if (typeof objOrLabel === 'string') {
    obj = logVal
    logger(objOrLabel)
  }
  logger(util.inspect(obj, false, null, true))
}

function debug(str) {
  // const doc = yaml.parseDocument(str.trim());
  // deepLog('doc', doc.contents)
  // process.exit(1)
}

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

test('Can quote string values including dates', () => {
  const input = `
version: 2012-10-17
name: test
deep:
  - key: value
  - date: 2023-01-01
`
  const result = stringify(parse(input), {
    originalString: input,
    quoteStrings: true
  })

  console.log('result', result)

  assert.ok(result.includes('version: "2012-10-17"'))
  assert.ok(result.includes('name: test'))
  assert.ok(result.includes('date: "2023-01-01"'))
})

test('Can quote strings while preserving other types', () => {
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
    quoteStrings: true
  })

  console.log('result', result)

  // Strings should be quoted
  assert.ok(result.includes('version: "2012-10-17"'))
  assert.ok(result.includes('name: test'))
  assert.ok(result.includes('date: "2023-01-01"'))

  // Numbers and booleans should not be quoted
  assert.ok(result.includes('count: 42'))
  assert.ok(result.includes('enabled: true'))
  assert.ok(result.includes('number: 123'))
})


test('Can quote strings while preserving other types', () => {

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
    // singleQuoteStrings: true
  })

  console.log('result', result)

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

function nudgeDate(str, date, quoteType = `"`)  {
  const pattern = new RegExp(`${date}`, 'g')
  return str.replace(pattern, `${quoteType}${date}${quoteType}`)
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
