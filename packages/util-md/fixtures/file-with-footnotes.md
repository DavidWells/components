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

[^1]: This is the first footnote.

````md
Four tick box
````

```javascript prop=here
console.log('test')
```

[^2]: Here's one with multiple paragraphs and code.

    Indent paragraphs to include them in the footnote.

    `{ my code }`

    Add as many paragraphs as you like.

This is another line.

Here's a simple footnote,[^1] and here's a longer one.[^bignote]


Not indented text.

[^3]: Here's one with multiple paragraphs and code.

  Indent paragraphs to include them in the footnote.

    `{ my code }`

    Add as many paragraphs as you like.

This is another line.
Not indented text.

[^4]: This is the fourth footnote.
hdhdhdh


## Post contents

Node introduced the `promisify` utilities in back in version 8.

[whatever]: https://github.com/cool "ignore this in footnotes check"

There are a couple bits missing from the core node.js filesystem.

Below is the promisified file system calls I use a bunch in projects.

I've added `createDir`, `fileExists`, and `deleteDir` to smooth over some of the core `fs` methods that can be a little awkward to work with.
Let me know if you have other file system utilities you like to use in the comments below.

~~~md
Three tilde box
~~~
