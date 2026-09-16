---
title: Math
summary: Arithmetic, precedence, division results, and ranges.
enableTableOfContents: true
---

Numbers come in two flavors in Sindlish. Whole numbers are `adad`, decimals are `dahai`. The arithmetic operators are `+`, `-`, `*`, `/`, `%` (remainder), and `^` (power).

Like in regular math, multiplication and division happen before addition and subtraction. Parentheses override the order:

```sd
likh(2 + 3 * 4)
likh((2 + 3) * 4)
likh(10 % 3)
likh(2 ^ 5)
```

```txt filename="Output"
14
20
1
32
```

So `2 + 3 * 4` is `14`, not `20`. When you want the addition first, wrap it in parentheses.

## Decimals behave as you expect

When a calculation involves a decimal, the answer comes back as a `dahai`:

```sd
likh(10 / 4)
likh(7 / 2)
likh(1.5 * 2)
```

```txt filename="Output"
2.5
3.5
3.0
```

## Division is gentle

Division is special. Instead of crashing the moment you divide by zero, `10 / 0` prints a message and moves on, because division hands back a `Result` rather than a plain number:

```sd
likh(10 / 0)
```

```txt filename="Output"
Zero (0) saan vand natho kare saghjay.
```

The Result model is Sindlish's way of handling failures, and the [errors](/docs/intermediate/errors) page teaches it properly. For now, remember that a division that cannot succeed reports a message instead of stopping your program.

## Number ranges with `silsilo`

The built-in `silsilo`, Sindlish for "sequence", creates a lazy range of numbers. Give it an end (starts at 0), a start and end, or all three with a step. Printed, a range shows how it was built:

```sd
likh(silsilo(3))
likh(silsilo(2, 6))
likh(silsilo(1, 10, 3))
```

```txt filename="Output"
silsilo(0, 3)
silsilo(2, 6)
silsilo(1, 10, 3)
```

`silsilo` is the fuel for `har` loops, which you will meet in the [loops](/docs/basics/loops) page.

Next up: [Conditions](/docs/basics/conditions)
