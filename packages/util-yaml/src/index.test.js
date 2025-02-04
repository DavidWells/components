const path = require('path')
const fs = require('fs')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { stringify, parse } = require('./')

const FRONTMATTER = path.join(__dirname, '../fixtures/file-with-frontmatter.md')
const HIDDEN_FRONTMATTER = path.join(__dirname, '../fixtures/file-with-hidden-frontmatter.md')

function read(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
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

test.only('Basic Result contains comments', async () => {
  const object = parse(basic.trim());
  /*
  console.log('object', object)
  /** */

  const yml = stringify(object, {
    originalString: basic,
  })
  /*
  console.log('basic', basic.trim())
  console.log('yml', yml)
  /** */
  assert.is(typeof yml, 'string')
  assert.equal(yml, basic.trim())
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
  console.log('object', object)
  /** */

  const yml = stringify(object, {
    originalString: simple,
  })
  /*
  console.log('simple', simple.trim())
  console.log('yml', yml)
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
  console.log('object', object)
  /** */

  const yml = stringify(object, {
    originalString: tinyYaml,
  })
  /*
  console.log('simple', simple.trim())
  console.log('yml', yml)
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
  console.log('yml', yml)
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
  return `${dest}
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
              status: inactive${start}
# after comment
# kkfkfkffkjddjjddjdjdjdjdjdjdjdjddjdj

# after comment
`
}
  const object = parse(result(blockToMove, '').trim());
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
    originalString: largeYaml,
  })
  /*
  console.log('yml', yml)
  /** */

  assert.is(typeof yml, 'string')
  assert.equal(yml, result('', blockToMove).trim())
})


const basicTwo = `
tutorial: #nesting level 1
  - yaml: #nesting level 2 (2 spaces used for indentation)
      name: YAML Ain't Markup Language #string [literal] #nesting level 3 (4 spaces used for indentation)
      type: awesome #string [literal]
      born: 2001 #number [literal]`;

test('Basic Result contains comments two', async () => {
  const object = parse(basicTwo.trim());
  /*
  console.log('object', object)
  /** */

  const yml = stringify(object, {
    originalString: basicTwo,
  })
  /*
  console.log('basic', basicTwo.trim())
  console.log('yml', yml)
  /** */
  assert.is(typeof yml, 'string')
  assert.equal(yml, basicTwo.trim())
})



test.run()
