/**
 * System-Wide Credit Validation Middleware
 * Handles credit checking across all generation endpoints
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface CreditValidationResult {
  success: boolean
  credits?: number
  userId?: string
  error?: string
  errorType?: 'INSUFFICIENT_CREDITS' | 'AUTH_REQUIRED' | 'UNKNOWN'
  details?: {
    required: number
    available: number
    shortfall: number
  }
}

/**
 * Validates user authentication and credits for API endpoints
 */
export async function validateUserCredits(
  request: NextRequest,
  requiredCredits: number
): Promise<CreditValidationResult> {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return {
        success: false,
        error: 'Authorization required',
        errorType: 'AUTH_REQUIRED'
      }
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return {
        success: false,
        error: 'Invalid authentication token',
        errorType: 'AUTH_REQUIRED'
      }
    }

    const userId = user.id

    // Fetch user credits
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('current_points')
      .eq('user_id', userId)
      .single()

    if (creditsError || !userCredits) {
      return {
        success: false,
        error: 'Unable to verify user credits',
        errorType: 'UNKNOWN'
      }
    }

    const availableCredits = userCredits.current_points

    // Check if user has enough credits
    if (availableCredits < requiredCredits) {
      return {
        success: false,
        error: 'Insufficient credits',
        errorType: 'INSUFFICIENT_CREDITS',
        credits: availableCredits,
        userId,
        details: {
          required: requiredCredits,
          available: availableCredits,
          shortfall: requiredCredits - availableCredits
        }
      }
    }

    return {
      success: true,
      credits: availableCredits,
      userId
    }

  } catch (error) {
    console.error('❌ Credit validation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorType: 'UNKNOWN'
    }
  }
}

/**
 * Deducts credits after successful generation
 */
export async function deductCredits(
  userId: string,
  creditsToDeduct: number,
  currentCredits: number
): Promise<boolean> {
  try {
    const { error: deductError } = await supabase
      .from('user_credits')
      .update({ current_points: currentCredits - creditsToDeduct })
      .eq('user_id', userId)

    if (deductError) {
      console.error('⚠️ Credit deduction failed:', deductError)
      return false
    }

    console.log('💰 Credits deducted successfully:', creditsToDeduct, 'credits')
    return true
  } catch (error) {
    console.error('❌ Credit deduction error:', error)
    return false
  }
}

/**
 * Returns standardized credit insufficient response
 */
export function createInsufficientCreditsResponse(
  details: {
    required: number
    available: number
    shortfall: number
  }
): NextResponse {
  return NextResponse.json({
    success: false,
    error: 'INSUFFICIENT_CREDITS',
    message: `Insufficient credits. Need ${details.required}, have ${details.available}`,
    details,
    action: 'REDIRECT_TO_PURCHASE'
  }, { status: 402 }) // Payment Required
}

/**
 * Credit validation decorator for API routes
 */
export function withCreditValidation(
  handler: (request: NextRequest, validation: CreditValidationResult) => Promise<NextResponse>,
  calculateCredits: (request: NextRequest) => Promise<number>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Calculate required credits based on request
      const requiredCredits = await calculateCredits(request)

      // Validate credits
      const validation = await validateUserCredits(request, requiredCredits)

      if (!validation.success) {
        if (validation.errorType === 'INSUFFICIENT_CREDITS' && validation.details) {
          return createInsufficientCreditsResponse(validation.details)
        }

        return NextResponse.json({
          success: false,
          error: validation.error
        }, { status: validation.errorType === 'AUTH_REQUIRED' ? 401 : 500 })
      }

      // Call the actual handler with validation result
      return handler(request, validation)

    } catch (error) {
      console.error('❌ Credit validation middleware error:', error)
      return NextResponse.json({
        success: false,
        error: 'Internal server error'
      }, { status: 500 })
    }
  }
}