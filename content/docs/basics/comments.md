---
title: Comments
summary: Annotate your Sindlish code with line and block comments.
enableTableOfContents: true
---

Comments are notes you leave in your code for your future self and for anyone who reads it. The interpreter ignores them completely, so you can write anything you like, in any language you like.

Sindlish has two comment styles. A line comment starts with `#` and runs to the end of the line. A block comment starts with `/*` and ends with `*/`, and it can span several lines.

```sd
# This is a line comment. The interpreter skips it.

likh("salam")  # You can attach a comment to the end of a line too.

/* This is a block comment.
   It can stretch across many lines. */

likh("dua")
```

```txt filename="Output"
salam
dua
```

## What comments are for

Use comments to say _why_, not _what_. The code already shows what it does. A good comment explains a decision, warns about a subtle trap, or labels a section of a longer program.

In the example above, the `# Prints:` style you will see on some sample lines is just a regular line comment: it tells you the expected output without the interpreter noticing.

Next up: [Variables](/docs/basics/variables)
