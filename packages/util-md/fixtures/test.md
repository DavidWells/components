---
draft: true
title: How to synchronize remote content in markdown files
slug: how-to-synchronize-remote-content-in-markdown-files
date: 2024-08-28T20:17
createdBy: David Wells
createdAt: 2024-08-29T03:27:50.016Z
updatedBy: David Wells
updatedAt: 2024-08-29T03:34:01.435Z
id: 76d167b7-831a-41fb-b5da-45d17ec62870
---

Markdown is an amazing authoring format. It frees us from the shackles of Microsoft word and let's you focus primarily on the content.

As a developer, you will write **ALOT** of markdown over the course of your career.

But like any text document, md docs can grow stale over time.

## Addressing Docs drift

As a project grows, we forget what docs we've authored and what information we've added into the docs we did write.

It's understandable. We can't keep it all in our head. But this leads to a terrible developer experience.

When you have dead links, or worse, outdated information in your docs it makes it hard to trust the content.

We can do better.

## So how can we fix it?

References. Automagic references.

> What if we could reference the source of truth in our docs and have them automatically update if something changes?

Enter markdown magic.

This syncing problem was one of the reasons I created markdown magic.

Markdown magic utilizes html comment blocks, that render invisibly to readers, to mark where remote contents should be placed.

A block is defined like this `<!-- doc-gen {transformName} [options] -->` where `transformName` is the type of transformation the block should use along with any inputs it might need via `options`.

Then blocks are closed with `<!-- end-doc-gen -->`. The inner content of the block is replaced with the transformed content.

It looks like this:

```md
<!-- doc-gen remote url="https://github.com/DavidWells/markdown-magic/blob/master/my-remote-source-of-truth.md" -->
This will be replaced with the remote content via the `remote` transform
<!-- end-doc-gen -->
```

The result of the above block would be the content of the remote file like so

```md
<!-- doc-gen remote url="https://github.com/DavidWells/markdown-magic/blob/master/my-remote-source-of-truth.md" -->
My amazing remote content
<!-- end-doc-gen -->
```

The text "My amazing remote content" would then be visible in the markdown file for any reader on Github or in your docs site.

## Syncing in code

The remote transform is just one of many transforms available in markdown magic.

Here's another that uses the `code` transform. The `code` transform is similar but it will automatically wrap the code with syntax highlighting.

```md
<!-- doc-gen code url="https://raw.githubusercontent.com/DavidWells/markdown-magic/master/examples/1_simple.js" -->
This transform will automatically pull in the code from the remote source and place it here in a markdown code fence
<!-- end-doc-gen -->
```

The result of the above block would be the content of the remote code like so

```md
<!-- doc-gen code url="https://raw.githubusercontent.com/DavidWells/markdown-magic/master/examples/1_simple.js" -->
\`\`\`js
console.log('Cool')
\`\`\`
<!-- end-doc-gen -->
```

There are several other pre-baked transforms to use or you can write your own.

Checkout some of the [plugin examples](https://github.com/DavidWells/markdown-magic/tree/master?tab=readme-ov-file#legacy-v1--v2-plugins) for ideas on how you might be able to use this in your markdown workflow.

## Compatibility

The library is compatible with whatever flavor of markdown you are using like MDX, markdoc, plain text files or regular ol' markdown.

## Download

You can see more about the [package on GitHub](https://github.com/DavidWells/markdown-magic/)

Enjoy ✌️
