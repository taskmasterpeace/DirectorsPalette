"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { 
  CommercialConfig,
  CommercialStructure,
  CommercialGenerationResult,
  CommercialStructureSchema,
  CommercialShotSchema,
  CommercialShot,
  Platform,
  Duration
} from "@/lib/types/commercial-types"
import { 
  COMMERCIAL_PROMPTS,
  buildCommercialPrompt,
  buildPlatformRequirements,
  buildCommercialDirectorStyle
} from "@/config/commercial-prompts"

// Enhanced commercial generation with structured output
export async function generateCommercial(config: CommercialConfig): Promise<CommercialGenerationResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: "Missing OPENAI_API_KEY environment variable",
      generatedAt: new Date().toISOString()
    }
  }

  try {
    // Determine content type if not specified
    const contentType = config.contentType || (isProductBased(config.product) ? 'product' : 'service')
    
    // Build director style
    const directorStyle = buildCommercialDirectorStyle(config.director)
    
    // Build platform requirements
    const platformRequirements = buildPlatformRequirements(config.platform)
    
    // Select appropriate base prompt
    let basePrompt: string
    if (config.duration === '10s') {
      basePrompt = contentType === 'product' 
        ? COMMERCIAL_PROMPTS.GENERATION.TEN_SECOND + "\n\n" + COMMERCIAL_PROMPTS.MODIFIERS.PRODUCT_FOCUS
        : COMMERCIAL_PROMPTS.GENERATION.TEN_SECOND + "\n\n" + COMMERCIAL_PROMPTS.MODIFIERS.SERVICE_FOCUS
    } else {
      basePrompt = contentType === 'product'
        ? COMMERCIAL_PROMPTS.GENERATION.THIRTY_SECOND + "\n\n" + COMMERCIAL_PROMPTS.MODIFIERS.PRODUCT_FOCUS  
        : COMMERCIAL_PROMPTS.GENERATION.THIRTY_SECOND + "\n\n" + COMMERCIAL_PROMPTS.MODIFIERS.SERVICE_FOCUS
    }

    // Add location modifier
    const locationRequirement = config.locationRequirement || 'flexible'
    if (locationRequirement === 'flexible') {
      basePrompt += "\n\n" + COMMERCIAL_PROMPTS.MODIFIERS.LOCATION_FLEXIBLE
    } else {
      basePrompt += "\n\n" + COMMERCIAL_PROMPTS.MODIFIERS.LOCATION_SPECIFIC
    }

    // Build the complete prompt with variables
    const fullPrompt = buildCommercialPrompt(basePrompt, {
      brand: config.brand,
      product: config.product,
      audience: config.audience,
      platform: config.platform,
      concept: config.concept || `Effective ${config.duration} commercial showcasing ${config.product}`,
      directorStyle,
      platformRequirements
    })

    // Generate structured commercial
    const result = await generateObject({
      model: openai("gpt-4o"),
      temperature: 0.7,
      prompt: fullPrompt,
      schema: CommercialStructureSchema
    })

    // Validate and enhance the generated commercial
    const enhancedCommercial = enhanceCommercialStructure(result.object, config)

    return {
      success: true,
      commercial: enhancedCommercial,
      generatedAt: new Date().toISOString(),
      tokens_used: {
        prompt: result.usage?.promptTokens || 0,
        completion: result.usage?.completionTokens || 0,
        total: result.usage?.totalTokens || 0
      }
    }

  } catch (error) {
    console.error("Commercial generation error:", error)
    
    return {
      success: false,
      error: `Failed to generate commercial: ${error instanceof Error ? error.message : 'Unknown error'}`,
      generatedAt: new Date().toISOString()
    }
  }
}

