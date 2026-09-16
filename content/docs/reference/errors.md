---
title: Errors
summary: The eight error classes and how they look.
enableTableOfContents: true
---

When Sindlish hits a problem that cannot be resolved by returning a value, it raises an error. Every error has a Sindlish name and a short description. The eight classes all inherit from a single base type, so you can catch any of them the same way if you need to, but in practice you inspect the class name.

| Error class        | Sindhi meaning           | Triggered by                                                 |
| ------------------ | ------------------------ | ------------------------------------------------------------ |
| `LikhaiJeGhalti`   | writing error (syntax)   | `+=`, `range(...)`, mismatched brackets, invalid indentation |
| `MatalabJeGhalti`  | meaning error (argument) | Wrong number of arguments in a call                          |
| `QisamJeGhalti`    | type error               | Wrong type given to a function or operator                   |
| `NaleJeGhalti`     | name error               | Unknown variable or method name                              |
| `IndexJeGhalti`    | index error              | Index out of bounds                                          |
| `TarteebJeGhalti`  | order error              | Statement out of place, or invalid scope mutation            |
| `HalndeVaktGhalti` | runtime error            | Bad value at runtime, like a failed cast                     |
| `ZeroVindJeGhalti` | zero arithmetic error    | Division by zero in a value context                          |

## Seeing the error

When an error stops a program, the interpreter prints the error class, a short description, and the source location. Each line below produces a different class, and each print shows the real output from the interpreter:

```sd illustrative
likh(adad("abc"))
```

`HalndeVaktGhalti`: `Value 'abc' khe adad mein badli natho kare saghjay.`

```sd illustrative
likh(range(5))
```

`NaleJeGhalti`: `Nalo 'range' na milyo`

```sd illustrative
likh("abc"[10])
```

`IndexJeGhalti`: `Lafz jo index 10 hadd khaan bahar aahe.`

Division by zero inside an expression raises a `ZeroVindJeGhalti`. On its own as a printed value, division by zero prints a message instead:

```sd
likh(10 / 0)
```

```txt filename="Output"
Zero (0) saan vand natho kare saghjay.
```

This is because division returns a `Result` (an `ok` or a `ghalti`), and printing a `ghalti` Result prints its message. In a value context like `5 + 10 / 0`, the same division raises the error.

## Error vs Result

Sindlish splits bad news into two categories: those that can be anticipated and handled, and those that cannot. Anticipated failures, like a lookup that might fail, return a `Result` using `ok` and `ghalti`. Unanticipated failures, like trying to use a name that does not exist, raise one of the eight error classes. The [intermediate errors](/docs/intermediate/errors) page explains how to create, inspect, and rescue `Result` values.
