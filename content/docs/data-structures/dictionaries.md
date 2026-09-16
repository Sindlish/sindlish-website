---
title: Dictionaries
summary: Key-value pairs called lughat.
enableTableOfContents: true
---

A **dictionary** stores values under names called keys. Sindlish calls it a `lughat`, and you would use it for anything you would naturally look up: a phone number for a friend, a score for a student, a stock count for a fruit.

Write a dictionary with `{key: value}`. To read a value, look it up by key:

```sd
lughat phonebook = {}
phonebook["Ali"] = 111
phonebook["Anaya"] = 222
likh(phonebook.hasil("Ali"))
likh(phonebook.hasil("Zain", "nah milo"))
```

```txt filename="Output"
111
nah milo
```

The `hasil` method (Sindlish for "get") looks up a key. Pass a second argument and that value comes back when the key is missing, instead of an error. That makes `hasil` the friendly way to read dictionaries.

## Add and update

The `[]` form is a two-way street. Reading `phonebook["Ali"]` gives the value, and writing `phonebook["Ali"] = 9` creates the key or replaces its value:

```sd
lughat score = {"Ali": 8}
score["Ali"] = 9
likh(score.hasil("Ali"))
```

```txt filename="Output"
9
```

## Look inside

`cabeyon` (keys) lists the keys, `raqamon` (values) lists the values, and `syon` (items) lists key-value pairs together:

```sd
lughat d = {"a": 1}
d["b"] = 2
likh(d.cabeyon())
likh(d.raqamon())
likh(d.syon())
```

```txt filename="Output"
[a, b]
[1, 2]
[[a, 1], [b, 2]]
```

## Smart defaults and merges

`defaultrakh` (set default) stores a value only if the key is missing, leaving an existing key untouched. `update` merges another dictionary in. `kadh` removes a key and returns its value:

```sd
lughat d = {"a": 1}
d.defaultrakh("a", 99)
likh(d.hasil("a"))
d.update({"b": 2})
likh(d.hasil("b"))
likh(d.kadh("a"))
likh(d.hasil("a", "natho"))
```

```txt filename="Output"
1
2
1
natho
```

## Loop over a dictionary

`har` loops over a dictionary's keys. Look up each one inside the loop for the value:

```sd
lughat d = {"a": 1}
d["b"] = 2
har key mein d {
  likh(key, d.hasil(key))
}
```

```txt filename="Output"
a 1
b 2
```

One honest warning: do not build logic around the order of a `lughat`. Sindlish does not promise that entries stay in the order you wrote them. A literal like `{"a": 1, "b": 2}` can even come out as `b` before `a`. Always look things up by key, as the examples here do.

That is the everyday dictionary toolkit. The full method list lives on the [collection methods](/docs/reference/collection-methods) reference page.

Next up: [Sets](/docs/data-structures/sets)