// Generate additional shots for existing commercial
export async function generateAdditionalCommercialShots(
  existingCommercial: CommercialStructure,
  shotCount: number = 2,
  focusAreas: string[] = ['engagement', 'product-detail']
): Promise<{ success: boolean; newShots?: CommercialShot[]; error?: string }> {
  
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: "Missing OPENAI_API_KEY environment variable"
    }
  }

  try {
    const directorStyle = buildCommercialDirectorStyle(existingCommercial.config.director)
    
    const additionalPrompt = `
You are expanding a commercial shot list. Generate ${shotCount} new, distinct shots that complement the existing commercial.

EXISTING COMMERCIAL:
${existingCommercial.shots.map(s => `Shot ${s.shotNumber}: ${s.description}`).join('\n')}

FOCUS AREAS: ${focusAreas.join(', ')}

DIRECTOR STYLE:
${directorStyle}

COMMERCIAL CONFIG:
Brand: ${existingCommercial.config.brand}
Product: ${existingCommercial.config.product}
Duration: ${existingCommercial.config.duration}
Platform: ${existingCommercial.config.platform}

Generate new shots that:
- Don't duplicate existing shots
- Enhance the overall commercial narrative
- Focus on the specified areas: ${focusAreas.join(', ')}
- Match the director's style and pacing
- Fit within the ${existingCommercial.config.duration} timeframe

Return as an array of shot objects with the same structure as existing shots.
`

    const result = await generateObject({
      model: openai("gpt-4o"),
      temperature: 0.8,
      prompt: additionalPrompt,
      schema: z.object({
        newShots: z.array(CommercialShotSchema)
      })
    })

    // Assign sequential shot numbers
    const nextShotNumber = Math.max(...existingCommercial.shots.map(s => s.shotNumber)) + 1
    const enhancedShots = result.object.newShots.map((shot, index) => ({
      ...shot,
      shotNumber: nextShotNumber + index,
      id: `shot-${nextShotNumber + index}-${Date.now()}`
    }))

    return {
      success: true,
      newShots: enhancedShots
    }

  } catch (error) {
    console.error("Additional shots generation error:", error)
    
    return {
      success: false,
      error: `Failed to generate additional shots: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Regenerate specific shots
export async function regenerateCommercialShots(
  commercial: CommercialStructure,
  shotNumbers: number[],
  customInstructions?: string
): Promise<{ success: boolean; updatedShots?: CommercialShot[]; error?: string }> {
  
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: "Missing OPENAI_API_KEY environment variable"
    }
  }

  try {
    const directorStyle = buildCommercialDirectorStyle(commercial.config.director)
    const shotsToRegenerate = commercial.shots.filter(s => shotNumbers.includes(s.shotNumber))
    
    const regeneratePrompt = `
Regenerate these specific shots from a commercial, maintaining the overall narrative flow.

COMMERCIAL CONTEXT:
Brand: ${commercial.config.brand}
Product: ${commercial.config.product}
Duration: ${commercial.config.duration}
Platform: ${commercial.config.platform}

DIRECTOR STYLE:
${directorStyle}

SHOTS TO REGENERATE:
${shotsToRegenerate.map(s => `Shot ${s.shotNumber} (${s.timing}): ${s.description}`).join('\n')}

FULL COMMERCIAL CONTEXT:
${commercial.shots.map(s => `Shot ${s.shotNumber}: ${s.description}`).join('\n')}

${customInstructions ? `CUSTOM INSTRUCTIONS: ${customInstructions}` : ''}

Generate improved versions of the specified shots that:
- Maintain the same timing and shot numbers
- Better integrate with the overall narrative
- Follow the director's style more closely
- Are more engaging and platform-optimized
${customInstructions ? `- Address the custom instructions provided` : ''}

Return the regenerated shots with the same structure and shot numbers.
`

    const result = await generateObject({
      model: openai("gpt-4o"),
      temperature: 0.8,
      prompt: regeneratePrompt,
      schema: z.object({
        regeneratedShots: z.array(CommercialShotSchema)
      })
    })

    return {
      success: true,
      updatedShots: result.object.regeneratedShots
    }

  } catch (error) {
    console.error("Shot regeneration error:", error)
    
    return {
      success: false,
      error: `Failed to regenerate shots: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Helper functions
function isProductBased(productString: string): boolean {
  const productKeywords = [
    'product', 'device', 'gadget', 'tool', 'equipment', 'item', 'goods',
    'phone', 'laptop', 'car', 'shoe', 'clothing', 'food', 'drink',
    'software', 'app', 'game', 'book', 'furniture', 'appliance'
  ]
  
  return productKeywords.some(keyword => 
    productString.toLowerCase().includes(keyword)
  )
}

function enhanceCommercialStructure(
  generated: CommercialStructure, 
  config: CommercialConfig
): CommercialStructure {
  // Ensure shot timing is valid for duration
  const maxSeconds = config.duration === '10s' ? 10 : 30
  
  const enhancedShots = generated.shots.map((shot, index) => {
    // Ensure shot has proper timing if missing
    if (!shot.timing || !shot.timing.includes('-')) {
      const start = config.duration === '10s' 
        ? Math.floor((index * maxSeconds) / generated.shots.length)
        : Math.floor((index * maxSeconds) / generated.shots.length)
      const end = config.duration === '10s'
        ? Math.floor(((index + 1) * maxSeconds) / generated.shots.length)
        : Math.floor(((index + 1) * maxSeconds) / generated.shots.length)
      shot.timing = `${start}-${end}s`
    }

    // Ensure proper brand integration
    if (!shot.brandIntegration || shot.brandIntegration.length < 10) {
      shot.brandIntegration = `${config.brand} ${config.product} prominently featured with clear brand messaging`
    }

    return shot
  })

  return {
    ...generated,
    config: config,
    commercialId: `commercial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    shots: enhancedShots,
    totalDuration: config.duration,
    platformOptimization: {
      platform: config.platform,
      aspectRatio: getAspectRatioForPlatform(config.platform),
      hookTiming: getHookTimingForPlatform(config.platform),
      ctaPlacement: getCTAPlacementForPlatform(config.platform),
      engagementFactors: getEngagementFactorsForPlatform(config.platform)
    }
  }
}

function getAspectRatioForPlatform(platform: Platform): string {
  const ratios = {
    'tiktok': '9:16 (vertical)',
    'instagram': '9:16 (stories/reels) or 1:1 (feed)',
    'youtube': '16:9 (horizontal)'
  }
  return ratios[platform]
}

function getHookTimingForPlatform(platform: Platform): string {
  const timings = {
    'tiktok': 'First 2 seconds critical',
    'instagram': 'First 3 seconds for engagement',
    'youtube': 'First 5 seconds for retention'
  }
  return timings[platform]
}

function getCTAPlacementForPlatform(platform: Platform): string {
  const placements = {
    'tiktok': 'End with text overlay and voice CTA',
    'instagram': 'Link in bio mention, DM prompt, or swipe up',
    'youtube': 'Subscribe reminder, end screen, description link'
  }
  return placements[platform]
}

function getEngagementFactorsForPlatform(platform: Platform): string[] {
  const factors = {
    'tiktok': ['trending sounds', 'fast cuts', 'text overlays', 'challenges'],
    'instagram': ['hashtags', 'stories integration', 'user-generated content', 'influencer potential'],
    'youtube': ['subscriber hooks', 'comment engagement', 'playlist inclusion', 'longer watch time']
  }
  return factors[platform]
}

export default generateCommercial