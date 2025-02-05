const path = require('path')
const fs = require('fs')
const util = require('util')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('./')

const FRONTMATTER = path.join(__dirname, '../fixtures/file-with-frontmatter.md')
const HIDDEN_FRONTMATTER = path.join(__dirname, '../fixtures/file-with-hidden-frontmatter.md')

const DEBUG = false
const logger = DEBUG ? logger : () => {}

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
  assert.equal(yml, simple.trim())
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
  assert.equal(yml, tinyYaml.trim())
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
  logger('yml', yml)
  /** */
  assert.is(typeof yml, 'string')
  assert.equal(yml, largeYaml.trim())
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
  logger('expected', expected)
  /** */

  assert.is(typeof yml, 'string')
  assert.equal(yml, expected)
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

test.run()
