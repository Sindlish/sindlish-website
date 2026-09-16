---
title: Errors
summary: Learn the eight error classes and the Result model.
enableTableOfContents: true
---

Sindlish divides bad news into two kinds. Some problems stop the program the moment they happen, like reaching past the end of a list. Others are expected business, like a lookup that finds nothing, and those things should be decisions, not crashes.

For the second kind, Sindlish uses a `Result`. A Result is a value that is either an **OK** (Sindlish `ok`) or an error (`ghalti`). You create one, inspect it, and decide what to do.

## Creating a Result

`ok(value)` wraps a value in success. `ghalti(message)` wraps a message in failure. Print a Result that is an `ok` and you see its value:

```sd
r = ok(42)
likh(r?)
```

```txt filename="Output"
42
```

The `?` operator unwraps an OK result and hands you the value inside.

## Falling back with `bachao`

The comfortable move with a `Result` is `bachao` (rescue). It returns the wrapped value when the result is `ok`, and your fallback when it is `ghalti`. No crashing either way:

```sd
r = ghalti("boo")
likh(r.bachao(99))
```

```txt filename="Output"
99
```

Unwrap a `ghalti` with `?` and you see its message on its own line instead of stopping the program:

```sd illustrative
r = ghalti("boo")
likh(r?)
```

It prints `boo`. That is the Result philosophy in miniature: failures become values you can look at.

## The eight error classes

When a problem is serious enough to stop the program, the interpreter raises one of eight error classes, each named in Romanized Sindhi:

| Error class        | English meaning      | When it stops you                                                         |
| ------------------ | -------------------- | ------------------------------------------------------------------------- |
| `LikhaiJeGhalti`   | syntax error         | The program text does not parse                                           |
| `MatalabJeGhalti`  | argument error       | A function got the wrong number of arguments                              |
| `QisamJeGhalti`    | type error           | A value of the wrong type showed up                                       |
| `NaleJeGhalti`     | name error           | A name or attribute does not exist                                        |
| `IndexJeGhalti`    | index error          | An index is out of range                                                  |
| `TarteebJeGhalti`  | order error          | A statement is out of place, like `wapas` at top level                    |
| `HalndeVaktGhalti` | runtime error        | Anything else at runtime, like changing a `pakko` value or failing a cast |
| `ZeroVindJeGhalti` | divide-by-zero error | Division by zero in a context that demands a value                        |

A failed cast is a great example of a `HalndeVaktGhalti`. It raises, so it does not hand back a Result to rescue. This program stops and reports how it could not turn `"abc"` into a number:

```sd illustrative
likh(adad("abc"))
```

The interpreter prints `HalndeVaktGhalti: Value 'abc' khe adad mein badli natho kare saghjay.` with the line that caused it. In plain words: `abc` cannot be changed into a number. The golden rule that follows: never chain `.bachao()` onto a cast. A cast either succeeds or raises, so fallbacks on casts are useless.

Other errors are similarly plain. Reaching past the end of a string raises `IndexJeGhalti`. Calling a function that does not exist raises `NaleJeGhalti`:

```sd illustrative
likh("abc"[10])
```

```sd illustrative
likh(range(5))
```

The first prints `Lafz jo index 10 hadd khaan bahar aahe.` The second reports `Nalo 'range' na milyo` (the name `range` was not found). The hint says it best: check that you spelled the name right. It is `silsilo` in Sindlish, not `range`.

Division deserves a mention. Inside an expression, dividing by zero raises `ZeroVindJeGhalti`. The same division on its own prints a message instead, because division returns a `Result`. When you want to guard a division, check the divisor before you divide.

Next up: [Typed collections](/docs/advanced/typed-collections)
