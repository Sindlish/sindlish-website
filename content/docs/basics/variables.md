---
title: Variables
summary: Store values in named variables and declare their types.
enableTableOfContents: true
---

A **variable** is a name that points to a value. Writing `umar = 25` stores the number 25 under the name `umar`, and from then on you can use `umar` anywhere you would type 25.

```sd
umar = 25
naalo = "Amanat"
likh(umar)
likh(naalo)
likh(qisam(umar), qisam(naalo))
```

```txt filename="Output"
25
Amanat
ADAD LAFZ
```

The built-in function `qisam` asks "what type is this value?" and answers with an all-caps name. `ADAD` means whole number, `LAFZ` means text, and you will meet the rest of the type names on the [data types](/docs/reference/data-types) reference page.

## Dynamic typing is the default

In the example above, Sindlish looked at the value on the right side of `=` and picked the type itself. That is **dynamic typing**. It is fast to write and fine for short programs. A variable typed this way can even hold a different type later:

```sd
x = 1
x = "now a text"
likh(qisam(x))
```

```txt filename="Output"
LAFZ
```

## Declaring the type yourself

For bigger programs, you often want a variable that can **only** hold one type. Put the type keyword before the name and Sindlish enforces it. The type key you pair with the value is written exactly like the type: `adad` for whole numbers, `dahai` for decimals, `lafz` for text, `faislo` for true or false.

```sd
adad score = 100
lafz city = "Karachi"
likh(score, city)
likh(qisam(score), qisam(city))
```

```txt filename="Output"
100 Karachi
ADAD LAFZ
```

If you declare a typed variable without a value, Sindlish fills in the type's default. Numbers start at `0`, empty text at `""`, and booleans at `koorh` (false):

```sd
adad count
lafz message
likh(count, "[" + message + "]")
```

```txt filename="Output"
0 []
```

## Postfix type annotations

Some people find it easier to read the type after the name, Python- or Rust-style. Sindlish supports that too: put a colon and the type after the name.

```sd
score: adad = 90
rate: dahai = 9.5
likh(score, rate)
```

```txt filename="Output"
90 9.5
```

## Constants with `pakko`

The `pakko` keyword, Sindlish for "fixed", makes a variable read-only. Assigning to it later is an error, which makes `pakko` perfect for values that must never change:

```sd
pakko lafz greeting = "Salam"
likh(greeting)
```

```txt filename="Output"
Salam
```

This next program tries to change a `pakko` value, so it stops with a runtime error, a `HalndeVaktGhalti`:

```sd illustrative
pakko adad x = 5
x = 6
```

The interpreter reports `'x' pakko (const) aahe, eho badli natho saghjay.` (it is fixed, it cannot be changed).

Next up: [Strings](/docs/basics/strings)
