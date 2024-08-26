const util = require('util')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { makeToc, normalizeTocLevels } = require('../find-headings')

const simpleMD = `
# Heading 1

stuff

## Heading 2

more stuff

### Heading 3

even more stuff

#### Heading 4

even more stuff
`

test('Generates Toc', async () => {
  const toc = makeNormalizedToc(simpleMD)

  deepLog(toc)
  assert.equal(toc, [{
    level: 1,
    text: 'Heading 1',
    slug: 'heading-1',
    match: '# Heading 1',
    children: [
      {
        level: 2,
        text: 'Heading 2',
        slug: 'heading-2',
        match: '## Heading 2',
        children: [
          {
            level: 3,
            text: 'Heading 3',
            slug: 'heading-3',
            match: '### Heading 3',
            children: [
              {
                level: 4,
                text: 'Heading 4',
                slug: 'heading-4',
                match: '#### Heading 4'
              }
            ]
          }
        ]
      }
    ]
  }])
})

const multipleLayers = `
# Heading 1

stuff

## Heading 2

more stuff

### Heading 3

even more stuff

# 2nd Heading 1

stuff

## 2nd Heading 2

more stuff

### 2nd Heading 3

even more stuff
`

test('Generates Toc multipleLayers', () => {
  const toc = makeNormalizedToc(multipleLayers)

  deepLog(toc)
  assert.equal(toc, [
  {
    level: 1,
    text: 'Heading 1',
    slug: 'heading-1',
    match: '# Heading 1',
    children: [
      {
        level: 2,
        text: 'Heading 2',
        slug: 'heading-2',
        match: '## Heading 2',
        children: [
          {
            level: 3,
            text: 'Heading 3',
            slug: 'heading-3',
            match: '### Heading 3'
          }
        ]
      }
    ]
  },
  {
    level: 1,
    text: '2nd Heading 1',
    slug: '2nd-heading-1',
    match: '# 2nd Heading 1',
    children: [
      {
        level: 2,
        text: '2nd Heading 2',
        slug: '2nd-heading-2',
        match: '## 2nd Heading 2',
        children: [
          {
            level: 3,
            text: '2nd Heading 3',
            slug: '2nd-heading-3',
            match: '### 2nd Heading 3'
          }
        ]
      }
    ]
  }
])
})

const multipleLayersWithMultipleChildren = `
# Heading 1

stuff

## Heading 2

more stuff

### Heading 3

even more stuff

### Heading 3 2

even more stuff 2

### Heading 3 3

# 2nd Heading 1

stuff

## 2nd Heading 2

more stuff

### 2nd Heading 3

even more stuff

### 2nd Heading 3 2

even more stuff 2

### 2nd Heading 3 3

even more stuff 3
`

test('Generates Toc multipleLayersWithMultipleChildren', () => {
  const toc = makeNormalizedToc(multipleLayersWithMultipleChildren)

  deepLog(toc)
  assert.equal(toc, [{
    level: 1,
    text: 'Heading 1',
    slug: 'heading-1',
    match: '# Heading 1',
    children: [
      {
        level: 2,
        text: 'Heading 2',
        slug: 'heading-2',
        match: '## Heading 2',
        children: [
          {
            level: 3,
            text: 'Heading 3',
            slug: 'heading-3',
            match: '### Heading 3'
          },
          {
            level: 3,
            text: 'Heading 3 2',
            slug: 'heading-3-2',
            match: '### Heading 3 2'
          },
          {
            level: 3,
            text: 'Heading 3 3',
            slug: 'heading-3-3',
            match: '### Heading 3 3'
          }
        ]
      }
    ]
  },
  {
    level: 1,
    text: '2nd Heading 1',
    slug: '2nd-heading-1',
    match: '# 2nd Heading 1',
    children: [
      {
        level: 2,
        text: '2nd Heading 2',
        slug: '2nd-heading-2',
        match: '## 2nd Heading 2',
        children: [
          {
            level: 3,
            text: '2nd Heading 3',
            slug: '2nd-heading-3',
            match: '### 2nd Heading 3'
          },
          {
            level: 3,
            text: '2nd Heading 3 2',
            slug: '2nd-heading-3-2',
            match: '### 2nd Heading 3 2'
          },
          {
            level: 3,
            text: '2nd Heading 3 3',
            slug: '2nd-heading-3-3',
            match: '### 2nd Heading 3 3'
          }
        ]
      }
    ]
  }
])
})


