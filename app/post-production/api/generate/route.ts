import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/post-production/replicate-client'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, settings, referenceImages } = await request.json()
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }
    
    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Replicate API token not configured. Add REPLICATE_API_TOKEN to .env.local' },
        { status: 500 }
      )
    }
    
    // Build additional input based on settings
    const additionalInput: Record<string, any> = {}
    
    // Handle aspect ratio
    if (settings?.aspectRatio) {
      const [width, height] = settings.aspectRatio.split(':').map(Number)
      const aspectRatio = width / height
      
      if (settings.resolution === '4K') {
        additionalInput.width = aspectRatio >= 1 ? 2048 : Math.round(2048 / aspectRatio)
        additionalInput.height = aspectRatio >= 1 ? Math.round(2048 / aspectRatio) : 2048
      } else if (settings.resolution === '1080p') {
        additionalInput.width = aspectRatio >= 1 ? 1024 : Math.round(1024 / aspectRatio)
        additionalInput.height = aspectRatio >= 1 ? Math.round(1024 / aspectRatio) : 1024
      } else {
        additionalInput.width = aspectRatio >= 1 ? 768 : Math.round(768 / aspectRatio)
        additionalInput.height = aspectRatio >= 1 ? Math.round(768 / aspectRatio) : 768
      }
    }
    
    // Handle seed
    if (settings?.seed) {
      additionalInput.seed = settings.seed
    }
    
    // Enhance prompt if reference images are provided
    let enhancedPrompt = prompt
    if (referenceImages && referenceImages.length > 0) {
      // In a real implementation, you would upload reference images to Replicate
      // and use a model that supports image-to-image generation
      enhancedPrompt = `${prompt} (style reference provided)`
    }
    
    // Generate image
    const imageUrls = await generateImage(enhancedPrompt, undefined, additionalInput)
    
    return NextResponse.json({
      success: true,
      images: imageUrls,
      prompt: enhancedPrompt,
      generatedAt: new Date().toISOString(),
      settings
    })
    
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}