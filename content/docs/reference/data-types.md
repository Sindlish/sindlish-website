---
title: Data types
summary: The primitive and collection types available in Sindlish.
enableTableOfContents: true
---

Sindlish organizes data into five primitive types and four collection types. Every value belongs to exactly one type, and the built-in `qisam` function tells you which:

```sd
likh(qisam(1))
likh(qisam(2.5))
likh(qisam("hi"))
likh(qisam(sach))
likh(qisam(khali))
```

```txt filename="Output"
ADAD
DAHAI
LAFZ
FAISLO
KHALI
```

Collections have their own type names too:

```sd
likh(qisam([1]))
likh(qisam({"a": 1}))
likh(qisam({1}))
likh(qisam(ok(1)))
```

```txt filename="Output"
FEHRIST
LUGHAT
MAJMUO
RESULT
```

## Primitive types

| Type name | What it holds | Default value | Example           |
| --------- | ------------- | ------------- | ----------------- |
| `adad`    | Whole numbers | `0`           | `42`, `-3`, `0`   |
| `dahai`   | Decimals      | `0.0`         | `3.14`, `-0.5`    |
| `lafz`    | Text strings  | `""`          | `"Salam"`, `"hi"` |
| `faislo`  | Boolean       | `koorh`       | `sach`, `koorh`   |
| `khali`   | Nothing       | `khali`       | `khali`           |

A typed variable declared without a value gets the default for its type:

```sd
adad count
lafz label
likh(count, "[" + label + "]")
```

```txt filename="Output"
0 []
```

## Collection types

| Type name | Sindhi | What it holds               |
| --------- | ------ | --------------------------- |
| `FEHRIST` | list   | Ordered values: `[1, 2, 3]` |
| `LUGHAT`  | dict   | Key-value pairs: `{"a": 1}` |
| `MAJMUO`  | set    | Unique values: `{1, 2}`     |
| `RESULT`  | result | Success or error: `ok(42)`  |

## Conversions between primitives

Sindlish provides three casting functions that create values of different types:

| Function   | Returns | Notes                                                           |
| ---------- | ------- | --------------------------------------------------------------- |
| `adad(x)`  | `adad`  | Turns `lafz` or `dahai` into a whole number; truncates decimals |
| `dahai(x)` | `dahai` | Turns `adad` or `lafz` into a decimal                           |
| `lafz(x)`  | `lafz`  | Turns almost anything into its text form                        |

Casting invalid input, like `adad("abc")`, raises a runtime error. There is no safe fallback on a cast. See the [errors](/docs/intermediate/errors) page for details.
