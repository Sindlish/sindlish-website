---
title: Scope
summary: Where variables live and how to reach across function boundaries.
enableTableOfContents: true
---

Scope answers one question: where can a name be seen? A few simple rules, mostly what you would expect, govern Sindlish.

## Blocks do not create scope

A pair of curly braces `{}` is just a grouping syntax. It does not create a new wall of visibility. A variable defined inside a block leaks straight into the surrounding level:

```sd
x = 2
{
  x = 3
}
likh(x)
```

```txt filename="Output"
3
```

## Functions do create scope

A `kaam` body is its own wall. A variable you assign inside one lives inside it and vanishes when the function finishes:

```sd illustrative
kaam f() {
  temp = 10
  likh(temp)
}
f()
likh(temp)
```

Inside `f`, `temp` is 10 and prints fine. Outside, the same name does not exist, and Sindlish stops with a `NaleJeGhalti` ("name not found"). That is scope at work.

## Reading a variable from an outer function

Sindlish looks outward from a function for a name it cannot find inside. That is a closure, and you saw it on the [advanced functions](/docs/intermediate/advanced-functions) page. Here it is again, cleanly:

```sd
kaam outer() {
  n = 2
  kaam inner() {
    likh(n * 2)
  }
  inner()
}
outer()
```

```txt filename="Output"
4
```

`inner` cannot find `n` in its own scope, so it borrows `n` from `outer`.

## Mutating an outer variable requires `bahari`

Reading is free. Writing is not. If you try to change a value that belongs to an enclosing function without declaring it, Sindlish stops with a `TarteebJeGhalti` and tells you to write `bahari` first. This protects outer scopes from accidental side effects:

```sd
kaam outer() {
  n = 2
  kaam inner() {
    bahari n
    n = 5
  }
  inner()
  likh(n)
}
outer()
```

```txt filename="Output"
5
```

`bahari n` says: _this_ `n` is the same `n` you see in the enclosing function. The mutation sticks.

A closure can also be stored and called later. Here a factory creates an incrementing counter that uses `bahari` to remember its state across calls:

```sd
kaam bana() {
  counter = 0
  kaam wadhao() {
    bahari counter
    counter = counter + 1
    likh(counter)
  }
  wapas wadhao
}
f = bana()
f()
f()
```

```txt filename="Output"
1
2
```

## Global variables with `aalmi`

What if you need a variable visible everywhere, including inside functions that are not nested inside any other? Declare it as global with `aalmi` (declare). It creates a module-level variable and lets a function write to it:

```sd
kaam f() {
  aalmi t
  t = 10
  likh(t)
}
f()
likh(t)
```

```txt filename="Output"
10
10
```

## The rules in brief

- **Blocks** leak. Variables escape braces.
- **Functions** isolate. A new assignment inside a `kaam` creates a local.
- **Borrowing** a variable from an enclosing `kaam` for reading works without ceremony.
- **Mutating** a borrowed variable requires `bahari` to signal intent.
- **Globals** use `aalmi` to declare module-level names explicitly.

Next up: [How-to guides](/docs/how-to/index)
