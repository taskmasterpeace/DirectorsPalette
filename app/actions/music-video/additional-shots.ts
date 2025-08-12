"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function generateAdditionalMusicVideoShots({
  sectionContent,
  sectionType,
  existingShots,
  categories = [],
  customRequest = "",
  director = "",
  directorNotes = "",
}: {
  sectionContent: string
  sectionType: string
  existingShots: string[]
  categories?: string[]
  customRequest?: string
  director?: string
  directorNotes?: string
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  try {
    const categoryPrompts = {
      'performance': 'Focus on artist performance shots with energy and presence',
      'narrative': 'Create narrative-driven shots that tell a story',
      'abstract': 'Generate abstract, artistic shots with visual metaphors',
      'closeup': 'Intimate close-up shots capturing emotion and detail',
      'wide': 'Wide establishing shots showing scale and environment',
      'movement': 'Dynamic shots with camera or subject movement',
      'effects': 'Shots designed for visual effects or post-production enhancement'
    }

    const selectedPrompts = categories
      .map(cat => categoryPrompts[cat as keyof typeof categoryPrompts])
      .filter(Boolean)
      .join('. ')

    const prompt = `
Generate 3-5 additional shots for this music video section.

Section Type: ${sectionType}
Section Content/Lyrics: ${sectionContent}

Existing Shots (DO NOT DUPLICATE):
${existingShots.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Requirements:
${selectedPrompts ? `Focus on: ${selectedPrompts}` : ''}
${customRequest ? `Special request: ${customRequest}` : ''}
${director ? `Match the style of ${director}` : ''}
${directorNotes ? `Director notes: ${directorNotes}` : ''}

Generate creative, complementary shots that enhance the music video.
Each shot should be a complete, detailed description (2-3 sentences).
Include camera movement, framing, and visual style details.
Use location, wardrobe, and prop references where appropriate.
`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      system: `You are a music video director creating additional shots in ${
        director ? `the style of ${director}` : 'a contemporary music video style'
      }.`,
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
    console.error('Error generating additional music video shots:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate additional shots'
    }
  }
}