---
title: Lists (fehrist)
summary: Manage ordered collections of data with the fehrist type.
enableTableOfContents: true
---

A **`fehrist`** (List) is an ordered, mutable collection of items. In Sindlish, lists are dynamic, meaning they can grow or shrink in size, and they can hold any mix of data types.

## 1. Creating a List

You can create a list using square brackets `[]`. Lists in Sindlish support multiple lines for better readability.

```sd
fal = ["Ambu", "Kela", "Soof"]
empty_list = []

# Multiline support
shahar = [
    "Karachi",
    "Hyderabad",
    "Sukkur"
]
```

---

## 2. Indexing and Slicing

Every item in a list has a position, starting from **0**. Sindlish also supports **negative indexing** to access items from the end of the list.

```sd
fal = ["Ambu", "Kela", "Soof"]

likh(fal[0])  # Prints: Ambu
likh(fal[-1]) # Prints: Soof (last item)
```

### Nested Indexing

If a list contains another list, you can chain brackets to reach the inner items.

```sd
matrix = [
    [1, 2, 3],
    [4, 5, 6]
]

likh(matrix[1][0]) # Prints: 4
```

---

## 3. Modifying Lists

Lists are **mutable**, meaning you can change their contents after creation using the index.

```sd
names = ["Amanat", "Sindh"]
names[1] = "Sindlish" # Changes "Sindh" to "Sindlish"
```

---

## 4. List Methods

Sindlish provides a rich set of built-in methods to manipulate lists.

| Method | Description |
| :--- | :--- |
| **`.wadha(item)`** | **Append**: Adds an item to the end of the list. |
| **`.wadhayo(fehrist)`** | **Extend**: Adds all items from another list to this one. |
| **`.wajh(index, item)`** | **Insert**: Adds an item at the specific index. |
| **`.hata(item)`** | **Remove**: Removes the first occurrence of the specified item. |
| **`.kadh(index)`** | **Pop**: Removes and returns the item at the specified index (default is last). |
| **`.saf()`** | **Clear**: Removes all items from the list. |
| **`.index(item)`** | **Index**: Returns the index of the first occurrence of an item. |
| **`.garn(item)`** | **Count**: Returns how many times an item appears in the list. |
| **`.tarteeb()`** | **Sort**: Sorts the list in ascending order. |
| **`.ulto()`** | **Reverse**: Reverses the order of items in the list. |
| **`.nakal()`** | **Copy**: Returns a shallow copy of the list. |

### Examples:

```sd
nums = [30, 10, 20]

nums.wadha(40)      # [30, 10, 20, 40]
nums.tarteeb()      # [10, 20, 30, 40]
nums.kadh(0)        # Removes 10, returns 10
likh(lambi(nums))   # Prints: 3 (using the global lambi function)
```

---

## 5. Iterating over Lists

Use the **`har ... mein`** loop to iterate through every item in a list.

```sd
todo = ["Code", "Eat", "Sleep"]

har task mein todo {
    likh("Today I will: " + task)
}
```

---

## 6. Typed Lists

For extra safety, you can restrict a list to only hold a specific type of data.

```sd
fehrist[adad] scores = [90, 85, 88]

# This would cause a QisamJeGhalti (Type Error):
# scores.wadha("Excellent") 
```

---

## 7. Important: Unhashable Type

In Sindlish, Lists are **unhashable**. This means you **cannot** use a list as a key in a Dictionary (`lughat`) or as an element in a Set (`majmuo`). Doing so will result in an error.
