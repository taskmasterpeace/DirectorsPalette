import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check if API token exists
  const hasToken = !!process.env.REPLICATE_API_TOKEN
  const tokenPreview = process.env.REPLICATE_API_TOKEN 
    ? `${process.env.REPLICATE_API_TOKEN.slice(0, 10)}...` 
    : 'Not found'
  
  // Test a simple API call to Replicate
  if (hasToken) {
    try {
      const response = await fetch('https://api.replicate.com/v1/models', {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      })
      
      const isValid = response.ok
      
      return NextResponse.json({
        success: true,
        hasToken,
        tokenPreview,
        apiValid: isValid,
        status: response.status,
        message: isValid ? 'Replicate API is connected!' : 'Token exists but API call failed'
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        hasToken,
        tokenPreview,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  return NextResponse.json({
    success: false,
    hasToken,
    tokenPreview,
    message: 'No Replicate API token found in environment'
  })
}