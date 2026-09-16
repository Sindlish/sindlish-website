---
title: Loops
summary: Repeat work with har and jistain loops.
enableTableOfContents: true
---

When a program needs to do something more than once, it uses a **loop**. Sindlish has two of them: `har` runs over the items of something, and `jistain` runs as long as a condition stays true.

## The `har` loop

`har` means "each" in Sindhi, and it pairs with `mein` (in). Read `har i mein silsilo(3)` as _for each i in the sequence from 0 to 2_. The body runs once per item:

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

A `silsilo(start, end)` range includes the start and stops before the end:

```sd
har i mein silsilo(1, 4) {
  likh(i)
}
```

```txt filename="Output"
1
2
3
```

## Looping over anything

`har` is not picky about what it loops over. The same shape works for lists, strings, and everything the [data structures](/docs/data-structures/lists) pages describe:

```sd
har naalo mein ["Ali", "Anaya", "Sana"] {
  likh("Salam, " + naalo)
}
```

```txt filename="Output"
Salam, Ali
Salam, Anaya
Salam, Sana
```

## The `jistain` loop

`jistain` (while) repeats its body as long as its condition is true. The classic counter loop counts up to five:

```sd
x = 0
jistain x < 5 {
  likh(x)
  x = x + 1
}
```

```txt filename="Output"
0
1
2
3
4
```

Note there is no `+=` shorthand in Sindlish yet, so the counting line is `x = x + 1`.

## Escaping mid-loop

`tor` (break) leaves the loop immediately. `jari` (continue) skips the rest of the current round and goes straight to the next item. Together they shape the loop's rhythm:

```sd
har i mein silsilo(6) {
  agar i == 2 {
    jari
  }
  agar i == 4 {
    tor
  }
  likh(i)
}
```

```txt filename="Output"
0
1
3
```

The loop skips `2` entirely, prints `3`, then `tor` stops it before it reaches `4` and `5`.

Next up: [Lists](/docs/data-structures/lists)
