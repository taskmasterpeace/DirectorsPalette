/**
 * API Call Monitoring and Logging System
 * Tracks all API usage for admin monitoring
 */

import { type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface APICallLog {
  endpoint: string
  method: string
  userId?: string
  apiKeyUsed: boolean
  apiKeyValid?: boolean
  callSource: 'internal' | 'external' | 'unknown'
  origin?: string
  userAgent?: string
  ipAddress?: string
  referer?: string
  statusCode: number
  responseTimeMs: number
  creditsConsumed?: number
  modelUsed?: string
  operationType?: string
  success: boolean
  errorMessage?: string
}

/**
 * Log an API call to the database for monitoring
 */
export async function logApiCall(
  request: NextRequest,
  response: {
    status: number
    responseTimeMs: number
    success: boolean
    errorMessage?: string
  },
  metadata?: {
    userId?: string
    creditsConsumed?: number
    modelUsed?: string
    operationType?: string
    apiKeyUsed?: boolean
    apiKeyValid?: boolean
  }
): Promise<void> {
  try {
    const url = new URL(request.url)
    const origin = request.headers.get('origin')
    const userAgent = request.headers.get('user-agent')
    const referer = request.headers.get('referer')
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')

    // Determine call source
    let callSource: 'internal' | 'external' | 'unknown' = 'unknown'
    if (origin?.includes('localhost') || url.hostname === 'localhost') {
      callSource = 'internal'
    } else if (metadata?.apiKeyUsed) {
      callSource = 'external'
    } else if (origin) {
      callSource = 'external'
    }

    // Extract IP address
    let ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
    if (ipAddress === 'unknown' && url.hostname === 'localhost') {
      ipAddress = '127.0.0.1'
    }

    const logEntry: APICallLog = {
      endpoint: url.pathname,
      method: request.method,
      userId: metadata?.userId,
      apiKeyUsed: metadata?.apiKeyUsed || false,
      apiKeyValid: metadata?.apiKeyValid,
      callSource,
      origin: origin || undefined,
      userAgent: userAgent || undefined,
      ipAddress,
      referer: referer || undefined,
      statusCode: response.status,
      responseTimeMs: response.responseTimeMs,
      creditsConsumed: metadata?.creditsConsumed,
      modelUsed: metadata?.modelUsed,
      operationType: metadata?.operationType,
      success: response.success,
      errorMessage: response.errorMessage
    }

    // Insert into database (don't await to avoid slowing down API responses)
    supabase
      .from('api_call_logs')
      .insert({
        endpoint: logEntry.endpoint,
        method: logEntry.method,
        user_id: logEntry.userId,
        api_key_used: logEntry.apiKeyUsed,
        api_key_valid: logEntry.apiKeyValid,
        call_source: logEntry.callSource,
        origin: logEntry.origin,
        user_agent: logEntry.userAgent,
        ip_address: logEntry.ipAddress,
        referer: logEntry.referer,
        status_code: logEntry.statusCode,
        response_time_ms: logEntry.responseTimeMs,
        credits_consumed: logEntry.creditsConsumed,
        model_used: logEntry.modelUsed,
        operation_type: logEntry.operationType,
        success: logEntry.success,
        error_message: logEntry.errorMessage
      })
      .then(({ error }) => {
        if (error) {
          console.error('Failed to log API call:', error)
        }
      })

    // Console log for immediate debugging
    console.log('📊 API Call:', {
      endpoint: logEntry.endpoint,
      method: logEntry.method,
      source: logEntry.callSource,
      status: logEntry.statusCode,
      responseTime: `${logEntry.responseTimeMs}ms`,
      credits: logEntry.creditsConsumed || 0,
      apiKey: logEntry.apiKeyUsed ? '✅ Used' : '❌ None'
    })

  } catch (error) {
    console.error('Error logging API call:', error)
  }
}

/**
 * Middleware wrapper that automatically logs API calls
 */
export function withApiLogging(
  handler: (request: NextRequest) => Promise<Response>,
  operationType: string = 'unknown'
) {
  return async (request: NextRequest): Promise<Response> => {
    const startTime = Date.now()
    let response: Response
    let success = true
    let errorMessage: string | undefined

    try {
      response = await handler(request)
      success = response.status >= 200 && response.status < 400
    } catch (error) {
      success = false
      errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw error
    } finally {
      const responseTimeMs = Date.now() - startTime

      // Check if API key was used
      const apiKeyUsed = !!(
        request.headers.get('x-api-key') ||
        request.headers.get('authorization')?.includes('dp_') ||
        request.headers.get('api-key')
      )

      // Log the API call
      logApiCall(
        request,
        {
          status: response?.status || 500,
          responseTimeMs,
          success,
          errorMessage
        },
        {
          operationType,
          apiKeyUsed,
          apiKeyValid: apiKeyUsed // Simplified for now
        }
      )
    }

    return response
  }
}

/**
 * Enhanced logging for generation endpoints
 */
export function logGenerationCall(
  request: NextRequest,
  response: Response,
  metadata: {
    userId?: string
    creditsConsumed: number
    modelUsed: string
    operationType: 'video_generation' | 'image_generation'
    success: boolean
    responseTimeMs: number
    errorMessage?: string
    apiKeyUsed?: boolean
  }
): void {
  logApiCall(
    request,
    {
      status: response.status,
      responseTimeMs: metadata.responseTimeMs,
      success: metadata.success,
      errorMessage: metadata.errorMessage
    },
    {
      userId: metadata.userId,
      creditsConsumed: metadata.creditsConsumed,
      modelUsed: metadata.modelUsed,
      operationType: metadata.operationType,
      apiKeyUsed: metadata.apiKeyUsed,
      apiKeyValid: metadata.apiKeyUsed
    }
  )
}