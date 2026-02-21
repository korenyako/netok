# Contributing to Netok

Thanks for your interest in contributing to Netok! This project aims to make network diagnostics accessible to everyone by translating technical information into human language.

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Windows 10/11 (currently the only supported platform)

### Setup

```bash
git clone https://github.com/korenyako/netok.git
cd netok
npm install
cd ui && npm install && cd ..
cargo tauri dev
```

## How to Contribute

### Good First Contributions

- **Translations** — improve or add languages in the `ui/src/i18n` folder. Netok supports 14 languages and we'd love to make them better.
- **Bug reports** — if something doesn't work as expected, open an issue.
- **Documentation** — fix typos, improve clarity, add examples.

### Bigger Contributions

Check out issues labeled [`good first issue`](../../labels/good%20first%20issue) and [`help wanted`](../../labels/help%20wanted) for tasks that are ready to be picked up.

If you want to work on something not listed, please open an issue first to discuss the approach. This saves everyone's time.

### Areas Where Help Is Especially Welcome

- **macOS support** — we currently don't have a Mac to develop and test on
- **Error scenarios** — human-readable explanations for common network problems
- **Testing** — expanding test coverage, especially edge cases

## Project Structure

```
netok/
├── netok_core/       # Rust core library — network diagnostics logic
├── netok_bridge/     # Tauri bridge between Rust and UI
├── netok_desktop/    # Tauri desktop app shell (Rust + Tauri config)
├── ui/               # React + TypeScript frontend (Vite, Tailwind, ESLint)
├── expo-app/         # Mobile app (experimental)
├── scripts/          # Utility scripts (project map generator, OUI database)
└── docs/             # Documentation
```

## Development Guidelines

### Code Style

- **Rust**: follow standard `cargo fmt` and `cargo clippy` conventions
- **TypeScript/React**: use the existing ESLint config (`ui/eslint.config.js`)
- Run `cargo test` and `cd ui && npm run test:run` before submitting a PR

### Commits

We use conventional commits:

```
feat: add WiFi channel detection
fix: handle missing SSID gracefully
docs: update setup instructions
chore: bump dependencies
```

### Pull Requests

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Make sure tests pass (`cargo test` and `cd ui && npm run test:run`)
4. Open a PR with a clear description of what and why

## Philosophy

Netok's core principle is **machines should speak human language**. When contributing, ask yourself: "Would a non-technical person understand this?" If the answer is no — let's find a way to make it clearer.

## Questions?

Open an issue or start a discussion. There are no stupid questions.

## License

By contributing, you agree that your contributions will be licensed under the [GPL-3.0 License](LICENSE).