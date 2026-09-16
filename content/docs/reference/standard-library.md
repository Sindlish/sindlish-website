---
title: Standard library
summary: The six built-in functions available everywhere.
enableTableOfContents: true
---

Sindlish ships six built-in functions that are available in every program. Beyond these, the standard library lives on the [collection methods](/docs/reference/collection-methods) page and the [casting functions](/docs/reference/data-types) page.

## likh

`likh(...)` prints its arguments to the terminal, separated by spaces and followed by a newline:

```sd
likh("Salam", 42, sach)
```

```txt filename="Output"
Salam 42 sach
```

## qisam

`qisam(x)` returns the type of `x` as a text name, in capitals. Handy for checking what you are dealing with:

```sd
likh(qisam([1, 2]))
likh(qisam({"a": 1}))
```

```txt filename="Output"
FEHRIST
LUGHAT
```

## lambi

`lambi(x)` returns the length of a string or collection as a number:

```sd
likh(lambi("salam"))
likh(lambi([1, 2, 3]))
```

```txt filename="Output"
5
3
```

## silsilo

`silsilo(...)` produces a range of numbers. Give it one, two, or three arguments, and it works like the classic range: start, stop, and an optional step. The stop value is never included:

```sd
har i mein silsilo(3) {
  likh(i)
}
```

```txt filename="Output"
0
1
2
```

```sd
har i mein silsilo(2, 8, 2) {
  likh(i)
}
```

```txt filename="Output"
2
4
6
```

## majmuo

`majmuo(...)` builds a set. With no arguments it returns an empty set; with one argument, typically a list, it keeps only the unique values:

```sd
s = majmuo([1, 2, 2, 3])
likh(s)
```

```txt filename="Output"
{1, 2, 3}
```

## puch

`puch(...)` reads a line of text from the terminal and returns it as a `lafz`. Its arguments form the prompt, printed with no trailing newline:

```sd illustrative
n = puch("Tuhandjo naalo: ")
likh("Salam, " + n)
```

You must run this in the real CLI with a terminal, because the online interpreter cannot read keyboard input. The [parse input](/docs/how-to/parse-input) guide shows how to turn the returned text into a number safely.
