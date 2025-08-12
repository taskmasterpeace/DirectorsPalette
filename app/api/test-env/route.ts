import { NextResponse } from 'next/server'

export async function GET() {
  console.log('=== Environment Variable Test ===')
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
  console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0)
  console.log('All env vars starting with OPENAI:', 
    Object.keys(process.env)
      .filter(key => key.startsWith('OPENAI'))
      .map(key => ({ [key]: process.env[key]?.length || 0 }))
  )
  
  return NextResponse.json({
    hasApiKey: !!process.env.OPENAI_API_KEY,
    keyLength: process.env.OPENAI_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    allOpenAIKeys: Object.keys(process.env).filter(key => key.startsWith('OPENAI'))
  })
}