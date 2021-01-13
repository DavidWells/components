# Quick Persist

Persist values to file system. Useful for tests & other temporary values.

## Install

```
npm install quick-persist -D
```

## Usage

```js
const { save, get } = require('quick-persist')

async function example() {
  // Save values
  await save({
    value: 'xyz',
    other: {
      stuff: 'here'
    }
  })
  // Get value by key using dotprop
  const value = await get('value')
  console.log('value', value)
  // Get value by key using dotprop
  const otherValue = await get('other.stuff')
  console.log('otherValue', otherValue)
  // Get value
  const allValues = await get()
  console.log('allValues', allValues)
}

example()
// value xyz
// otherValue here
// allValues { value: xyz }
```
