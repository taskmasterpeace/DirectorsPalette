/**
 * Base service configuration and utilities
 */

import { openai } from "@ai-sdk/openai"
import { configService, ensureInitialized } from "@/config/config-service"

export function assertAIEnv() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY. Please add the OpenAI integration or set the key in project settings.")
  }
}

/**
 * Get AI model configuration from config service
 */
export async function getAIConfig() {
  await ensureInitialized()
  const aiConfig = configService.getAIConfig()
  return {
    model: openai(aiConfig.model),
    maxTokens: aiConfig.maxTokens,
    temperature: aiConfig.temperature,
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