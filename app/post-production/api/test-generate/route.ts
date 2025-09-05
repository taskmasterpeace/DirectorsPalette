import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/post-production/replicate-client'

export async function POST(request: NextRequest) {
  try {
    // Test with a simple prompt
    const testPrompt = "A cinematic shot of a detective standing in rain at night, noir style, dramatic lighting, urban cityscape background"
    
    console.log('Testing Replicate generation with prompt:', testPrompt)
    
    // Generate image
    const imageUrls = await generateImage(
      testPrompt,
      (status) => console.log('Generation status:', status)
    )
    
    return NextResponse.json({
      success: true,
      prompt: testPrompt,
      images: imageUrls,
      generatedAt: new Date().toISOString(),
      message: 'Test generation successful!'
    })
    
  } catch (error) {
    console.error('Test generation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}