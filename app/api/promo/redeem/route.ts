/**
 * Promo Code Redemption API
 * Handles beta testing credit distribution with tracking
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addCorsHeaders, addSecurityHeaders } from '@/lib/middleware/api-middleware'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 5-letter promo codes for controlled beta access
const PROMO_CODES = {
  // Standard beta testing packages
  'BETA1': {
    credits: 1000,
    description: 'Standard Beta Package',
    maxUses: 25,
    adminOnly: false
  },
  'CREAT': {
    credits: 500,
    description: 'Creator Beta Package',
    maxUses: 50,
    adminOnly: false
  },
  'MEDIA': {
    credits: 750,
    description: 'Media Creator Package',
    maxUses: 30,
    adminOnly: false
  },
  'STUDY': {
    credits: 2000,
    description: 'Studio Package',
    maxUses: 15,
    adminOnly: false
  },

  // Admin and team codes
  'ADMIN': {
    credits: 5000,
    description: 'Admin Testing Package',
    maxUses: 999,
    adminOnly: true
  },
  'ABAKAR': {
    credits: 2500,
    description: 'Developer Testing',
    maxUses: 5,
    adminOnly: false
  },
  'KENIL': {
    credits: 2500,
    description: 'Developer Testing',
    maxUses: 5,
    adminOnly: false
  },

  // Quick testing codes
  'TEST1': {
    credits: 100,
    description: 'Quick Test Package',
    maxUses: 100,
    adminOnly: false
  },
  'TEST2': {
    credits: 250,
    description: 'Extended Test Package',
    maxUses: 50,
    adminOnly: false
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { promoCode } = await request.json()

    if (!promoCode || typeof promoCode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Promo code is required' },
        { status: 400 }
      )
    }

    // Normalize promo code
    const normalizedCode = promoCode.trim().toUpperCase()

    // Check if code exists
    const codeConfig = PROMO_CODES[normalizedCode as keyof typeof PROMO_CODES]
    if (!codeConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid promo code' },
        { status: 400 }
      )
    }

    // For development testing - use default user
    // In production, get from authentication
    let userId = '7cf1a35d-e572-4e39-b4cd-a38d8f10c6d2'

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
      console.log('Using default user for development testing')
    }

    console.log('🎟️ Promo code redemption attempt:', {
      code: normalizedCode,
      userId,
      credits: codeConfig.credits
    })

    // Check if user has already used this promo code
    const { data: existingRedemption, error: checkError } = await supabase
      .from('promo_code_redemptions')
      .select('*')
      .eq('user_id', userId)
      .eq('promo_code', normalizedCode)
      .single()

    if (existingRedemption) {
      return NextResponse.json(
        { success: false, error: 'Promo code already used' },
        { status: 400 }
      )
    }

    // Check total usage of this promo code
    const { data: totalUsage, error: usageError } = await supabase
      .from('promo_code_redemptions')
      .select('id')
      .eq('promo_code', normalizedCode)

    if (usageError) {
      console.error('Error checking promo code usage:', usageError)
    }

    const currentUsage = totalUsage?.length || 0
    if (currentUsage >= codeConfig.maxUses) {
      return NextResponse.json(
        { success: false, error: 'Promo code has reached maximum usage limit' },
        { status: 400 }
      )
    }

    // Get current user credits
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('current_points')
      .eq('user_id', userId)
      .single()

    if (creditsError || !userCredits) {
      // Initialize credits for new user
      const { error: initError } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          current_points: codeConfig.credits
        })

      if (initError) {
        console.error('Failed to initialize user credits:', initError)
        return NextResponse.json(
          { success: false, error: 'Failed to initialize credits' },
          { status: 500 }
        )
      }
    } else {
      // Add credits to existing balance
      const newBalance = userCredits.current_points + codeConfig.credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ current_points: newBalance })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Failed to update credits:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update credits' },
          { status: 500 }
        )
      }
    }

    // Record promo code redemption
    const { error: redemptionError } = await supabase
      .from('promo_code_redemptions')
      .insert({
        user_id: userId,
        promo_code: normalizedCode,
        credits_granted: codeConfig.credits,
        description: codeConfig.description,
        redeemed_at: new Date().toISOString()
      })

    if (redemptionError) {
      console.error('Failed to record redemption:', redemptionError)
      // Continue anyway since credits were added
    }

    console.log('✅ Promo code redeemed successfully:', {
      code: normalizedCode,
      credits: codeConfig.credits,
      usage: currentUsage + 1,
      maxUses: codeConfig.maxUses
    })

    const response = NextResponse.json({
      success: true,
      message: `${codeConfig.credits} credits added to your account!`,
      creditsAdded: codeConfig.credits,
      codeUsage: currentUsage + 1,
      maxUses: codeConfig.maxUses
    })

    return addSecurityHeaders(addCorsHeaders(response))

  } catch (error) {
    console.error('❌ Promo code redemption error:', error)

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