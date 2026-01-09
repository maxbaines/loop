/**
 * Terminal tools for Ralph
 * Provides command execution capabilities
 */

import { spawn } from 'child_process'
import type { CommandResult } from '../types.ts'

/**
 * Execute a shell command
 */
export async function executeCommand(
  command: string,
  workingDir: string,
  timeout: number = 60000
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const startTime = Date.now()

    // Use shell to execute the command
    const child = spawn(command, {
      shell: true,
      cwd: workingDir,
      env: process.env,
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    // Set timeout
    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM')
      resolve({
        success: false,
        error: `Command timed out after ${timeout}ms`,
        stdout,
        stderr,
        exitCode: -1,
      })
    }, timeout)

    child.on('close', (code) => {
      clearTimeout(timeoutId)
      const duration = Date.now() - startTime

      if (code === 0) {
        resolve({
          success: true,
          output: `Command completed in ${duration}ms`,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code,
        })
      } else {
        resolve({
          success: false,
          error: `Command exited with code ${code}`,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code ?? -1,
        })
      }
    })

    child.on('error', (error) => {
      clearTimeout(timeoutId)
      resolve({
        success: false,
        error: `Failed to execute command: ${error.message}`,
        exitCode: -1,
      })
    })
  })
}

/**
 * Run npm/pnpm/bun script
 */
export async function runScript(
  script: string,
  workingDir: string,
  packageManager: 'npm' | 'pnpm' | 'bun' = 'bun'
): Promise<CommandResult> {
  const command = `${packageManager} run ${script}`
  return executeCommand(command, workingDir, 120000) // 2 minute timeout for scripts
}

/**
 * Run type checking
 */
export async function runTypeCheck(workingDir: string): Promise<CommandResult> {
  // Try different type check commands
  const commands = [
    'bun run typecheck',
    'pnpm typecheck',
    'npm run typecheck',
    'npx tsc --noEmit',
  ]

  for (const cmd of commands) {
    const result = await executeCommand(cmd, workingDir, 120000)
    if (result.success || result.exitCode !== 127) {
      // 127 = command not found
      return result
    }
  }

  return {
    success: true,
    output: 'No type checking configured',
  }
}

/**
 * Run tests
 */
export async function runTests(workingDir: string): Promise<CommandResult> {
  const commands = ['bun test', 'pnpm test', 'npm test']

  for (const cmd of commands) {
    const result = await executeCommand(cmd, workingDir, 300000) // 5 minute timeout
    if (result.success || result.exitCode !== 127) {
      return result
    }
  }

  return {
    success: true,
    output: 'No tests configured',
  }
}

/**
 * Run linting
 */
export async function runLint(workingDir: string): Promise<CommandResult> {
  const commands = ['bun run lint', 'pnpm lint', 'npm run lint', 'npx eslint .']

  for (const cmd of commands) {
    const result = await executeCommand(cmd, workingDir, 120000)
    if (result.success || result.exitCode !== 127) {
      return result
    }
  }

  return {
    success: true,
    output: 'No linting configured',
  }
}

/**
 * Run all feedback loops (types, tests, lint)
 */
export async function runFeedbackLoops(
  workingDir: string
): Promise<{
  typeCheck: CommandResult
  tests: CommandResult
  lint: CommandResult
}> {
  const [typeCheck, tests, lint] = await Promise.all([
    runTypeCheck(workingDir),
    runTests(workingDir),
    runLint(workingDir),
  ])

  return { typeCheck, tests, lint }
}