const hash2Max = `
## Heading 2

stuff

## Heading 2 2

more stuff

### Heading 3

even more stuff

### Heading 3 2

even more stuff 2

### Heading 3 3

## 2nd Heading 2 2

stuff

## 2nd Heading 2

more stuff

### 2nd Heading 3

even more stuff

### 2nd Heading 3 2

even more stuff 2

### 2nd Heading 3 3

even more stuff 3
`

test('Generates Toc hash2Max', () => {
  const toc = makeNormalizedToc(hash2Max)

  deepLog(toc)
  assert.equal(toc, [
  {
    level: 2,
    text: 'Heading 2',
    slug: 'heading-2',
    match: '## Heading 2'
  },
  {
    level: 2,
    text: 'Heading 2 2',
    slug: 'heading-2-2',
    match: '## Heading 2 2',
    children: [
      {
        level: 3,
        text: 'Heading 3',
        slug: 'heading-3',
        match: '### Heading 3'
      },
      {
        level: 3,
        text: 'Heading 3 2',
        slug: 'heading-3-2',
        match: '### Heading 3 2'
      },
      {
        level: 3,
        text: 'Heading 3 3',
        slug: 'heading-3-3',
        match: '### Heading 3 3'
      }
    ]
  },
  {
    level: 2,
    text: '2nd Heading 2 2',
    slug: '2nd-heading-2-2',
    match: '## 2nd Heading 2 2'
  },
  {
    level: 2,
    text: '2nd Heading 2',
    slug: '2nd-heading-2',
    match: '## 2nd Heading 2',
    children: [
      {
        level: 3,
        text: '2nd Heading 3',
        slug: '2nd-heading-3',
        match: '### 2nd Heading 3'
      },
      {
        level: 3,
        text: '2nd Heading 3 2',
        slug: '2nd-heading-3-2',
        match: '### 2nd Heading 3 2'
      },
      {
        level: 3,
        text: '2nd Heading 3 3',
        slug: '2nd-heading-3-3',
        match: '### 2nd Heading 3 3'
      }
    ]
  }
])
})


const headingBreaker = `
## Heading 2

stuff

## Heading 2 2

more stuff

### Heading 3

even more stuff

### Heading 3 2

even more stuff 2

### Heading 3 3

# Heading breaker

cool

## 2nd Heading 2 2

stuff

## 2nd Heading 2

more stuff

### 2nd Heading 3

even more stuff

### 2nd Heading 3 2

even more stuff 2

### 2nd Heading 3 3

even more stuff 3
`

const headingBreakerExpected = [
  {
    level: 2,
    text: 'Heading 2',
    slug: 'heading-2',
    match: '## Heading 2'
  },
  {
    level: 2,
    text: 'Heading 2 2',
    slug: 'heading-2-2',
    match: '## Heading 2 2',
    children: [
      {
        level: 3,
        text: 'Heading 3',
        slug: 'heading-3',
        match: '### Heading 3'
      },
      {
        level: 3,
        text: 'Heading 3 2',
        slug: 'heading-3-2',
        match: '### Heading 3 2'
      },
      {
        level: 3,
        text: 'Heading 3 3',
        slug: 'heading-3-3',
        match: '### Heading 3 3'
      }
    ]
  },
  {
    level: 1,
    text: 'Heading breaker',
    slug: 'heading-breaker',
    match: '# Heading breaker',
    children: [
      {
        level: 2,
        text: '2nd Heading 2 2',
        slug: '2nd-heading-2-2',
        match: '## 2nd Heading 2 2'
      },
      {
        level: 2,
        text: '2nd Heading 2',
        slug: '2nd-heading-2',
        match: '## 2nd Heading 2',
        children: [
          {
            level: 3,
            text: '2nd Heading 3',
            slug: '2nd-heading-3',
            match: '### 2nd Heading 3'
          },
          {
            level: 3,
            text: '2nd Heading 3 2',
            slug: '2nd-heading-3-2',
            match: '### 2nd Heading 3 2'
          },
          {
            level: 3,
            text: '2nd Heading 3 3',
            slug: '2nd-heading-3-3',
            match: '### 2nd Heading 3 3'
          }
        ]
      }
    ]
  }
]

