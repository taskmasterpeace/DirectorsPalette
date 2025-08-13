"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function generateAdditionalMusicVideoShots(
  section: any,
  songTitle: string,
  director: string = "",
  customRequest: string = ""
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  try {
    // Removed category prompts as they're not being used in the current implementation

    // Extract section data
    const sectionType = section.type || 'unknown'
    const sectionContent = section.lyrics || section.content || 'Instrumental'
    const existingShots = section.shots || []
    
    const prompt = `
Generate 3-5 additional shots for this music video section.

Song: "${songTitle}"
Section Type: ${sectionType}
Section Content/Lyrics: ${sectionContent}

Existing Shots (DO NOT DUPLICATE):
${existingShots.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

Requirements:
${customRequest ? `Special request: ${customRequest}` : ''}
${director ? `Match the style of ${director}` : ''}

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
      data: shots  // Return shots array directly, not wrapped in an object
    }
  } catch (error) {
    console.error('Error generating additional music video shots:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate additional shots'
    }
  }
}