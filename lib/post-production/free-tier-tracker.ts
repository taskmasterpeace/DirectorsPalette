/**
 * Free tier usage tracker for anonymous users
 * Uses localStorage to persist usage across sessions
 */

const FREE_TIER_KEY = 'dp_free_tier_usage'
const FREE_TIER_DAILY_LIMIT = 3
const FREE_TIER_RESET_HOURS = 24

export interface FreeTierUsage {
  count: number
  firstUsed: string // ISO timestamp
  lastUsed: string // ISO timestamp
  resetAt: string // ISO timestamp
}

export function getFreeTierUsage(): FreeTierUsage | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(FREE_TIER_KEY)
  if (!stored) return null

  try {
    const usage = JSON.parse(stored) as FreeTierUsage

    // Check if reset time has passed
    const resetTime = new Date(usage.resetAt)
    if (new Date() >= resetTime) {
      // Reset the usage
      localStorage.removeItem(FREE_TIER_KEY)
      return null
    }

    return usage
  } catch {
    localStorage.removeItem(FREE_TIER_KEY)
    return null
  }
}

export function canUseFreeTier(): { allowed: boolean; remaining: number; resetAt: string | null } {
  const usage = getFreeTierUsage()

  if (!usage) {
    return {
      allowed: true,
      remaining: FREE_TIER_DAILY_LIMIT,
      resetAt: null
    }
  }

  const remaining = Math.max(0, FREE_TIER_DAILY_LIMIT - usage.count)
  return {
    allowed: remaining > 0,
    remaining,
    resetAt: usage.resetAt
  }
}

export function incrementFreeTierUsage(): boolean {
  if (typeof window === 'undefined') return false

  const current = getFreeTierUsage()
  const now = new Date()
  const resetAt = new Date(now.getTime() + FREE_TIER_RESET_HOURS * 60 * 60 * 1000)

  if (current) {
    // Check if we've hit the limit
    if (current.count >= FREE_TIER_DAILY_LIMIT) {
      return false
    }

    // Increment existing usage
    const updated: FreeTierUsage = {
      ...current,
      count: current.count + 1,
      lastUsed: now.toISOString()
    }

    localStorage.setItem(FREE_TIER_KEY, JSON.stringify(updated))
    return true
  } else {
    // First usage
    const newUsage: FreeTierUsage = {
      count: 1,
      firstUsed: now.toISOString(),
      lastUsed: now.toISOString(),
      resetAt: resetAt.toISOString()
    }

    localStorage.setItem(FREE_TIER_KEY, JSON.stringify(newUsage))
    return true
  }
}

export function formatResetTime(resetAt: string): string {
  const resetTime = new Date(resetAt)
  const now = new Date()
  const hoursRemaining = Math.ceil((resetTime.getTime() - now.getTime()) / (1000 * 60 * 60))

  if (hoursRemaining <= 1) {
    const minutesRemaining = Math.ceil((resetTime.getTime() - now.getTime()) / (1000 * 60))
    return `${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`
  }

  return `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`
}