'use server'

import { userCreditService } from '@/lib/credits/user-credits'
import { OPENROUTER_MODELS } from '@/lib/ai-providers/openrouter-config'
import { getCurrentUser } from '@/lib/supabase'

// Calculate points based on model and usage
export function calculatePoints(modelId: string, tokensUsed: number = 0): number {
  const model = OPENROUTER_MODELS[modelId]
  if (!model) return 15 // Default fallback
  
  if (model.isFree) return 0 // FREE models cost 0 points
  
  // Calculate based on cost per 1M tokens
  const promptCost = (tokensUsed / 1000000) * model.pricing.prompt
  const completionCost = (tokensUsed / 1000000) * model.pricing.completion
  const totalCost = promptCost + completionCost
  
  // Convert to points (1 point = $0.01)
  return Math.max(1, Math.ceil(totalCost * 100))
}

// Usage tracking wrapper for AI actions
export async function withUsageTracking<T>(
  actionType: string,
  functionName: string,
  modelId: string,
  action: () => Promise<T>,
  estimatedTokens: number = 1000
): Promise<{ success: boolean; data?: T; error?: string; remainingPoints?: number }> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Calculate estimated points
    const estimatedPoints = calculatePoints(modelId, estimatedTokens)
    const model = OPENROUTER_MODELS[modelId]
    
    // Check if user has enough points (unless it's a FREE model)
    if (!model?.isFree) {
      const userCredits = await userCreditService.getUserCredits(user.id)
      if (!userCredits || userCredits.current_points < estimatedPoints) {
        return { 
          success: false, 
          error: `Insufficient points. Need ${estimatedPoints}, have ${userCredits?.current_points || 0}` 
        }
      }
    }

    // Execute the AI action
    const startTime = Date.now()
    const result = await action()
    const endTime = Date.now()
    
    // Deduct points and log usage (only for non-free models)
    if (!model?.isFree) {
      const actualPoints = estimatedPoints // TODO: Get actual tokens from response
      const actualCost = actualPoints * 0.01 // 1 point = $0.01
      
      const deductionResult = await userCreditService.deductPoints(
        user.id,
        actualPoints,
        actionType,
        modelId,
        model?.name || 'Unknown Model',
        actualCost,
        functionName,
        estimatedTokens
      )
      
      if (!deductionResult.success) {
        console.error('❌ Failed to deduct points after successful AI action:', deductionResult.error)
        // TODO: Handle this edge case - possibly refund or alert admin
      }
      
      console.log(`✅ ${actionType} completed - ${actualPoints} points deducted for ${user.id}`)
      
      return { 
        success: true, 
        data: result, 
        remainingPoints: deductionResult.remainingPoints 
      }
    } else {
      // FREE model - log usage but don't deduct points
      console.log(`✅ ${actionType} completed with FREE model ${modelId}`)
      
      // Still log the usage for analytics
      await userCreditService.deductPoints(
        user.id,
        0, // 0 points for FREE models
        actionType,
        modelId,
        model?.name || 'Unknown Free Model',
        0, // $0 cost
        functionName,
        estimatedTokens
      )
      
      return { success: true, data: result }
    }
    
  } catch (error) {
    console.error(`💥 ${actionType} failed:`, error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'AI action failed' 
    }
  }
}

// Specific wrappers for different action types
export async function withStoryTracking<T>(
  modelId: string,
  action: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string; remainingPoints?: number }> {
  return withUsageTracking('story-breakdown', 'story-breakdown', modelId, action, 3000)
}

export async function withMusicVideoTracking<T>(
  modelId: string,
  action: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string; remainingPoints?: number }> {
  return withUsageTracking('music-video-analysis', 'music-analysis', modelId, action, 2500)
}

export async function withCommercialTracking<T>(
  modelId: string,
  action: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string; remainingPoints?: number }> {
  return withUsageTracking('commercial-generation', 'commercial-generation', modelId, action, 2000)
}

export async function withChildrenBookTracking<T>(
  modelId: string,
  action: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string; remainingPoints?: number }> {
  return withUsageTracking('children-book-generation', 'children-book-generation', modelId, action, 2500)
}

export async function withDirectorTracking<T>(
  modelId: string,
  action: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string; remainingPoints?: number }> {
  return withUsageTracking('director-creation', 'director-creation', modelId, action, 1500)
}

export async function withEntityTracking<T>(
  modelId: string,
  action: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string; remainingPoints?: number }> {
  return withUsageTracking('entity-extraction', 'entity-extraction', modelId, action, 800)
}