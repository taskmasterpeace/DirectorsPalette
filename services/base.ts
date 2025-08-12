/**
 * Base service configuration and utilities
 */

import { openai } from "@ai-sdk/openai"
// Commented out to fix fs module error - not currently used
// import { configService, ensureInitialized } from "@/config/config-service"

export function assertAIEnv() {
  console.log('Checking OPENAI_API_KEY...')
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
  console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0)
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY. Please add the OpenAI integration or set the key in project settings.")
  }
}

/**
 * Get AI model configuration with environment-based overrides
 */
export function getAIConfig() {
  const model = process.env.OPENAI_MODEL || "gpt-4o"
  const maxTokens = process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : 4000
  const temperature = process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.7
  
  return {
    model: openai(model),
    maxTokens,
    temperature,
  }
}

export const AI_MODEL = openai("gpt-4o") // Fallback for backwards compatibility

export const AI_CONFIG = {
  model: AI_MODEL,
  maxTokens: 4000,
  temperature: 0.7,
}

export class ServiceError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message)
    this.name = 'ServiceError'
  }
}

/**
 * Get a configured prompt template
 */
export async function getPrompt(category: string, key: string, variables?: Record<string, string>): Promise<string> {
  await ensureInitialized()
  
  if (variables) {
    return configService.getFilledPrompt(category, key, variables)
  } else {
    return configService.getPrompt(category, key) || ''
  }
}