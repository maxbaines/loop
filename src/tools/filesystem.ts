/**
 * Filesystem tools for Ralph
 * Provides file read/write/list capabilities
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'fs'
import { dirname, join, relative } from 'path'
import type { FileReadResult, FileWriteResult, ToolResult } from '../types.ts'

/**
 * Read a file's contents
 */
export function readFile(path: string, workingDir: string): FileReadResult {
  try {
    const fullPath = join(workingDir, path)

    if (!existsSync(fullPath)) {
      return {
        success: false,
        error: `File not found: ${path}`,
      }
    }

    const content = readFileSync(fullPath, 'utf-8')
    return {
      success: true,
      content,
      output: `Read ${content.length} characters from ${path}`,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to read file: ${
        error instanceof Error ? error.message : String(error)
      }`,
    }
  }
}

/**
 * Write content to a file (creates directories if needed)
 */
export function writeFile(
  path: string,
  content: string,
  workingDir: string
): FileWriteResult {
  try {
    const fullPath = join(workingDir, path)
    const dir = dirname(fullPath)

    // Create directory if it doesn't exist
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    writeFileSync(fullPath, content, 'utf-8')
    return {
      success: true,
      path: fullPath,
      output: `Wrote ${content.length} characters to ${path}`,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to write file: ${
        error instanceof Error ? error.message : String(error)
      }`,
    }
  }
}

/**
 * List files in a directory
 */
export function listFiles(
  path: string,
  workingDir: string,
  recursive: boolean = false
): ToolResult & { files?: string[] } {
  try {
    const fullPath = join(workingDir, path)

    if (!existsSync(fullPath)) {
      return {
        success: false,
        error: `Directory not found: ${path}`,
      }
    }

    const files: string[] = []

    function walkDir(dir: string) {
      const entries = readdirSync(dir)
      for (const entry of entries) {
        // Skip hidden files and common ignore patterns
        if (
          entry.startsWith('.') ||
          entry === 'node_modules' ||
          entry === 'dist'
        ) {
          continue
        }

        const entryPath = join(dir, entry)
        const relativePath = relative(fullPath, entryPath)
        const stat = statSync(entryPath)

        if (stat.isDirectory()) {
          files.push(relativePath + '/')
          if (recursive) {
            walkDir(entryPath)
          }
        } else {
          files.push(relativePath)
        }
      }
    }

    walkDir(fullPath)

    return {
      success: true,
      files,
      output: `Found ${files.length} files/directories in ${path}`,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to list files: ${
        error instanceof Error ? error.message : String(error)
      }`,
    }
  }
}

/**
 * Check if a file or directory exists
 */
export function fileExists(
  path: string,
  workingDir: string
): ToolResult & { exists?: boolean } {
  try {
    const fullPath = join(workingDir, path)
    const exists = existsSync(fullPath)
    return {
      success: true,
      exists,
      output: exists ? `${path} exists` : `${path} does not exist`,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to check file: ${
        error instanceof Error ? error.message : String(error)
      }`,
    }
  }
}

/**
 * Search for text in files (simple grep-like)
 */
export function searchFiles(
  pattern: string,
  path: string,
  workingDir: string
): ToolResult & {
  matches?: Array<{ file: string; line: number; content: string }>
} {
  try {
    const fullPath = join(workingDir, path)
    const matches: Array<{ file: string; line: number; content: string }> = []
    const regex = new RegExp(pattern, 'gi')

    function searchDir(dir: string) {
      const entries = readdirSync(dir)
      for (const entry of entries) {
        if (
          entry.startsWith('.') ||
          entry === 'node_modules' ||
          entry === 'dist'
        ) {
          continue
        }

        const entryPath = join(dir, entry)
        const stat = statSync(entryPath)

        if (stat.isDirectory()) {
          searchDir(entryPath)
        } else if (stat.isFile()) {
          try {
            const content = readFileSync(entryPath, 'utf-8')
            const lines = content.split('\n')
            lines.forEach((line, index) => {
              if (regex.test(line)) {
                matches.push({
                  file: relative(fullPath, entryPath),
                  line: index + 1,
                  content: line.trim(),
                })
              }
            })
          } catch {
            // Skip binary files or files we can't read
          }
        }
      }
    }

    searchDir(fullPath)

    return {
      success: true,
      matches,
      output: `Found ${matches.length} matches for "${pattern}"`,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to search files: ${
        error instanceof Error ? error.message : String(error)
      }`,
    }
  }
}
