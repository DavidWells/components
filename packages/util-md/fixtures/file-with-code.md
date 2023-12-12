---
title: 'Promisified node.js file system utilities'
author: David Wells
date: 2020-05-10
layout: post
category: snippets
tags:
  - javascript
  - node
---

## Code blocks

For code blocks that allows multiple lines, syntax highlighting, line numbers and line highlighting, use triple backticks for code fencing: ```.

````md
Four tick box
````

```javascript prop=here
console.log('test')
```

````md
```javascript
console.log('test')
```
````

Javascript example:

```javascript
const s = "JavaScript syntax highlighting"
alert(s)
```

<details>
  <summary>Javascript code markdown</summary>

  ````md
  ```javascript
  const s = "JavaScript syntax highlighting"
  alert(s)
  ```
  ````
</details>

Python example:

<details>
  <summary>Python code markdown</summary>

  ````md
  ```python
  s = "zPython syntax highlighting"
  print s
  ```
  ````
</details>


```python
s = "Python syntax highlighting"
print s
```

## Post contents

Node introduced the `promisify` utilities in back in version 8.

There are a couple bits missing from the core node.js filesystem.

Below is the promisified file system calls I use a bunch in projects.

I've added `createDir`, `fileExists`, and `deleteDir` to smooth over some of the core `fs` methods that can be a little awkward to work with.
Let me know if you have other file system utilities you like to use in the comments below.

~~~md
Three tilde box
~~~


<pre>
  <code>
  cool
  </code>
</pre>
