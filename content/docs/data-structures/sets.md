---
title: Sets
summary: Unordered collections of unique values called majmuo.
enableTableOfContents: true
---

A **set** holds unique values: every value appears at most once. Sindlish calls it a `majmuo`, and you write one with curly braces, `{3, 1, 2}`.

Sets cheerfully ignore duplicates, and when you print a small set of numbers, the interpreter shows them in a tidy order:

```sd
majmuo m = {3, 1, 2}
likh(m)
m.addkar(4)
likh(lambi(m))
```

```txt filename="Output"
{1, 2, 3}
4
```

The `addkar` method (add) puts a new value in. `lambi` counts the members. A set's whole point is fast membership checks, so `har` loops and lookups are a natural fit:

```sd
m = majmuo([1, 2, 2, 3])
har x mein m {
  likh(x)
}
```

```txt filename="Output"
1
2
3
```

The list `[1, 2, 2, 3]` becomes the set `{1, 2, 3}`. The duplicate `2` vanishes. That trick, turning a list into a set, is the quickest way to remove duplicates.

## Set math

Sets shine at the operations you learned in school. `bade` unions two sets, `mushtarak` intersects them, `farq` subtracts one from the other, and `symmetric_farq` keeps everything that is in one set but not both:

```sd
majmuo a = {1, 2, 3}
majmuo b = {2, 3, 4}
likh(a.bade(b))
likh(a.mushtarak(b))
likh(a.farq(b))
likh(a.symmetric_farq(b))
```

```txt filename="Output"
{1, 2, 3, 4}
{2, 3}
{1}
{1, 4}
```

## Relative sizes and relations

A few methods describe how two sets relate. `nandohisoahe` asks "is this set a subset of that one?", `wadohisoahe` asks "is this a superset?", and `alaghahe` asks "are these two sets completely separate?":

```sd
majmuo m = {1, 2, 3}
likh(m.nandohisoahe({1, 2, 3, 4}))
likh(m.wadohisoahe({1}))
likh(m.alaghahe({7}))
```

```txt filename="Output"
sach
sach
sach
```

## Removing members

`chad` (discard) drops a value without complaining if it was already absent. `hata` removes and requires the value to exist. `saf` empties the set:

```sd
majmuo m = {1, 2, 3}
m.chad(1)
likh(m)
m.hata(2)
likh(m)
m.saf()
likh(m)
```

```txt filename="Output"
{2, 3}
{3}
{}
```

One construction note: an empty dictionary and an empty set both look like `{}` in source, so Sindlish parses `{}` as an empty `lughat`. Build an empty set with the constructor instead: `majmuo m = majmuo()`.

The full set method list is on the [collection methods](/docs/reference/collection-methods) reference page.

Next up: [Functions](/docs/intermediate/functions)
