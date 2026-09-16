---
title: Hello, world
summary: Write and run your first Sindlish program.
enableTableOfContents: true
---

Let's write the classic first program. Make a file called `hello.sd`, type this, then run `sindlish hello.sd`:

```sd
likh("Salam, duniya!")
```

```txt filename="Output"
Salam, duniya!
```

The print function `likh` writes a line to the screen. Every time you call it, the output starts on a fresh line.

The examples in these pages come with a **Run** button above the code box. Click it and the interpreter in your browser runs the example and shows the output on the right. You can follow along without installing anything.

## Print more than one thing

`likh` takes any number of values and prints them separated by spaces, one call after another:

```sd
likh("Salam", "Sindh!")
likh(10, 20, "salam")
```

```txt filename="Output"
Salam Sindh!
10 20 salam
```

Because `likh` is spelled like the Sindhi word for "write", reading it back is easy. Your code says _write this_, and the screen says _done_.

Next up: [Comments](/docs/basics/comments)
