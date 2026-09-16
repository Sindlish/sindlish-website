---
title: Typed collections
summary: Pin down the element types of lists, dictionaries, and sets.
enableTableOfContents: true
---

The variables page showed typed variables. Collections can be typed too, and the syntax follows the collection keyword: `fehrist[adad]` is a list that holds only whole numbers.

## A list of numbers

Declare the element type in square brackets right after the collection keyword:

```sd
fehrist[adad] nums = [1, 2, 3]
likh(nums)
```

```txt filename="Output"
[1, 2, 3]
```

Push a wrong type into a typed list and the program stops with a `QisamJeGhalti`:

```sd illustrative
fehrist[adad] nums = [1, 2]
nums.wadha("oops")
```

It reports that a list of `adad` was given a `lafz`. Typed collections turn that mistake into an immediate, clear error instead of a confusing crash many lines later.

## A dictionary with fixed key and value types

A `lughat` takes two types: the key type, then the value type. `lughat[lafz, adad]` maps text keys to number values:

```sd
lughat[lafz, adad] ages = {"Ali": 25}
likh(ages.hasil("Ali"))
```

```txt filename="Output"
25
```

## A typed set

Sets take one element type, like lists:

```sd
majmuo[adad] m = {1, 2, 3}
likh(lambi(m))
```

```txt filename="Output"
3
```

## Why bother

Types are contracts. Declaring `fehrist[adad]` tells every reader of the code, and the interpreter, that this list will only ever hold whole numbers. In a larger program that promise prevents whole families of bugs, and it lets the [function](/docs/intermediate/advanced-functions) signatures stay honest. Return a typed list the same way: `-> fehrist[adad]`.

Next up: [Scope](/docs/advanced/scope)
