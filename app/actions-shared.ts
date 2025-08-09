"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

function assertAIEnv() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY. Please add the OpenAI integration or set the key in project settings.")
  }
}

const DirectorStyleSchema = z.object({
  visualHallmarks: z.string().describe("Key visual hallmarks as a sentence or short paragraph."),
  narrativeStyle: z.string().describe("Narrative approach and storytelling preferences."),
  pacingAndEnergy: z.string().default("Moderate").describe("Typical pacing and energy."),
  genres: z.string().default("Drama, Thriller").describe("Comma-separated genres this style pairs well with."),
})

export async function generateDirectorStyleDetails(name: string, description: string) {
  assertAIEnv()
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: DirectorStyleSchema,
    system:
      "You are a seasoned film scholar distilling a director concept into practical style attributes for production.",
    prompt: `DIRECTOR NAME: ${name}
DIRECTOR DESCRIPTION: ${description}

Return concise, production-ready attributes.`,
  })
  return object
}
