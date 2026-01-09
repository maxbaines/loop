/**
 * PRD Generator for Little Wiggy
 * Uses Claude to generate structured PRD files from natural language descriptions
 */

import Anthropic from '@anthropic-ai/sdk'
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import type { PrdJson, PrdItem, RalphConfig } from './types.ts'
import { savePrd } from './prd.ts'

/**
 * System prompt for PRD generation
 * Based on Matt Pocock's Ralph Wiggum article recommendations
 */
const PRD_GENERATION_PROMPT = `You are a PRD (Product Requirements Document) generator for an autonomous AI coding agent.

Your job is to take a natural language description of what needs to be built and create a structured PRD that the agent can work through.

## PRD Format

Generate a JSON PRD with this structure:
{
  "name": "Project Name",
  "description": "Brief description of the project",
  "items": [
    {
      "id": "1",
      "category": "setup|architecture|functional|testing|documentation|polish",
      "description": "Clear, actionable task description",
      "steps": [
        "Specific acceptance criteria 1",
        "Specific acceptance criteria 2"
      ],
      "priority": "high|medium|low",
      "passes": false
    }
  ]
}

## Guidelines (from Matt Pocock's Ralph Wiggum methodology)

1. **Prioritize by type:**
   - HIGH: Architecture, core abstractions, integration points
   - MEDIUM: Standard features, implementation
   - LOW: Polish, documentation, cleanup

2. **Be specific about scope:**
   - Define exactly what "done" looks like
   - Include acceptance criteria (steps) for each task
   - Don't leave room for shortcuts

3. **Keep tasks atomic:**
   - Each task should be completable in one iteration
   - If a task is too large, break it into subtasks
   - One logical change per task

4. **Categories:**
   - setup: Project initialization, dependencies, configuration
   - architecture: Core abstractions, patterns, structure
   - functional: Features, business logic
   - testing: Tests, coverage
   - documentation: README, comments, docs
   - polish: Cleanup, refactoring, optimization

5. **Acceptance criteria (steps):**
   - Be specific and verifiable
   - Include edge cases
   - Think about what could go wrong

## Output

Return ONLY valid JSON. No markdown, no explanation, just the PRD JSON object.`

/**
 * Generate a PRD from a natural language description
 */
export async function generatePrd(
  description: string,
  config: RalphConfig,
  options: {
    analyzeCodebase?: boolean
    existingFiles?: string[]
  } = {}
): Promise<PrdJson> {
  const client = new Anthropic({
    apiKey: config.apiKey,
    timeout: 5 * 60 * 1000, // 5 minutes
  })

  // Build context
  let context = `## Project Description\n${description}\n\n`

  if (options.analyzeCodebase && options.existingFiles) {
    context += `## Existing Files\n${options.existingFiles.join('\n')}\n\n`
  }

  const response = await client.messages.create({
    model: config.model,
    max_tokens: 4096,
    system: PRD_GENERATION_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate a PRD for the following project:\n\n${context}`,
      },
    ],
  })

  // Extract JSON from response
  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  const jsonText = textContent.text.trim()

  try {
    const prd = JSON.parse(jsonText) as PrdJson
    return normalizePrd(prd)
  } catch {
    // Try to extract JSON from markdown code block
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      const prd = JSON.parse(jsonMatch[1].trim()) as PrdJson
      return normalizePrd(prd)
    }
    throw new Error(
      `Failed to parse PRD JSON: ${jsonText.substring(0, 200)}...`
    )
  }
}

/**
 * Normalize PRD to ensure all fields exist
 */
function normalizePrd(prd: Partial<PrdJson>): PrdJson {
  return {
    name: prd.name || 'PRD',
    description: prd.description,
    items: (prd.items || []).map((item, index) => ({
      id: item.id || String(index + 1),
      category: item.category || 'functional',
      description: item.description || '',
      steps: item.steps || [],
      priority: item.priority || 'medium',
      passes: item.passes || false,
    })),
  }
}

/**
 * Analyze codebase to get context for PRD generation
 */
export function analyzeCodebase(workingDir: string): string[] {
  const files: string[] = []
  const ignoreDirs = ['node_modules', '.git', 'dist', '.build', 'coverage']
  const ignoreFiles = ['.DS_Store', 'bun.lockb', 'package-lock.json']

  function walkDir(dir: string, prefix: string = '') {
    try {
      const entries = readdirSync(dir)
      for (const entry of entries) {
        if (ignoreDirs.includes(entry) || ignoreFiles.includes(entry)) continue
        if (entry.startsWith('.') && entry !== '.env.example') continue

        const fullPath = join(dir, entry)
        const relativePath = prefix ? `${prefix}/${entry}` : entry

        try {
          const stat = statSync(fullPath)
          if (stat.isDirectory()) {
            files.push(`${relativePath}/`)
            walkDir(fullPath, relativePath)
          } else {
            files.push(relativePath)
          }
        } catch {
          // Skip files we can't stat
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  walkDir(workingDir)
  return files
}

/**
 * Read README or other documentation for context
 */
export function readProjectDocs(workingDir: string): string | null {
  const docFiles = [
    'README.md',
    'readme.md',
    'README',
    'SPEC.md',
    'REQUIREMENTS.md',
  ]

  for (const file of docFiles) {
    const path = join(workingDir, file)
    if (existsSync(path)) {
      try {
        return readFileSync(path, 'utf-8')
      } catch {
        continue
      }
    }
  }

  return null
}

/**
 * Interactive PRD refinement
 */
export async function refinePrd(
  prd: PrdJson,
  feedback: string,
  config: RalphConfig
): Promise<PrdJson> {
  const client = new Anthropic({
    apiKey: config.apiKey,
    timeout: 5 * 60 * 1000,
  })

  const response = await client.messages.create({
    model: config.model,
    max_tokens: 4096,
    system: PRD_GENERATION_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Here is an existing PRD:\n\n${JSON.stringify(
          prd,
          null,
          2
        )}\n\nPlease refine it based on this feedback:\n${feedback}\n\nReturn the updated PRD as JSON.`,
      },
    ],
  })

  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  const jsonText = textContent.text.trim()

  try {
    return normalizePrd(JSON.parse(jsonText))
  } catch {
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      return normalizePrd(JSON.parse(jsonMatch[1].trim()))
    }
    throw new Error('Failed to parse refined PRD')
  }
}

/**
 * Generate and save PRD to file
 */
export async function generateAndSavePrd(
  description: string,
  config: RalphConfig,
  outputPath: string,
  options: {
    analyzeCodebase?: boolean
    verbose?: boolean
  } = {}
): Promise<PrdJson> {
  if (options.verbose) {
    console.log('🔍 Analyzing project...')
  }

  const existingFiles = options.analyzeCodebase
    ? analyzeCodebase(config.workingDir)
    : undefined

  if (options.verbose && existingFiles) {
    console.log(`   Found ${existingFiles.length} files`)
  }

  if (options.verbose) {
    console.log('🤖 Generating PRD...')
  }

  const prd = await generatePrd(description, config, {
    analyzeCodebase: options.analyzeCodebase,
    existingFiles,
  })

  if (options.verbose) {
    console.log(`   Generated ${prd.items.length} tasks`)
  }

  savePrd(outputPath, prd)

  if (options.verbose) {
    console.log(`✅ PRD saved to ${outputPath}`)
  }

  return prd
}
