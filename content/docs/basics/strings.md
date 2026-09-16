---
title: Strings
summary: Work with text values in Sindlish.
enableTableOfContents: true
---

A **string** is text: a name, a sentence, a label. In Sindlish strings are called `lafz`, and you write them between double quotes, like `"Salam"`.

Strings support the operations you would expect. You can measure them with `lambi`, pull out a single character with square brackets, join them with `+`, and repeat them with `*`:

```sd
naalo = "Sindh"
likh(lambi(naalo))
likh(naalo[0], naalo[4], naalo[-1])
likh(naalo + " is home")
likh("ha" * 3)
```

```txt filename="Output"
5
S h h
Sindh is home
hahaha
```

Notice the index rules. Count starts at `0`, so `naalo[0]` is the first character. Negative indexes count from the end, so `naalo[-1]` is the last character. `lambi` is the built-in length function, and it works on strings, lists, dictionaries, sets, and ranges.

## An empty string

A string can be empty, written `""`. It is perfectly valid and often useful as a starting value:

```sd
empty = ""
likh(lambi(empty))
```

```txt filename="Output"
0
```

## Walking through the characters

The loop keyword `har` with `mein` (Sindlish for "each" and "in") visits every character in a string. The loops page covers `har` in full; here is a preview:

```sd
har ch mein "abc" {
  likh(ch)
}
```

```txt filename="Output"
a
b
c
```

## Indexes out of reach

Looking up an index that does not exist stops the program with an `IndexJeGhalti` (index error). The interpreter tells you which index and where:

```sd illustrative
likh("abc"[10])
```

It reports `Lafz jo index 10 hadd khaan bahar aahe.` (the index is outside the string's range).

Next up: [Math](/docs/basics/math)
