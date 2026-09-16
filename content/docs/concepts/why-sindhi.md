---
title: Why Sindhi
summary: The ideas and principles behind Sindlish.
enableTableOfContents: true
---

Sindlish is a small, readable language for people who prefer their code to read more like their notes. It is built around three pillars.

## Bilingual and inclusive

Sindhi is a language with a deep history. By letting you write that language in Roman script, Sindlish makes the programming experience feel local and familiar. Every keyword is a Sindhi word you would use when explaining a concept to a colleague: `kaam` (work), `agar` (if), `fehrist` (list).

Because Sindlish is written in Latin letters, it works with any editor, any terminal, any operating system. No special font is required. The barrier to entry is low, while the vocabulary is rich.

## Progressive complexity

Sindlish starts simple: variables, a loop, a function. That tiny core gets you surprisingly far, and the rest of the language layers on only when you need it. Collections can be untyped or typed. Closures and scope are straightforward. Results give you a way to handle failure without exceptions, but you never have to learn them until a program of yours needs them.

This progression means you can write meaningful programs within minutes and never hit a hard wall of new syntax. New ideas meet you when you are ready for them.

## How the interpreter runs your code

Sindlish is interpreted, which means you can run a file immediately and see the result. The interpreter works in four stages:

1. **Lexing**: your program text becomes a stream of tokens.
2. **Parsing**: the tokens become an abstract syntax tree.
3. **Compiling**: the tree becomes bytecodes.
4. **Executing**: a virtual machine runs the bytecodes and produces output.

That pipeline is what makes the Sindlish interpreter fast and predictable. A bug in a program almost always shows up as a clear error message that points to a line and explains what went wrong.
