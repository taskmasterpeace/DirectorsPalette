/**
 * Director service for generating custom director style details
 */
"use server"

import { generateObject } from "ai"
import { z } from "zod"
import { assertAIEnv, getAIConfig, getPrompt, ServiceError } from "./base"
import { validateServerInput } from "@/lib/validation/validator"
import { CustomDirectorSchema } from "@/lib/validation/schemas"

const DirectorStyleSchema = z.object({
  visualHallmarks: z.string().describe("Key visual hallmarks as a sentence or short paragraph."),
  narrativeStyle: z.string().describe("Narrative approach and storytelling preferences."),
  pacingAndEnergy: z.string().default("Moderate").describe("Typical pacing and energy."),
  genres: z.string().default("Drama, Thriller").describe("Comma-separated genres this style pairs well with."),
})

export type DirectorStyle = z.infer<typeof DirectorStyleSchema>

export class DirectorService {
  /**
   * Generate style details for a custom director
   */
  static async generateStyleDetails(name: string, description: string): Promise<DirectorStyle> {
    try {
      assertAIEnv()
      
      // Validate and sanitize input
      const validatedInput = validateServerInput(
        CustomDirectorSchema,
        { name, description },
        { sanitize: true, moderate: true, rateLimit: { key: 'director-generation', limit: 5, windowMs: 600000 } }
      )
      
      const aiConfig = await getAIConfig()
      const systemPrompt = await getPrompt('director-prompts', 'systemPrompts.styleGeneration')
      const promptTemplate = await getPrompt('director-prompts', 'styleGenerationPrompt', {
        name: validatedInput.name,
        description: validatedInput.description
      })
      
      const { object } = await generateObject({
        model: aiConfig.model,
        schema: DirectorStyleSchema,
        system: systemPrompt,
        prompt: promptTemplate,
        maxTokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
      })
      
      return object
    } catch (error) {
      throw new ServiceError(
        `Failed to generate director style details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DIRECTOR_GENERATION_FAILED',
        { name, description }
      )
    }
  }
}