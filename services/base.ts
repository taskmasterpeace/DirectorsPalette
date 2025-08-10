/**
 * Base service configuration and utilities
 */
"use server"

import { openai } from "@ai-sdk/openai"

export function assertAIEnv() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY. Please add the OpenAI integration or set the key in project settings.")
  }
}

export const AI_MODEL = openai("gpt-4o")

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