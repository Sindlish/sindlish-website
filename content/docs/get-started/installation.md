---
title: Installation
summary: How to install Sindlish on your machine.
enableTableOfContents: true
---

Before we write programs, let's get the `sindlish` command onto your machine. It runs files, opens a prompt, and ships with a small offline reference. Follow the steps for your operating system.

## Windows

1. Download the latest installer, `sindlish-installer-win64.exe`.
2. Run the wizard and follow the on-screen instructions.
3. Open a new terminal.
4. Verify the installation by typing:

```bash
sindlish --version
```

## Mac and Linux

1. Download the `install.sh` script from the repository.
2. Open a terminal and navigate to the folder where you saved the script.
3. Run the installer:

```bash
bash install.sh
```

4. Restart your terminal.
5. Verify the installation:

```bash
sindlish --version
```

## Run your first file

Sindlish source files end in `.sd`. Create a file called `salam.sd` with this content:

```sd
likh("Salam, Sindh!")
```

```txt filename="Output"
Salam, Sindh!
```

Then run it from the terminal:

```bash
sindlish salam.sd
```

## Next steps

From here, the fun starts:

- Write your [first program by hand](/docs/get-started/hello-world).
- Grab the [VS Code extension](/docs/vscode-extension) for syntax highlighting.
- Or open the offline reference anytime with `sindlish docs`.

Next up: [Hello, world](/docs/get-started/hello-world)
