# Little Wiggy (# Ralph Wiggum Bun Version)🤖

> "Me fail English? That's unpossible!" - Ralph Wiggum

**Little Wiggy** is an autonomous AI coding loop built with TypeScript and Bun, using the Claude Agent SDK directly. It compiles to a single executable for Mac, Windows, and Linux.

Named after Ralph Wiggum - because like Ralph, it just keeps going until the job is done (or it gets distracted by paste). This Little Wiggy (S9E18) Imaginary leprechaun tells him to "burn things" (no food).

## Features

- **Single executable** - Bun compiles to native binaries
- **Cross-platform** - Mac, Windows, Linux from one codebase
- **No Claude Code dependency** - Direct API access via Claude Agent SDK
- **Full tool support** - File operations, terminal commands, git
- **PRD support** - JSON and Markdown formats
- **Progress tracking** - Maintains state between iterations

## Quick Start

```bash
# Install dependencies
bun install

# Run with help
bun run src/index.ts --help

# Run a single iteration
bun run src/index.ts 1

# Run 5 iterations with HITL mode
bun run src/index.ts 5 --hitl
```

## Configuration

Ralph looks for configuration in this order:

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

## Building Executables

```bash
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

## Usage

```bash
# Run with iterations
./ralph 5

# HITL mode (pause between iterations)
./ralph 10 --hitl

# Custom config file
./ralph 5 --config my.config.json

# Show help
./ralph --help

# Show version
./ralph --version
```

## PRD Files

Ralph supports two PRD formats:

### JSON Format

```json
{
  "name": "My Feature",
  "items": [
    {
      "id": "1",
      "category": "architecture",
      "description": "Set up database schema",
      "steps": ["Create migrations", "Add indexes"],
      "priority": "high",
      "passes": false
    }
  ]
}
```

### Markdown Format

```markdown
## Tasks

### High Priority

- [ ] **Set up database schema**
  - Create migrations
  - Add indexes
```

## Tools Available

Ralph has access to these tools:

| Tool              | Description                  |
| ----------------- | ---------------------------- |
| `read_file`       | Read file contents           |
| `write_file`      | Write/create files           |
| `list_files`      | List directory contents      |
| `search_files`    | Search for patterns in files |
| `execute_command` | Run shell commands           |
| `run_tests`       | Run test suite               |
| `run_typecheck`   | Run type checking            |
| `run_lint`        | Run linter                   |
| `git_status`      | Get git status               |
| `git_commit`      | Stage and commit changes     |
| `git_diff`        | Get diff of changes          |
| `git_log`         | Get recent commits           |

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
bun/
├── src/
│   ├── index.ts          # CLI entry point
│   ├── ralph.ts          # Main loop logic
│   ├── agent.ts          # Claude Agent SDK wrapper
│   ├── config.ts         # Configuration loading
│   ├── prd.ts            # PRD file parsing
│   ├── progress.ts       # Progress tracking
│   ├── types.ts          # TypeScript types
│   └── tools/
│       ├── index.ts      # Tool registry
│       ├── filesystem.ts # File operations
│       ├── terminal.ts   # Command execution
│       └── git.ts        # Git operations
├── package.json
├── tsconfig.json
└── .env.example
```

## License

MIT
