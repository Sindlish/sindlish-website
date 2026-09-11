---
title: Installation
summary: How to install Sindlish on your machine.
enableTableOfContents: true
---

## Installation Guide

You can run Sindlish directly from your terminal! Follow the instructions for your operating system below.

## Windows

1. Download the latest installer: `sindlish-installer-win64.exe`.
2. Run the wizard and follow the on-screen instructions.
3. Open a new terminal (PowerShell or Command Prompt).
4. Verify the installation by typing:
   ```bash
   sindlish --version
   ```

## Mac & Linux

1. Download the `install.sh` script from the repository.
2. Open your terminal and navigate to the directory where you downloaded the script.
3. Run the installation script:
   ```bash
   bash install.sh
   ```
4. Restart your terminal.
5. Verify the installation:
   ```bash
   sindlish --version
   ```

## Running Your First Program

Once installed, you can run any Sindlish file (ending in `.sd`) by typing:

```bash
sindlish your_file.sd
```

Try creating a file called `salam.sd` with the following content:

```sd
likh("Salam, Sindh!")
```

Then run it:

```bash
sindlish salam.sd
```

## Next Steps

Now that you have Sindlish installed, you should:
- [Setup VS Code](/docs/vscode-extension) for the best coding experience.
- Dive into the [Language Guide](/docs/basics/variables) to start learning.
