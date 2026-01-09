#!/usr/bin/env bun
/**
 * Ralph - CLI Entry Point
 * Autonomous AI coding loop using Claude Agent SDK
 */

import type { RalphArgs } from './types.ts'
import { runRalph } from './ralph.ts'

const VERSION = '1.0.0'

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): RalphArgs {
  const result: RalphArgs = {
    iterations: 1,
    hitl: false,
    sandbox: false,
    help: false,
    version: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '-h':
      case '--help':
        result.help = true
        break

      case '-v':
      case '--version':
        result.version = true
        break

      case '--hitl':
        result.hitl = true
        break

      case '--sandbox':
        result.sandbox = true
        break

      case '-c':
      case '--config':
        result.configFile = args[++i]
        break

      case '-n':
      case '--iterations':
        result.iterations = parseInt(args[++i], 10)
        break

      default:
        // Check if it's a number (iterations)
        const num = parseInt(arg, 10)
        if (!isNaN(num) && num > 0) {
          result.iterations = num
        }
        break
    }
  }

  return result
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Ralph Wiggum - Autonomous AI Coding Loop

Usage: ralph [iterations] [options]

Arguments:
  iterations          Number of iterations to run (default: 1)

Options:
  -h, --help          Show this help message
  -v, --version       Show version number
  -n, --iterations N  Number of iterations to run
  --hitl              Human-in-the-loop mode (pause between iterations)
  --sandbox           Run in sandbox mode (limited permissions)
  -c, --config FILE   Path to config file (default: ralph.config.json)

Examples:
  ralph 5             Run 5 iterations
  ralph 10 --hitl     Run 10 iterations with HITL pauses
  ralph --config my.config.json

Configuration:
  Ralph looks for configuration in this order:
  1. Environment variables (ANTHROPIC_API_KEY, RALPH_MODEL, etc.)
  2. Config file (ralph.config.json)
  3. .env file

  Required:
    ANTHROPIC_API_KEY   Your Anthropic API key

  Optional:
    RALPH_MODEL         Model to use (default: claude-sonnet-4-20250514)
    RALPH_MAX_TOKENS    Max tokens per response (default: 8192)
    RALPH_WORKING_DIR   Working directory (default: current directory)
    RALPH_PRD_FILE      Path to PRD file (default: auto-detect)
    RALPH_PROGRESS_FILE Progress file path (default: progress.txt)
    RALPH_VERBOSE       Enable verbose logging (default: false)

PRD Files:
  Ralph looks for PRD files in this order:
  - plans/prd.json
  - prd.json
  - plans/prd.md
  - prd.md

For more information, visit: https://github.com/maxbaines/ralph
`)
}

/**
 * Print version
 */
function printVersion(): void {
  console.log(`Ralph Wiggum v${VERSION}`)
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  // Skip first two args (bun and script path)
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    printHelp()
    process.exit(0)
  }

  if (args.version) {
    printVersion()
    process.exit(0)
  }

  if (args.iterations < 1) {
    console.error('Error: iterations must be at least 1')
    process.exit(1)
  }

  if (args.sandbox) {
    console.log('Note: Sandbox mode is not yet implemented in the Bun version.')
    console.log(
      'For sandboxed execution, use Docker or the shell script version.'
    )
  }

  try {
    await runRalph(args)
  } catch (error) {
    console.error(
      'Fatal error:',
      error instanceof Error ? error.message : error
    )
    process.exit(1)
  }
}

// Run
main()
