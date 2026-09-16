---
title: Conditions
summary: Make decisions with agar, yawari, and warna.
enableTableOfContents: true
---

Programs make decisions. Sindlish borrows the Sindhi words for _if_, _or else if_, and _otherwise_: `agar`, `yawari`, and `warna`.

A condition decides which block runs. Start with `agar` and a true-or-false question, then the block to run when the answer is true:

```sd
agar 5 > 3 {
  likh("wadho aahe")
}
```

```txt filename="Output"
wadho aahe
```

## True or false values

Comparisons produce a `faislo` value (Sindlish for "decision"), which is either `sach` (true) or `koorh` (false). The comparison operators are `==`, `!=`, `<`, `<=`, `>`, `>=`:

```sd
likh(5 >= 5, 3 != 3, 2 <= 1)
```

```txt filename="Output"
sach koorh koorh
```

Valid Sindlish text reads almost like a sentence. `3 != 3` means "3 is not equal to 3", which is `koorh`, false, and the print confirms it.

## Combining conditions

Join conditions with `aen` (and) and `ya` (or), and flip one with `nah` (not):

```sd
likh((5 > 3) aen (2 < 4))
likh((5 > 3) ya (2 > 4))
likh(nah (5 > 3))
```

```txt filename="Output"
sach
sach
koorh
```

Use `aen` and `ya` with `faislo` values, like the comparisons above. If you apply them to numbers, the result is easy to misread, so keep them for true-or-false questions.

## Choosing between several outcomes

Chain as many `yawari` branches as you need, and finish with `warna` for everything else:

```sd
adad score = 72
agar score >= 80 {
  likh("A")
} yawari score >= 60 {
  likh("B")
} warna {
  likh("C")
}
```

```txt filename="Output"
B
```

Sindlish checks the branches top to bottom and runs the first one that is true. With a score of 72, the second branch wins.

Next up: [Loops](/docs/basics/loops)
