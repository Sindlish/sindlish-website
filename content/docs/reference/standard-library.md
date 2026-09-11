---
title: Standard Library
summary: Explore the built-in functions that come with Sindlish.
enableTableOfContents: true
---

Sindlish comes with a essential set of built-in functions that are available in the global scope without any extra setup.

## Console I/O

### `likh(...)`

The primary output function. It accepts any number of arguments, converts them to strings, and prints them to the console separated by spaces.
```sd
likh("Salam", "Sindh", 2024) # Prints: Salam Sindh 2024
```

### `puch(prompt)`

The input function. It displays the `prompt` string to the user and waits for them to type something. It returns the user's input as a **lafz** (string).
```sd
naalo = puch("Tawaan jo naalo cha aahe? ")
likh("Salam, " + naalo)
```

---

## Collections & Ranges

### `lambi(collection)`

Returns the number of items in a **fehrist**, **lughat**, or **majmuo**, or the number of characters in a **lafz**.
```sd
likh(lambi("Sindh")) # Prints: 5
likh(lambi([1, 2, 3])) # Prints: 3
```

### `range(start, end, step)`

Generates a list of integers.
- `range(5)` -> `[0, 1, 2, 3, 4]`
- `range(1, 6)` -> `[1, 2, 3, 4, 5]`
- `range(0, 10, 2)` -> `[0, 2, 4, 6, 8]`

### `majmuo(iterable)`

Creates a new **majmuo** (Set). If an iterable (like a List or String) is provided, it converts it into a set, automatically removing any duplicates.
```sd
unique = majmuo([1, 2, 2, 3]) # {1, 2, 3}
```

---

## Type Conversion (Cast Functions)

As detailed in the **[Variables & Types](/docs/basics/variables#typecasting-qisam-badli---in-detail)** section, the type keywords themselves act as functions to convert data:

- `adad(value)`: Convert to Integer.
- `dahai(value)`: Convert to Float.
- `lafz(value)`: Convert to String.
- `faislo(value)`: Convert to Boolean.
- `fehrist(value)`: Convert to List.
- `majmuo(value)`: Convert to Set.
