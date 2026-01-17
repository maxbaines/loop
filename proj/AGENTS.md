# AGENTS.md

> Following the open AGENTS.md standard (https://agents.md)
> Compatible with OpenAI Codex, Google Jules, GitHub Copilot, Cursor, Amp, and more

## Project overview

<!-- Describe what this project is -->

This is a **[production/prototype/library]** project that [brief description].

## Setup commands

- Install deps: `[package manager install command]`
- Build: `[build command]`
- Run: `[run command]`
- Dev server: `[dev command if applicable]`

## Back pressure (required checks before commit)

<!-- These commands MUST pass before any commit -->
<!-- The agent will run these automatically using the `run_checks` tool -->

- Build: `[build command]`
- Typecheck: `[typecheck command]`
- Lint: `[lint command]`
- Test: `[test command]`
- Format check: `[format check command]` (optional)

### Language-Specific Examples

**TypeScript/JavaScript (Node.js):**

```
- Build: `npm run build` or `bun run build`
- Typecheck: `npx tsc --noEmit` or `bun run typecheck`
- Lint: `npm run lint` or `npx eslint .`
- Test: `npm test` or `bun test`
```

**Swift:**

```
- Build: `swift build`
- Typecheck: `swift build`
- Lint: `swiftlint`
- Test: `swift test`
```

**Rust:**

```
- Build: `cargo build`
- Typecheck: `cargo check`
- Lint: `cargo clippy`
- Test: `cargo test`
- Format check: `cargo fmt --check`
```

**Go:**

```
- Build: `go build ./...`
- Lint: `golangci-lint run`
- Test: `go test ./...`
- Format check: `gofmt -l .`
```

**Python:**

```
- Typecheck: `mypy .` or `pyright`
- Lint: `ruff check .` or `flake8`
- Test: `pytest`
- Format check: `ruff format --check .` or `black --check .`
```

## Testing instructions

- Run `[test command]` before committing
- All tests must pass before merge
- Add tests for new functionality
- [Any project-specific testing notes]

## Code style

- [Language-specific conventions]
- [Naming conventions]
- [Formatting rules]
- [Other style guidelines]

## Architecture

```
[Brief directory structure]
src/
├── ...
```

## What NOT to do

- Don't skip tests
- Don't commit with failing checks
- Don't add unnecessary dependencies
- Don't leave commented-out code
- Don't ignore type errors
- [Project-specific anti-patterns]

## Notes

<!-- Any additional context for the agent -->
