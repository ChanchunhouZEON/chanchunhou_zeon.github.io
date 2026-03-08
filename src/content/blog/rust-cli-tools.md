---
title: "Why I Write CLI Tools in Rust"
date: "2026-02-20"
excerpt: "Exploring the benefits of Rust for building fast, reliable command-line tools -- from zero-cost abstractions to fearless concurrency."
tags: ["Rust", "CLI", "Developer Tools"]
category: "dev-tools"
---

## The Case for Rust

Rust gives you the performance of C with the safety of a modern language. For CLI tools that developers use hundreds of times a day, those milliseconds matter.

## Key Libraries

- **clap** -- Argument parsing with derive macros
- **tokio** -- Async runtime for I/O-heavy operations
- **serde** -- Serialization that just works
- **colored** -- Terminal colors made easy

> [!INFO]
> The Rust ecosystem has matured significantly. Crates like `clap`, `serde`, and `tokio` are battle-tested and widely used in production.

## Distribution

With `cargo install` and cross-compilation via GitHub Actions, distributing Rust CLI tools is surprisingly simple. One workflow can produce binaries for Linux, macOS, and Windows.

> [!EXAMPLE] Cross-compilation Workflow
> Set up a GitHub Actions matrix with `ubuntu-latest`, `macos-latest`, and `windows-latest` targets. Use `cross` for easy cross-compilation without complex toolchain setup.

> [!WARNING]
> Be careful with platform-specific code paths. Always test on all target platforms in CI before releasing.
