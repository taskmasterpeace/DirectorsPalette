// Boost Packs System - One-time credit purchases

export interface BoostPack {
  id: string
  name: string
  points: number
  price: number
  description: string
  icon: string
  color: string
  popular?: boolean
}

export const BOOST_PACKS: BoostPack[] = [
  {
    id: 'quick-boost',
    name: 'Quick Boost',
    points: 500,
    price: 4,
    description: 'Perfect for finishing that project',
    icon: 'Zap',
    color: 'blue'
  },
  {
    id: 'power-boost', 
    name: 'Power Boost',
    points: 1500,
    price: 10,
    description: 'Serious creative work',
    icon: 'Rocket',
    color: 'purple',
    popular: true
  },
  {
    id: 'mega-boost',
    name: 'Mega Boost', 
    points: 5000,
    price: 30,
    description: 'Maximum creative power',
    icon: 'Sparkles',
    color: 'orange'
  }
]

// Calculate value per point
export function getPointValue(pack: BoostPack): number {
  return pack.price / pack.points
}

// Get best value pack
export function getBestValuePack(): BoostPack {
  return BOOST_PACKS.reduce((best, current) => 
    getPointValue(current) < getPointValue(best) ? current : best
  )
}

// Purchase boost pack
export async function purchaseBoostPack(
  userId: string,
  boostPackId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const pack = BOOST_PACKS.find(p => p.id === boostPackId)
    if (!pack) {
      return { success: false, error: 'Boost pack not found' }
    }

    // Here you would integrate with payment provider (Stripe, etc.)
    // For now, simulate purchase
    console.log(`Purchasing ${pack.name} for $${pack.price}`)
    
    // Add credits to user account
    await addCreditsToUser(userId, pack.points)
    
    // Track purchase for analytics
    await trackBoostPackPurchase(userId, pack)
    
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Purchase failed' 
    }
  }
}

// Add credits to user account
async function addCreditsToUser(userId: string, points: number): Promise<void> {
  // Update user credit balance in database
  // This would integrate with your Supabase user table
  console.log(`Adding ${points} credits to user ${userId}`)
}

// Track boost pack purchases for analytics
async function trackBoostPackPurchase(
  userId: string, 
  pack: BoostPack
): Promise<void> {
  // Analytics tracking for business intelligence
  console.log(`Boost pack purchased: ${pack.name} by ${userId}`)
}

// Get user's credit balance
export async function getUserCredits(userId: string): Promise<number> {
  // Fetch from user database
  // For now, return mock data
  return 2500
}

// Check if user can afford operation
export function canAffordOperation(
  userCredits: number,
  operationCost: number
): { canAfford: boolean; suggestion?: BoostPack } {
  if (userCredits >= operationCost) {
    return { canAfford: true }
  }
  
  const shortfall = operationCost - userCredits
  const suggestedPack = BOOST_PACKS.find(pack => pack.points >= shortfall)
  
  return {
    canAfford: false,
    suggestion: suggestedPack || BOOST_PACKS[2] // Default to Mega Boost
  }
}

// Calculate monthly value comparison
export function calculateMonthlyComparison() {
  return {
    baseSubscription: {
      price: 20,
      points: 2500,
      valuePerPoint: 0.008
    },
    boostPacks: BOOST_PACKS.map(pack => ({
      ...pack,
      valuePerPoint: getPointValue(pack),
      savingsVsBase: ((0.008 - getPointValue(pack)) / 0.008 * 100).toFixed(1)
    }))
  }
}