import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { model, test } = await request.json()
    
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    const startTime = Date.now()
    
    // Simple health check with minimal tokens
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://v0-director-style-workflow.vercel.app',
        'X-Title': 'Director\'s Palette Health Check'
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-4o-mini',
        messages: [
          { role: 'user', content: 'Health check. Respond with just "OK".' }
        ],
        max_tokens: 5,
        temperature: 0
      })
    })

    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json({
        healthy: false,
        responseTime,
        error: errorData,
        status: response.status
      }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      healthy: true,
      responseTime,
      model,
      response: data.choices?.[0]?.message?.content || 'No response',
      usage: data.usage
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: 5000 // Timeout
      },
      { status: 500 }
    )
  }
}