test('Generates Toc headingBreaker', () => {
  const toc = makeNormalizedToc(headingBreaker)

  deepLog(toc)
  assert.equal(toc, headingBreakerExpected)
})

test('Generates Toc headingBreaker with normalizeLevels hoists levels', () => {
    const toc = makeNormalizedToc(headingBreaker)
    deepLog(toc)
    assert.equal(toc, headingBreakerExpected)

    const normalized = normalizeTocLevels(toc)

    const normalizedExpected = [
    {
      level: 1,
      text: 'Heading 2',
      slug: 'heading-2',
      match: '## Heading 2'
    },
    {
      level: 1,
      text: 'Heading 2 2',
      slug: 'heading-2-2',
      match: '## Heading 2 2',
      children: [
        {
          level: 2,
          text: 'Heading 3',
          slug: 'heading-3',
          match: '### Heading 3'
        },
        {
          level: 2,
          text: 'Heading 3 2',
          slug: 'heading-3-2',
          match: '### Heading 3 2'
        },
        {
          level: 2,
          text: 'Heading 3 3',
          slug: 'heading-3-3',
          match: '### Heading 3 3'
        }
      ]
    },
    {
      level: 1,
      text: 'Heading breaker',
      slug: 'heading-breaker',
      match: '# Heading breaker',
      children: [
        {
          level: 2,
          text: '2nd Heading 2 2',
          slug: '2nd-heading-2-2',
          match: '## 2nd Heading 2 2'
        },
        {
          level: 2,
          text: '2nd Heading 2',
          slug: '2nd-heading-2',
          match: '## 2nd Heading 2',
          children: [
            {
              level: 3,
              text: '2nd Heading 3',
              slug: '2nd-heading-3',
              match: '### 2nd Heading 3'
            },
            {
              level: 3,
              text: '2nd Heading 3 2',
              slug: '2nd-heading-3-2',
              match: '### 2nd Heading 3 2'
            },
            {
              level: 3,
              text: '2nd Heading 3 3',
              slug: '2nd-heading-3-3',
              match: '### 2nd Heading 3 3'
            }
          ]
        }
      ]
    }]
    assert.equal(normalized, normalizedExpected)

    const tocTwo = makeNormalizedToc(headingBreaker, { normalizeTocLevels: true })
    assert.equal(tocTwo, normalizedExpected, 'normalizeTocLevels option works')
})

test('html headers', () => {
  const htmlHeaders = `
<h1>Heading 1 html</h1>

stuff

<h2>Heading 2</h2>

more stuff

<h3>Heading 3</h3>

even more stuff

<h4>Heading 4</h4>

even more stuff

`

    const toc = makeNormalizedToc(htmlHeaders)
    deepLog(toc)
    assert.equal(toc, [
    {
      level: 1,
      text: 'Heading 1 html',
      slug: 'heading-1-html',
      match: '<h1>Heading 1 html</h1>',
      children: [
        {
          level: 2,
          text: 'Heading 2',
          slug: 'heading-2',
          match: '<h2>Heading 2</h2>',
          children: [
            {
              level: 3,
              text: 'Heading 3',
              slug: 'heading-3',
              match: '<h3>Heading 3</h3>',
              children: [
                {
                  level: 4,
                  text: 'Heading 4',
                  slug: 'heading-4',
                  match: '<h4>Heading 4</h4>'
                }
              ]
            }
          ]
        }
      ]
    }
  ])
})


const mixed = `
<h3>What is this?</h3>

# Heading 1

stuff

<h2>Heading 2 html</h2>

more stuff

<h3>Heading 3</h3>

even more stuff

#### Heading 4

end`

test('html and md headers mixed', () => {
  const toc = makeNormalizedToc(mixed)

  deepLog(toc)

  assert.equal(toc, [
    {
      level: 3,
      text: 'What is this?',
      slug: 'what-is-this',
      match: '<h3>What is this?</h3>'
    },
    {
      level: 1,
      text: 'Heading 1',
      slug: 'heading-1',
      match: '# Heading 1',
      children: [
        {
          level: 2,
          text: 'Heading 2 html',
          slug: 'heading-2-html',
          match: '<h2>Heading 2 html</h2>',
          children: [
            {
              level: 3,
              text: 'Heading 3',
              slug: 'heading-3',
              match: '<h3>Heading 3</h3>',
              children: [
                {
                  level: 4,
                  text: 'Heading 4',
                  slug: 'heading-4',
                  match: '#### Heading 4'
                }
              ]
            }
          ]
        }
      ]
    }
  ])
})

