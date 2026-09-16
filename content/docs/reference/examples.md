---
title: Examples
summary: A gallery of complete runnable programs.
enableTableOfContents: true
---

This is a gallery of small, complete programs. They all run, so copy any one into a file and try it.

### Hello world

```sd
likh("Salam, dunya!")
```

### A simple calculator

```sd
a = 10
b = 5
likh(a + b)
likh(a * b)
likh(a / b)
```

### Even or odd

```sd
n = 7
agar n % 2 == 0 {
  likh("Jor")
} warna {
  likh("Feerk")
}
```

### Sum the first ten numbers

```sd
jama = 0
har i mein silsilo(1, 11) {
  jama = jama + i
}
likh(jama)
```

### Count the digits in a number

```sd
n = 12345
likh("Digit ho: " + lafz(lambi(lafz(n))))
```

### Build a list

```sd
items = []
items.wadha("qalam")
items.wadha("kaghaz")
items.wadha("kitaab")
likh(items)
```

### Fizzbuzz

```sd
har i mein silsilo(1, 31) {
  agar i % 15 == 0 {
    likh("FizzBuzz")
  } yawari i % 3 == 0 {
    likh("Fizz")
  } yawari i % 5 == 0 {
    likh("Buzz")
  } warna {
    likh(i)
  }
}
```

### Dictionary lookup with fallback

```sd
ages = {}
ages["Ali"] = 25
ages["Anaya"] = 30
likh(ages.hasil("Ali"))
likh(ages.hasil("Zain", "nah pata"))
```

### Result pattern for safe division

```sd
r1 = 10 / 4
likh(r1?)

r2 = 10 / 0
likh(r2?)
```

### Closure counter

```sd
kaam bana() {
  counter = 0
  kaam wadhao() {
    bahari counter
    counter = counter + 1
    likh(counter)
  }
  wapas wadhao
}
f = bana()
f()
f()
f()
```
