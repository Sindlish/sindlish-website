---
title: Functions (kaam)
summary: Organize your code into reusable, modular blocks using kaam.
enableTableOfContents: true
---

Functions (defined with the **`kaam`** keyword) are blocks of reusable code designed to perform a specific task. They help you avoid repeating yourself and make your programs much easier to read and maintain.

## 1. Defining a Function

A function is defined with a name, a set of parameters in parentheses `()`, and a body enclosed in curly braces `{}`.

```sd
kaam salam() {
    likh("Salam Dunya!")
}

# To use the function, you must "call" it
salam()
```

---

## 2. Parameters & Types

Functions can accept inputs. You can optionally specify the type of each parameter for extra safety.

```sd
kaam greet(naalo: lafz) {
    likh("Salam, " + naalo + "!")
}

greet("Amanat")
```

### Default Parameters

You can provide default values for parameters. If the caller doesn't provide a value, the default will be used.

```sd
kaam khush_amdeed(naalo = "Mehman") {
    likh("Khush Amdeed, " + naalo)
}

khush_amdeed()          # Prints: Khush Amdeed, Mehman
khush_amdeed("Ali")     # Prints: Khush Amdeed, Ali
```

---

## 3. Return Values (wapas)

Functions in Sindlish can return values in two ways:

### A. Explicit Return (`wapas`)

The `wapas` keyword immediately stops the function and sends a value back to the caller. You can optionally specify the return type using the `->` arrow.

```sd
kaam add(a: adad, b: adad) -> adad {
    wapas a + b
}
```

### B. Implicit Return

If the last line of a function is an expression (and you haven't used `wapas`), Sindlish will automatically return the result of that expression.

```sd
kaam square(n) {
    n * n  # This is automatically returned!
}

result = square(5) # result is 25
```

---

## 4. The Result System

By default, every value returned from a function in Sindlish is wrapped in a **Result** object (`Ok`). This is what allows Sindlish to handle errors so gracefully.

If you want to return an error, use the `ghalti()` constructor:

```sd
kaam vind(a, b) {
    agar b == 0 {
        wapas ghalti("Zero saan vand natho kare saghjay")
    }
    wapas a / b
}
```

Learn more about handling these results in the **[Handling Errors](/docs/intermediate/errors)** section.

---

## 5. Function Scope

Variables created inside a function are local to that function. They cannot be seen or modified from the outside.

```sd
kaam calculate() {
    x = 10
}

calculate()
# likh(x) <-- Error! x is not defined here.
```

---

## 6. First-Class Functions

In Sindlish, functions are "First-Class Citizens." This means you can store a function in a variable, pass it to another function, or return it from one!

```sd
kaam hello() { likh("Salam!") }

f = hello
f() # Calls hello()
```
