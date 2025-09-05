"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { generateStoryBreakdown } from "./breakdown"
import type { DirectorQuestion } from '@/components/story/DirectorQuestionCards'

const EntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['character', 'location', 'prop'])
})

const ExtractedEntitiesSchema = z.object({
  characters: z.array(EntitySchema),
  locations: z.array(EntitySchema),
  props: z.array(EntitySchema),
  themes: z.array(z.string()),
})

export async function extractStoryEntities(story: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY")
  }

  try {
    const prompt = `
Extract all entities from this story that would be relevant for shot generation.

For each entity provide:
- A unique ID
- The name as it appears in the story
- A brief description
- The type (character, location, or prop)

Also identify key themes in the story.

ONLY extract entities that are explicitly mentioned in the story.
`

    const { object: entities } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ExtractedEntitiesSchema,
      prompt,
      system: `You are extracting entities from a story. Story: """${story}"""`,
    })

    return {
      success: true,
      data: entities
    }
  } catch (error) {
    console.error('Error extracting entities:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract entities'
    }
  }
}

export async function generateStoryBreakdownWithEntities(
  story: string,
  director: string,
  directorNotes: string,
  entities: any,
  directorAnswers: DirectorQuestion[],
  titleCardOptions?: any,
  promptOptions?: any,
  chapterMethod: string = 'ai-suggested',
  userChapterCount: number = 4
) {
  // Format entities for the prompt
  const entityContext = `
STORY ENTITIES TO USE:
Characters: ${entities.characters?.map((c: any) => `${c.name} - ${c.description}`).join(', ') || 'None'}
Locations: ${entities.locations?.map((l: any) => `${l.name} - ${l.description}`).join(', ') || 'None'}
Props: ${entities.props?.map((p: any) => `${p.name} - ${p.description}`).join(', ') || 'None'}

DIRECTOR Q&A:
${directorAnswers?.map((q: DirectorQuestion) => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n') || 'None'}

Use these entities and director answers to inform your shot generation.
`

  // Add entity context to director notes
  const enhancedNotes = `${directorNotes}\n\n${entityContext}`

  // Use the regular generateBreakdown with enhanced notes
  return generateStoryBreakdown(
    story,
    director,
    enhancedNotes,
    titleCardOptions,
    promptOptions,
    chapterMethod,
    userChapterCount
  )
}