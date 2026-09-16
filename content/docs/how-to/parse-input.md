---
title: Read and parse user input
summary: Safely turn text from puch into a number without crashing.
enableTableOfContents: true
---

Sindlish's `puch` function reads a line of text from the terminal. It always returns a `lafz` (string). If you try to cast a non-numeric string with `adad`, the program stops. This guide shows how to test a string first and use the cast only when you know it is safe.

## The problem

Calling `adad` on text that is not a number raises a runtime error. This is the same behavior you met on the [errors](/docs/intermediate/errors) page:

```sd illustrative
likh(adad("abc"))
```

The interpreter prints a `HalndeVaktGhalti` and stops. In a game or tool, that is too aggressive.

## Build a digit checker

A quick solution is a function that checks whether every character in the string is a digit. Because `har` looping over a string has some quirks in the current interpreter, the safest pattern is index access:

```sd
kaam khalisAdad(s) {
  agar lambi(s) == 0 {
    wapas koorh
  }
  n = lambi(s)
  har i mein silsilo(n) {
    c = s[i]
    agar nah (c >= "0" aen c <= "9") {
      wapas koorh
    }
  }
  wapas sach
}
likh(khalisAdad("123"))
likh(khalisAdad("12a"))
likh(khalisAdad(""))
likh(khalisAdad("7"))
```

```txt filename="Output"
sach
koorh
koorh
sach
```

The function walks each character by index, compares it to the characters `"0"` and `"9"`, and returns `sach` (true) only if every one passes. Empty strings come back as `koorh` too, so an empty prompt is safely rejected.

One note on the style above: Sindlish currently evaluates function arguments eagerly in the same stack frame. For now, keep **one user-function call per statement** when calling a function that contains a loop. Multiple calls in the same `likh(...)` expression may produce unexpected output.

## Safe casting in practice

Combine the check with a cast:

```sd illustrative
kaam parse_adad() {
  n = puch("Adad likho: ")
  agar khalisAdad(n) {
    likh("Aap jo adad: " + lafz(adad(n)))
  } warna {
    likh("Eho koi adad nathi.")
  }
}
parse_adad()
```

The program now handles bad input gracefully. The player sees a friendly message and can try again, rather than a crash.

## Edge cases

What should happen with `""` or `"-5"` or `"3.14"`? This simple checker rejects all of them, because the minus sign and the dot are not digits. That is fine for a game that only expects whole numbers from 1 to 10. If you need decimals or negatives, expand the comparison to include `"-"` at position zero and `"."` anywhere, then validate two pieces separately.

## Where to go next

The [number guessing game](/docs/how-to/number-guessing-game) ties this parsing technique into the full interactive game. Bring this `khalisAdad` function along and you will have a game that never crashes on unexpected input.
