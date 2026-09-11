---
title: Variables & Types
summary: A comprehensive guide to storing data, understanding types, and converting between them.
enableTableOfContents: true
---

Before you write complex logic, you need to understand how Sindlish stores and manages information. In programming, a **variable** is a named location in the computer's memory where you can store data to use or modify later. Every piece of data belongs to a specific **type**. 

## The 5 Basic Data Types

Sindlish provides five core primitive data types. Whenever you declare a variable without giving it an initial value, Sindlish will automatically assign it a "Default Value" based on its type.

| Keyword | English Meaning | What it stores | Default Value | Example |
| :--- | :--- | :--- | :--- | :--- |
| **`adad`** | Integer | Whole numbers (no decimals) | `0` | `10`, `-5`, `999` |
| **`dahai`** | Float | Decimal numbers | `0.0` | `3.14`, `-0.5`, `10.0` |
| **`lafz`** | String | Text, words, and characters | `""` (Empty string) | `"Salam"`, `'Sindh'` |
| **`faislo`** | Boolean | Truth values | `koorh` (False) | `sach` (True), `koorh` (False) |
| **`khali`** | Null | Absolutely nothing | `khali` | `khali` |

---

## Creating Variables

Sindlish features a **Hybrid Typing System**. This means you get the best of both worlds: you can write extremely fast, dynamic code when prototyping, or you can write strict, rigidly-typed code when building large, reliable systems.

### 1. Dynamic Typing (The Quick Way)

You do not have to tell Sindlish what type of data you are storing. It will infer the type automatically based on the value you provide. Furthermore, because it is dynamic, you can change the type of the variable later in your code!

```sd
# Sindlish looks at the right side and decides 'naalo' is a lafz (String)
naalo = "Amanat"   

# Sindlish decides 'umar' is an adad (Integer)
umar = 25          

# Because it is dynamic, we can overwrite 'umar' with a completely different type!
umar = "pacheeh"   # Now it's a string! No errors thrown.
```

### 2. Typed Declarations (The Safe Way)

If you are building a critical system, you might want to guarantee that a variable *only* ever holds numbers. If you explicitly declare the type before the variable name, Sindlish will enforce that type.

```sd
# This variable is locked to the 'adad' type.
adad score = 100

# This variable is locked to the 'lafz' type.
lafz city = "Karachi"

# If you try to run the following line, Sindlish will throw a Type Error and stop!
# score = "high"
```

**Default Initialization:**
If you declare a typed variable but don't give it a value, Sindlish gives it the default value for that type.
```sd
lafz message   # Sindlish assigns "" (empty string) to message
adad count     # Sindlish assigns 0 to count
```

### 3. Postfix Type Annotations

For developers coming from modern languages like TypeScript, Rust, or Python, you can use the colon `:` syntax to declare types. It behaves exactly the same as the method above.

```sd
price: dahai = 99.99
is_active: faislo = sach
```

### 4. Constants (`pakko`)

Sometimes you have a value that should **never** change throughout the entire lifespan of your program (for example, the value of Pi, or a server configuration URL). You can lock the variable permanently using the `pakko` keyword. 

```sd
pakko dahai PI = 3.14159
pakko lafz GREETING = "Salam, welcome to the system!"

# Attempting to change a pakko variable will cause a fatal error.
# PI = 4.0  <-- This will crash the program!
```

---

## Typecasting (Qisam Badli) - In Detail

In real-world programming, you will constantly receive data in one format and need it in another. For example, if you ask the user for their age, they might type `"25"`. To the computer, that is a string (`lafz`), not a number. If you try to do math with a string, your program will fail.

You need to convert the data. This process is called **Typecasting** (or Qisam Badli in Sindlish). In Sindlish, you typecast by simply using the type keyword as if it were a function.

### Converting to Integers (`adad`)

You can convert strings and floats into whole numbers using `adad()`. When converting a float to an integer, it truncates (chops off) the decimal part; it does not round up.

```sd
# String to Integer
age_string = "25"
age_number = adad(age_string)
likh(age_number + 5)  # Prints: 30

# Float to Integer
pi = 3.14159
pi_int = adad(pi)
likh(pi_int)  # Prints: 3 (The .14159 is discarded)

# Boolean to Integer
likh(adad(sach))   # Prints: 1
likh(adad(koorh))  # Prints: 0
```

### Converting to Floats (`dahai`)

You can convert integers and strings into decimal numbers.

```sd
# Integer to Float
number = 10
float_number = dahai(number)
likh(float_number)  # Prints: 10.0

# String to Float
price_text = "99.99"
price_float = dahai(price_text)
likh(price_float * 2)  # Prints: 199.98
```

### Converting to Strings (`lafz`)

Almost anything in Sindlish can be converted into a string using `lafz()`. This is incredibly useful when you want to concatenate (join) numbers with text.

```sd
# Integer to String
score = 150
score_text = lafz(score)
likh("Your final score is: " + score_text)

# Boolean to String
likh(lafz(sach))  # Prints the text "sach"
```

### Converting to Booleans (`faislo`)

When converting a boolean, Sindlish follows the concept of "Truthiness". 
- `0`, `0.0`, `""` (empty string), and `khali` will convert to `koorh` (False).
- Any non-zero number and any non-empty string will convert to `sach` (True).

```sd
likh(faislo(1))       # Prints: sach
likh(faislo(0))       # Prints: koorh
likh(faislo(-5))      # Prints: sach

likh(faislo("Text"))  # Prints: sach
likh(faislo(""))      # Prints: koorh
likh(faislo(khali))   # Prints: koorh
```

### Converting Collections

You can even use typecasting to convert strings into Lists (`fehrist`)! Every character in the string becomes an item in the list.

```sd
word = "Sindh"
letter_list = fehrist(word)
likh(letter_list)  # Prints: ["S", "i", "n", "d", "h"]
```
