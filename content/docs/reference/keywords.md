---
title: Keywords
summary: The 29 reserved words in Sindlish and what they mean.
enableTableOfContents: true
---

Every programming language reserves certain words so that its parser can recognize them. In Sindlish these words are Romanized Sindhi, and none of them can be used as variable names. The list is short: 29 words.

## Data type keywords

These keywords name the five primitive types and three collection types. You use them to declare variables or build collections:

| Keyword   | Sindhi meaning | What it holds                             |
| --------- | -------------- | ----------------------------------------- |
| `adad`    | number         | Whole numbers like `0`, `5`, `-3`         |
| `dahai`   | decimal        | Decimal numbers like `3.14`, `-0.5`       |
| `lafz`    | word           | Text strings like `"Salam"`               |
| `faislo`  | decision       | Boolean: `sach` (true) or `koorh` (false) |
| `khali`   | empty          | Nothing at all                            |
| `fehrist` | list           | Ordered collection: `[1, 2]`              |
| `lughat`  | dictionary     | Key-value pairs: `{"a": 1}`               |
| `majmuo`  | set            | Unique values: `{1, 2}`                   |

## Literal keywords

Two keywords are also values:

| Keyword | Meaning         |
| ------- | --------------- |
| `sach`  | The true value  |
| `koorh` | The false value |

## Control flow

| Keyword   | Meaning                    |
| --------- | -------------------------- |
| `agar`    | If                         |
| `yawari`  | Or else if                 |
| `warna`   | Otherwise                  |
| `jistain` | While                      |
| `har`     | Each (for-each loop)       |
| `tor`     | Break out of a loop        |
| `jari`    | Skip to the next iteration |

## Functions and scope

| Keyword  | Meaning                                                   |
| -------- | --------------------------------------------------------- |
| `kaam`   | Declare a function                                        |
| `wapas`  | Return a value from a function                            |
| `mein`   | In (pairs with `har`: "each ... in ...")                  |
| `bahari` | Declare a variable as belonging to the enclosing function |
| `aalmi`  | Declare a variable as global to the module                |

## Results and errors

| Keyword  | Meaning                             |
| -------- | ----------------------------------- |
| `ok`     | Wrap a value in an OK Result        |
| `ghalti` | Create an error Result or raise one |

## Operators written as words

| Keyword | Meaning                           |
| ------- | --------------------------------- |
| `aen`   | Logical and                       |
| `ya`    | Logical or                        |
| `nah`   | Logical not                       |
| `pakko` | Make a variable read-only (const) |

## Coming soon

| Keyword | Status                                                                                         |
| ------- | ---------------------------------------------------------------------------------------------- |
| `match` | Reserved for pattern matching. Not implemented yet. The parser rejects it with a roadmap note. |

The keywords page is a quick lookup. To see a keyword in action, follow the link from the relevant Learn page.
