"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

// Children's Book Schemas
const BookPageSchema = z.object({
  pageNumber: z.number(),
  pageText: z.string(),
  illustrationPrompt: z.string(),
  characters: z.array(z.string()),
  setting: z.string(),
  mood: z.string(),
  ageAppropriate: z.boolean()
})

const ChildrenBookSchema = z.object({
  title: z.string(),
  targetAge: z.string(),
  theme: z.string().optional(),
  pages: z.array(BookPageSchema),
  characterDescriptions: z.array(z.object({
    name: z.string(),
    description: z.string(),
    consistencyNotes: z.string()
  })),
  illustrationStyle: z.string(),
  totalPages: z.number()
})

interface BookGenerationOptions {
  story: string
  illustratorStyle: string
  ageGroup: string
  theme?: string
  aspectRatio: string
}

export async function generateChildrenBook(options: BookGenerationOptions) {
  try {
    const { story, illustratorStyle, ageGroup, theme, aspectRatio } = options
    
    // Create age-appropriate prompt based on target age group
    const ageGuidelines = {
      '0-3': 'Very simple text, large illustrations, basic concepts, bright colors, no scary elements',
      '3-7': 'Simple sentences, engaging illustrations, clear storyline, positive messages, friendly characters',
      '6-10': 'Longer text, detailed illustrations, more complex storyline, adventure elements, character development',
      '8-12': 'Chapter-like structure, sophisticated illustrations, complex themes, character growth, meaningful lessons'
    }

    const ageGuide = ageGuidelines[ageGroup as keyof typeof ageGuidelines] || ageGuidelines['3-7']

    const prompt = `Create a children's book from this story, adapting it for ${ageGroup}-year-olds.

STORY: ${story}

ILLUSTRATION STYLE: ${illustratorStyle}
ASPECT RATIO: ${aspectRatio}
AGE GUIDELINES: ${ageGuide}
${theme ? `THEME/LESSON: ${theme}` : ''}

Instructions:
1. Break the story into 6-12 book pages with age-appropriate text per page
2. Create detailed illustration prompts that maintain character consistency using @character_name format
3. Ensure illustrations are suitable for ${ageGroup}-year-olds
4. Include character descriptions for consistent illustration across pages
5. Make sure each illustration prompt includes the specified aspect ratio (${aspectRatio})
6. Include setting, mood, and character emotions for each page
7. Ensure content is completely age-appropriate and positive

Focus on creating engaging illustrations that will captivate young readers while maintaining story consistency.`

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

// Extract characters from book story (reuse existing logic)
export async function extractBookCharacters(story: string) {
  try {
    const prompt = `Extract all characters from this children's book story and provide consistent descriptions for illustration:

STORY: ${story}

Extract:
1. All character names (use @character_name format for consistency)
2. Physical descriptions suitable for children's book illustration
3. Personality traits that should show in illustrations
4. Any important visual characteristics (clothing, accessories, etc.)

Return characters that can be consistently illustrated throughout the book.`

    const CharacterSchema = z.object({
      characters: z.array(z.object({
        name: z.string(),
        tagName: z.string(), // @character_name format
        description: z.string(),
        visualTraits: z.array(z.string()),
        personality: z.string()
      }))
    })

    const result = await generateObject({
      model: openai('gpt-4o'),
      prompt,
      schema: CharacterSchema,
    })

    return {
      success: true,
      data: result.object.characters
    }
  } catch (error) {
    console.error('Character extraction error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract characters'
    }
  }
}