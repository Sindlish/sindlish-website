---
title: Welcome to Sindlish
summary: The programming language that speaks your language.
enableTableOfContents: true
---

# Salam, Duniay! (Hello World!)

Welcome to **Sindlish**, the first high-level programming language designed specifically for the Sindhi-speaking community. 

Sindlish is not just a translation; it is a full-featured, stack-based bytecode virtual machine that allows you to write professional, high-performance software using the words you already know.

## Why Sindlish?

For decades, the world of programming has been dominated by English. This creates a barrier for millions of talented people who think and speak in Sindhi. Sindlish breaks that barrier by providing:

- **Native Keywords**: Use `kaam`, `agar`, `har`, and `lafz` instead of `function`, `if`, `for`, and `string`.
- **Hybrid Typing**: Enjoy the flexibility of dynamic typing or the safety of static typing.
- **Crash-Proof Design**: A modern `Result` system for error handling using `Result`, `ghalti`, and `?`.
- **High Performance**: A bytecode VM that ensures your code runs fast.

## A Quick Preview

Here is how a simple prime number checker looks in Sindlish:

```sd
kaam is_prime(n) {
    agar n <= 1 { wapas koorh }
    
    # har loop for iteration
    har i mein silsilo(2, n) {
        agar i * i > n { tor } # Exit early using 'tor'
        
        agar n % i == 0 {
            wapas koorh
        }
    }
    
    wapas sach
}

# Let's test it
number = 17
agar is_prime(number) {
    likh(lafz(number) + " is a prime number!")
}
```

## Study from the Source
The best way to learn Sindlish is to study the official reference file. It covers everything from basic math to advanced error handling.

> [!TIP]
> Check out the `hello.sd` file in the root of the repository for a complete feature demonstration!

## Getting Started

Ready to start your journey? Follow these steps:

1. **[Setup & Installation](/docs/get-started/installation)**: Get Sindlish running on your machine.
2. **[VS Code Extension](/docs/vscode-extension)**: Install the official extension for syntax highlighting.
3. **[Language Guide](/docs/basics/variables)**: Learn about variables, loops, and logic.
4. **[Data Structures](/docs/data-structures/lists)**: Master lists, dictionaries, and sets.

Sindh has a rich history of literature and knowledge. With Sindlish, we are bringing that legacy into the digital age. **Bismillah!**
