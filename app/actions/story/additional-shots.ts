"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function generateAdditionalChapterShots(
  chapterContent: string,
  existingShots: string[],
  categories: string[] = [],
  customRequest: string = "",
  director: string = "",
  directorNotes: string = ""
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  try {
    const categoryPrompts = {
      'character-moments': 'Focus on intimate character moments, reactions, and emotional beats',
      'action-sequences': 'Create dynamic action shots with movement and energy',
      'establishing-shots': 'Wide establishing shots that set location and atmosphere',
      'insert-details': 'Close-up insert shots of important objects and details',
      'atmospheric': 'Mood-setting shots that build atmosphere and tension',
      'transitions': 'Creative transition shots between scenes'
    }

    const selectedPrompts = categories
      .map(cat => categoryPrompts[cat as keyof typeof categoryPrompts])
      .filter(Boolean)
      .join('. ')

    const prompt = `
Based on this chapter content, generate 3-5 additional shots.

Chapter Content: ${chapterContent}

Existing Shots (DO NOT DUPLICATE):
${existingShots.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Requirements:
${selectedPrompts ? `Focus on: ${selectedPrompts}` : ''}
${customRequest ? `Special request: ${customRequest}` : ''}
${director ? `Match the style of ${director}` : ''}
${directorNotes ? `Director notes: ${directorNotes}` : ''}

Generate creative, complementary shots that add value to the existing coverage.
Each shot should be a complete, detailed description (2-3 sentences).
Use @character, @location, and @prop references where appropriate.
`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      system: `You are a cinematographer creating additional shots in ${director ? `the style of ${director}` : 'a cinematic style'}.`,
    })

    // Parse the response into individual shots
    const shots = text
      .split('\n')
      .filter(line => line.trim())
      .filter(line => /^\d+[\.\)]\s*/.test(line) || line.startsWith('-') || line.startsWith('•'))
      .map(line => line.replace(/^[\d\.\)\-•\s]+/, '').trim())
      .filter(shot => shot.length > 20) // Filter out short/incomplete lines

    return {
      success: true,
      data: {
        shots,
        generatedAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Error generating additional shots:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate additional shots'
    }
  }
}