---
title: Introduction
summary: What Sindlish is and how this guide teaches it to you, step by step.
enableTableOfContents: true
---

Sindlish is a small programming language that speaks your language. Its keywords are Romanized Sindhi: the print function is `likh`, a function is a `kaam`, a list is a `fehrist`. You write code the same way you would in any modern language, but the words that drive it mean what they say, so you read your program without translating.

This guide teaches Sindlish the way you would learn any spoken language, one step at a time. You will write a working program in the next few pages, then build on it until you can read and write real programs on your own.

## What makes Sindlish different

Sindlish keeps the ideas that make other languages powerful and drops the ones that confuse newcomers:

- **Hybrid typing.** You can let Sindlish figure out a value's type for you (`umar = 25`), or declare it yourself (`adad umar = 25`). Same language, both speeds.
- **A Result model for errors.** Functions that can fail hand you a `Result` instead of crashing your program. You check it, unwrap it, or fall back to a default.
- **Natural data structures.** Lists, dictionaries, and sets have comfortable Sindlish names, and their methods read like Sindhi verbs.

## How this guide is organized

The documentation is split into four parts, and you are in the first one:

- **Learn** walks you through the language in dependency order. Each page ends with a next-up link. Work through them in order and you will never meet a concept before its turn.
- **How-to guides** solve real problems, like building a number guessing game. Read these after the Learn path.
- **Reference** pages are lookup tables. You consult them, you do not memorize them.
- **Concepts** explain the thinking behind the language, like why it exists and how its type system works.

## Your first word

Let's write something before you even install anything. Sindlish's print function is `likh`, and it writes a line to the screen. Run this anywhere Sindlish is available:

```sd
likh("Salam, Sindh!")
```

```txt filename="Output"
Salam, Sindh!
```

That is your first Sindlish program. Everything else is a detail, and the next pages cover every one of them.

Next up: [Install Sindlish](/docs/get-started/installation)
