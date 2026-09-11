---
title: Dictionaries (lughat)
summary: Store data in key-value pairs for fast lookup using lughat.
enableTableOfContents: true
---

A **`lughat`** (Dictionary) is an unordered collection of key-value pairs. Each key is unique and acts as a shortcut to its corresponding value.

## 1. Creating a Dictionary

Dictionaries use curly braces `{}` and colons `:` to separate keys from values. Sindlish supports multiline declarations.

```sd
user = {
    "naalo": "Amanat",
    "umar": 25,
    "shahr": "Karachi"
}

empty_dict = {}
```

---

## 2. Accessing & Modifying

You can access values using square brackets `[]` or the `.hasil()` method.

```sd
likh(user["naalo"]) # Prints: Amanat

# Adding or updating a value:
user["kaam"] = "Programmer"
user["umar"] = 26
```

---

## 3. The Unhashable Rule (Keys)

In Sindlish, a **key** must be an "immutable" type. This means you can use **Strings**, **Numbers**, and **Booleans** as keys. You **cannot** use a List, Set, or another Dictionary as a key.

```sd
# Valid:
data = { 100: "Score", sach: "Status" }

# Invalid (Will Error):
# data = { [1, 2]: "Invalid" } 
```

---

## 4. Dictionary Methods

Sindlish provides several methods to manage your data pairs.

| Method | Description |
| :--- | :--- |
| **`.hasil(key, default)`** | Returns the value for a key. Returns the `default` (or khali) if key doesn't exist. |
| **`.update(bi_lughat)`** | Merges another dictionary into the current one. |
| **`.cabeyon()`** | Returns a list of all **keys** in the dictionary. |
| **`.raqamon()`** | Returns a list of all **values** in the dictionary. |
| **`.syon()`** | Returns a list of all **items** (as [key, value] lists). |
| **`.kadh(key)`** | Removes the specified key and returns its value. |
| **`.syonkadh()`** | Removes and returns the last key-value pair added. |
| **`.defaultrakh(k, v)`** | If key exists, returns its value. If not, inserts key with value `v`. |
| **`.saf()`** | Removes all items from the dictionary. |
| **`.nakal()`** | Returns a shallow copy of the dictionary. |

### Examples:

```sd
scores = { "Ali": 90, "Sara": 95 }

likh(scores.hasil("Ali"))      # 90
likh(scores.hasil("Zaid", 0))  # 0 (fallback used)

keys = scores.cabeyon()        # ["Ali", "Sara"]
```

---

## 5. Iterating over Dictionaries

When you use a **`har`** loop on a dictionary, you iterate over its **keys**.

```sd
prices = { "Ambu": 100, "Kela": 50 }

har phal mein prices {
    qimat = prices[phal]
    likh(phal + " ji qimat aahe " + lafz(qimat))
}
```

---

## 6. Typed Dictionaries

You can enforce types for both keys and values in a dictionary.

```sd
# A dictionary where keys are Strings and values are Integers
lughat[lafz, adad] inventory = { "Pen": 10, "Book": 5 }

# This would cause an error:
# inventory["Eraser"] = "Out of stock" 
```
