/**
 * Environment Variable Security Checker
 * Validates that all required environment variables are present and secure
 */

interface EnvSecurityCheck {
  isSecure: boolean
  warnings: string[]
  errors: string[]
  recommendations: string[]
}

/**
 * Check environment variable security
 */
export function checkEnvironmentSecurity(): EnvSecurityCheck {
  const warnings: string[] = []
  const errors: string[] = []
  const recommendations: string[] = []

  // Required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'REPLICATE_API_TOKEN'
  ]

  // Check for missing required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }

  // Check for insecure values
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    warnings.push('OPENAI_API_KEY does not have expected format (should start with sk-)')
  }

  if (process.env.REPLICATE_API_TOKEN && !process.env.REPLICATE_API_TOKEN.startsWith('r8_')) {
    warnings.push('REPLICATE_API_TOKEN does not have expected format (should start with r8_)')
  }

  // Check for development/test values in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')) {
      errors.push('Using localhost Supabase URL in production')
    }

    if (process.env.OPENAI_API_KEY?.includes('test') || process.env.OPENAI_API_KEY?.includes('dev')) {
      warnings.push('Using test/dev OpenAI key in production')
    }
  }

  // Security recommendations
  if (!process.env.API_RATE_LIMIT_ENABLED) {
    recommendations.push('Enable API rate limiting by setting API_RATE_LIMIT_ENABLED=true')
  }

  if (!process.env.CORS_ORIGIN) {
    recommendations.push('Set CORS_ORIGIN to restrict cross-origin requests')
  }

  if (!process.env.API_KEY_ENCRYPTION_KEY) {
    recommendations.push('Set API_KEY_ENCRYPTION_KEY for additional API key security')
  }

  const isSecure = errors.length === 0

  return {
    isSecure,
    warnings,
    errors,
    recommendations
  }
}

/**
 * Log security check results (for development)
 */
export function logSecurityStatus(): void {
  if (process.env.NODE_ENV === 'development') {
    const check = checkEnvironmentSecurity()

    if (!check.isSecure) {
      console.error('🚨 SECURITY ERRORS:')
      check.errors.forEach(error => console.error(`  ❌ ${error}`))
    }

    if (check.warnings.length > 0) {
      console.warn('⚠️  SECURITY WARNINGS:')
      check.warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`))
    }

    if (check.recommendations.length > 0) {
      console.info('💡 SECURITY RECOMMENDATIONS:')
      check.recommendations.forEach(rec => console.info(`  💡 ${rec}`))
    }

    if (check.isSecure && check.warnings.length === 0) {
      console.log('✅ Environment security check passed')
    }
  }
}

/**
 * Middleware to block requests if environment is insecure
 */
export function requireSecureEnvironment(): boolean {
  const check = checkEnvironmentSecurity()
  return check.isSecure
}

/**
 * Get sanitized environment info for debugging (no secrets)
 */
export function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasReplicate: !!process.env.REPLICATE_API_TOKEN,
    hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    rateLimitEnabled: process.env.API_RATE_LIMIT_ENABLED === 'true',
    corsOrigin: process.env.CORS_ORIGIN || 'not-set'
  }
}