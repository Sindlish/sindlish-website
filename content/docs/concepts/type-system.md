---
title: The type system
summary: Static annotations, dynamic checking, and conversion.
enableTableOfContents: true
---

Sindlish trusts you with types, and checks them hard. The design is practical: you can write code with no annotations at all, and Sindlish infers and checks everything at runtime. When you want a promise, you add a type annotation and Sindlish holds you to it.

## Dynamic by default

Assign a variable without a type and it simply takes whatever value you give it. Reassign it to a different type and it works:

```sd
x = 5
likh(qisam(x))
x = "salam"
likh(qisam(x))
```

```txt filename="Output"
ADAD
LAFZ
```

## Typed when you promise

Add `: type` to a variable, a parameter, or a return value, and that becomes a contract. Give it the wrong type and the interpreter raises a `QisamJeGhalti` at the moment of the violation:

```sd illustrative
adad count = 0
count = "oops"
```

The program stops with a type error, telling you that a `lafz` showed up where an `adad` was promised. This catches a whole family of mistakes usually called "where did that string come from".

Defaults still apply. A typed variable with no initial value gets the default for its type; you saw this with the empty string `""`, the number `0`, and so on in the [data types reference](/docs/reference/data-types).

## Collections carry inner types

Typed collections are the real payoff. `fehrist[adad]` means the list promises to hold only whole numbers. The interpreter checks every mutation, not just the initial literal:

```sd illustrative
fehrist[adad] nums = [1, 2, 3]
nums.wadha("oops")
```

That push fails immediately with a type error. A plain, untagged list would let it through and you would find the problem later, far from where you wrote it. The [typed collections](/docs/advanced/typed-collections) page drills into this.

## Converting between types

Sometimes you want to move a value across an expected boundary: a `lafz` that came from `puch` needs to become an `adad`. Sindlish gives you explicit cast functions, `adad(...)`, `dahai(...)`, and `lafz(...)`, described in the [data types reference](/docs/reference/data-types). A cast that cannot succeed raises a runtime error, so guard it before you cast. The safe-casting helper on the [parse input](/docs/how-to/parse-input) guide is the pattern to copy.

## The hierarchy

Values at runtime are objects with a type. `sach`, `koorh`, and `khali` are values, not types: `faislo` is the type that `sach` and `koorh` belong to, and `khali` is its own singleton type. `Result` wraps any value with success or failure, as the [results](/docs/concepts/results) page showed. That small world of types covers the whole language.
