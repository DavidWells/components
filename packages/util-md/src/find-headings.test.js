const path = require('path')
const fs = require('fs')
const util = require('util')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { findHeadings, makeToc } = require('./find-headings')

const FILE_WITH_HEADERS = path.join(__dirname, '../fixtures/file-with-headings.md')

function read(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

function deepLog(objOrLabel, logVal) {
  let obj = objOrLabel
  if (typeof objOrLabel === 'string') {
    obj = logVal
    console.log(objOrLabel)
  }
  console.log(util.inspect(obj, false, null, true))
}

test('find headers x', async () => {
  const contents = read(path.join(__dirname, '../fixtures/syntax.md'))
  const headers = findHeadings(contents, {
    includeHtmlHeaders: true
  })
  assert.equal(headers.length, 19)
})

test('find headers', async () => {
  const contents = read(FILE_WITH_HEADERS)
  const headers = findHeadings(contents)
  /*
  console.log('headers', headers)
  return
  /** */
  assert.equal(headers, [
    {
      text: 'Heading 1 with paragraph',
      match: '# Heading 1 with paragraph',
      level: 1,
      index: 81
    },
    {
      text: 'Heading 2 with paragraph 1 😃',
      match: '## Heading 2 with paragraph 1 😃',
      level: 2,
      index: 194
    },
    {
      text: 'Heading 2 with paragraph 2',
      match: '## Heading 2 with paragraph 2',
      level: 2,
      index: 585
    },
    {
      text: 'Nested Heading 3 with paragraph',
      match: '### Nested Heading 3 with paragraph',
      level: 3,
      index: 973
    },
    {
      text: 'Nested Heading 3 with paragraph 2',
      match: '### Nested Heading 3 with paragraph 2',
      level: 3,
      index: 1367
    },
    {
      text: 'Heading 2 with paragraph 3',
      match: '## Heading 2 with paragraph 3',
      level: 2,
      index: 1763
    },
    {
      text: 'Heading 2 with paragraph 4',
      match: '## Heading 2 with paragraph 4',
      level: 2,
      index: 2164
    },
    {
      text: 'Heading 2 with paragraph 5',
      match: '## Heading 2 with paragraph 5',
      level: 2,
      index: 2552
    },
    {
      text: 'Heading 2 with paragraph 6',
      match: '## Heading 2 with paragraph 6',
      level: 2,
      index: 2940
    },
    {
      text: 'Group 2 Heading 1 with paragraph',
      match: '# Group 2 Heading 1 with paragraph',
      level: 1,
      index: 3958
    },
    {
      text: 'Group 2 Heading 2 with paragraph 1',
      match: '## Group 2 Heading 2 with paragraph 1',
      level: 2,
      index: 4079
    },
    {
      text: 'Group 2 Heading 2 with paragraph 2',
      match: '## Group 2 Heading 2 with paragraph 2',
      level: 2,
      index: 4475
    },
    {
      text: 'This is a first level heading',
      match: '\n\nThis is a first level heading\n=============================',
      level: 1,
      index: 4875
    },
    {
      text: 'This is a second level heading',
      match: '\n\nThis is a second level heading\n------------------------------',
      level: 2,
      index: 5293
    },
    {
      text: 'This is a first level heading 2',
      match: '\n\nThis is a first level heading 2\n=================================',
      level: 1,
      index: 5713
    },
    {
      text: 'This is a second level heading 2',
      match: '\n\nThis is a second level heading 2\n----------------------------------',
      level: 2,
      index: 6137
    }
  ])
})

test('handles setext false positives', async () => {
    const contentsTwo = `
first level heading 1
=====================

Blah

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae mauris arcu, eu pretium nisi.
False positive 2
------------------------------------------

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae mauris arcu, eu pretium nisi.
False positive 1
=================================

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6
`
  const headersTwo = findHeadings(contentsTwo)
  /*
  console.log('headersTwo', headersTwo)
  /** */
  assert.equal(headersTwo, [
    {
      text: 'first level heading 1',
      match: '\nfirst level heading 1\n=====================',
      level: 1,
      index: 1
    },
    { text: 'Heading 3', match: '### Heading 3', level: 3, index: 367 },
    { text: 'Heading 4', match: '#### Heading 4', level: 4, index: 382 },
    { text: 'Heading 5', match: '##### Heading 5', level: 5, index: 398 },
    {
      text: 'Heading 6',
      match: '###### Heading 6',
      level: 6,
      index: 415
    }
  ])
})


test('Filters unwanted headings', async () => {
    const contentsTwo = `
first level heading 1
=====================

Blah

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae mauris arcu, eu pretium nisi.
False positive 2
------------------------------------------

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae mauris arcu, eu pretium nisi.
False positive 1
=================================

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6
`
  const headersTwo = findHeadings(contentsTwo, {
    filter: ({ text }) => {
      return text !== 'Heading 4'
    }
  })
  /*
  console.log('headersTwo', headersTwo)
  /** */
  assert.equal(headersTwo, [
    {
      text: 'first level heading 1',
      match: '\nfirst level heading 1\n=====================',
      level: 1,
      index: 1
    },
    { text: 'Heading 3', match: '### Heading 3', level: 3, index: 367 },
    { text: 'Heading 5', match: '##### Heading 5', level: 5, index: 398 },
    {
      text: 'Heading 6',
      match: '###### Heading 6',
      level: 6,
      index: 415
    }
  ], 'headersTwo')

  const headersThree = findHeadings(contentsTwo, {
    filter: ({ text }) => {
      return !text.match(/Heading/)
    }
  })
  /*
  console.log('headersTwo', headersTwo)
  /** */
  assert.equal(headersThree, [
    {
      text: 'first level heading 1',
      match: '\nfirst level heading 1\n=====================',
      level: 1,
      index: 1
    },
  ], 'headersThree')


  const headersFour = findHeadings(contentsTwo, {
    filter: ({ text }) => {
      return !text.match(/first/)
    }
  })
  assert.equal(headersFour, [
    { text: 'Heading 3', match: '### Heading 3', level: 3, index: 367 },
    { text: 'Heading 4', match: '#### Heading 4', level: 4, index: 382 },
    { text: 'Heading 5', match: '##### Heading 5', level: 5, index: 398 },
    {
      text: 'Heading 6',
      match: '###### Heading 6',
      level: 6,
      index: 415
    }
  ], 'headersFour')
})

test('handles conflicts', async () => {
  const contents = `
\`\`\`
This is a first level heading
=============================

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae mauris arcu, eu pretium nisi. Praesent fringilla ornare ullamcorper. Pellentesque diam orci, sodales in blandit ut, placerat quis felis. Vestibulum at sem massa, in tempus nisi. Vivamus ut fermentum odio. Etiam porttitor faucibus volutpat. Vivamus vitae mi ligula, non hendrerit urna.

This is a second level heading
------------------------------

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae mauris arcu, eu pretium nisi. Praesent fringilla ornare ullamcorper. Pellentesque diam orci, sodales in blandit ut, placerat quis felis. Vestibulum at sem massa, in tempus nisi. Vivamus ut fermentum odio. Etiam porttitor faucibus volutpat. Vivamus vitae mi ligula, non hendrerit urna.
\`\`\`


\`\`\`
# In code Block Heading 1

## In code Block Heading 2

### In code Block Heading 3

#### In code Block Heading 4

##### In code Block Heading 5

###### In code Block Heading 6
\`\`\`

<pre>
  <code>
# In code pre Heading 1

## In code pre Heading 2

### In code pre Heading 3

#### In code pre Heading 4

##### In code pre Heading 5

###### In code pre Heading 6
  </code>
</pre>

<pre>
  <code>
<h1>HTML code pre Heading 1</h1>

<h2>HTML code pre Heading 2</h2>

<h2>HTML code pre Heading 2</h2>
  </code>
</pre>

`
  const headers = findHeadings(contents)
  /*
  console.log('headers', headers)
  /** */
  assert.equal(headers, [])


    const contentsTwo = `
# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

\`\`\`
# In code Block Heading 1

## In code Block Heading 2

### In code Block Heading 3

#### In code Block Heading 4

##### In code Block Heading 5

###### In code Block Heading 6
\`\`\`

`
  const headersTwo = findHeadings(contentsTwo)
  /*
  console.log('headersTwo', headersTwo)
  /** */
  assert.equal(headersTwo, [
    { text: 'Heading 1', match: '# Heading 1', level: 1, index: 1 },
    { text: 'Heading 2', match: '## Heading 2', level: 2, index: 14 },
    { text: 'Heading 3', match: '### Heading 3', level: 3, index: 28 },
    { text: 'Heading 4', match: '#### Heading 4', level: 4, index: 43 },
    { text: 'Heading 5', match: '##### Heading 5', level: 5, index: 59 },
    { text: 'Heading 6', match: '###### Heading 6', level: 6, index: 76 }
  ])

})

test('makeToc', async () => {
  const contents = read(FILE_WITH_HEADERS)
  const headerToc = makeToc(contents)
  /*
  deepLog('headerToc', headerToc)
  /** */
  assert.equal(headerToc, [
    {
      level: 0,
      index: 81,
      text: 'Heading 1 with paragraph',
      slug: 'heading-1-with-paragraph',
      match: '# Heading 1 with paragraph',
      children: [
        {
          level: 1,
          index: 194,
          text: 'Heading 2 with paragraph 1 😃',
          slug: 'heading-2-with-paragraph-1',
          match: '## Heading 2 with paragraph 1 😃'
        },
        {
          level: 1,
          index: 585,
          text: 'Heading 2 with paragraph 2',
          slug: 'heading-2-with-paragraph-2',
          match: '## Heading 2 with paragraph 2',
          children: [
            {
              level: 2,
              index: 973,
              text: 'Nested Heading 3 with paragraph',
              slug: 'nested-heading-3-with-paragraph',
              match: '### Nested Heading 3 with paragraph'
            },
            {
              level: 2,
              index: 1367,
              text: 'Nested Heading 3 with paragraph 2',
              slug: 'nested-heading-3-with-paragraph-2',
              match: '### Nested Heading 3 with paragraph 2'
            }
          ]
        },
        {
          level: 1,
          index: 1763,
          text: 'Heading 2 with paragraph 3',
          slug: 'heading-2-with-paragraph-3',
          match: '## Heading 2 with paragraph 3'
        },
        {
          level: 1,
          index: 2164,
          text: 'Heading 2 with paragraph 4',
          slug: 'heading-2-with-paragraph-4',
          match: '## Heading 2 with paragraph 4'
        },
        {
          level: 1,
          index: 2552,
          text: 'Heading 2 with paragraph 5',
          slug: 'heading-2-with-paragraph-5',
          match: '## Heading 2 with paragraph 5'
        },
        {
          level: 1,
          index: 2940,
          text: 'Heading 2 with paragraph 6',
          slug: 'heading-2-with-paragraph-6',
          match: '## Heading 2 with paragraph 6'
        }
      ]
    },
    {
      level: 0,
      index: 3958,
      text: 'Group 2 Heading 1 with paragraph',
      slug: 'group-2-heading-1-with-paragraph',
      match: '# Group 2 Heading 1 with paragraph',
      children: [
        {
          level: 1,
          index: 4079,
          text: 'Group 2 Heading 2 with paragraph 1',
          slug: 'group-2-heading-2-with-paragraph-1',
          match: '## Group 2 Heading 2 with paragraph 1'
        },
        {
          level: 1,
          index: 4475,
          text: 'Group 2 Heading 2 with paragraph 2',
          slug: 'group-2-heading-2-with-paragraph-2',
          match: '## Group 2 Heading 2 with paragraph 2'
        }
      ]
    },
    {
      level: 0,
      index: 4875,
      text: 'This is a first level heading',
      slug: 'this-is-a-first-level-heading',
      match: '\n\nThis is a first level heading\n=============================',
      children: [
        {
          level: 1,
          index: 5293,
          text: 'This is a second level heading',
          slug: 'this-is-a-second-level-heading',
          match: '\n\nThis is a second level heading\n------------------------------'
        }
      ]
    },
    {
      level: 0,
      index: 5713,
      text: 'This is a first level heading 2',
      slug: 'this-is-a-first-level-heading-2',
      match: '\n\nThis is a first level heading 2\n=================================',
      children: [
        {
          level: 1,
          index: 6137,
          text: 'This is a second level heading 2',
          slug: 'this-is-a-second-level-heading-2',
          match: '\n' +
            '\n' +
            'This is a second level heading 2\n' +
            '----------------------------------'
        }
      ]
    },
    {
      level: 0,
      index: 6571,
      text: 'HTML Heading 1',
      slug: 'html-heading-1',
      match: '<h1>HTML Heading 1</h1>',
      children: [
        {
          level: 1,
          index: 6654,
          text: 'HTML Heading 2',
          slug: 'html-heading-2',
          match: '<h2>HTML Heading 2</h2>'
        },
        {
          level: 1,
          index: 7036,
          text: 'HTML Heading 2',
          slug: 'html-heading-2-1',
          match: '<h2>HTML Heading 2</h2>'
        }
      ]
    }
  ])
})

test('makeToc with filterSection trim h1 and children', async () => {
  const contents = read(FILE_WITH_HEADERS)
  const headerToc = makeToc(contents, {
    filterSection: ({ text }) => {
      return !text.match(/This is a first level heading 2/)
    }
  })
  /*
  deepLog('headerToc', headerToc)
  /** */
assert.equal(headerToc, [
  {
    level: 0,
    index: 81,
    text: 'Heading 1 with paragraph',
    slug: 'heading-1-with-paragraph',
    match: '# Heading 1 with paragraph',
    children: [
      {
        level: 1,
        index: 194,
        text: 'Heading 2 with paragraph 1 😃',
        slug: 'heading-2-with-paragraph-1',
        match: '## Heading 2 with paragraph 1 😃'
      },
      {
        level: 1,
        index: 585,
        text: 'Heading 2 with paragraph 2',
        slug: 'heading-2-with-paragraph-2',
        match: '## Heading 2 with paragraph 2',
        children: [
          {
            level: 2,
            index: 973,
            text: 'Nested Heading 3 with paragraph',
            slug: 'nested-heading-3-with-paragraph',
            match: '### Nested Heading 3 with paragraph'
          },
          {
            level: 2,
            index: 1367,
            text: 'Nested Heading 3 with paragraph 2',
            slug: 'nested-heading-3-with-paragraph-2',
            match: '### Nested Heading 3 with paragraph 2'
          }
        ]
      },
      {
        level: 1,
        index: 1763,
        text: 'Heading 2 with paragraph 3',
        slug: 'heading-2-with-paragraph-3',
        match: '## Heading 2 with paragraph 3'
      },
      {
        level: 1,
        index: 2164,
        text: 'Heading 2 with paragraph 4',
        slug: 'heading-2-with-paragraph-4',
        match: '## Heading 2 with paragraph 4'
      },
      {
        level: 1,
        index: 2552,
        text: 'Heading 2 with paragraph 5',
        slug: 'heading-2-with-paragraph-5',
        match: '## Heading 2 with paragraph 5'
      },
      {
        level: 1,
        index: 2940,
        text: 'Heading 2 with paragraph 6',
        slug: 'heading-2-with-paragraph-6',
        match: '## Heading 2 with paragraph 6'
      }
    ]
  },
  {
    level: 0,
    index: 3958,
    text: 'Group 2 Heading 1 with paragraph',
    slug: 'group-2-heading-1-with-paragraph',
    match: '# Group 2 Heading 1 with paragraph',
    children: [
      {
        level: 1,
        index: 4079,
        text: 'Group 2 Heading 2 with paragraph 1',
        slug: 'group-2-heading-2-with-paragraph-1',
        match: '## Group 2 Heading 2 with paragraph 1'
      },
      {
        level: 1,
        index: 4475,
        text: 'Group 2 Heading 2 with paragraph 2',
        slug: 'group-2-heading-2-with-paragraph-2',
        match: '## Group 2 Heading 2 with paragraph 2'
      }
    ]
  },
  {
    level: 0,
    index: 4875,
    text: 'This is a first level heading',
    slug: 'this-is-a-first-level-heading',
    match: '\n\nThis is a first level heading\n=============================',
    children: [
      {
        level: 1,
        index: 5293,
        text: 'This is a second level heading',
        slug: 'this-is-a-second-level-heading',
        match: '\n\nThis is a second level heading\n------------------------------'
      }
    ]
  },
  {
    level: 0,
    index: 6571,
    text: 'HTML Heading 1',
    slug: 'html-heading-1',
    match: '<h1>HTML Heading 1</h1>',
    children: [
      {
        level: 1,
        index: 6654,
        text: 'HTML Heading 2',
        slug: 'html-heading-2',
        match: '<h2>HTML Heading 2</h2>'
      },
      {
        level: 1,
        index: 7036,
        text: 'HTML Heading 2',
        slug: 'html-heading-2-1',
        match: '<h2>HTML Heading 2</h2>'
      }
    ]
  }
])
})


test('makeToc with filterSection trim h2 and children', async () => {
  const contents = read(FILE_WITH_HEADERS)
  const headerToc = makeToc(contents, {
    filterSection: ({ text }) => {
      return !text.match(/^Heading 2 with paragraph 2/)
    }
  })
  /*
  deepLog('headerToc', headerToc)
  /** */
  assert.equal(headerToc, [
    {
      level: 0,
      index: 81,
      text: 'Heading 1 with paragraph',
      slug: 'heading-1-with-paragraph',
      match: '# Heading 1 with paragraph',
      children: [
        {
          level: 1,
          index: 194,
          text: 'Heading 2 with paragraph 1 😃',
          slug: 'heading-2-with-paragraph-1',
          match: '## Heading 2 with paragraph 1 😃'
        },
        {
          level: 1,
          index: 1763,
          text: 'Heading 2 with paragraph 3',
          slug: 'heading-2-with-paragraph-3',
          match: '## Heading 2 with paragraph 3'
        },
        {
          level: 1,
          index: 2164,
          text: 'Heading 2 with paragraph 4',
          slug: 'heading-2-with-paragraph-4',
          match: '## Heading 2 with paragraph 4'
        },
        {
          level: 1,
          index: 2552,
          text: 'Heading 2 with paragraph 5',
          slug: 'heading-2-with-paragraph-5',
          match: '## Heading 2 with paragraph 5'
        },
        {
          level: 1,
          index: 2940,
          text: 'Heading 2 with paragraph 6',
          slug: 'heading-2-with-paragraph-6',
          match: '## Heading 2 with paragraph 6'
        }
      ]
    },
    {
      level: 0,
      index: 3958,
      text: 'Group 2 Heading 1 with paragraph',
      slug: 'group-2-heading-1-with-paragraph',
      match: '# Group 2 Heading 1 with paragraph',
      children: [
        {
          level: 1,
          index: 4079,
          text: 'Group 2 Heading 2 with paragraph 1',
          slug: 'group-2-heading-2-with-paragraph-1',
          match: '## Group 2 Heading 2 with paragraph 1'
        },
        {
          level: 1,
          index: 4475,
          text: 'Group 2 Heading 2 with paragraph 2',
          slug: 'group-2-heading-2-with-paragraph-2',
          match: '## Group 2 Heading 2 with paragraph 2'
        }
      ]
    },
    {
      level: 0,
      index: 4875,
      text: 'This is a first level heading',
      slug: 'this-is-a-first-level-heading',
      match: '\n\nThis is a first level heading\n=============================',
      children: [
        {
          level: 1,
          index: 5293,
          text: 'This is a second level heading',
          slug: 'this-is-a-second-level-heading',
          match: '\n\nThis is a second level heading\n------------------------------'
        }
      ]
    },
    {
      level: 0,
      index: 5713,
      text: 'This is a first level heading 2',
      slug: 'this-is-a-first-level-heading-2',
      match: '\n\nThis is a first level heading 2\n=================================',
      children: [
        {
          level: 1,
          index: 6137,
          text: 'This is a second level heading 2',
          slug: 'this-is-a-second-level-heading-2',
          match: '\n' +
            '\n' +
            'This is a second level heading 2\n' +
            '----------------------------------'
        }
      ]
    },
    {
      level: 0,
      index: 6571,
      text: 'HTML Heading 1',
      slug: 'html-heading-1',
      match: '<h1>HTML Heading 1</h1>',
      children: [
        {
          level: 1,
          index: 6654,
          text: 'HTML Heading 2',
          slug: 'html-heading-2',
          match: '<h2>HTML Heading 2</h2>'
        },
        {
          level: 1,
          index: 7036,
          text: 'HTML Heading 2',
          slug: 'html-heading-2-1',
          match: '<h2>HTML Heading 2</h2>'
        }
      ]
    }
  ])
})

test.run()
