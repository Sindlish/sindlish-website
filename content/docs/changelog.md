---
title: Changelog
summary: Stay up to date with the latest changes and improvements to Sindlish.
enableTableOfContents: true
---

# Release History

## v0.1.1 (2026-09-10)

The next release after the first alpha: a complete under-the-hood rebuild across all six pipeline stages, unified error philosophy, a major performance pass, and production-ready packaging — plus the new official documentation site.

### New Features

- **Installable CLI**: the `sindlish` command ships the full toolset — `sindlish run`, `repl`, `eval`, `tokens`, `ast`, `check`, and `docs` (offline reference).
- **Multi-platform distribution**: Windows installer (`.exe`), macOS package (`.pkg`), and Linux package (`.deb`) are built automatically on every GitHub release.
- **Official documentation**: a brand-new mdBook (*Sindlish Internals — A Cozy Field Guide*) became the canonical reference, with appendices covering the AST, grammar, distribution, and the VS Code extension.
- **Licensing**: Sindlish is now free software under the **GNU GPL v3.0-or-later** license.
- **VS Code extension 0.1.1**: syntax grammar is now regenerated from the language's own vocab registries, so highlighting can never drift out of sync (stale `kharabi` and `range` tokens removed, `silsilo` added).

### Improvements

- **Performance pass**: inlined VM dispatch loop, O(1) constant dedupe in the compiler, slimmer frame re-sync, and a fast operand-unwrap path.
- **Unified error philosophy**: arithmetic operators return a `Result` on failure, ordering comparisons raise, and equality is total. A clean 8-class error taxonomy with consistent Romanized Sindhi messages.
- **Backend rebuild**: generated dispatch and operand-encoding tables, dead opcodes dropped, and colorized, pretty-printed `ast` output.
- **Object model & runtime**: objects, collections, and `Result` reworked; vestigial ref-counting and env bookkeeping removed.
- **Pipeline facade**: frontend, resolver, and backend now expose a clean `lex → parse → resolve → compile → build_vm → check` pipeline that CLI and tests share.
- **Renames**: `range` becomes **`silsilo`**; the set-intersection method `milap` becomes **`mushtarak`**.

### Bug Fixes

- A top-level `wapas` (return) is now reported as a proper `TarteebJeGhalti` instead of a confusing failure.
- Misusing `bahari` is classified as `TarteebJeGhalti`, and referencing an unknown outer name reports `NaleJeGhalti`.
- `silsilo` now rejects non-`adad` arguments instead of silently truncating them.
- Duplicate keyword arguments are rejected, and typed-list elements are re-checked.
- Fixed the test runner's hard-coded machine-specific `sys.path`.

## v0.1.0 Alpha (2026-04-26)

The initial alpha release of Sindlish! This version introduces the core language architecture and the bytecode virtual machine.

### New Features

- **Bytecode VM**: A high-performance stack-based virtual machine.
- **Hybrid Typing**: Support for both dynamic and static type declarations.
- **Result Model**: Modern error handling using `Result`, `ghalti`, and `?`.
- **VS Code Extension**: Official support for syntax highlighting and snippets.
- **Data Structures**: Native support for `fehrist` (List), `lughat` (Dictionary), and `majmuo` (Set).

### Improvements

- Improved string concatenation performance.
- Better error messages for syntax violations.
- Added support for multi-line comments using `/* */`.

### Bug Fixes

- Fixed a memory leak in nested loops.
- Resolved an issue where `0.0` was incorrectly treated as truthy.
