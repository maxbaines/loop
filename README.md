# Loop (A version of Ralph Wiggum by Geoffrey Huntley)

> "Me fail English? That's unpossible!" - Ralph Wiggum

**Loop** is an autonomous AI coding loop built with TypeScript and Bun, using the Claude Agent SDK directly. It compiles to a single executable for Mac, Windows, and Linux.

Named after Ralph Wiggum - because like Ralph, it just keeps going until the job is done.

## Quick Start

```bash
# Download the binary for your platform from releases, or build from source
# Then run with a task:

# Generate a PRD from a description
loop init "Build a CLI todo app with add, list, complete commands"

# Run iterations to implement the PRD
loop 5 --hitl
```

## Usage

```bash
# Run with iterations
./loop 5

# HITL mode (pause between iterations for human review)
./loop 10 --hitl

# Custom config file
./loop 5 --config my.config.json

# Show help
./loop --help

# Show version
./loop --version
```

## Configuration

Loop looks for configuration in this order:

1. **Environment variables** (highest priority)
2. **Config file** (`ralph.config.json`)
3. **.env file**

### Required

```bash
ANTHROPIC_API_KEY=your-api-key-here
```

### Optional

```bash
RALPH_MODEL=claude-sonnet-4-20250514
RALPH_MAX_TOKENS=8192
RALPH_WORKING_DIR=.
RALPH_PRD_FILE=plans/prd.json
RALPH_PROGRESS_FILE=progress.txt
RALPH_VERBOSE=false
```

### Config File

Create `ralph.config.json`:

```json
{
  "apiKey": "your-api-key",
  "model": "claude-sonnet-4-20250514",
  "maxTokens": 8192,
  "workingDir": ".",
  "progressFile": "progress.txt",
  "verbose": false
}
```

## PRD Generator

Loop can generate structured PRDs from natural language descriptions using Claude:

```bash
# Basic PRD generation
loop init "Build a REST API for user authentication"

# Analyze existing codebase for context
loop init "Add tests for all endpoints" --analyze

# Output as Markdown
loop init "Create a dashboard UI" --markdown

# Custom output file
loop init "Refactor database layer" --output plans/db-refactor.json
```

The generator follows Matt Pocock's Loop Wiggum methodology:

- **Prioritizes by type**: Architecture first, polish last
- **Atomic tasks**: Each task completable in one iteration
- **Acceptance criteria**: Specific, verifiable steps
- **Explicit scope**: No room for shortcuts

## AGENTS.md & Back Pressure

Loop follows the [AGENTS.md standard](https://agents.md) for AI agent configuration. When you run `loop init`, it automatically generates an `AGENTS.md` file for your project.

### Back Pressure System (WIP)

Loop reads your `AGENTS.md` file to determine which checks to run before committing changes:

```markdown
## Back pressure

- Build: `swift build`
- Typecheck: `bun run typecheck`
- Lint: `bun run lint`
- Test: `bun test`
```

These checks are automatically run to ensure code quality. If no `AGENTS.md` is found, Loop falls back to auto-detecting common check commands (typecheck, lint, test).

## PRD Files

Loop PRD Markdown format:

```markdown
## Tasks

### High Priority

- [ ] **Set up database schema**
  - Create migrations
  - Add indexes
```

## Tools Available

Loop has access to these tools:

| Tool              | Description                            |
| ----------------- | -------------------------------------- |
| `read_file`       | Read file contents                     |
| `write_file`      | Write/create files                     |
| `list_files`      | List directory contents                |
| `search_files`    | Search for patterns in files           |
| `execute_command` | Run shell commands                     |
| `run_tests`       | Run test suite                         |
| `run_typecheck`   | Run type checking                      |
| `run_lint`        | Run linter                             |
| `run_checks`      | Run all AGENTS.md back pressure checks |
| `git_status`      | Get git status                         |
| `git_commit`      | Stage and commit changes               |
| `git_diff`        | Get diff of changes                    |
| `git_log`         | Get recent commits                     |

## Features

- **Single executable** - Bun compiles to native binaries
- **Cross-platform** - Mac, Windows, Linux from one codebase
- **No Claude Code dependency** - Direct API access via Claude Agent SDK
- **Full tool support** - File operations, terminal commands, git
- **AGENTS.md support** - Follows the open standard for AI agent configuration
- **Back pressure** - Automatic quality checks before commits
- **PRD support** - JSON and Markdown formats
- **Progress tracking** - Maintains state between iterations

## Building from Source

```bash
# Install dependencies
bun install

# Build for current platform
bun run build

# Build for all platforms
bun run build:all

# Individual platforms
bun run build:mac      # macOS ARM64
bun run build:mac-x64  # macOS x64
bun run build:linux    # Linux x64
bun run build:windows  # Windows x64
```

Executables are output to `dist/`.

## Development

```bash
# Run in development
bun run dev

# Type check
bun run typecheck

# Run tests
bun test
```

## Project Structure

```
loop/
├── src/
│   ├── index.ts          # CLI entry point
│   ├── ralph.ts          # Main loop logic
│   ├── agent.ts          # Claude Agent SDK wrapper
│   ├── backpressure.ts   # AGENTS.md back pressure system
│   ├── config.ts         # Configuration loading
│   ├── generate.ts       # PRD generator (AI-powered)
│   ├── output.ts         # Centralized output formatting
│   ├── prd.ts            # PRD file parsing
│   ├── progress.ts       # Progress tracking
│   ├── types.ts          # TypeScript types
│   └── tools/
│       ├── index.ts      # Tool registry
│       ├── filesystem.ts # File operations
│       ├── terminal.ts   # Command execution
│       └── git.ts        # Git operations
├── example/              # Example project
├── package.json
├── tsconfig.json
└── .env.example
```

## License

MIT
