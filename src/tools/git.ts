/**
 * Git tools for Ralph
 * Provides git operations using child_process directly
 * (No longer depends on terminal.ts)
 */

import { spawn } from 'child_process'
import type { GitResult, CommandResult } from '../types.ts'

/**
 * Execute a shell command (internal helper)
 */
async function executeCommand(
  command: string,
  workingDir: string,
  timeout: number = 60000,
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
 * Check if directory is a git repository
 */
export async function isGitRepo(workingDir: string): Promise<boolean> {
  const result = await executeCommand('git rev-parse --git-dir', workingDir)
  return result.success
}

/**
 * Get current branch name
 */
export async function getCurrentBranch(workingDir: string): Promise<GitResult> {
  const result = await executeCommand(
    'git rev-parse --abbrev-ref HEAD',
    workingDir,
  )

  if (result.success) {
    return {
      success: true,
      branch: result.stdout?.trim(),
      output: `Current branch: ${result.stdout?.trim()}`,
    }
  }

  return {
    success: false,
    error: result.error || 'Failed to get current branch',
  }
}

/**
 * Get git status
 */
export async function getStatus(workingDir: string): Promise<CommandResult> {
  return executeCommand('git status --porcelain', workingDir)
}

/**
 * Stage files for commit
 */
export async function stageFiles(
  files: string | string[],
  workingDir: string,
): Promise<CommandResult> {
  const fileList = Array.isArray(files) ? files.join(' ') : files
  return executeCommand(`git add ${fileList}`, workingDir)
}

/**
 * Stage all changes
 */
export async function stageAll(workingDir: string): Promise<CommandResult> {
  return executeCommand('git add -A', workingDir)
}

/**
 * Create a commit
 */
export async function commit(
  message: string,
  workingDir: string,
): Promise<GitResult> {
  // Escape quotes in message
  const escapedMessage = message.replace(/"/g, '\\"')
  const result = await executeCommand(
    `git commit -m "${escapedMessage}"`,
    workingDir,
  )

  if (result.success) {
    // Get the commit hash
    const hashResult = await executeCommand(
      'git rev-parse --short HEAD',
      workingDir,
    )
    return {
      success: true,
      commitHash: hashResult.stdout?.trim(),
      output: `Committed: ${hashResult.stdout?.trim()}`,
    }
  }

  return {
    success: false,
    error: result.error || result.stderr || 'Failed to commit',
  }
}

/**
 * Stage all and commit
 */
export async function stageAndCommit(
  message: string,
  workingDir: string,
): Promise<GitResult> {
  const stageResult = await stageAll(workingDir)
  if (!stageResult.success) {
    return {
      success: false,
      error: `Failed to stage files: ${stageResult.error}`,
    }
  }

  // Check if there are changes to commit
  const statusResult = await getStatus(workingDir)
  if (!statusResult.stdout?.trim()) {
    return {
      success: true,
      output: 'No changes to commit',
    }
  }

  return commit(message, workingDir)
}

/**
 * Get recent commits
 */
export async function getRecentCommits(
  workingDir: string,
  count: number = 5,
): Promise<CommandResult> {
  return executeCommand(`git log --oneline -n ${count}`, workingDir)
}

/**
 * Get diff of staged changes
 */
export async function getStagedDiff(
  workingDir: string,
): Promise<CommandResult> {
  return executeCommand('git diff --cached', workingDir)
}

/**
 * Get diff of unstaged changes
 */
export async function getUnstagedDiff(
  workingDir: string,
): Promise<CommandResult> {
  return executeCommand('git diff', workingDir)
}

/**
 * Create a new branch
 */
export async function createBranch(
  branchName: string,
  workingDir: string,
): Promise<CommandResult> {
  return executeCommand(`git checkout -b ${branchName}`, workingDir)
}

/**
 * Switch to a branch
 */
export async function switchBranch(
  branchName: string,
  workingDir: string,
): Promise<CommandResult> {
  return executeCommand(`git checkout ${branchName}`, workingDir)
}

/**
 * Pull latest changes
 */
export async function pull(workingDir: string): Promise<CommandResult> {
  return executeCommand('git pull', workingDir)
}

/**
 * Push changes
 */
export async function push(workingDir: string): Promise<CommandResult> {
  return executeCommand('git push', workingDir)
}
