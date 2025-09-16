/**
 * Credit Validation Utilities
 * Handles credit checking, validation, and cost calculations
 */

export interface CreditValidationResult {
  canProceed: boolean
  required: number
  available: number
  shortfall?: number
  alternatives?: AlternativeOption[]
}

export interface AlternativeOption {
  label: string
  credits: number
  description: string
  settings: Record<string, any>
}

export interface CreditCheckOptions {
  operation: string
  baseCredits: number
  duration?: number
  resolution?: string
  model?: string
  includeAlternatives?: boolean
}

/**
 * Fetches current user credits from Supabase
 */
export async function fetchUserCredits(): Promise<number> {
  try {
    const response = await fetch('/api/user/credits', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // Include cookies for session auth
    })

    if (!response.ok) {
      console.error('Failed to fetch user credits:', response.status)
      return 0
    }

    const data = await response.json()
    return data.credits || 0
  } catch (error) {
    console.error('Error fetching user credits:', error)
    return 0
  }
}

/**
 * Calculates credit cost based on operation parameters
 */
export function calculateCreditCost(options: CreditCheckOptions): number {
  const { baseCredits, duration = 5, resolution = '720p', model = 'lite' } = options

  let cost = baseCredits

  // Duration multiplier
  cost *= duration

  // Resolution multiplier
  const resolutionMultiplier = {
    '480p': 1,
    '720p': 1.5,
    '1080p': 2
  }[resolution] || 1.5

  cost = Math.ceil(cost * resolutionMultiplier)

  // Model multiplier
  const modelMultiplier = {
    'lite': 1,
    'pro': 2
  }[model.includes('lite') ? 'lite' : 'pro'] || 1

  cost = Math.ceil(cost * modelMultiplier)

  return cost
}

/**
 * Generates alternative options with lower credit costs
 */
export function generateAlternatives(
  originalSettings: Record<string, any>,
  operation: string
): AlternativeOption[] {
  const alternatives: AlternativeOption[] = []
  const { duration, resolution, model } = originalSettings

  // Alternative 1: Reduce duration
  if (duration > 3) {
    const newDuration = Math.max(3, Math.floor(duration / 2))
    const cost = calculateCreditCost({
      operation,
      baseCredits: 15,
      duration: newDuration,
      resolution,
      model
    })

    alternatives.push({
      label: `${newDuration}-second video`,
      credits: cost,
      description: `Shorter video with same quality (${resolution})`,
      settings: { ...originalSettings, duration: newDuration }
    })
  }

  // Alternative 2: Lower resolution
  if (resolution !== '480p') {
    const newResolution = resolution === '1080p' ? '720p' : '480p'
    const cost = calculateCreditCost({
      operation,
      baseCredits: 15,
      duration,
      resolution: newResolution,
      model
    })

    alternatives.push({
      label: `${newResolution} video`,
      credits: cost,
      description: `Same duration (${duration}s) with lower resolution`,
      settings: { ...originalSettings, resolution: newResolution }
    })
  }

  // Alternative 3: Combine both reductions
  if (duration > 3 && resolution !== '480p') {
    const newDuration = Math.max(3, Math.floor(duration / 2))
    const newResolution = '480p'
    const cost = calculateCreditCost({
      operation,
      baseCredits: 15,
      duration: newDuration,
      resolution: newResolution,
      model
    })

    alternatives.push({
      label: `${newDuration}s ${newResolution} video`,
      credits: cost,
      description: `Budget option - shorter and lower resolution`,
      settings: { ...originalSettings, duration: newDuration, resolution: newResolution }
    })
  }

  return alternatives.sort((a, b) => a.credits - b.credits)
}

/**
 * Validates if user has enough credits for an operation
 */
export async function validateCredits(options: CreditCheckOptions): Promise<CreditValidationResult> {
  const required = calculateCreditCost(options)
  const available = await fetchUserCredits()
  const canProceed = available >= required

  const result: CreditValidationResult = {
    canProceed,
    required,
    available
  }

  if (!canProceed) {
    result.shortfall = required - available

    if (options.includeAlternatives) {
      result.alternatives = generateAlternatives({
        duration: options.duration,
        resolution: options.resolution,
        model: options.model
      }, options.operation)
    }
  }

  return result
}

/**
 * Handles credit validation with automatic redirect for insufficient credits
 */
export async function validateCreditsWithRedirect(
  options: CreditCheckOptions,
  router: any,
  currentPath: string
): Promise<CreditValidationResult | null> {
  const result = await validateCredits(options)

  // If user doesn't have enough credits, check if they can afford any reasonable alternative
  if (!result.canProceed) {
    // Generate alternatives to see if user can afford any option
    const alternatives = generateAlternatives({
      duration: options.duration,
      resolution: options.resolution,
      model: options.model
    }, options.operation)

    // Find the cheapest alternative
    const cheapestAlternative = alternatives.length > 0
      ? Math.min(...alternatives.map(alt => alt.credits))
      : result.required

    // If user can't afford even the cheapest alternative, redirect to purchase
    if (result.available < cheapestAlternative) {
      const purchaseUrl = `/credits?required=${result.required}&operation=${encodeURIComponent(options.operation)}&return=${encodeURIComponent(currentPath)}`
      router.push(purchaseUrl)
      return null // Indicates redirect happened
    }
  }

  return result
}

/**
 * Pre-generation credit check hook for React components
 */
export function useCreditValidation() {
  const checkCredits = async (options: CreditCheckOptions): Promise<CreditValidationResult> => {
    return validateCredits({ ...options, includeAlternatives: true })
  }

  return { checkCredits }
}

/**
 * Real-time credit cost calculator for UI display
 */
export function useRealTimeCostCalculator(settings: Record<string, any>) {
  const calculateCost = () => {
    return calculateCreditCost({
      operation: 'video generation',
      baseCredits: 15,
      duration: settings.duration || 5,
      resolution: settings.resolution || '720p',
      model: settings.model || 'lite'
    })
  }

  return calculateCost()
}