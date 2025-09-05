import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { test } = await request.json()
    
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      )
    }

    const startTime = Date.now()
    
    // Health check for Gen4 model availability
    const response = await fetch('https://api.replicate.com/v1/models/playgroundai/playground-v2.5-1024px-aesthetic/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          prompt: "health check",
          width: 64,
          height: 64,
          guidance_scale: 3,
          num_inference_steps: 4,
          scheduler: "K_EULER_ANCESTRAL"
        }
      })
    })

    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json({
        healthy: false,
        responseTime,
        service: 'gen4-image',
        error: errorData,
        status: response.status
      }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      healthy: true,
      responseTime,
      service: 'gen4-image',
      model: 'playground-v2.5-1024px-aesthetic',
      prediction_id: data.id,
      status: data.status
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        healthy: false,
        service: 'gen4-image', 
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: 5000 // Timeout
      },
      { status: 500 }
    )
  }
}