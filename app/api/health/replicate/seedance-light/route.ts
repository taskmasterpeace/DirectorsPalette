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
    
    // Health check for Seedance Light model availability
    const response = await fetch('https://api.replicate.com/v1/models/deforum/seedance', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json({
        healthy: false,
        responseTime,
        service: 'seedance-light',
        error: errorData,
        status: response.status
      }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      healthy: true,
      responseTime,
      service: 'seedance-light',
      model: 'deforum/seedance',
      model_data: {
        name: data.name,
        description: data.description,
        visibility: data.visibility,
        latest_version: data.latest_version?.id
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        healthy: false,
        service: 'seedance-light', 
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: 5000 // Timeout
      },
      { status: 500 }
    )
  }
}