# YAML

> To install:

```sh
npm install yaml
# or
yarn add yaml
```

`yaml` is a new definitive library for [YAML](http://yaml.org/), a human friendly data serialization standard. This library:

- Supports all versions of the standard (1.0, 1.1, and 1.2),
- Passes all of the [yaml-test-suite](https://github.com/yaml/yaml-test-suite) tests,
- Can accept any string as input without throwing, parsing as much YAML out of it as it can, and
- Supports parsing, modifying, and writing YAML comments.

The library is released under the ISC open source license, and the code is [available on GitHub](https://github.com/eemeli/yaml/). It has no external dependencies and runs on Node.js 6 and later, and in browsers from IE 11 upwards.

For the purposes of versioning, any changes that break any of the endpoints or APIs documented here will be considered semver-major breaking changes. Undocumented library internals may change between minor versions, and previous APIs may be deprecated (but not removed).

## API Overview

The API provided by `yaml` has three layers, depending on how deep you need to go: [Parse & Stringify](#parse-amp-stringify), [Documents](#documents), and the [CST Parser](#cst-parser). The first has the simplest API and "just works", the second gets you all the bells and whistles supported by the library along with a decent [AST](#content-nodes), and the third is the closest to YAML source, making it fast, raw, and crude.

<h3>Parse & Stringify</h3>

```js
import YAML from 'yaml'
// or
const YAML = require('yaml')
```

- [`YAML.parse(str, options): value`](#yaml-parse)
- [`YAML.stringify(value, options): string`](#yaml-stringify)

<h3>Documents</h3>

- [`YAML.createNode(value, wrapScalars, tag): Node`](#creating-nodes)
- [`YAML.defaultOptions`](#options)
- [`YAML.Document`](#documents)
  - [`constructor(options)`](#creating-documents)
  - [`defaults`](#options)
  - [`#anchors`](#working-with-anchors)
  - [`#contents`](#content-nodes)
  - [`#errors`](#errors)
- [`YAML.parseAllDocuments(str, options): YAML.Document[]`](#parsing-documents)
- [`YAML.parseDocument(str, options): YAML.Document`](#parsing-documents)

```js
import { Pair, YAMLMap, YAMLSeq } from 'yaml/types'
```

- [`new Pair(key, value)`](#creating-nodes)
- [`new YAMLMap()`](#creating-nodes)
- [`new YAMLSeq()`](#creating-nodes)

<h3>CST Parser</h3>

```js
import parseCST from 'yaml/parse-cst'
```

- [`parseCST(str): CSTDocument[]`](#parsecst)
- [`YAML.parseCST(str): CSTDocument[]`](#parsecst)

# Parse & Stringify

```yaml
# file.yml
YAML:
  - A human-readable data serialization language
  - https://en.wikipedia.org/wiki/YAML
yaml:
  - A complete JavaScript implementation
  - https://www.npmjs.com/package/yaml
```

At its simplest, you can use `YAML.parse(str)` and `YAML.stringify(value)` just as you'd use `JSON.parse(str)` and `JSON.stringify(value)`. If that's enough for you, everything else in these docs is really just implementation details.

## YAML.parse

```js
import fs from 'fs'
import YAML from 'yaml'

YAML.parse('3.14159')
// 3.14159

YAML.parse('[ true, false, maybe, null ]\n')
// [ true, false, 'maybe', null ]

const file = fs.readFileSync('./file.yml', 'utf8')
YAML.parse(file)
// { YAML:
//   [ 'A human-readable data serialization language',
//     'https://en.wikipedia.org/wiki/YAML' ],
//   yaml:
//   [ 'A complete JavaScript implementation',
//     'https://www.npmjs.com/package/yaml' ] }
```

#### `YAML.parse(str, options = {}): any`

`str` should be a string with YAML formatting. See [Options](#options) for more information on the second parameter, an optional configuration object.

The returned value will match the type of the root value of the parsed YAML document, so Maps become objects, Sequences arrays, and scalars result in nulls, booleans, numbers and strings.

`YAML.parse` may throw on error, and it may log warnings using `console.warn`. It only supports input consisting of a single YAML document; for multi-document support you should use [`YAML.parseAllDocuments`](#parsing-documents).

## YAML.stringify

```js
YAML.stringify(3.14159)
// '3.14159\n'

YAML.stringify([true, false, 'maybe', null])
// `- true
// - false
// - maybe
// - null
// `

YAML.stringify({ number: 3, plain: 'string', block: 'two\nlines\n' })
// `number: 3
// plain: string
// block: >
//   two
//
//   lines
// `
```

#### `YAML.stringify(value, options = {}): string`

`value` can be of any type. The returned string will always include `\n` as the last character, as is expected of YAML documents. See [Options](#options) for more information on the second parameter, an optional configuration object.

As strings in particular may be represented in a number of different styles, the simplest option for the value in question will always be chosen, depending mostly on the presence of escaped or control characters and leading & trailing whitespace.

To create a stream of documents, you may call `YAML.stringify` separately for each document's `value`, and concatenate the documents with the string `...\n` as a separator.

# Options

```js
YAML.defaultOptions
// { keepBlobsInJSON: true,
//   keepNodeTypes: true,
//   version: '1.2' }

YAML.Document.defaults
// { '1.0': { merge: true, schema: 'yaml-1.1' },
//   '1.1': { merge: true, schema: 'yaml-1.1' },
//   '1.2': { merge: false, schema: 'core' } }
```

#### `YAML.defaultOptions`

#### `YAML.Document.defaults`

`yaml` defines document-specific options in three places: as an argument of parse, create and stringify calls, in the values of `YAML.defaultOptions`, and in the version-dependent `YAML.Document.defaults` object. Values set in `YAML.defaultOptions` override version-dependent defaults, and argument options override both.

The `version` option value (`'1.2'` by default) may be overridden by any document-specific `%YAML` directive.

| Option          | Type                                          | Description                                                                                                                                                             |
| --------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| anchorPrefix    | `string`                                      | Default prefix for anchors. By default `'a'`, resulting in anchors `a1`, `a2`, etc.                                                                                     |
| customTags      | `Tag[] ⎮ function`                            | Array of [additional tags](#custom-data-types) to include in the schema                                                                                                 |
| indent          | `number`                                      | The number of spaces to use when indenting code. By default `2`.                                                                                                        |
| indentSeq       | `boolean`                                     | Whether block sequences should be indented. By default `true`.                                                                                                          |
| keepBlobsInJSON | `boolean`                                     | Allow non-JSON JavaScript objects to remain in the `toJSON` output. Relevant with the YAML 1.1 `!!timestamp` and `!!binary` tags as well as BigInts. By default `true`. |
| keepCstNodes    | `boolean`                                     | Include references in the AST to each node's corresponding CST node. By default `false`.                                                                                |
| keepNodeTypes   | `boolean`                                     | Store the original node type when parsing documents. By default `true`.                                                                                                 |
| mapAsMap        | `boolean`                                     | When outputting JS, use Map rather than Object to represent mappings. By default `false`.                                                                               |
| maxAliasCount   | `number`                                      | Prevent [exponential entity expansion attacks] by limiting data aliasing count; set to `-1` to disable checks; `0` disallows all alias nodes. By default `100`.         |
| merge           | `boolean`                                     | Enable support for `<<` merge keys. By default `false` for YAML 1.2 and `true` for earlier versions.                                                                    |
| prettyErrors    | `boolean`                                     | Include line position & node type directly in errors; drop their verbose source and context. By default `false`.                                                        |
| schema          | `'core' ⎮ 'failsafe' ⎮` `'json' ⎮ 'yaml-1.1'` | The base schema to use. By default `'core'` for YAML 1.2 and `'yaml-1.1'` for earlier versions.                                                                         |
| simpleKeys      | `boolean`                                     | When stringifying, require keys to be scalars and to use implicit rather than explicit notation. By default `false`.                                                    |
| sortMapEntries  | `boolean ⎮` `(a, b: Pair) => number`          | When stringifying, sort map entries. If `true`, sort by comparing key values with `<`. By default `false`.                                                              |
| version         | `'1.0' ⎮ '1.1' ⎮ '1.2'`                       | The YAML version used by documents without a `%YAML` directive. By default `'1.2'`.                                                                                     |

[exponential entity expansion attacks]: https://en.wikipedia.org/wiki/Billion_laughs_attack

## Data Schemas

```js
YAML.parse('3') // 3
YAML.parse('3', { schema: 'failsafe' }) // '3'

YAML.parse('No') // 'No'
YAML.parse('No', { schema: 'json' }) // SyntaxError: Unresolved plain scalar "No"
YAML.parse('No', { schema: 'yaml-1.1' }) // false
YAML.parse('No', { version: '1.1' }) // false

YAML.parse('{[1, 2]: many}') // { '[1,2]': 'many' }
YAML.parse('{[1, 2]: many}', { mapAsMap: true }) // Map { [ 1, 2 ] => 'many' }
```

Aside from defining the language structure, the YAML 1.2 spec defines a number of different _schemas_ that may be used. The default is the [`core`](http://yaml.org/spec/1.2/spec.html#id2804923) schema, which is the most common one. The [`json`](http://yaml.org/spec/1.2/spec.html#id2803231) schema is effectively the minimum schema required to parse JSON; both it and the core schema are supersets of the minimal [`failsafe`](http://yaml.org/spec/1.2/spec.html#id2802346) schema.

The `yaml-1.1` schema matches the more liberal [YAML 1.1 types](http://yaml.org/type/) (also used by YAML 1.0), including binary data and timestamps as distinct tags as well as accepting greater variance in scalar values (with e.g. `'No'` being parsed as `false` rather than a string value). The `!!value` and `!!yaml` types are not supported.

```js
YAML.defaultOptions.merge = true

const mergeResult = YAML.parse(`
source: &base { a: 1, b: 2 }
target:
  <<: *base
  b: base
`)

mergeResult.target
// { a: 1, b: 'base' }
```

**Merge** keys are a [YAML 1.1 feature](http://yaml.org/type/merge.html) that is not a part of the 1.2 spec. To use a merge key, assign an alias node or an array of alias nodes as the value of a `<<` key in a mapping.

## Scalar Options

```js
// Without simpleKeys, an all-null-values object uses explicit keys & no values
YAML.stringify({ 'this is': null }, { simpleKeys: true })
// this is: null

YAML.scalarOptions.null.nullStr = '~'
YAML.scalarOptions.str.defaultType = 'QUOTE_SINGLE'
YAML.stringify({ 'this is': null }, { simpleKeys: true })
// 'this is': ~
```

#### `YAML.scalarOptions`

Some customization options are availabe to control the parsing and stringification of scalars. Note that these values are used by all documents.

These options objects are also exported individually from `'yaml/types'`.

| Option             | Type      | Default value                                       | Description                                                                                                                                                                |
| ------------------ | --------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| binary.defaultType | `Type`    | `'BLOCK_LITERAL'`                                   | The type of string literal used to stringify `!!binary` values                                                                                                             |
| binary.lineWidth   | `number`  | `76`                                                | Maximum line width for `!!binary` values                                                                                                                                   |
| bool.trueStr       | `string`  | `'true'`                                            | String representation for `true` values                                                                                                                                    |
| bool.falseStr      | `string`  | `'false'`                                           | String representation for `false` values                                                                                                                                   |
| int.asBigInt       | `boolean` | `false`                                             | Whether integers should be parsed into [BigInt] values                                                                                                                     |
| null.nullStr       | `string`  | `'null'`                                            | String representation for `null` values                                                                                                                                    |
| str.defaultType    | `Type`    | `'PLAIN'`                                           | The default type of string literal used to stringify values                                                                                                                |
| str.doubleQuoted   | `object`  | `{ jsonEncoding: false,` `minMultiLineLength: 40 }` | `jsonEncoding`: Whether to restrict double-quoted strings to use JSON-compatible syntax; `minMultiLineLength`: Minimum length to use multiple lines to represent the value |
| str.fold           | `object`  | `{ lineWidth: 80,` `minContentWidth: 20 }`          | `lineWidth`: Maximum line width (set to `0` to disable folding); `minContentWidth`: Minimum width for highly-indented content                                              |

[bigint]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/BigInt

## Silencing Warnings

By default, the library will emit warnings for uses of deprecated APIs and as required by the YAML spec during parsing. If you'd like to silence these, define a global variable `YAML_SILENCE_WARNINGS` with a true-ish value. To silence only deprecation warnings, use `YAML_SILENCE_DEPRECATION_WARNINGS`. These values may also be set in `process.env`.

# Documents

In order to work with YAML features not directly supported by native JavaScript data types, such as comments, anchors and aliases, `yaml` provides the `YAML.Document` API.

## Parsing Documents

```js
import fs from 'fs'
import YAML from 'yaml'

const file = fs.readFileSync('./file.yml', 'utf8')
const doc = YAML.parseDocument(file)
doc.contents
// YAMLMap {
//   items:
//    [ Pair {
//        key: Scalar { value: 'YAML', range: [ 0, 4 ] },
//        value:
//         YAMLSeq {
//           items:
//            [ Scalar {
//                value: 'A human-readable data serialization language',
//                range: [ 10, 55 ] },
//              Scalar {
//                value: 'https://en.wikipedia.org/wiki/YAML',
//                range: [ 59, 94 ] } ],
//           tag: 'tag:yaml.org,2002:seq',
//           range: [ 8, 94 ] } },
//      Pair {
//        key: Scalar { value: 'yaml', range: [ 94, 98 ] },
//        value:
//         YAMLSeq {
//           items:
//            [ Scalar {
//                value: 'A complete JavaScript implementation',
//                range: [ 104, 141 ] },
//              Scalar {
//                value: 'https://www.npmjs.com/package/yaml',
//                range: [ 145, 180 ] } ],
//           tag: 'tag:yaml.org,2002:seq',
//           range: [ 102, 180 ] } } ],
//   tag: 'tag:yaml.org,2002:map',
//   range: [ 0, 180 ] }
```

#### `YAML.parseDocument(str, options = {}): YAML.Document`

Parses a single `YAML.Document` from the input `str`; used internally by `YAML.parse`. Will include an error if `str` contains more than one document. See [Options](#options) for more information on the second parameter.

<br/>

#### `YAML.parseAllDocuments(str, options = {}): YAML.Document[]`

When parsing YAML, the input string `str` may consist of a stream of documents separated from each other by `...` document end marker lines. `YAML.parseAllDocuments` will return an array of `Document` objects that allow these documents to be parsed and manipulated with more control. See [Options](#options) for more information on the second parameter.

<br/>

These functions should never throw; errors and warnings are included in the documents' `errors` and `warnings` arrays. In particular, if `errors` is not empty it's likely that the document's parsed `contents` are not entirely correct.

The `contents` of a parsed document will always consist of `Scalar`, `Map`, `Seq` or `null` values.

## Creating Documents

#### `new YAML.Document(options = {})`

| Member              | Type                                | Description                                                                                                                                                              |
| ------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| anchors             | [`Anchors`](#anchors)               | Anchors associated with the document's nodes; also provides alias & merge node creators.                                                                                 |
| commentBefore       | `string?`                           | A comment at the very beginning of the document. If not empty, separated from the rest of the document by a blank line or the directives-end indicator when stringified. |
| comment             | `string?`                           | A comment at the end of the document. If not empty, separated from the rest of the document by a blank line when stringified.                                            |
| contents            | [`Node`](#content-nodes)&vert;`any` | The document contents.                                                                                                                                                   |
| directivesEndMarker | `boolean?`                          | Whether the document should always include a directives-end marker `---` at its start, even if it includes no directives.                                                |
| errors              | `Error[]`                           | Errors encountered during parsing.                                                                                                                                       |
| schema              | `Schema`                            | The schema used with the document.                                                                                                                                       |
| tagPrefixes         | `Prefix[]`                          | Array of prefixes; each will have a string `handle` that starts and ends with `!` and a string `prefix` that the handle will be replaced by.                             |
| version             | `string?`                           | The parsed version of the source document; if true-ish, stringified output will include a `%YAML` directive.                                                             |
| warnings            | `Error[]`                           | Warnings encountered during parsing.                                                                                                                                     |

```js
const doc = new YAML.Document()
doc.version = true
doc.commentBefore = ' A commented document'
doc.contents = ['some', 'values', { balloons: 99 }]

String(doc)
// # A commented document
// %YAML 1.2
// ---
// - some
// - values
// - balloons: 99
```

The Document members are all modifiable, though it's unlikely that you'll have reason to change `errors`, `schema` or `warnings`. In particular you may be interested in both reading and writing **`contents`**. Although `YAML.parseDocument()` and `YAML.parseAllDocuments()` will leave it with `Map`, `Seq`, `Scalar` or `null` contents, it can be set to anything.

During stringification, a document with a true-ish `version` value will include a `%YAML` directive; the version number will be set to `1.2` unless the `yaml-1.1` schema is in use.

## Document Methods

| Method                       | Returns    | Description                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| listNonDefaultTags()         | `string[]` | List the tags used in the document that are not in the default `tag:yaml.org,2002:` namespace.                                                                                                                                                                                                                                                                                                           |
| parse(cst)                   | `Document` | Parse a CST into this document. Mostly an internal method, modifying the document according to the contents of the parsed `cst`. Calling this multiple times on a Document is not recommended.                                                                                                                                                                                                           |
| setSchema(id, customTags)    | `void`     | When a document is created with `new YAML.Document()`, the schema object is not set as it may be influenced by parsed directives; call this with no arguments to set it manually, or with arguments to change the schema used by the document. `id` may either be a YAML version, or the identifier of a YAML 1.2 schema; if set, `customTags` should have the same shape as the similarly-named option. |
| setTagPrefix(handle, prefix) | `void`     | Set `handle` as a shorthand string for the `prefix` tag namespace.                                                                                                                                                                                                                                                                                                                                       |
| toJSON()                     | `any`      | A plain JavaScript representation of the document `contents`.                                                                                                                                                                                                                                                                                                                                            |
| toString()                   | `string`   | A YAML representation of the document.                                                                                                                                                                                                                                                                                                                                                                   |

```js
const doc = YAML.parseDocument('a: 1\nb: [2, 3]\n')
doc.get('a') // 1
doc.getIn([]) // YAMLMap { items: [Pair, Pair], ... }
doc.hasIn(['b', 0]) // true
doc.addIn(['b'], 4) // -> doc.get('b').items.length === 3
doc.deleteIn(['b', 1]) // true
doc.getIn(['b', 1]) // 4
```

In addition to the above, the document object also provides the same **accessor methods** as [collections](#collections), based on the top-level collection: `add`, `delete`, `get`, `has`, and `set`, along with their deeper variants `addIn`, `deleteIn`, `getIn`, `hasIn`, and `setIn`. For the `*In` methods using an empty `path` value (i.e. `null`, `undefined`, or `[]`) will refer to the document's top-level `contents`.

To define a tag prefix to use when stringifying, use **`setTagPrefix(handle, prefix)`** rather than setting a value directly in `tagPrefixes`. This will guarantee that the `handle` is valid (by throwing an error), and will overwrite any previous definition for the `handle`. Use an empty `prefix` value to remove a prefix.

```js
const src = '1969-07-21T02:56:15Z'
const doc = YAML.parseDocument(src, { customTags: ['timestamp'] })

doc.toJSON()
// Date { 1969-07-21T02:56:15.000Z }

doc.options.keepBlobsInJSON = false
doc.toJSON()
// '1969-07-21T02:56:15.000Z'

String(doc)
// '1969-07-21T02:56:15\n'
```

For a plain JavaScript representation of the document, **`toJSON()`** is your friend. By default the values wrapped in scalar nodes will not be forced to JSON, so e.g. a `!!timestamp` will remain a `Date` in the output. To change this behaviour and enforce JSON values only, set the [`keepBlobsInJSON` option](#options) to `false`.

Conversely, to stringify a document as YAML, use **`toString()`**. This will also be called by `String(doc)`. This method will throw if the `errors` array is not empty.

## Working with Anchors

A description of [alias and merge nodes](#alias-nodes) is included in the next section.

<br/>

#### `YAML.Document#anchors`

| Method                                 | Returns    | Description                                                                                                                |
| -------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| createAlias(node: Node, name?: string) | `Alias`    | Create a new `Alias` node, adding the required anchor for `node`. If `name` is empty, a new anchor name will be generated. |
| createMergePair(...Node)               | `Merge`    | Create a new `Merge` node with the given source nodes. Non-`Alias` sources will be automatically wrapped.                  |
| getName(node: Node)                    | `string?`  | The anchor name associated with `node`, if set.                                                                            |
| getNames()                             | `string[]` | List of all defined anchor names.                                                                                          |
| getNode(name: string)                  | `Node?`    | The node associated with the anchor `name`, if set.                                                                        |
| newName(prefix: string)                | `string`   | Find an available anchor name with the given `prefix` and a numerical suffix.                                              |
| setAnchor(node: Node, name?: string)   | `string?`  | Associate an anchor with `node`. If `name` is empty, a new name will be generated.                                         |

```js
const src = '[{ a: A }, { b: B }]'
const doc = YAML.parseDocument(src)
const { anchors, contents } = doc
const [a, b] = contents.items
anchors.setAnchor(a.items[0].value) // 'a1'
anchors.setAnchor(b.items[0].value) // 'a2'
anchors.setAnchor(null, 'a1') // 'a1'
anchors.getName(a) // undefined
anchors.getNode('a2')
// { value: 'B', range: [ 16, 18 ], type: 'PLAIN' }
String(doc)
// [ { a: A }, { b: &a2 B } ]

const alias = anchors.createAlias(a, 'AA')
contents.items.push(alias)
doc.toJSON()
// [ { a: 'A' }, { b: 'B' }, { a: 'A' } ]
String(doc)
// [ &AA { a: A }, { b: &a2 B }, *AA ]

const merge = anchors.createMergePair(alias)
b.items.push(merge)
doc.toJSON()
// [ { a: 'A' }, { b: 'B', a: 'A' }, { a: 'A' } ]
String(doc)
// [ &AA { a: A }, { b: &a2 B, <<: *AA }, *AA ]

// This creates a circular reference
merge.value.items.push(anchors.createAlias(b))
doc.toJSON() // [RangeError: Maximum call stack size exceeded]
String(doc)
// [
//   &AA { a: A },
//   &a3 {
//       b: &a2 B,
//       <<:
//         [ *AA, *a3 ]
//     },
//   *AA
// ]
```

The constructors for `Alias` and `Merge` are not directly exported by the library, as they depend on the document's anchors; instead you'll need to use **`createAlias(node, name)`** and **`createMergePair(...sources)`**. You should make sure to only add alias and merge nodes to the document after the nodes to which they refer, or the document's YAML stringification will fail.

It is valid to have an anchor associated with a node even if it has no aliases. `yaml` will not allow you to associate the same name with more than one node, even though this is allowed by the YAML spec (all but the last instance will have numerical suffixes added). To add or reassign an anchor, use **`setAnchor(node, name)`**. The second parameter is optional, and if left out either the pre-existing anchor name of the node will be used, or a new one generated. To remove an anchor, use `setAnchor(null, name)`. The function will return the new anchor's name, or `null` if both of its arguments are `null`.

While the `merge` option needs to be true to parse `Merge` nodes as such, this is not required during stringification.

# Content Nodes

After parsing, the `contents` value of each `YAML.Document` is the root of an [Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) of nodes representing the document (or `null` for an empty document).

## Scalar Values

```js
class Node {
  comment: ?string,   // a comment on or immediately after this
  commentBefore: ?string, // a comment before this
  range: ?[number, number],
      // the [start, end] range of characters of the source parsed
      // into this node (undefined for pairs or if not parsed)
  spaceBefore: ?boolean,
      // a blank line before this node and its commentBefore
  tag: ?string,       // a fully qualified tag, if required
  toJSON(): any       // a plain JS representation of this node
}
```

For scalar values, the `tag` will not be set unless it was explicitly defined in the source document; this also applies for unsupported tags that have been resolved using a fallback tag (string, `Map`, or `Seq`).

```js
class Scalar extends Node {
  format: 'BIN' | 'HEX' | 'OCT' | 'TIME' | undefined,
      // By default (undefined), numbers use decimal notation.
      // The YAML 1.2 core schema only supports 'HEX' and 'OCT'.
  type:
    'BLOCK_FOLDED' | 'BLOCK_LITERAL' | 'PLAIN' |
    'QUOTE_DOUBLE' | 'QUOTE_SINGLE' | undefined,
  value: any
}
```

A parsed document's contents will have all of its non-object values wrapped in `Scalar` objects, which themselves may be in some hierarchy of `Map` and `Seq` collections. However, this is not a requirement for the document's stringification, which is rather tolerant regarding its input values, and will use [`YAML.createNode`](#yaml-createnode) when encountering an unwrapped value.

When stringifying, the node `type` will be taken into account by `!!str` and `!!binary` values, and ignored by other scalars. On the other hand, `!!int` and `!!float` stringifiers will take `format` into account.

## Collections

```js
class Pair extends Node {
  key: Node | any,    // key and value are always Node or null
  value: Node | any,  // when parsed, but can be set to anything
  type: 'PAIR'
}

class Map extends Node {
  items: Array<Pair>,
  type: 'FLOW_MAP' | 'MAP' | undefined
}

class Seq extends Node {
  items: Array<Node | any>,
  type: 'FLOW_SEQ' | 'SEQ' | undefined
}
```

Within all YAML documents, two forms of collections are supported: sequential `Seq` collections and key-value `Map` collections. The JavaScript representations of these collections both have an `items` array, which may (`Seq`) or must (`Map`) consist of `Pair` objects that contain a `key` and a `value` of any type, including `null`. The `items` array of a `Seq` object may contain values of any type.

When stringifying collections, by default block notation will be used. Flow notation will be selected if `type` is `FLOW_MAP` or `FLOW_SEQ`, the collection is within a surrounding flow collection, or if the collection is in an implicit key.

The `yaml-1.1` schema includes [additional collections](https://yaml.org/type/index.html) that are based on `Map` and `Seq`: `OMap` and `Pairs` are sequences of `Pair` objects (`OMap` requires unique keys & corresponds to the JS Map object), and `Set` is a map of keys with null values that corresponds to the JS Set object.

All of the collections provide the following accessor methods:

| Method                      | Returns   | Description                                                                                                                                                                                       |
| --------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| add(value)                  | `void`    | Adds a value to the collection. For `!!map` and `!!omap` the value must be a Pair instance or a `{ key, value }` object, which may not have a key that already exists in the map.                 |
| delete(key)                 | `boolean` | Removes a value from the collection. Returns `true` if the item was found and removed.                                                                                                            |
| get(key,&nbsp;[keepScalar]) | `any`     | Returns item at `key`, or `undefined` if not found. By default unwraps scalar values from their surrounding node; to disable set `keepScalar` to `true` (collections are always returned intact). |
| has(key)                    | `boolean` | Checks if the collection includes a value with the key `key`.                                                                                                                                     |
| set(key, value)             | `any`     | Sets a value in this collection. For `!!set`, `value` needs to be a boolean to add/remove the item from the set.                                                                                  |

<!-- prettier-ignore -->
```js
const map = YAML.createNode({ a: 1, b: [2, 3] })
map.add({ key: 'c', value: 4 })
  // => map.get('c') === 4 && map.has('c') === true
map.addIn(['b'], 5) // -> map.getIn(['b', 2]) === 5
map.delete('c') // true
map.deleteIn(['c', 'f']) // false
map.get('a') // 1
map.get(YAML.createNode('a'), true) // Scalar { value: 1 }
map.getIn(['b', 1]) // 3
map.has('c') // false
map.hasIn(['b', '0']) // true
map.set('c', null)
  // => map.get('c') === null && map.has('c') === true
map.setIn(['c', 'x'])
  // throws Error:
  // Expected YAML collection at c. Remaining path: x
```

For all of these methods, the keys may be nodes or their wrapped scalar values (i.e. `42` will match `Scalar { value: 42 }`) . Keys for `!!seq` should be positive integers, or their string representations. `add()` and `set()` do not automatically call `createNode()` to wrap the value.

Each of the methods also has a variant that requires an iterable as the first parameter, and allows fetching or modifying deeper collections: `addIn(path, value)`, `deleteIn(path)`, `getIn(path, keepScalar)`, `hasIn(path)`, `setIn(path, value)`. If any intermediate node in `path` is a scalar rather than a collection, an error will be thrown. If any of the intermediate collections is not found:

- `getIn` and `hasIn` will return `undefined` or `false` (respectively)
- `addIn` and `setIn` will create missing collections; non-negative integer keys will create sequences, all other keys create maps
- `deleteIn` will throw an error

Note that for `addIn` the path argument points to the collection rather than the item; for maps its `value` should be a `Pair` or an object with `{ key, value }` fields.

## Alias Nodes

```js
class Alias extends Node {
  source: Scalar | Map | Seq,
  type: 'ALIAS'
}

const obj = YAML.parse('[ &x { X: 42 }, Y, *x ]')
  // => [ { X: 42 }, 'Y', { X: 42 } ]
obj[2].Z = 13
  // => [ { X: 42, Z: 13 }, 'Y', { X: 42, Z: 13 } ]
YAML.stringify(obj)
  // - &a1
  //   X: 42
  //   Z: 13
  // - Y
  // - *a1
```

`Alias` nodes provide a way to include a single node in multiple places in a document; the `source` of an alias node must be a preceding node in the document. Circular references are fully supported, and where possible the JS representation of alias nodes will be the actual source object.

When directly stringifying JS structures with `YAML.stringify()`, multiple references to the same object will result in including an autogenerated anchor at its first instance, and alias nodes to that anchor at later references. Directly calling `YAML.createNode()` will not create anchors or alias nodes, allowing for greater manual control.

```js
class Merge extends Pair {
  key: Scalar('<<'),      // defined by the type specification
  value: Seq<Alias(Map)>, // stringified as *A if length = 1
  type: 'MERGE_PAIR'
}
```

`Merge` nodes are not a core YAML 1.2 feature, but are defined as a [YAML 1.1 type](http://yaml.org/type/merge.html). They are only valid directly within a `Map#items` array and must contain one or more `Alias` nodes that themselves refer to `Map` nodes. When the surrounding map is resolved as a plain JS object, the key-value pairs of the aliased maps will be included in the object. Earlier `Alias` nodes override later ones, as do values set in the object directly.

To create and work with alias and merge nodes, you should use the [`YAML.Document#anchors`](#working-with-anchors) object.

## Creating Nodes

```js
const seq = YAML.createNode(['some', 'values', { balloons: 99 }])
// YAMLSeq {
//   items:
//    [ Scalar { value: 'some' },
//      Scalar { value: 'values' },
//      YAMLMap {
//        items:
//         [ Pair {
//             key: Scalar { value: 'balloons' },
//             value: Scalar { value: 99 } } ] } ] }

const doc = new YAML.Document()
doc.contents = seq
seq.items[0].comment = ' A commented item'
String(doc)
// - some # A commented item
// - values
// - balloons: 99
```

#### `YAML.createNode(value, wrapScalars?, tag?): Node`

`YAML.createNode` recursively turns objects into [collections](#collections). Generic objects as well as `Map` and its descendants become mappings, while arrays and other iterable objects result in sequences. If `wrapScalars` is undefined or `true`, it also wraps plain values in `Scalar` objects; if it is false and `value` is not an object, it will be returned directly.

To specify the collection type, set `tag` to its identifying string, e.g. `"!!omap"`. Note that this requires the corresponding tag to be available based on the default options. To use a specific document's schema, use the wrapped method `doc.schema.createNode(value, wrapScalars, tag)`.

The primary purpose of this function is to enable attaching comments or other metadata to a value, or to otherwise exert more fine-grained control over the stringified output. To that end, you'll need to assign its return value to the `contents` of a Document (or somewhere within said contents), as the document's schema is required for YAML string output.

<h4 style="clear:both"><code>new Map(), new Seq(), new Pair(key, value)</code></h4>

```js
import YAML from 'yaml'
import { Pair, YAMLSeq } from 'yaml/types'

const doc = new YAML.Document()
doc.contents = new YAMLSeq()
doc.contents.items = [
  'some values',
  42,
  { including: 'objects', 3: 'a string' }
]
doc.contents.items.push(new Pair(1, 'a number'))

doc.toString()
// - some values
// - 42
// - "3": a string
//   including: objects
// - 1: a number
```

To construct a `YAMLSeq` or `YAMLMap`, use [`YAML.createNode()`](#yaml-createnode) with array, object or iterable input, or create the collections directly by importing the classes from `yaml/types`.

Once created, normal array operations may be used to modify the `items` array. New `Pair` objects may created either by importing the class from `yaml/types` and using its `new Pair(key, value)` constructor, or by using the `doc.schema.createPair(key, value)` method. The latter will recursively wrap the `key` and `value` as nodes.

## Comments

```js
const doc = YAML.parseDocument(`
# This is YAML.
---
it has:
  - an array
  - of values
`)

doc.toJSON()
// { 'it has': [ 'an array', 'of values' ] }

doc.commentBefore
// ' This is YAML.'

const seq = doc.contents.items[0].value
seq.items[0].comment = ' item comment'
seq.comment = ' collection end comment'

doc.toString()
// # This is YAML.
//
// it has:
//   - an array # item comment
//   - of values
//   # collection end comment
```

A primary differentiator between this and other YAML libraries is the ability to programmatically handle comments, which according to [the spec](http://yaml.org/spec/1.2/spec.html#id2767100) "must not have any effect on the serialization tree or representation graph. In particular, comments are not associated with a particular node."

This library does allow comments to be handled programmatically, and does attach them to particular nodes (most often, the following node). Each `Scalar`, `Map`, `Seq` and the `Document` itself has `comment` and `commentBefore` members that may be set to a stringifiable value.

The string contents of comments are not processed by the library, except for merging adjacent comment lines together and prefixing each line with the `#` comment indicator. Document comments will be separated from the rest of the document by a blank line.

**Note**: Due to implementation details, the library's comment handling is not completely stable. In particular, when creating, writing, and then reading a YAML file, comments may sometimes be associated with a different node.

## Blank Lines

```js
const doc = YAML.parseDocument('[ one, two, three ]')

doc.contents.items[0].comment = ' item comment'
doc.contents.items[1].spaceBefore = true
doc.comment = ' document end comment'

doc.toString()
// [
//   one, # item comment
//
//   two,
//   three
// ]
//
// # document end comment
```

Similarly to comments, the YAML spec instructs non-content blank lines to be discarded. Instead of doing that, `yaml` provides a `spaceBefore` boolean property for each node. If true, the node (and its `commentBefore`, if any) will be separated from the preceding node by a blank line.

Note that scalar block values with "keep" chomping (i.e. with `+` in their header) consider any trailing empty lines to be a part of their content, so the `spaceBefore` setting of a node following such a value is ignored.

# Custom Data Types

```js
YAML.parse('!!timestamp 2001-12-15 2:59:43')
// YAMLWarning:
//   The tag tag:yaml.org,2002:timestamp is unavailable,
//   falling back to tag:yaml.org,2002:str
// '2001-12-15 2:59:43'

YAML.defaultOptions.customTags = ['timestamp']

YAML.parse('2001-12-15 2:59:43') // returns a Date instance
// 2001-12-15T02:59:43.000Z

const doc = YAML.parseDocument('2001-12-15 2:59:43')
doc.contents.value.toDateString()
// 'Sat Dec 15 2001'
```

The easiest way to extend a [schema](#data-schemas) is by defining the additional **tags** that you wish to support. To do that, the `customTags` option allows you to provide an array of custom tag objects or tag identifiers. In particular, the built-in tags that are a part of the `core` and `yaml-1.1` schemas may be referred to by their string identifiers. For those tags that are available in both, only the `core` variant is provided as a custom tag.

For further customisation, `customTags` may also be a function `(Tag[]) => (Tag[])` that may modify the schema's base tag array.

## Built-in Custom Tags

```js
YAML.parse('[ one, true, 42 ]').map(v => typeof v)
// [ 'string', 'boolean', 'number' ]

let opt = { schema: 'failsafe' }
YAML.parse('[ one, true, 42 ]', opt).map(v => typeof v)
// [ 'string', 'string', 'string' ]

opt = { schema: 'failsafe', customTags: ['int'] }
YAML.parse('[ one, true, 42 ]', opt).map(v => typeof v)
// [ 'string', 'string', 'number' ]
```

### YAML 1.2 Core Schema

These tags are a part of the YAML 1.2 [Core Schema](https://yaml.org/spec/1.2/spec.html#id2804923), and may be useful when constructing a parser or stringifier for a more limited set of types, based on the `failsafe` schema. Some of these define a `format` value; this will be added to the parsed nodes and affects the node's stringification.

If including more than one custom tag from this set, make sure that the `'float'` and `'int'` tags precede any of the other `!!float` and `!!int` tags.

| Identifier   | Regular expression                               | YAML Type | Format  | Example values  |
| ------------ | ------------------------------------------------ | --------- | ------- | --------------- |
| `'bool'`     | `true⎮True⎮TRUE⎮false⎮False⎮FALSE`               | `!!bool`  |         | `true`, `false` |
| `'float'`    | `[-+]?(0⎮[1-9][0-9]*)\.[0-9]*`                   | `!!float` |         | `4.2`, `-0.0`   |
| `'floatExp'` | `[-+]?(0⎮[1-9][0-9]*)(\.[0-9]*)?[eE][-+]?[0-9]+` | `!!float` | `'EXP'` | `4.2e9`         |
| `'floatNaN'` | `[-+]?(\.inf⎮\.Inf⎮\.INF)⎮\.nan⎮\.NaN⎮\.NAN`     | `!!float` |         | `-Infinity`     |
| `'int'`      | `[-+]?[0-9]+`                                    | `!!int`   |         | `42`, `-0`      |
| `'intHex'`   | `0x[0-9a-fA-F]+`                                 | `!!int`   | `'HEX'` | `0xff0033`      |
| `'intOct'`   | `0o[0-7]+`                                       | `!!int`   | `'OCT'` | `0o127`         |
| `'null'`     | `~⎮null⎮Null⎮NULL`                               | `!!null`  |         | `null`          |

### YAML 1.1

These tags are a part of the YAML 1.1 [language-independent types](https://yaml.org/type/), but are not a part of any default YAML 1.2 schema.

| Identifier    | YAML Type                                             | JS Type      | Description                                                                                                                                                                        |
| ------------- | ----------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'binary'`    | [`!!binary`](https://yaml.org/type/binary.html)       | `Uint8Array` | Binary data, represented in YAML as base64 encoded characters.                                                                                                                     |
| `'floatTime'` | [`!!float`](https://yaml.org/type/float.html)         | `Number`     | Sexagesimal floating-point number format, e.g. `190:20:30.15`. To stringify with this tag, the node `format` must be `'TIME'`.                                                     |
| `'intTime'`   | [`!!int`](https://yaml.org/type/int.html)             | `Number`     | Sexagesimal integer number format, e.g. `190:20:30`. To stringify with this tag, the node `format` must be `'TIME'`.                                                               |
| `'omap'`      | [`!!omap`](https://yaml.org/type/omap.html)           | `Map`        | Ordered sequence of key: value pairs without duplicates. Using `mapAsMap: true` together with this tag is not recommended, as it makes the parse → stringify loop non-idempotent.  |
| `'pairs'`     | [`!!pairs`](https://yaml.org/type/pairs.html)         | `Array`      | Ordered sequence of key: value pairs allowing duplicates. To create from JS, you'll need to explicitly use `'!!pairs'` as the third argument of [`createNode()`](#creating-nodes). |
| `'set'`       | [`!!set`](https://yaml.org/type/set.html)             | `Set`        | Unordered set of non-equal values.                                                                                                                                                 |
| `'timestamp'` | [`!!timestamp`](https://yaml.org/type/timestamp.html) | `Date`       | A point in time, e.g. `2001-12-15T02:59:43`.                                                                                                                                       |

## Writing Custom Tags

```js
import { stringifyString } from 'yaml/util'

const regexp = {
  identify: value => value instanceof RegExp,
  tag: '!re',
  resolve(doc, cst) {
    const match = cst.strValue.match(/^\/([\s\S]+)\/([gimuy]*)$/)
    return new RegExp(match[1], match[2])
  }
}

const sharedSymbol = {
  identify: value => value.constructor === Symbol,
  tag: '!symbol/shared',
  resolve: (doc, cst) => Symbol.for(cst.strValue),
  stringify(item, ctx, onComment, onChompKeep) {
    const key = Symbol.keyFor(item.value)
    if (key === undefined) throw new Error('Only shared symbols are supported')
    return stringifyString({ value: key }, ctx, onComment, onChompKeep)
  }
}

YAML.defaultOptions.customTags = [regexp, sharedSymbol]

YAML.stringify({
  regexp: /foo/gi,
  symbol: Symbol.for('bar')
})
// regexp: !re /foo/gi
// symbol: !symbol/shared bar
```

In YAML-speak, a custom data type is represented by a _tag_. To define your own tag, you need to account for the ways that your data is both parsed and stringified. Furthermore, both of those processes are split into two stages by the intermediate AST node structure.

If you wish to implement your own custom tags, the [`!!binary`](https://github.com/eemeli/yaml/blob/master/src/tags/yaml-1.1/binary.js) and [`!!set`](https://github.com/eemeli/yaml/blob/master/src/tags/yaml-1.1/set.js) tags provide relatively cohesive examples to study in addition to the simple examples in the sidebar here.

### Parsing Custom Data

At the lowest level, [`YAML.parseCST()`](#cst-parser) will take care of turning string input into a concrete syntax tree (CST). In the CST all scalar values are available as strings, and maps & sequences as collections of nodes. Each schema includes a set of default data types, which handle converting at least strings, maps and sequences into their AST nodes. These are considered to have _implicit_ tags, and are autodetected. Custom tags, on the other hand, should almost always define an _explicit_ `tag` with which their value will be prefixed. This may be application-specific local `!tag`, a shorthand `!ns!tag`, or a verbatim `!<tag:example.com,2019:tag>`.

Once identified by matching the `tag`, the `resolve(doc, cstNode): Node | any` function will turn a CST node into an AST node. For scalars, this is relatively simple, as the stringified node value is directly available, and should be converted to its actual value. Collections are trickier, and it's almost certain that it'll make sense to use the `parseMap(doc, cstNode)` and `parseSeq(doc, cstNode)` functions exported from `'yaml/util'` to initially resolve the CST collection into a `YAMLMap` or `YAMLSeq` object, and to work with that instead -- this is for instance what the YAML 1.1 collections do.

Note that during the CST -> AST parsing, the anchors and comments attached to each node are also resolved for each node. This metadata will unfortunately be lost when converting the values to JS objects, so collections should have values that extend one of the existing collection classes. Collections should therefore either fall back to their parent classes' `toJSON()` methods, or define their own in order to allow their contents to be expressed as the appropriate JS object.

### Creating Nodes and Stringifying Custom Data

As with parsing, turning input data into its YAML string representation is a two-stage process as the input is first turned into an AST tree before stringifying it. This allows for metadata and comments to be attached to each node, and for e.g. circular references to be resolved. For scalar values, this means just wrapping the value within a `Scalar` class while keeping it unchanged.

As values may be wrapped within objects and arrays, `YAML.createNode()` uses each tag's `identify(value): boolean` function to detect custom data types. For the same reason, collections need to define their own `createNode(schema, value, ctx): Collection` functions that may recursively construct their equivalent collection class instances.

Finally, `stringify(item, ctx, ...): string` defines how your data should be represented as a YAML string, in case the default stringifiers aren't enough. For collections in particular, the default stringifier should be perfectly sufficient. `'yaml/util'` exports `stringifyNumber(item)` and `stringifyString(item, ctx, ...)`, which may be of use for custom scalar data.

### Custom Tag API

<!-- prettier-ignore -->
```js
import {
  findPair, // (items, key) => Pair? -- Given a key, find a matching Pair
  parseMap, // (doc, cstNode) => new YAMLMap
  parseSeq, // (doc, cstNode) => new YAMLSeq
  stringifyNumber, // (node) => string
  stringifyString, // (node, ctx, ...) => string
  toJSON, // (value, arg, ctx) => any -- Recursively convert to plain JS
  Type, // { [string]: string } -- Used as enum for node types
  YAMLReferenceError, YAMLSemanticError, YAMLSyntaxError, YAMLWarning
} from 'yaml/util'
```

To define your own tag, you'll need to define an object comprising of some of the following fields. Those in bold are required:

- `createNode(schema, value, ctx): Node` is an optional factory function, used e.g. by collections when wrapping JS objects as AST nodes.
- `format: string` If a tag has multiple forms that should be parsed and/or stringified differently, use `format` to identify them. Used by `!!int` and `!!float`.
- **`identify(value): boolean`** is used by `YAML.createNode` to detect your data type, e.g. using `typeof` or `instanceof`. Required.
- `nodeClass: Node` is the `Node` child class that implements this tag. Required for collections and tags that have overlapping JS representations.
- `options: Object` is used by some tags to configure their stringification.
- **`resolve(doc, cstNode): Node | any`** turns a CST node into an AST node; `doc` is the resulting `YAML.Document` instance. If returning a non-`Node` value, the output will be wrapped as a `Scalar`. Required.
- `stringify(item, ctx, onComment, onChompKeep): string` is an optional function stringifying the `item` AST node in the current context `ctx`. `onComment` and `onChompKeep` are callback functions for a couple of special cases. If your data includes a suitable `.toString()` method, you can probably leave this undefined and use the default stringifier.
- **`tag: string`** is the identifier for your data type, with which its stringified form will be prefixed. Should either be a !-prefixed local `!tag`, or a fully qualified `tag:domain,date:foo`. Required.
- `test: RegExp` and `default: boolean` allow for values to be stringified without an explicit tag and detected using a regular expression. For most cases, it's unlikely that you'll actually want to use these, even if you first think you do.

# CST Parser

For ease of implementation and to provide better error handling and reporting, the lowest level of the library's parser turns any input string into a [**Concrete Syntax Tree**](https://en.wikipedia.org/wiki/Concrete_syntax_tree) of nodes as if the input were YAML. This level of the API has not been designed to be particularly user-friendly for external users, but it is fast, robust, and not dependent on the rest of the library.

## parseCST

<!-- prettier-ignore -->
```js
import parseCST from 'yaml/parse-cst'

const cst = parseCST(`
sequence: [ one, two, ]
mapping: { sky: blue, sea: green }
---
-
  "flow in block"
- >
 Block scalar
- !!map # Block collection
  foo : bar
`)

cst[0]            // first document, containing a map with two keys
  .contents[0]    // document contents (as opposed to directives)
  .items[3].node  // the last item, a flow map
  .items[3]       // the fourth token, parsed as a plain value
  .strValue       // 'blue'

cst[1]            // second document, containing a sequence
  .contents[0]    // document contents (as opposed to directives)
  .items[1].node  // the second item, a block value
  .strValue       // 'Block scalar\n'
```

#### `parseCST(string): CSTDocument[]`

#### `YAML.parseCST(string): CSTDocument[]`

The CST parser will not produce a CST that is necessarily valid YAML, and in particular its representation of collections of items is expected to undergo further processing and validation. The parser should never throw errors, but may include them as a value of the relevant node. On the other hand, if you feed it garbage, you'll likely get a garbage CST as well.

The public API of the CST layer is a single function which returns an array of parsed CST documents. The array and its contained nodes override the default `toString` method, each returning a YAML string representation of its contents. The same function is exported as a part of the default `YAML` object, as well as seprately at `yaml/parse-cst`. It has no dependency on the rest of the library, so importing only `parseCST` should add about 9kB to your gzipped bundle size, when the whole library will add about 27kB.

Care should be taken when modifying the CST, as no error checks are included to verify that the resulting YAML is valid, or that e.g. indentation levels aren't broken. In other words, this is an engineering tool and you may hurt yourself. If you're looking to generate a brand new YAML document, see the section on [Creating Documents](#creating-documents).

For more usage examples and CST trees, have a look through the [extensive test suite](https://github.com/eemeli/yaml/tree/master/tests/cst) included in the project's repository.

<h3 style="clear:both">Error detection</h3>

```js
import YAML from 'yaml'

const cst = YAML.parseCST('this: is: bad YAML')

cst[0].contents[0] // Note: Simplified for clarity
// { type: 'MAP',
//   items: [
//     { type: 'PLAIN', strValue: 'this' },
//     { type: 'MAP_VALUE',
//       node: {
//         type: 'MAP',
//         items: [
//           { type: 'PLAIN', strValue: 'is' },
//           { type: 'MAP_VALUE',
//             node: { type: 'PLAIN', strValue: 'bad YAML' } } ] } } ] }

const doc = new YAML.Document()
doc.parse(cst[0])
doc.errors
// [ {
//   name: 'YAMLSemanticError',
//   message: 'Nested mappings are not allowed in compact mappings',
//   source: {
//     type: 'MAP',
//     range: { start: 6, end: 18 },
//     ...,
//     rawValue: 'is: bad YAML' } } ]

doc.contents.items[0].value.items[0].value.value
// 'bad YAML'
```

While the YAML spec considers e.g. block collections within a flow collection to be an error, this error will not be detected by the CST parser. For complete validation, you will need to parse the CST into a `YAML.Document`. If the document contains errors, they will be included in the document's `errors` array, and each error will will contain a `source` reference to the CST node where it was encountered. Do note that even if an error is encountered, the document contents might still be available. In such a case, the error will be a [`YAMLSemanticError`](#yamlsemanticerror) rather than a [`YAMLSyntaxError`](#yamlsyntaxerror).

<h3 style="clear:both">Dealing with CRLF line terminators</h3>

```js
import parseCST from 'yaml/parse-cst'

const src = '- foo\r\n- bar\r\n'
const cst = parseCST(src)
cst.setOrigRanges() // true
const { range, valueRange } = cst[0].contents[0].items[1].node

src.slice(range.origStart, range.origEnd)
// 'bar\r\n'

src.slice(valueRange.origStart, valueRange.origEnd)
// 'bar'
```

#### `CST#setOrigRanges(): bool`

The array returned by `parseCST()` will also include a method `setOrigRanges` to help deal with input that includes `\r\n` line terminators, which are converted to just `\n` before parsing into documents. This conversion will obviously change the total length of the string, as well as the offsets of all ranges. If the method returns `false`, the input did not include `\r\n` line terminators and no changes were made. However, if the method returns `true`, each `Range` object within the CST will have its `origStart` and `origEnd` values set appropriately to refer to the original input string.

## CST Nodes

> Node type definitions use Flow-ish notation, so `+` as a prefix indicates a read-only getter property.

```js
class Range {
  start: number,        // offset of first character
  end: number,          // offset after last character
  isEmpty(): boolean,   // true if end is not greater than start
  origStart: ?number,   // set by CST#setOrigRanges(), source
  origEnd: ?number      //   offsets for input with CRLF terminators
}
```

**Note**: The `Node`, `Scalar` and other values referred to in this section are the CST representations of said objects, and are not the same as those used in preceding parts.

Actual values in the CST nodes are stored as `start`, `end` indices of the input string. This allows for memory consumption to be minimised by making string generation really lazy.

<h3 style="clear:both">Node</h3>

```js
class Node {
  context: {            // not enumerable, to simplify logging
    atLineStart: boolean, // is this node the first one on this line
    indent: number,     // current level of indentation (may be -1)
    root: CSTDocument,  // a reference to the parent document
    src: string         // the full original source
  },
  error: ?Error,        // if not null, indicates a parser failure
  props: Array<Range>,  // anchors, tags and comments
  range: Range,         // span of context.src parsed into this node
  type:                 // specific node type
    'ALIAS' | 'BLOCK_FOLDED' | 'BLOCK_LITERAL' | 'COMMENT' |
    'DIRECTIVE' | 'DOCUMENT' | 'FLOW_MAP' | 'FLOW_SEQ' |
    'MAP' | 'MAP_KEY' | 'MAP_VALUE' | 'PLAIN' |
    'QUOTE_DOUBLE' | 'QUOTE_SINGLE' | 'SEQ' | 'SEQ_ITEM',
  value: ?string        // if set to a non-null value, overrides
                        //   source value when stringified
  +anchor: ?string,     // anchor, if set
  +comment: ?string,    // newline-delimited comment(s), if any
  +rangeAsLinePos:      // human-friendly source location
    ?{ start: LinePos, end: ?LinePos },
    // LinePos here is { line: number, col: number }
  +rawValue: ?string,   // an unprocessed slice of context.src
                        //   determining this node's value
  +tag:                 // this node's tag, if set
    null | { verbatim: string } | { handle: string, suffix: string },
  toString(): string    // a YAML string representation of this node
}

type ContentNode =
  Comment | Alias | Scalar | Map | Seq | FlowCollection
```

Each node in the CST extends a common ancestor `Node`. Additional undocumented properties are available, but are likely only useful during parsing.

If a node has its `value` set, that will be used when re-stringifying (initially `undefined` for all nodes).

<h3 style="clear:both">Scalars</h3>

```js
class Alias extends Node {
  // rawValue will contain the anchor without the * prefix
  type: 'ALIAS'
}

class Scalar extends Node {
  type: 'PLAIN' | 'QUOTE_DOUBLE' | 'QUOTE_SINGLE' |
    'BLOCK_FOLDED' | 'BLOCK_LITERAL'
  +strValue: ?string |  // unescaped string value
    { str: string, errors: YAMLSyntaxError[] }
}

class Comment extends Node {
  type: 'COMMENT',      // PLAIN nodes may also be comment-only
  +anchor: null,
  +comment: string,
  +rawValue: null,
  +tag: null
}

class BlankLine extends Comment {
  type: 'BLANK_LINE',   // represents a single blank line, which
  +comment: null        //   may include whitespace
}
```

While `Alias`, `BlankLine` and `Comment` nodes are not technically scalars, they are parsed as such at this level.

Due to parsing differences, each scalar type is implemented using its own class.

<h3 style="clear:both">Collections</h3>

```js
class MapItem extends Node {
  node: ContentNode | null,
  type: 'MAP_KEY' | 'MAP_VALUE'
}

class Map extends Node {
  // implicit keys are not wrapped
  items: Array<Comment | Alias | Scalar | MapItem>,
  type: 'MAP'
}

class SeqItem extends Node {
  node: ContentNode | null,
  type: 'SEQ_ITEM'
}

class Seq extends Node {
  items: Array<Comment | SeqItem>,
  type: 'SEQ'
}

type FlowChar = '{' | '}' | '[' | ']' | ',' | '?' | ':'

class FlowCollection extends Node {
  items: Array<FlowChar | Comment | Alias | Scalar | FlowCollection>,
  type: 'FLOW_MAP' | 'FLOW_SEQ'
}
```

Block and flow collections are parsed rather differently, due to their representation differences.

An `Alias` or `Scalar` item directly within a `Map` should be treated as an implicit map key.

In actual code, `MapItem` and `SeqItem` are implemented as `CollectionItem`, and correspondingly `Map` and `Seq` as `Collection`.

<h3 style="clear:both">Document Structure</h3>

```js
class Directive extends Node {
  name: string,  // should only be 'TAG' or 'YAML'
  type: 'DIRECTIVE',
  +anchor: null,
  +parameters: Array<string>,
  +tag: null
}

class CSTDocument extends Node {
  directives: Array<Comment | Directive>,
  contents: Array<ContentNode>,
  type: 'DOCUMENT',
  directivesEndMarker: Range | null,
  documentEndMarker: Range | null,
  +anchor: null,
  +comment: null,
  +tag: null
}
```

The CST tree of a valid YAML document should have a single non-`Comment` `ContentNode` in its `contents` array. Multiple values indicates that the input is malformed in a way that made it impossible to determine the proper structure of the document. If `directivesEndMarker` or `documentEndMarker` are non-empty, the document includes (respectively) a directives-end marker `---` or a document-end marker `...` with the indicated range.


# Errors

Nearly all errors and warnings produced by the `yaml` parser functions contain the following fields:

| Member  | Type       | Description                                                                                                                                                                  |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name    | `string`   | One of `YAMLReferenceError`, `YAMLSemanticError`, `YAMLSyntaxError`, or `YAMLWarning`                                                                                        |
| message | `string`   | A human-readable description of the error                                                                                                                                    |
| source  | `CST Node` | The CST node at which this error or warning was encountered. Note that in particular `source.context` is likely to be a complex object and include some circular references. |

If the `prettyErrors` option is enabled, `source` is dropped from the errors and the following fields are added with summary information regarding the error's source node, if available:

| Member   | Type                                | Description                                                                                   |
| -------- | ----------------------------------- | --------------------------------------------------------------------------------------------- |
| nodeType | `string`                            | A string constant identifying the type of node                                                |
| range    | `{ start: number, end: ?number }`   | Character offset in the input string                                                          |
| linePos  | `{ start: LinePos, end: ?LinePos }` | One-indexed human-friendly source location. `LinePos` here is `{ line: number, col: number }` |

In rare cases, the library may produce a more generic error. In particular, `TypeError` may occur when parsing invalid input using the `json` schema, and `ReferenceError` when the `maxAliasCount` limit is enountered.

## YAMLReferenceError

An error resolving a tag or an anchor that is referred to in the source. It is likely that the contents of the `source` node have not been completely parsed into the document. Not used by the CST parser.

## YAMLSemanticError

An error related to the metadata of the document, or an error with limitations imposed by the YAML spec. The data contents of the document should be valid, but the metadata may be broken.

## YAMLSyntaxError

A serious parsing error; the document contents will not be complete, and the CST is likely to be rather broken.

## YAMLWarning

Not an error, but a spec-mandated warning about unsupported directives or a fallback resolution being used for a node with an unavailable tag. Not used by the CST parser.

# YAML Syntax

A YAML _schema_ is a combination of a set of tags and a mechanism for resolving non-specific tags, i.e. values that do not have an explicit tag such as `!!int`. The [default schema](#data-schemas) is the `'core'` schema, which is the recommended one for YAML 1.2. For YAML 1.0 and YAML 1.1 documents the default is `'yaml-1.1'`.

## Tags

```js
YAML.parse('"42"')
// '42'

YAML.parse('!!int "42"')
// 42

YAML.parse(`
%TAG ! tag:example.com,2018:app/
---
!foo 42
`)
// YAMLWarning:
//   The tag tag:example.com,2018:app/foo is unavailable,
//   falling back to tag:yaml.org,2002:str
// '42'
```

The default prefix for YAML tags is `tag:yaml.org,2002:`, for which the shorthand `!!` is used when stringified. Shorthands for other prefixes may also be defined by document-specific directives, e.g. `!e!` or just `!` for `tag:example.com,2018:app/`, but this is not required to use a tag with a different prefix.

During parsing, unresolved tags should not result in errors (though they will be noted as `warnings`), with the tagged value being parsed according to the data type that it would have under automatic tag resolution rules. This should not result in any data loss, allowing such tags to be handled by the calling app.

In order to have `yaml` provide you with automatic parsing and stringification of non-standard data types, it will need to be configured with a suitable tag object. For more information, see [Custom Tags](#custom-tags).

The YAML 1.0 tag specification is [slightly different](#changes-from-yaml-1-0-to-1-1) from that used in later versions, and implements prefixing shorthands rather differently.

## Version Differences

This library's parser is based on the 1.2 version of the [YAML spec](http://yaml.org/spec/1.2/spec.html), which is mostly backwards-compatible with [YAML 1.1](http://yaml.org/spec/1.1/) as well as [YAML 1.0](http://yaml.org/spec/1.0/). Some specific relaxations have been added for backwards compatibility, but if you encounter an issue please [report it](https://github.com/eemeli/yaml/issues).

### Changes from YAML 1.1 to 1.2

```yaml
%YAML 1.1
---
true: Yes
octal: 014
sexagesimal: 3:25:45
picture: !!binary |
  R0lGODlhDAAMAIQAAP//9/X
  17unp5WZmZgAAAOfn515eXv
  Pz7Y6OjuDg4J+fn5OTk6enp
  56enmleECcgggoBADs=
```

```js
{ true: true,
  octal: 12,
  sexagesimal: 12345,
  picture:
   Buffer [Uint8Array] [
     71, 73, 70, 56, 57, 97, 12, 0, 12, 0, 132, 0, 0,
     255, 255, 247, 245, 245, 238, 233, 233, 229, 102,
     102, 102, 0, 0, 0, 231, 231, 231, 94, 94, 94, 243,
     243, 237, 142, 142, 142, 224, 224, 224, 159, 159,
     159, 147, 147, 147, 167, 167, 167, 158, 158, 158,
     105, 94, 16, 39, 32, 130, 10, 1, 0, 59 ] }
```

The most significant difference between YAML 1.1 and YAML 1.2 is the introduction of the core data schema as the recommended default, replacing the YAML 1.1 type library:

- Only `true` and `false` strings are parsed as booleans (including `True` and `TRUE`); `y`, `yes`, `on`, and their negative counterparts are parsed as strings.
- Underlines `_` cannot be used within numerical values.
- Octal values need a `0o` prefix; e.g. `010` is now parsed with the value 10 rather than 8.
- The binary and sexagesimal integer formats have been dropped.
- The `!!pairs`, `!!omap`, `!!set`, `!!timestamp` and `!!binary` types have been dropped.
- The merge `<<` and value `=` special mapping keys have been removed.

The other major change has been to make sure that YAML 1.2 is a valid superset of JSON. Additionally there are some minor differences between the parsing rules:

- The next-line `\x85`, line-separator `\u2028` and paragraph-separator `\u2029` characters are no longer considered line-break characters. Within scalar values, this means that next-line characters will not be included in the white-space normalisation. Using any of these outside scalar values is likely to result in errors during parsing. For a relatively robust solution, try replacing `\x85` and `\u2028` with `\n` and `\u2029` with `\n\n`.
- Tag shorthands can no longer include any of the characters `,[]{}`, but can include `#`. To work around this, either fix your tag names or use verbatim tags.
- Anchors can no longer include any of the characters `,[]{}`.
- Inside double-quoted strings `\/` is now a valid escape for the `/` character.
- Quoted content can include practically all Unicode characters.
- Documents in streams are now independent of each other, and no longer inherit preceding document directives if they do not define their own.

### Changes from YAML 1.0 to 1.1

```text
%YAML:1.0
---
date: 2001-01-23
number: !int '123'
string: !str 123
pool: !!ball { number: 8 }
invoice: !domain.tld,2002/^invoice
  customers: !seq
    - !^customer
      given : Chris
      family : Dumars
```

```js
// YAMLWarning:
//   The tag tag:private.yaml.org,2002:ball is unavailable,
//   falling back to tag:yaml.org,2002:map
// YAMLWarning:
//   The tag tag:domain.tld,2002/^invoice is unavailable,
//   falling back to tag:yaml.org,2002:map
// YAMLWarning:
//   The tag ^customer is unavailable,
//   falling back to tag:yaml.org,2002:map
{ date: '2001-01-23T00:00:00.000Z',
  number: 123,
  string: '123',
  pool: { number: 8 },
  invoice: { customers: [ { given: 'Chris', family: 'Dumars' } ] } }
```

The most significant difference between these versions is the complete refactoring of the tag syntax:

- The `%TAG` directive has been added, along with the `!foo!` tag prefix shorthand notation.
- The `^` character no longer enables tag prefixing.
- The private vs. default scoping of `!` and `!!` tag prefixes has been switched around; `!!str` is now a default tag while `!bar` is an application-specific tag.
- Verbatim `!<baz>` tag notation has been added.
- The formal `tag:domain,date/path` format for tag names has been dropped as a requirement.

Additionally, the formal description of the language describing the document structure has been completely refactored between these versions, but the described intent has not changed. Other changes include:

- A `\` escape has been added for the tab character, in addition to the pre-existing `\t`
- The `\^` escape has been removed
- Directives now use a blank space `' '` rather than `:` as the separator between the name and its parameter/value.

`yaml` supports parsing and stringifying YAML 1.0 tags, but does not expand tags using the `^` notation. If this is something you'd find useful, please file a [GitHub issue](https://github.com/eemeli/yaml/issues) about it.
