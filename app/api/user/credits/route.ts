/**
 * User Credits API Endpoint
 * Fetches current user credit balance
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addCorsHeaders, addSecurityHeaders } from '@/lib/middleware/api-middleware'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // For development testing - return a fixed user ID if no auth
    // In production, this should be properly authenticated
    let userId = '7cf1a35d-e572-4e39-b4cd-a38d8f10c6d2' // Default test user

    // Try to get authenticated user if possible
    try {
      const authHeader = request.headers.get('authorization')
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (!authError && user) {
          userId = user.id
        }
      }
    } catch (authError) {
      // Continue with default user for development
      console.log('Auth failed, using default user for development')
    }

    // Fetch user credits
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('current_points')
      .eq('user_id', userId)
      .single()

    if (creditsError || !userCredits) {
      console.error('Error fetching user credits:', creditsError)
      return NextResponse.json(
        { success: false, error: 'Unable to fetch user credits' },
        { status: 400 }
      )
    }

    const response = NextResponse.json({
      success: true,
      credits: userCredits.current_points,
      userId
    })

    return addSecurityHeaders(addCorsHeaders(response))

  } catch (error) {
    console.error('❌ Credits API error:', error)

    const errorResponse = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )

    return addSecurityHeaders(addCorsHeaders(errorResponse))
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}