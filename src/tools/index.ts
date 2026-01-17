/**
 * Tool registry for Ralph
 * Defines all tools available to the Claude agent
 */

import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import * as filesystem from './filesystem.ts'
import * as terminal from './terminal.ts'
import * as git from './git.ts'

// Re-export all tools
export { filesystem, terminal, git }

/**
 * Tool definitions for Claude Agent SDK
 */
export const toolDefinitions: Tool[] = [
  // Filesystem tools
  {
    name: 'read_file',
    description:
      'Read the contents of a file at the specified path. Use this to examine existing files.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description:
            'The path of the file to read (relative to working directory)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description:
      'Write content to a file at the specified path. Creates directories if needed. If the file exists, it will be overwritten.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description:
            'The path of the file to write (relative to working directory)',
        },
        content: {
          type: 'string',
          description: 'The content to write to the file',
        },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'list_files',
    description:
      'List files and directories in the specified directory. Use recursive=true to list all files recursively.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description:
            'The path of the directory to list (relative to working directory)',
        },
        recursive: {
          type: 'boolean',
          description: 'Whether to list files recursively (default: false)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'search_files',
    description:
      'Search for a pattern in files within a directory. Returns matching lines with file paths and line numbers.',
    input_schema: {
      type: 'object' as const,
      properties: {
        pattern: {
          type: 'string',
          description: 'The regex pattern to search for',
        },
        path: {
          type: 'string',
          description:
            'The directory to search in (relative to working directory)',
        },
      },
      required: ['pattern', 'path'],
    },
  },

  // Terminal tools
  {
    name: 'execute_command',
    description:
      'Execute a shell command. Use this for running scripts, installing packages, or any CLI operations.',
    input_schema: {
      type: 'object' as const,
      properties: {
        command: {
          type: 'string',
          description: 'The shell command to execute',
        },
      },
      required: ['command'],
    },
  },
  {
    name: 'run_tests',
    description:
      'Run the test suite. Automatically detects and uses the appropriate test runner (bun test, npm test, etc).',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'run_typecheck',
    description:
      'Run TypeScript type checking. Automatically detects and uses the appropriate type checker.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'run_lint',
    description:
      'Run the linter. Automatically detects and uses the appropriate linter (eslint, etc).',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  // Git tools
  {
    name: 'git_status',
    description:
      'Get the current git status showing changed, staged, and untracked files.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'git_commit',
    description:
      'Stage all changes and create a git commit with the specified message.',
    input_schema: {
      type: 'object' as const,
      properties: {
        message: {
          type: 'string',
          description: 'The commit message',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'git_diff',
    description: 'Get the diff of current changes (staged and unstaged).',
    input_schema: {
      type: 'object' as const,
      properties: {
        staged: {
          type: 'boolean',
          description:
            'If true, show only staged changes. If false, show unstaged changes.',
        },
      },
      required: [],
    },
  },
  {
    name: 'git_log',
    description: 'Get recent git commits.',
    input_schema: {
      type: 'object' as const,
      properties: {
        count: {
          type: 'number',
          description: 'Number of commits to show (default: 5)',
        },
      },
      required: [],
    },
  },
]

/**
 * Execute a tool by name
 */
export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  workingDir: string
): Promise<string> {
  try {
    switch (name) {
      // Filesystem tools
      case 'read_file': {
        const result = filesystem.readFile(input.path as string, workingDir)
        if (result.success) {
          // Include success indicator so display logic shows ✅ not ❌
          const content = result.content || ''
          return `[Read ${content.length} chars successfully]\n${content}`
        }
        return `Error: ${result.error}`
      }

      case 'write_file': {
        const result = filesystem.writeFile(
          input.path as string,
          input.content as string,
          workingDir
        )
        if (result.success) {
          return result.output || 'File written successfully'
        }
        return `Error: ${result.error}`
      }

      case 'list_files': {
        const result = filesystem.listFiles(
          input.path as string,
          workingDir,
          input.recursive as boolean
        )
        if (result.success && result.files) {
          return result.files.join('\n')
        }
        return `Error: ${result.error}`
      }

      case 'search_files': {
        const result = filesystem.searchFiles(
          input.pattern as string,
          input.path as string,
          workingDir
        )
        if (result.success && result.matches) {
          return result.matches
            .map((m) => `${m.file}:${m.line}: ${m.content}`)
            .join('\n')
        }
        return `Error: ${result.error}`
      }

      // Terminal tools
      case 'execute_command': {
        const result = await terminal.executeCommand(
          input.command as string,
          workingDir
        )
        if (result.success) {
          return result.stdout || result.output || 'Command completed'
        }
        return `Error (exit code ${result.exitCode}): ${
          result.stderr || result.error
        }`
      }

      case 'run_tests': {
        const result = await terminal.runTests(workingDir)
        if (result.success) {
          return result.stdout || result.output || 'Tests passed'
        }
        return `Tests failed: ${result.stderr || result.error}`
      }

      case 'run_typecheck': {
        const result = await terminal.runTypeCheck(workingDir)
        if (result.success) {
          return result.stdout || result.output || 'Type check passed'
        }
        return `Type check failed: ${result.stderr || result.error}`
      }

      case 'run_lint': {
        const result = await terminal.runLint(workingDir)
        if (result.success) {
          return result.stdout || result.output || 'Lint passed'
        }
        return `Lint failed: ${result.stderr || result.error}`
      }

      // Git tools
      case 'git_status': {
        const result = await git.getStatus(workingDir)
        if (result.success) {
          return result.stdout || 'No changes'
        }
        return `Error: ${result.error}`
      }

      case 'git_commit': {
        const result = await git.stageAndCommit(
          input.message as string,
          workingDir
        )
        if (result.success) {
          return result.output || `Committed: ${result.commitHash}`
        }
        return `Error: ${result.error}`
      }

      case 'git_diff': {
        const staged = input.staged as boolean
        const result = staged
          ? await git.getStagedDiff(workingDir)
          : await git.getUnstagedDiff(workingDir)
        if (result.success) {
          return result.stdout || 'No changes'
        }
        return `Error: ${result.error}`
      }

      case 'git_log': {
        const count = (input.count as number) || 5
        const result = await git.getRecentCommits(workingDir, count)
        if (result.success) {
          return result.stdout || 'No commits'
        }
        return `Error: ${result.error}`
      }

      default:
        return `Unknown tool: ${name}`
    }
  } catch (error) {
    return `Tool execution error: ${
      error instanceof Error ? error.message : String(error)
    }`
  }
}
