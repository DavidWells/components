# Quick Persist

Persist values to file system. Useful for tests & other temporary values.

## Install

```
npm install quick-persist -D
```

## Usage

```js
const { save, get } = require('quick-persist')

async function runExample() {
  // Save single value
  await save({ hello: 'there' })
  // Save multiple values
  await save({
    value: '123',
    other: {
      stuff: 'abc'
    }
  })
  // Get value by key using dot.prop
  const value = await get('value')
  console.log(value)
  // "123"
  const otherValue = await get('other.stuff')
  console.log(otherValue)
  // "abc"

  // Get All values
  const allValues = await get()
  console.log(allValues)
  // "{hello: "there", value:"123",other:{"stuff":"abc"}}"
}

runExample()

```

By default values are written to `/node_modules/quick-persist/.cache`.

You can use a custom path with the second arg

```js
const path = require('path')

async function runExample() {
  const customFilePath = path.resolve('my-custom-path')
  await save({ hello: 'there' }, customFilePath)
  const val = await get('hello', customFilePath)
  console.log(val)
  // 'there'
```

## Alternative approaches

- https://github.com/azu/localstorage-ponyfill
