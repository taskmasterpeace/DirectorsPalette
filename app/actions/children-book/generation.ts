"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

// Children's Book Schemas (No chapters, focus on pages)
const BookPageSchema = z.object({
  pageNumber: z.number(),
  pageText: z.string(),
  sceneDescription: z.string(), // Background/setting description, no lighting/camera
  characters: z.array(z.string()), // @character references
  location: z.string(), // @location reference  
  props: z.array(z.string()), // @prop references
  mood: z.string(),
  ageAppropriate: z.boolean()
})

const ChildrenBookSchema = z.object({
  title: z.string(),
  targetAge: z.string(),
  theme: z.string().optional(),
  pages: z.array(BookPageSchema),
  totalPages: z.number()
})

interface BookGenerationOptions {
  story: string
  ageGroup: string
  theme?: string
  aspectRatio: string
  references: {
    characters: any[]
    locations: any[]
    props: any[]
  }
  illustrationNotes?: string
}

export async function generateChildrenBook(options: BookGenerationOptions) {
  try {
    const { story, ageGroup, theme, aspectRatio, references, illustrationNotes } = options
    
    // Create age-appropriate prompt based on target age group
    const ageGuidelines = {
      '0-3': 'Very simple text, large illustrations, basic concepts, bright colors, no scary elements',
      '3-7': 'Simple sentences, engaging illustrations, clear storyline, positive messages, friendly characters',
      '6-10': 'Longer text, detailed illustrations, more complex storyline, adventure elements, character development',
      '8-12': 'Chapter-like structure, sophisticated illustrations, complex themes, character growth, meaningful lessons'
    }

    const ageGuide = ageGuidelines[ageGroup as keyof typeof ageGuidelines] || ageGuidelines['3-7']

    const referencesText = `
EXTRACTED REFERENCES:
CHARACTERS: ${references.characters.map(c => `${c.reference}: ${c.name} - ${c.description}`).join('\n')}
LOCATIONS: ${references.locations.map(l => `${l.reference}: ${l.name} - ${l.description}`).join('\n')}
PROPS: ${references.props.map(p => `${p.reference}: ${p.name} - ${p.description}`).join('\n')}`

    const prompt = `Create a children's book from this story, adapting it for ${ageGroup}-year-olds.

STORY: ${story}${referencesText}

ASPECT RATIO: ${aspectRatio}
AGE GUIDELINES: ${ageGuide}
${theme ? `THEME/LESSON: ${theme}` : ''}
${illustrationNotes ? `ILLUSTRATION NOTES: ${illustrationNotes}` : ''}

Instructions for CHILDREN'S BOOK ILLUSTRATIONS (NOT FILM):
1. Break the story into 6-12 book pages with age-appropriate text per page
2. For each page, create a SCENE DESCRIPTION (not cinematic shots)
3. Focus on BACKGROUND/SETTING descriptions, character positions, and mood
4. DO NOT include lighting, camera angles, or cinematic techniques
5. Use the extracted references (@character, @location, @prop) for consistency
6. Include simple, clear descriptions of what the illustration should show
7. Ensure all content is age-appropriate and positive for ${ageGroup}-year-olds
8. Each scene should be in ${aspectRatio} aspect ratio format

Create ILLUSTRATION SCENES, not movie shots. Focus on what children will see in the picture.`

    const result = await generateObject({
      model: openai('gpt-4o'), // Use GPT-4o as requested
      prompt,
      schema: ChildrenBookSchema,
    })

    return {
      success: true,
      data: result.object
    }
  } catch (error) {
    console.error('Children\'s book generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate children\'s book'
    }
  }
}

// Use EXACT same extraction system as story mode
const ReferenceSchema = z.object({
  id: z.string(),
  reference: z.string(),
  name: z.string(),
  description: z.string(),
  appearances: z.array(z.string()).optional(),
})

const BookReferencesSchema = z.object({
  characters: z.array(ReferenceSchema),
  locations: z.array(ReferenceSchema),
  props: z.array(ReferenceSchema),
  themes: z.array(z.string()),
})

export async function extractBookReferences(story: string) {
  try {
    const prompt = `
Analyze this CHILDREN'S BOOK story and extract ONLY the actual characters, locations, and props that appear in the text.
DO NOT invent or add any elements not explicitly mentioned in the story.

For each element, provide:
- A unique ID (e.g., "char-1", "loc-1", "prop-1")
- A reference handle (e.g., "@teddy_bear", "@bedroom", "@magic_wand")
- The actual name from the story
- A brief visual description suitable for children's book illustration
- Appearances (which parts of the story they appear in)

Also identify:
- Key themes appropriate for children (friendship, kindness, courage, etc.)

CRITICAL RULES FOR CHILDREN'S BOOKS:
1. ONLY extract elements that are EXPLICITLY mentioned in the story text
2. Do NOT create or imagine any characters, locations, or props not in the story
3. Keep descriptions age-appropriate and positive
4. Focus on visual consistency for illustrations
5. Use child-friendly reference names (e.g., @little_rabbit instead of @rabbit_protagonist)

Return ONLY the actual elements found in the story text.
`

    const { object: references } = await generateObject({
      model: openai("gpt-4o"), // Use GPT-4o for structured output compatibility
      schema: BookReferencesSchema,
      prompt,
      system: `You are extracting elements from a children's book story for illustration consistency. STORY: """${story}"""`,
    })

    return {
      success: true,
      data: references
    }
  } catch (error) {
    console.error('Book references extraction error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract references'
    }
  }
}