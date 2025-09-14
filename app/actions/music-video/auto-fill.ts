'use server'

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { retryAIGeneration } from '@/lib/ai-utils'

export async function generateMusicVideoConcept(
  songTitle: string,
  artist: string,
  lyrics: string
) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: 'OpenAI API key not configured'
    }
  }

  try {
    const result = await retryAIGeneration(async () => {
      const prompt = `
Generate a compelling music video concept based on the following song:

Song Title: "${songTitle}"
Artist: ${artist}
Lyrics: ${lyrics}

Create a cohesive music video concept that:
- Captures the song's emotional core and narrative themes
- Translates the lyrics into visual storytelling
- Considers the artist's style and genre
- Suggests creative visual metaphors and symbolism
- Is engaging and memorable for viewers

Provide a concise but detailed concept description (2-3 sentences maximum).
`

      const response = await generateText({
        model: openai('gpt-4o-mini'),
        prompt,
        maxTokens: 200,
        temperature: 0.7
      })

      return response.text.trim()
    })

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Error generating concept:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate concept'
    }
  }
}

export async function generateVisualStyle(
  songTitle: string,
  artist: string,
  lyrics: string,
  concept?: string
) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: 'OpenAI API key not configured'
    }
  }

  try {
    const result = await retryAIGeneration(async () => {
      const prompt = `
Generate visual style description for a music video:

Song Title: "${songTitle}"
Artist: ${artist}
Lyrics: ${lyrics}
${concept ? `Concept: ${concept}` : ''}

Create a visual style description that includes:
- Color palette and mood
- Lighting style and atmosphere  
- Camera work and cinematography approach
- Overall aesthetic and artistic direction
- Visual textures and design elements

Provide a detailed but concise visual style description (2-3 sentences maximum).
Focus on concrete visual elements that a director and cinematographer can implement.
`

      const response = await generateText({
        model: openai('gpt-4o-mini'),
        prompt,
        maxTokens: 200,
        temperature: 0.7
      })

      return response.text.trim()
    })

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Error generating visual style:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate visual style'
    }
  }
}