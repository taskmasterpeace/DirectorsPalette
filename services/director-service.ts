/**
 * Director service for generating custom director style details
 */
"use server"

import { generateObject } from "ai"
import { z } from "zod"
import { assertAIEnv, AI_MODEL, ServiceError } from "./base"

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
      
      const { object } = await generateObject({
        model: AI_MODEL,
        schema: DirectorStyleSchema,
        system: "You are a seasoned film scholar distilling a director concept into practical style attributes for production.",
        prompt: `DIRECTOR NAME: ${name}
DIRECTOR DESCRIPTION: ${description}

Return concise, production-ready attributes.`,
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