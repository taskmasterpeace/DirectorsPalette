"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function generateAdditionalMusicVideoShots(
  section: any,
  songTitle: string,
  director: string = "",
  customRequest: string = "",
  artistName: string = "artist"
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
${customRequest ? `IMPORTANT: ${customRequest}` : ''}
${director ? `Match the style of ${director}` : ''}

CRITICAL FORMATTING RULES:
1. ALWAYS use @artist as the placeholder for the artist
2. NEVER use the actual artist name
3. @artist will be replaced by the user's toggle preference

If location, wardrobe, or prop references are provided above, you MUST incorporate them into the shots.

Generate creative, complementary shots that enhance the music video.
Each shot should be a complete, detailed description (2-3 sentences).
Include camera movement, framing, and visual style details.

RESPONSE FORMAT - NUMBER YOUR SHOTS:
1. [Shot description with @artist and any specified references]
2. [Shot description with @artist and any specified references]
3. [Shot description with @artist and any specified references]
(continue for 3-5 shots total)
`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      system: `You are a music video director creating additional shots in ${
        director ? `the style of ${director}` : 'a contemporary music video style'
      }. CRITICAL: Always use @artist as a placeholder for the artist's name in shot descriptions, never use the actual artist name.`,
    })

    // Parse the AI response

    // Parse the response into individual shots - be more flexible
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    const shots = lines
      .map(line => {
        // Remove various numbering formats but keep the content
        return line
          .replace(/^\d+[\.\)]\s*/, '')     // Remove "1. " or "1) "
          .replace(/^[-•]\s*/, '')           // Remove "- " or "• "
          .replace(/^Shot \d+:?\s*/i, '')   // Remove "Shot 1:"
          .replace(/^\[/, '').replace(/\]$/, '') // Remove brackets if used
          .trim()
      })
      .filter(shot => {
        // Keep only substantial content (not headers or short lines)
        return shot.length > 20 && 
               !shot.toLowerCase().startsWith('here') &&
               !shot.toLowerCase().startsWith('shot')
      })


    // Ensure we have @artist in shots (don't replace with actual name)
    // The display component will handle the toggle

    if (shots.length === 0) {
      // No shots could be parsed from AI response
      // Try to salvage something from the response
      const fallbackShots = text
        .split('\n')
        .filter(line => line.trim().length > 30) // Get any substantial lines
        .slice(0, 3) // Take up to 3 lines
      
      if (fallbackShots.length > 0) {
        // Using fallback parsing
        return {
          success: true,
          data: fallbackShots
        }
      }
    }

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