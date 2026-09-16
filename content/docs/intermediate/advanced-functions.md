---
title: Advanced functions
summary: Defaults, types, variable arguments, and closures.
enableTableOfContents: true
---

The basic `kaam` gets you far. This page adds the four upgrades that make it comfortable for real programs: default parameter values, typed parameters, variable arguments, and nesting.

## Default parameter values

A parameter can carry a default, so callers can leave it out. Think of a title that usually repeats:

```sd
kaam salaam(naalo, laqab = "Khan") {
  likh(naalo + " " + laqab)
}
salaam("Ali")
salaam("Ali", "Shaikh")
```

```txt filename="Output"
Ali Khan
Ali Shaikh
```

## Types on parameters and returns

Just like variables, parameters can demand a type. Put the type after the parameter name with a colon, and put a `->` plus the type after the parentheses for the return value:

```sd
kaam square(x: adad) -> adad {
  wapas x * x
}
likh(square(4))
likh(square(9))
```

```txt filename="Output"
16
81
```

Calling `square` with a `lafz` instead of an `adad` stops the program with a `QisamJeGhalti` (type error), which catches mistakes early.

## Any number of arguments

Sometimes a function should accept whatever it is given. A `*` before a parameter name collects every extra positional argument into a list:

```sd
kaam sob_kaam(*args) {
  likh(lambi(args), args)
}
sob_kaam(1, "do", 3)
```

```txt filename="Output"
3 [1, do, 3]
```

Two stars collect named extras instead. Here a call passes two keyword arguments, and the function prints them as a dictionary:

```sd
kaam pengo(**kwargs) {
  likh(kwargs)
}
pengo(niimi = 1, sundhi = 2)
```

```txt filename="Output"
{niimi: 1, sundhi: 2}
```

## Functions inside functions

A `kaam` can be defined inside another `kaam`. The inner function can read the outer function's variables, a behavior called a **closure**. Here a factory builds a multiplier that remembers a factor:

```sd
kaam bana() {
  qadr = 2
  kaam zarb(n) {
    likh(n * qadr)
  }
  wapas zarb
}
f = bana()
f(3)
f(4)
```

```txt filename="Output"
6
8
```

The function returned by `bana()` still remembers `qadr` long after `bana()` finished running. Closures and the rules around which variables they can see are explained in depth on the [scope](/docs/advanced/scope) page.

Next up: [Errors](/docs/intermediate/errors)
