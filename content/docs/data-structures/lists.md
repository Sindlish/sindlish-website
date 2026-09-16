---
title: Lists
summary: Ordered collections of values called fehrist.
enableTableOfContents: true
---

A **list** holds several values in order. Sindlish calls a list a `fehrist`, and you write one with square brackets: `[10, 20, 30]`.

You reach a list's items by index, counting from `0`, and `-1` reaches the last item. `lambi` tells you how many items the list holds:

```sd
fehrist f = [10, 20, 30]
likh(f[0], f[-1])
likh(lambi(f))
```

```txt filename="Output"
10 30
3
```

## Building a list step by step

Start with an empty list and add items with the `wadha` method, Sindlish for "add":

```sd
shopping = []
shopping.wadha("qara qalam")
shopping.wadha("kaghaz")
likh(shopping, lambi(shopping))
```

```txt filename="Output"
[qara qalam, kaghaz] 2
```

## Sort, reverse, and insert

Lists come with a small toolkit of methods. `wajh` inserts at an index, `tarteeb` sorts, `ulto` reverses:

```sd
fehrist f = [3, 1, 2]
f.wajh(0, 9)
likh(f)
f.tarteeb()
likh(f)
f.ulto()
likh(f)
```

```txt filename="Output"
[9, 3, 1, 2]
[1, 2, 3, 9]
[9, 3, 2, 1]
```

## Take items out

`kadh` (pull out) removes and returns the last item. `hata` removes the first matching value. You can also ask where an item lives with `index`, and count how many times a value appears with `garn` (count):

```sd
fehrist f = [1, 2, 3, 4]
likh(f.kadh())
likh(f)
f.hata(3)
likh(f)
likh(f.index(2), f.garn(1))
```

```txt filename="Output"
4
[1, 2, 3]
[1, 2]
1 1
```

## Extend, copy, clear

`wadhayo` (extend) joins another list onto the end. `nakal` (copy) makes an independent clone. `saf` (clear) empties the list:

```sd
f = [1]
f.wadhayo([2, 3])
likh(f)
g = f.nakal()
likh(g)
f.saf()
likh(f)
```

```txt filename="Output"
[1, 2, 3]
[1, 2, 3]
[]
```

## A list from a string

The built-in `fehrist` also works as a constructor: feed it a string and every character becomes an item:

```sd
likh(fehrist("Sindh"))
```

```txt filename="Output"
[S, i, n, d, h]
```

That covers the common list moves. For the full method list, see the [collection methods](/docs/reference/collection-methods) reference.

Next up: [Dictionaries](/docs/data-structures/dictionaries)
