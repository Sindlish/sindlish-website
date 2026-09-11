---
title: Handling Errors
summary: Build crash-proof software using the Result system and the ghalti keyword.
enableTableOfContents: true
---

Most programming languages use "Exceptions" (try/catch), which can make code unpredictable and hard to follow. Sindlish uses a modern **Result Model**. Instead of crashing, functions that might fail return a **Result** object that must be handled.

## 1. The Result Object

Every function call in Sindlish returns a Result. A result can be in one of two states:
- **Ok**: The operation was successful and contains the value.
- **Ghalti**: The operation failed and contains an error message or object.

You can check the state of a result using the `.ok` and `.ghalti` properties:

```sd
res = some_function()
agar res.ghalti {
    likh("Something went wrong!")
}
```

---

## 2. Returning Errors (`ghalti`)

To signal an error from a function, use the `ghalti()` constructor.

```sd
kaam check_password(pass) {
    agar lambi(pass) < 8 {
        wapas ghalti("Password is too short!")
    }
    wapas sach
}
```

---

## 3. Handling Results (The 5 Methods)

Sindlish provides powerful operators and methods to deal with results without writing many `if` statements.

### A. The `?` Operator (Soft Propagate)

The "Question Mark" operator is the most common way to handle errors. 
- If the result is **Ok**, it "unwraps" the value.
- If the result is **Ghalti**, it immediately returns the error from the current function.

```sd
kaam setup() -> Result {
    user = get_user()?  # If this fails, setup() returns the error here.
    likh("Welcome " + user)
    wapas sach
}
```

### B. The `.bachao()` Method (Default/Fallback)

Use this when you want to provide a safe default value if an error occurs.

```sd
# If the file doesn't exist, 'content' becomes an empty string instead of an error.
content = read_file("config.txt").bachao("") 
```

### C. The `.lazmi()` Method (Required)

Use this when an error is unacceptable. If the result is a `Ghalti`, the program will crash (Panic) with the custom message you provide.

```sd
# If this fails, the program stops immediately with the message "Database required!"
db = connect_db().lazmi("Database required!")
```

### D. The `!!` Operator (Panic Unwrap)

Similar to `.lazmi()`, but it crashes with the **original** error message contained in the result.

```sd
val = divide(10, 0)!! # CRASHES with "Zero saan vand natho kare saghjay"
```

---

## 4. Triggering a Panic (`ghalti` statement)

When `ghalti` is used as a **standalone statement** (not inside a `wapas`), it acts as an immediate panic. Use this for unrecoverable system failures.

```sd
agar critical_system_failure {
    ghalti("CRITICAL ERROR: Reactor overheating!") # Program stops here.
}
```

---

## 5. Summary Table

| Tool | Behavior on Ok | Behavior on Ghalti |
| :--- | :--- | :--- |
| **`?`** | Returns Value | **Returns Error** from function |
| **`.bachao(v)`** | Returns Value | Returns **`v`** |
| **`.lazmi(m)`** | Returns Value | **Panics** with message `m` |
| **`!!`** | Returns Value | **Panics** with original error |
| **`res.ok`** | `sach` | `koorh` |
| **`res.ghalti`** | `koorh` | `sach` |
