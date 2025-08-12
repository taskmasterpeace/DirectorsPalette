"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const FilmDirectorSchema = z.object({
  name: z.string(),
  description: z.string(),
  visualLanguage: z.string(),
  cameraStyle: z.string(),
  colorPalette: z.string(),
  signatureElements: z.array(z.string()),
  narrativeApproach: z.string(),
  influences: z.array(z.string()),
  notableWorks: z.array(z.string()),
})

const MusicVideoDirectorSchema = z.object({
  name: z.string(),
  description: z.string(),
  visualHallmarks: z.string(),
  editingStyle: z.string(),
  narrativeStructure: z.string(),
  colorAndLighting: z.string(),
  signatureTechniques: z.array(z.string()),
  influences: z.array(z.string()),
  genres: z.array(z.string()),
  notableWorks: z.array(z.string()),
})

export async function generateDirectorStyleDetails(name: string, description: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  try {
    const prompt = `
Based on this director description, generate detailed style information.

Director Name: ${name}
Description: ${description}

Create comprehensive style details including:
- Visual language and aesthetic
- Camera techniques and movement style
- Color palette and lighting approach
- Signature elements and techniques
- Narrative approach
- Influences and references
- Notable works (can be fictional if this is a custom director)

Make the style distinctive and consistent with the description provided.
`

    // Generate both film and music video director profiles
    const [filmResult, mvResult] = await Promise.all([
      generateObject({
        model: openai("gpt-4o-mini"),
        schema: FilmDirectorSchema,
        prompt,
        system: "You are creating a detailed film director style profile.",
      }),
      generateObject({
        model: openai("gpt-4o-mini"),
        schema: MusicVideoDirectorSchema,
        prompt,
        system: "You are creating a detailed music video director style profile.",
      }),
    ])

    return {
      success: true,
      data: {
        film: filmResult.object,
        musicVideo: mvResult.object,
        generatedAt: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Error generating director style details:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate director style",
    }
  }
}