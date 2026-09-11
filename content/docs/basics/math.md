---
title: Math & Logic
summary: Master arithmetic operations, logical comparisons, and complex expressions in Sindlish.
enableTableOfContents: true
---

Sindlish provides a robust set of operators for performing mathematical calculations and logical evaluations. Whether you are building a simple calculator or a complex algorithm, understanding these operators is essential.

## 1. Arithmetic Operators

Arithmetic operators are used to perform common mathematical operations.

| Operator | Meaning | Example | Result |
| :--- | :--- | :--- | :--- |
| **`+`** | Addition | `10 + 5` | `15` |
| **`-`** | Subtraction | `10 - 5` | `5` |
| **`*`** | Multiplication | `10 * 5` | `50` |
| **`/`** | Division | `10 / 2` | `5.0` |
| **`%`** | Modulo (Remainder) | `10 % 3` | `1` |
| **`^`** | Exponent | `2 ^ 3` | `8` |

### Floating Point Division

In Sindlish, division (`/`) always returns a decimal number (**`dahai`**), even if both numbers are integers. This prevents precision loss.

```sd
likh(10 / 2)  # Prints: 5.0
likh(7 / 2)   # Prints: 3.5
```

---

## 2. Comparison Operators

Comparison operators are used to compare two values. They always return a **`faislo`** (`sach` or `koorh`).

| Operator | Meaning | Example | Result |
| :--- | :--- | :--- | :--- |
| **`==`** | Equal to | `10 == 10` | `sach` |
| **`!=`** | Not equal to | `10 != 5` | `sach` |
| **`>`** | Greater than | `10 > 5` | `sach` |
| **`<`** | Less than | `5 < 10` | `sach` |
| **`>=`** | Greater or equal | `10 >= 10` | `sach` |
| **`<=`** | Less or equal | `5 <= 10` | `sach` |

---

## 3. Logical Operators

Logical operators allow you to combine multiple comparisons into a single decision.

| Keyword | Meaning |
| :--- | :--- |
| **`aen`** | True if **both** sides are true |
| **`ya`** | True if **at least one** side is true |
| **`nah`** (or **`!`**) | Inverts the boolean value |

```sd
umar = 20
has_license = sach

agar umar >= 18 aen has_license == sach {
    likh("You can drive!")
}
```

---

## 4. Operator Precedence

When you write complex expressions like `10 + 5 * 2`, Sindlish follows standard mathematical rules to decide which operation happens first.

1. **Parentheses `()`**: Anything inside brackets happens first.
2. **Unary `- + !`**: Negation or logical not.
3. **Power `^`**: Exponentiation.
4. **Multiplication/Division `* / %`**: These happen before addition.
5. **Addition/Subtraction `+ -`**: These happen last.

```sd
result = (10 + 5) * 2  # Result is 30
result = 10 + 5 * 2    # Result is 20
```

---

## 5. String Operations

The addition operator `+` can also be used to join two strings together. This is called **concatenation**.

```sd
firstName = "Amanat"
lastName = "Ali"
fullName = firstName + " " + lastName
likh(fullName)  # Prints: Amanat Ali
```

You can also multiply a string by a number to repeat it!
```sd
likh("Ha" * 3)  # Prints: HaHaHa
```

## 6. Multiline Expressions

If an expression is too long to fit on one line, you can wrap it in parentheses to spread it across multiple lines. Sindlish will treat everything inside the parentheses as a single expression.

```sd
total = (
    item1_price +
    item2_price +
    item3_price +
    tax_rate
)
```
