"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { generateBreakdown } from "./breakdown"

const ReferenceSchema = z.object({
  id: z.string(),
  reference: z.string(),
  name: z.string(),
  description: z.string(),
  appearances: z.array(z.string()).optional(),
})

const StoryReferencesSchema = z.object({
  characters: z.array(ReferenceSchema),
  locations: z.array(ReferenceSchema),
  props: z.array(ReferenceSchema),
  themes: z.array(z.string()),
  suggestedTreatments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
  })),
})

export async function extractStoryReferences(
  story: string,
  director: string = "",
  directorNotes: string = ""
) {
  console.log('Extracting story references...')
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY")
  }

  try {
    const prompt = `
Analyze this story and extract ONLY the actual characters, locations, and props that appear in the text.
DO NOT invent or add any elements not explicitly mentioned in the story.

For each element, provide:
- A unique ID (e.g., "char-1", "loc-1", "prop-1")
- A reference handle (e.g., "@john", "@warehouse", "@briefcase")
- The actual name from the story
- A brief visual description suitable for ${director || 'cinematic'} style
- Appearances (which parts of the story they appear in)

Also identify:
- Key themes and moods in the story
- Suggested visual treatments that would work well

CRITICAL RULES:
1. ONLY extract elements that are EXPLICITLY mentioned in the story text
2. Do NOT create or imagine any characters, locations, or props not in the story
3. If a character is mentioned by name, use that exact name
4. If a location is described, use that description
5. Be conservative - when in doubt, don't include it

Director Notes to consider: ${directorNotes || 'None'}

Return ONLY the actual elements found in the story text.
`

    const { object: references } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: StoryReferencesSchema,
      prompt,
      system: `You are a script supervisor extracting ONLY actual elements from the story. STORY: """${story}"""`,
    })

    console.log('Extracted references:', {
      characters: references.characters.length,
      locations: references.locations.length,
      props: references.props.length,
    })

    return {
      success: true,
      data: references
    }
  } catch (error) {
    console.error('Error extracting references:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract references'
    }
  }
}

export async function generateStoryBreakdownWithReferences(
  story: string,
  director: string,
  directorNotes: string,
  configuredReferences: {
    characters: Array<{ reference: string; name: string; description: string }>
    locations: Array<{ reference: string; name: string; description: string }>
    props: Array<{ reference: string; name: string; description: string }>
  },
  titleCardOptions?: any,
  promptOptions?: any,
  chapterMethod: string = "ai-suggested",
  userChapterCount: number = 4
) {
  console.log('Generating breakdown with configured references...')
  
  // Format references for the prompt
  const characterList = configuredReferences.characters
    .map(c => `${c.reference} - ${c.name}: ${c.description}`)
    .join('\n')
  
  const locationList = configuredReferences.locations
    .map(l => `${l.reference} - ${l.name}: ${l.description}`)
    .join('\n')
  
  const propList = configuredReferences.props
    .map(p => `${p.reference} - ${p.name}: ${p.description}`)
    .join('\n')

  // Add reference constraints to director notes
  const constrainedNotes = `
${directorNotes}

CRITICAL REFERENCE CONSTRAINTS:
You MUST use ONLY these approved references in your shot list:

CHARACTERS (use these exact references):
${characterList || 'None specified'}

LOCATIONS (use these exact references):
${locationList || 'None specified'}

PROPS (use these exact references):
${propList || 'None specified'}

DO NOT introduce any characters, locations, or props not listed above.
Use the exact @reference handles provided (e.g., @john, @warehouse).
Focus on creative shot composition using only these approved elements.
`

  const result = await generateBreakdown(
    story,
    director,
    constrainedNotes,
    titleCardOptions,
    promptOptions,
    chapterMethod,
    userChapterCount
  )

  return result
}