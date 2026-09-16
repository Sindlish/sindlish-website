---
title: Collection methods
summary: Every method on lists, dictionaries, and sets.
enableTableOfContents: true
---

Sindlish collections each carry their own methods. The tables below list them all, grouped by collection, with a sentence about what each one does. All examples here are verified against the interpreter.

## List methods

A `fehrist` is ordered and indexable, so its methods are mostly about positions and order:

| Method        | Sindhi meaning | What it does                              | Example                             |
| ------------- | -------------- | ----------------------------------------- | ----------------------------------- |
| `wadha(x)`    | add            | Append `x` to the end                     | `[1, 2].wadha(3)` → `[1, 2, 3]`     |
| `wajh(i, x)`  | insert         | Insert `x` at index `i`                   | `[1, 3].wajh(1, 2)` → `[1, 2, 3]`   |
| `wadhayo(xs)` | extend         | Append every item of a list `xs`          | `[1].wadhayo([2, 3])` → `[1, 2, 3]` |
| `tarteeb()`   | order/sort     | Sort in place                             | `[3, 1, 2]` becomes `[1, 2, 3]`     |
| `ulto()`      | reverse        | Reverse the order in place                | `[1, 2, 3]` becomes `[3, 2, 1]`     |
| `index(v)`    | index          | 0-based position of the first `v`         | `[1, 2, 3].index(3)` → `2`          |
| `garn(v)`     | count          | How many times `v` appears                | `[1, 2, 1].garn(1)` → `2`           |
| `kadh()`      | pull out       | Remove and return the last item           | `[1, 2].kadh()` → `2`               |
| `hata(v)`     | remove         | Remove the first `v`                      | `[1, 2, 3].hata(3)` → `[1, 2]`      |
| `nakal()`     | copy           | Return an independent clone               | `g = f.nakal()`                     |
| `saf()`       | clear          | Empty the list, keeping the same variable | `f.saf()` → `[]`                    |

## Dictionary methods

A `lughat` matches keys to values. Its methods ask and update by key:

| Method               | Sindhi meaning    | What it does                                                 | Example                                    |
| -------------------- | ----------------- | ------------------------------------------------------------ | ------------------------------------------ |
| `hasil(k)`           | get               | Value for key `k`                                            | `d.hasil("Ali")`                           |
| `hasil(k, fallback)` | get with fallback | Value for `k`, or `fallback` if missing                      | `d.hasil("Zain", "nah milo")` → `nah milo` |
| `d[k] = v`           | subscript set     | Create or replace a key                                      | `d["Ali"] = 9`                             |
| `kadh(k)`            | pull out          | Remove `k` and return its value                              | `d.kadh("a")`                              |
| `defaultrakh(k, v)`  | set default       | Store `v` only if `k` is missing; return the resulting value | `d.defaultrakh("b", 2)` → `2`              |
| `update(other)`      | merge             | Fold another dictionary's entries into `d`                   | `d.update({"b": 2})`                       |
| `cabeyon()`          | keys              | The keys as a list                                           | `d.cabeyon()` → `[a, b]`                   |
| `raqamon()`          | values            | The values as a list                                         | `d.raqamon()` → `[1, 2]`                   |
| `syon()`             | items             | Key-value pairs as a list of two-item lists                  | `d.syon()` → `[[a, 1], [b, 2]]`            |
| `syonkadh()`         | pop item          | Remove and return one key-value pair                         | `d.syonkadh()` → `[b, 2]`                  |

Dictionary read patterns shown together, using the subscript and `hasil` forms:

```sd
lughat d = {}
d["a"] = 1
likh(d.hasil("a"))
likh(d.hasil("z", "natho"))
likh(d.cabeyon())
```

```txt filename="Output"
1
natho
[a]
```

## Set methods

A `majmuo` stores unique values. Its methods split into algebra and membership:

| Method                  | Sindhi meaning | What it does                      | Example                                          |
| ----------------------- | -------------- | --------------------------------- | ------------------------------------------------ |
| `addkar(v)`             | add            | Add `v` if not present            | `{1}.addkar(2)` → `{1, 2}`                       |
| `chad(v)`               | discard        | Remove `v`; no error if absent    | `{1, 2}.chad(2)` → `{1}`                         |
| `hata(v)`               | remove         | Remove `v`; error if absent       | `{1, 2}.hata(1)` → `{2}`                         |
| `saf()`                 | clear          | Empty the set                     | `m.saf()` → `{}`                                 |
| `bade(other)`           | union          | Everything from both sets         | `{1, 2}.bade({2, 3})` → `{1, 2, 3}`              |
| `mushtarak(other)`      | intersection   | Only what both share              | `{1, 2}.mushtarak({2, 3})` → `{2}`               |
| `farq(other)`           | difference     | In this set but not `other`       | `{1, 2}.farq({2, 3})` → `{1}`                    |
| `symmetric_farq(other)` | symmetric diff | In exactly one of the sets        | `{1, 2, 3}.symmetric_farq({3, 4})` → `{1, 2, 4}` |
| `nandohisoahe(other)`   | subset         | Is this set contained in `other`? | `{1, 2}.nandohisoahe({1, 2, 3})` → `sach`        |
| `wadohisoahe(other)`    | superset       | Does this set contain `other`?    | `{1, 2, 3}.wadohisoahe({1})` → `sach`            |
| `alaghahe(other)`       | disjoint       | Do the sets share nothing?        | `{1}.alaghahe({7})` → `sach`                     |

One example of the difference between `chad` and `hata`. Both remove, but `hata` insists the value exists:

```sd illustrative
likh({1, 2}.hata(9))
```

`hata` on a missing value raises a `QisamJeGhalti`. Use `chad` when "it may or may not be there" is part of the plan.

## Choosing the right method

A mnemonic helps: `wadha` adds to the end of a list, `addkar` adds to a set, `hasil` gets from a dictionary. If a method you want is missing, add it to the list with `wadha` before filing a bug report.
