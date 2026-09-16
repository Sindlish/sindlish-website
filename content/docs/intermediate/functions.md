---
title: Functions
summary: Reusable blocks of code called kaam.
enableTableOfContents: true
---

A **function** is a named block of code you can run whenever you need it. In Sindlish a function is a `kaam`, and you call it just by writing its name. Define a function once, and the reward is calling it many times.

The simplest `kaam` takes no input and does one thing:

```sd
kaam salaam() {
  likh("Salam, duniya!")
}
salaam()
salaam()
```

```txt filename="Output"
Salam, duniya!
Salam, duniya!
```

The definition starts with `kaam`, then the name, then `()`. The body lives in curly braces. Nothing runs at definition time; work happens when you call `salaam()`.

## Parameters

A function becomes useful when it can accept input. Give it parameters inside the parentheses:

```sd
kaam sum(a, b) {
  wapas a + b
}
likh(sum(2, 3))
```

```txt filename="Output"
5
```

`wapas` is Sindlish for "return": it hands a value back to the caller. Here `sum(2, 3)` evaluates to `5`, then `likh` prints it.

## Use the returned value

The result of a call is an ordinary value. Store it in a variable, or feed it straight into another call:

```sd
kaam add(a, b) {
  wapas a + b
}
x = add(2, 3)
likh(x, add(10, x))
```

```txt filename="Output"
5 15
```

When a `kaam` reaches the end without a `wapas`, it returns nothing at all. That is fine for functions whose whole job is printing or changing something.

Next up: [Advanced functions](/docs/intermediate/advanced-functions)
