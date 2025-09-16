// Pipeline Prompt Parser
// Handles | pipe syntax for image-to-image chaining
// Builds on existing bracket [option1, option2] and wildcard _name_ systems

import { parseDynamicPrompt, type DynamicPromptResult } from './dynamic-prompting'
import type { WildCard } from './wildcards/types'

export interface PipelineStep {
  prompt: string
  stepNumber: number
  expandedPrompts?: string[] // If step uses brackets/wildcards
  hasVariations: boolean
}

export interface PipelineResult {
  isPipeline: boolean
  isValid: boolean
  originalPrompt: string
  steps: PipelineStep[]
  totalSteps: number
  estimatedImages: number // Total images that will be generated
  warnings: string[]
  errors: string[]
}

/**
 * Parse prompt for pipeline syntax (| operators)
 * Supports brackets and wildcards within each step
 * Example: "wizard in forest | isolate [character, person] | add _background_"
 */
export function parsePipelinePrompt(
  prompt: string,
  userWildCards: WildCard[] = []
): PipelineResult {
  // Check if prompt contains pipe operators
  const hasPipes = prompt.includes('|')

  if (!hasPipes) {
    // Not a pipeline - return single step result
    const dynamicResult = parseDynamicPrompt(prompt, {}, userWildCards)

    return {
      isPipeline: false,
      isValid: true,
      originalPrompt: prompt,
      steps: [{
        prompt: prompt.trim(),
        stepNumber: 1,
        expandedPrompts: dynamicResult.expandedPrompts,
        hasVariations: dynamicResult.hasBrackets || dynamicResult.hasWildCards
      }],
      totalSteps: 1,
      estimatedImages: dynamicResult.expandedPrompts.length,
      warnings: dynamicResult.warnings || [],
      errors: []
    }
  }

  // Parse pipeline steps
  const rawSteps = prompt.split('|').map(step => step.trim()).filter(step => step.length > 0)

  if (rawSteps.length < 2) {
    return {
      isPipeline: false,
      isValid: false,
      originalPrompt: prompt,
      steps: [],
      totalSteps: 0,
      estimatedImages: 0,
      warnings: [],
      errors: ['Pipeline must have at least 2 steps separated by |']
    }
  }

  // Process each step for brackets/wildcards
  const processedSteps: PipelineStep[] = []
  const warnings: string[] = []
  const errors: string[] = []
  let totalEstimatedImages = 0

  rawSteps.forEach((stepPrompt, index) => {
    if (stepPrompt.length === 0) {
      errors.push(`Step ${index + 1} is empty`)
      return
    }

    // Parse dynamic content for this step
    const stepResult = parseDynamicPrompt(stepPrompt, {}, userWildCards)

    // For pipeline steps, we only use the FIRST variation for chaining
    // But we show user how many variations this step could generate
    const step: PipelineStep = {
      prompt: stepPrompt,
      stepNumber: index + 1,
      expandedPrompts: stepResult.expandedPrompts,
      hasVariations: stepResult.hasBrackets || stepResult.hasWildCards
    }

    processedSteps.push(step)

    // Add warnings from step parsing
    if (stepResult.warnings) {
      warnings.push(...stepResult.warnings.map(w => `Step ${index + 1}: ${w}`))
    }

    // For pipeline chaining, each step generates 1 image (using first variation)
    // But warn user about unused variations
    if (step.hasVariations && stepResult.expandedPrompts.length > 1) {
      warnings.push(`Step ${index + 1} has ${stepResult.expandedPrompts.length} variations but only first will be used in pipeline`)
    }
  })

  // Pipeline generates 1 image per step (no multiplication)
  totalEstimatedImages = processedSteps.length

  // Additional validations
  if (processedSteps.length > 10) {
    warnings.push(`Long pipeline detected: ${processedSteps.length} steps may take significant time`)
  }

  if (processedSteps.length > 5) {
    warnings.push(`⚠️ ${processedSteps.length}-step pipeline will use ${totalEstimatedImages} credits`)
  }

  return {
    isPipeline: true,
    isValid: errors.length === 0,
    originalPrompt: prompt,
    steps: processedSteps,
    totalSteps: processedSteps.length,
    estimatedImages: totalEstimatedImages,
    warnings,
    errors
  }
}

/**
 * Calculate credit cost for pipeline
 */
export function calculatePipelineCost(
  pipelineResult: PipelineResult,
  creditsPerImage: number
): { totalCost: number; breakdown: Array<{step: number; cost: number; prompt: string}> } {
  if (!pipelineResult.isValid || !pipelineResult.isPipeline) {
    return { totalCost: 0, breakdown: [] }
  }

  const breakdown = pipelineResult.steps.map(step => ({
    step: step.stepNumber,
    cost: creditsPerImage, // Each step costs 1 image generation
    prompt: step.prompt
  }))

  const totalCost = breakdown.reduce((sum, item) => sum + item.cost, 0)

  return { totalCost, breakdown }
}

/**
 * Get the first prompt for each step (for actual execution)
 * Handles brackets/wildcards by taking the first variation
 */
export function getPipelineExecutionPrompts(pipelineResult: PipelineResult): string[] {
  if (!pipelineResult.isValid || !pipelineResult.isPipeline) {
    return []
  }

  return pipelineResult.steps.map(step => {
    // Use first expanded prompt if there are variations, otherwise use original
    return step.expandedPrompts && step.expandedPrompts.length > 0
      ? step.expandedPrompts[0]
      : step.prompt
  })
}

/**
 * Validate pipeline syntax in real-time
 */
export function validatePipelineSyntax(prompt: string): {
  isValid: boolean
  error?: string
  suggestion?: string
} {
  if (!prompt.includes('|')) {
    return { isValid: true }
  }

  const steps = prompt.split('|')

  // Check for empty steps
  const emptySteps = steps.findIndex(step => step.trim().length === 0)
  if (emptySteps !== -1) {
    return {
      isValid: false,
      error: `Empty step found at position ${emptySteps + 1}`,
      suggestion: 'Remove empty steps or add content between | operators'
    }
  }

  // Check for too many consecutive pipes
  if (prompt.includes('||')) {
    return {
      isValid: false,
      error: 'Double pipes (||) found',
      suggestion: 'Use single | to separate steps'
    }
  }

  // Check reasonable step count
  if (steps.length > 15) {
    return {
      isValid: false,
      error: `Too many steps: ${steps.length}`,
      suggestion: 'Consider breaking into smaller pipelines (max 10-15 steps recommended)'
    }
  }

  return { isValid: true }
}

/**
 * Get preview text for UI display
 */
export function getPipelinePreview(pipelineResult: PipelineResult): string {
  if (!pipelineResult.isPipeline) {
    return 'Single generation'
  }

  if (!pipelineResult.isValid) {
    return 'Invalid pipeline syntax'
  }

  const stepCount = pipelineResult.totalSteps
  const imageCount = pipelineResult.estimatedImages

  return `${stepCount}-step pipeline → ${imageCount} image${imageCount === 1 ? '' : 's'}`
}