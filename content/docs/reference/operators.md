---
title: Operators
summary: Arithmetic, comparison, logical, and other operators in Sindlish.
enableTableOfContents: true
---

Operators are the small symbols that do the work between values. Sindlish keeps the operator set small, and everything you see here has been confirmed against the interpreter.

## Arithmetic

| Operator | Meaning   | Example  | Result |
| -------- | --------- | -------- | ------ |
| `+`      | Add       | `2 + 3`  | `5`    |
| `-`      | Subtract  | `7 - 2`  | `5`    |
| `*`      | Multiply  | `3 * 4`  | `12`   |
| `/`      | Divide    | `10 / 4` | `2.5`  |
| `%`      | Remainder | `10 % 3` | `1`    |
| `^`      | Power     | `2 ^ 5`  | `32`   |

Division and remainder return a `Result`. When they succeed, the unwrapped value is a plain number:

```sd
likh(10 / 4)
```

```txt filename="Output"
2.5
```

Dividing by zero prints a message rather than stopping the program:

```sd
likh(10 / 0)
```

```txt filename="Output"
Zero (0) saan vand natho kare saghjay.
```

### Precedence

Multiplication and division bind tighter than addition and subtraction, which is the standard order you are used to:

```sd
likh(2 + 3 * 4)
likh((2 + 3) * 4)
```

```txt filename="Output"
14
20
```

Parentheses override the order. Power `^` binds tighter than multiplication:

```sd
likh(2 * 3 ^ 2)
```

```txt filename="Output"
18
```

## Comparison

Comparisons produce a `faislo`: `sach` (true) or `koorh` (false). They work on numbers and text, but not on collections:

| Operator | Meaning               |
| -------- | --------------------- |
| `==`     | Equal                 |
| `!=`     | Not equal             |
| `<`      | Less than             |
| `<=`     | Less than or equal    |
| `>`      | Greater than          |
| `>=`     | Greater than or equal |

```sd
likh(5 > 3, 5 == 5, 5.0 == 5)
```

```txt filename="Output"
sach sach sach
```

### About collection equality

Equality on lists, dictionaries, and sets always returns `koorh` right now, even when the collections look identical. Use `.hasil` or membership tests instead of `==` to check inside a `lughat`.

## Logical operators

`aen` (and), `ya` (or), and `nah` (not) work on `faislo` values:

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

Keep `aen` and `ya` for boolean expressions. Their behavior on raw numbers is not yet well defined and may surprise you.

## Other operators

| Operator | Meaning                     | Notes                                                            |
| -------- | --------------------------- | ---------------------------------------------------------------- |
| `+`      | Concatenate strings         | `"ab" + "cd"` gives `"abcd"`                                     |
| `*`      | Repeat a string             | `"ha" * 3` gives `"hahaha"`                                      |
| `[]`     | Index into a string or list | `s[0]` is the first element; negative indexes count from the end |
| `:`      | Postfix type annotation     | `x: adad = 5`                                                    |