const sixLayers = `
Headings with links:

# [Heading 1 stacked](https://google.com)

## [Heading 2 stacked](https://google.com)

### [Heading 3 stacked](https://google.com)

#### [Heading 4 stacked](https://google.com)

##### [Heading 5 stacked](https://google.com)

###### [Heading 6 stacked](https://google.com)
`

test('sixLayers', () => {
  const toc = makeNormalizedToc(sixLayers)

  deepLog(toc)

  assert.equal(toc,[
    {
      level: 1,
      text: '[Heading 1 stacked](https://google.com)',
      slug: 'heading-1-stackedhttpsgooglecom',
      match: '# [Heading 1 stacked](https://google.com)',
      children: [
        {
          level: 2,
          text: '[Heading 2 stacked](https://google.com)',
          slug: 'heading-2-stackedhttpsgooglecom',
          match: '## [Heading 2 stacked](https://google.com)',
          children: [
            {
              level: 3,
              text: '[Heading 3 stacked](https://google.com)',
              slug: 'heading-3-stackedhttpsgooglecom',
              match: '### [Heading 3 stacked](https://google.com)',
              children: [
                {
                  level: 4,
                  text: '[Heading 4 stacked](https://google.com)',
                  slug: 'heading-4-stackedhttpsgooglecom',
                  match: '#### [Heading 4 stacked](https://google.com)',
                  children: [
                    {
                      level: 5,
                      text: '[Heading 5 stacked](https://google.com)',
                      slug: 'heading-5-stackedhttpsgooglecom',
                      match: '##### [Heading 5 stacked](https://google.com)',
                      children: [
                        {
                          level: 6,
                          text: '[Heading 6 stacked](https://google.com)',
                          slug: 'heading-6-stackedhttpsgooglecom',
                          match: '###### [Heading 6 stacked](https://google.com)'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ])
})


const codeFence = (before, after) => `
Ignore code fences

${before}

\`\`\`
# [Heading 1 stacked](https://google.com)

## [Heading 2 stacked](https://google.com)

### [Heading 3 stacked](https://google.com)

#### [Heading 4 stacked](https://google.com)

##### [Heading 5 stacked](https://google.com)

###### [Heading 6 stacked](https://google.com)

\`\`\`

${after}
`

test('Ignore code fences', () => {
  const toc = makeNormalizedToc(codeFence())
  /*
  deepLog(toc)
  /** */
  assert.equal(toc, [])
  const toc2 = makeNormalizedToc(codeBlock('# heading 1'))
  /*
  deepLog(toc2)
  /** */
  assert.equal(toc2, [
    {
      level: 1,
      text: 'heading 1',
      slug: 'heading-1',
      match: '# heading 1'
    }
  ])
})

const codeBlock = (before, after) => `
Ignore code blocks

${before}

<pre>
# [Heading 1 stacked](https://google.com)

## [Heading 2 stacked](https://google.com)

### [Heading 3 stacked](https://google.com)

#### [Heading 4 stacked](https://google.com)

##### [Heading 5 stacked](https://google.com)

###### [Heading 6 stacked](https://google.com)

</pre>

${after}
`

test('Ignore codeBlock', () => {
  const toc = makeNormalizedToc(codeBlock())
  /*
  deepLog(toc)
  /** */
  assert.equal(toc, [])

  const toc2 = makeNormalizedToc(codeBlock('# heading 1'))
  //*
  deepLog(toc2)
  /** */
  assert.equal(toc2, [
    {
      level: 1,
      text: 'heading 1',
      slug: 'heading-1',
      match: '# heading 1'
    }
  ])
})

function makeNormalizedToc(str, opts = {}) {
  const toc = makeToc(str, opts)
  return toc.map(normalizeObject)
}

function deepLog(objOrLabel, logVal) {
  let obj = objOrLabel
  if (typeof objOrLabel === 'string') {
    obj = logVal
    console.log(objOrLabel)
  }
  console.log(util.inspect(obj, false, null, true))
}

function normalizeObject(obj) {
  const { index, children, ...rest } = obj
  if (children && children.length > 0) {
    rest.children = children.map(normalizeObject)
  }
  return rest
}

test.run()
