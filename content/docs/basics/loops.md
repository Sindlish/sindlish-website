---
title: Loops (Iterators)
summary: Repeat actions efficiently using har and jistain loops.
enableTableOfContents: true
---

Loops are used to repeat a block of code multiple times. Sindlish provides two main types of loops: `har` for iteration and `jistain` for condition-based looping.

## 1. The `har` (For) Loop

The `har` loop is used to iterate over a collection (like a list, dictionary, or set) or a range of numbers. The **`mein`** keyword is mandatory between the iterator variable and the collection.

### Numeric Range

The `range()` function generates a sequence of numbers. It can be used in three ways:
1. `range(end)`: 0 to end (exclusive).
2. `range(start, end)`: start to end (exclusive).
3. `range(start, end, step)`: start to end with a custom increment.

```sd
# Loops from 0 to 4
har i mein range(5) {
    likh("Count: " + lafz(i))
}

# Loops from 10 down to 2, skipping 2 each time
har i mein range(10, 0, -2) {
    likh("Down: " + lafz(i))
}
```

### Iterating over Collections

You can use `har` to process items in any collection.

```sd
fal = ["Ambu", "Kela", "Soof"]

har f mein fal {
    likh("Khadaaseen: " + f)
}
```

---

## 2. The `jistain` (While) Loop

The `jistain` loop continues to run as long as a specific condition remains **sach** (true).

```sd
adad count = 1

jistain count <= 3 {
    likh("Iteration: " + lafz(count))
    count = count + 1
}
```

---

## 3. Loop Control: `tor` & `jari`

### `tor` (Break)

The `tor` keyword exits the loop immediately.

```sd
har i mein range(100) {
    agar i == 5 {
        tor # Stops the loop entirely
    }
    likh(i)
}
```

### `jari` (Continue)

The `jari` keyword skips the current iteration and jumps to the next one.

```sd
har i mein range(5) {
    agar i == 2 {
        jari # Skip 2 and continue with 3
    }
    likh(i)
}
# Output: 0, 1, 3, 4
```

---

## 4. Infinite Loops

If you need a loop that runs forever (e.g., for a server or a game engine), you can use `jistain sach`.

```sd
jistain sach {
    likh("Press Ctrl+C to stop me!")
}
```
