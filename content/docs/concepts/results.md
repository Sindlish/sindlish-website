---
title: Results
summary: How Sindlish turns failure into a value you can handle.
enableTableOfContents: true
---

Every program has to think about failure. The question is where. Some languages throw exceptions that zoom up the call stack; other languages return magic values like `null` and hope you remembered to check.

Sindlish takes a middle path. Dangerous operations return a `Result`: a value that is either an **OK** with data inside, or an error carrying a message. You decide at the call site what to do.

## The two shapes

`ok(value)` wraps success. `ghalti(message)` wraps failure. Both produce a `Result`, and `qisam` recognizes them:

```sd
likh(qisam(ok(1)))
likh(qisam(ghalti("boo")))
```

```txt filename="Output"
RESULT
RESULT
```

## Unwrap with question mark

The `?` operator is the blunt instrument: give me the value, whatever it is. On an OK result it returns the value quietly. On an error result it prints the message instead of stopping you dead:

```sd
likh(ok(42)?)
```

```txt filename="Output"
42
```

```sd illustrative
likh(ghalti("boo")?)
```

The second program prints `boo`.

## Rescue with bachao

The surgical instrument is `bachao` (rescue). Give it the fallback and it yields the value on success, the fallback on failure:

```sd
likh(ghalti("boo").bachao(99))
likh(ok(7).bachao(99))
```

```txt filename="Output"
99
7
```

## When Results appear

The places you will meet Results, and the operations that raise errors instead, are laid out on the [intermediate errors](/docs/intermediate/errors) page. The key distinction: division returns a Result (so `10 / 0` prints a message), while a failed cast raises a runtime error (so `adad("abc")` stops the program).

## Why Results

Results keep error handling local and visible. When a function returns a Result, the calling code can see in one glance whether the function can fail and how the failure is handled. That is more honest than a hidden exception, and more useful than a bare `koorh`.

The exact spelling guidelines, like when to use `?` versus `.bachao()`, live with the [errors reference](/docs/reference/errors).
