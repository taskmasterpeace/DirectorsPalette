'use client'

import { supabase } from '@/lib/supabase'

// User Credit Types
export interface UserCredits {
  id: string
  user_id: string
  current_points: number
  monthly_allocation: number
  last_reset_date: string
  tier: 'free' | 'pro' | 'studio'
  total_purchased_points: number
  created_at: string
  updated_at: string
}

export interface UsageLogEntry {
  id: string
  user_id: string
  action_type: string
  model_id: string
  model_name: string
  points_consumed: number
  cost_usd: number
  tokens_used: number
  function_name: string
  success: boolean
  error_message?: string
  created_at: string
}

export interface BoostPurchase {
  id: string
  user_id: string
  pack_type: 'quick' | 'power' | 'mega'
  points_added: number
  cost_usd: number
  payment_id?: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export interface DailyUsage {
  date: string
  total_points: number
  total_cost: number
  action_breakdown: { [action: string]: number }
  model_breakdown: { [model: string]: number }
}

class UserCreditService {
  
  // Initialize user credits when they first sign up
  async initializeUserCredits(userId: string, tier: 'free' | 'pro' | 'studio' = 'pro'): Promise<UserCredits | null> {
    if (!supabase) return null

    const allocation = tier === 'free' ? 50 : tier === 'pro' ? 2500 : 7500

    const { data, error } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        current_points: allocation,
        monthly_allocation: allocation,
        tier,
        total_purchased_points: 0
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to initialize user credits:', error)
      return null
    }

    return data
  }

  // Get user's current credit balance
  async getUserCredits(userId: string): Promise<UserCredits | null> {
    if (!supabase) {
      console.warn('⚠️ Supabase client not initialized')
      return null
    }

    if (!userId) {
      console.warn('⚠️ User ID is required for getUserCredits')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('❌ Failed to get user credits:', {
          error: error.message || error,
          code: error.code,
          details: error.details,
          hint: error.hint,
          userId
        })
        
        // Try to initialize if user doesn't exist
        if (error.code === 'PGRST116') {
          console.log('ℹ️ User credits not found, attempting to initialize for:', userId)
          return await this.initializeUserCredits(userId)
        }
        return null
      }

      return data
    } catch (exception) {
      console.error('💥 Exception in getUserCredits:', {
        exception,
        userId,
        stack: exception instanceof Error ? exception.stack : 'No stack trace'
      })
      return null
    }
  }

  // Deduct points for AI usage
  async deductPoints(
    userId: string,
    points: number,
    actionType: string,
    modelId: string,
    modelName: string,
    costUsd: number,
    functionName: string,
    tokensUsed: number = 0
  ): Promise<{ success: boolean; remainingPoints?: number; error?: string }> {
    if (!supabase) return { success: false, error: 'Database not available' }

    try {
      // Call the database function for atomic deduction + logging
      const { data, error } = await supabase.rpc('deduct_user_points', {
        p_user_id: userId,
        p_points: points,
        p_action_type: actionType,
        p_model_id: modelId,
        p_model_name: modelName,
        p_cost_usd: costUsd,
        p_function_name: functionName
      })

      if (error) {
        console.error('❌ Failed to deduct points:', error)
        return { success: false, error: error.message }
      }

      if (!data) {
        return { success: false, error: 'Insufficient points' }
      }

      // Get updated balance
      const credits = await this.getUserCredits(userId)
      return { 
        success: true, 
        remainingPoints: credits?.current_points || 0 
      }
    } catch (error) {
      console.error('💥 Point deduction exception:', error)
      return { success: false, error: 'Database error' }
    }
  }

  // Get user's usage history
  async getUserUsage(userId: string, days: number = 30): Promise<UsageLogEntry[]> {
    if (!supabase) return []

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('usage_log')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Failed to get user usage:', error)
      return []
    }

    return data || []
  }

  // Get daily usage breakdown for user dashboard
  async getDailyUsage(userId: string, days: number = 7): Promise<DailyUsage[]> {
    if (!supabase) {
      console.warn('⚠️ Supabase client not initialized')
      return []
    }

    if (!userId) {
      console.warn('⚠️ User ID is required for getDailyUsage')
      return []
    }

    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('usage_log')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Failed to get daily usage:', {
          error: error.message || error,
          code: error.code,
          details: error.details,
          hint: error.hint,
          userId,
          days
        })
        return []
      }

      if (!data) {
        console.log('ℹ️ No usage data found for user:', userId)
        return []
      }
    } catch (exception) {
      console.error('💥 Exception in getDailyUsage:', {
        exception,
        userId,
        days,
        stack: exception instanceof Error ? exception.stack : 'No stack trace'
      })
      return []
    }

      // Group by date
      const dailyMap = new Map<string, DailyUsage>()
      
      data?.forEach(entry => {
        try {
          const date = entry.created_at.split('T')[0]
          
          if (!dailyMap.has(date)) {
            dailyMap.set(date, {
              date,
              total_points: 0,
              total_cost: 0,
              action_breakdown: {},
              model_breakdown: {}
            })
          }
          
          const dayData = dailyMap.get(date)!
          dayData.total_points += entry.points_consumed || 0
          dayData.total_cost += parseFloat(entry.cost_usd?.toString() || '0')
          
          // Action breakdown
          if (entry.action_type) {
            dayData.action_breakdown[entry.action_type] = 
              (dayData.action_breakdown[entry.action_type] || 0) + (entry.points_consumed || 0)
          }
          
          // Model breakdown  
          if (entry.model_name) {
            dayData.model_breakdown[entry.model_name] = 
              (dayData.model_breakdown[entry.model_name] || 0) + (entry.points_consumed || 0)
          }
        } catch (entryError) {
          console.warn('⚠️ Error processing usage entry:', { entry, error: entryError })
        }
      })

      return Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date))
  }

  // Add boost pack points
  async addBoostPack(
    userId: string,
    packType: 'quick' | 'power' | 'mega',
    pointsAdded: number,
    costUsd: number,
    paymentId?: string
  ): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    if (!supabase) return { success: false, error: 'Database not available' }

    try {
      // Record the purchase
      const { error: purchaseError } = await supabase
        .from('boost_purchases')
        .insert({
          user_id: userId,
          pack_type: packType,
          points_added: pointsAdded,
          cost_usd: costUsd,
          payment_id: paymentId,
          status: 'completed'
        })

      if (purchaseError) {
        console.error('❌ Failed to record boost purchase:', purchaseError)
        return { success: false, error: purchaseError.message }
      }

      // Add points to user account
      const { data, error } = await supabase
        .from('user_credits')
        .update({
          current_points: supabase.sql`current_points + ${pointsAdded}`,
          total_purchased_points: supabase.sql`total_purchased_points + ${pointsAdded}`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select('current_points')
        .single()

      if (error) {
        console.error('❌ Failed to add boost points:', error)
        return { success: false, error: error.message }
      }

      return { success: true, newBalance: data.current_points }
    } catch (error) {
      console.error('💥 Boost pack exception:', error)
      return { success: false, error: 'Database error' }
    }
  }

  // Get all users for admin (with usage summary)
  async getAllUsersWithUsage(): Promise<Array<UserCredits & { recent_usage: number; total_usage: number }>> {
    if (!supabase) return []

    const { data, error } = await supabase
      .from('user_credits')
      .select(`
        *,
        usage_log!inner(
          points_consumed,
          created_at
        )
      `)

    if (error) {
      console.error('❌ Failed to get users with usage:', error)
      return []
    }

    // Calculate usage summaries
    return data?.map(user => {
      const usage = (user as any).usage_log as UsageLogEntry[]
      const recent = usage.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      
      return {
        ...user,
        recent_usage: recent.reduce((sum, u) => sum + u.points_consumed, 0),
        total_usage: usage.reduce((sum, u) => sum + u.points_consumed, 0)
      }
    }) || []
  }

  // Get system-wide daily usage totals for admin
  async getSystemDailyUsage(days: number = 30): Promise<{ date: string; total_points: number; total_users: number; total_cost: number }[]> {
    if (!supabase) return []

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('usage_log')
      .select('created_at, points_consumed, cost_usd, user_id')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Failed to get system usage:', error)
      return []
    }

    // Group by date
    const dailyMap = new Map<string, { total_points: number; users: Set<string>; total_cost: number }>()
    
    data?.forEach(entry => {
      const date = entry.created_at.split('T')[0]
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          total_points: 0,
          users: new Set(),
          total_cost: 0
        })
      }
      
      const dayData = dailyMap.get(date)!
      dayData.total_points += entry.points_consumed
      dayData.total_cost += parseFloat(entry.cost_usd.toString())
      dayData.users.add(entry.user_id)
    })

    return Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      total_points: data.total_points,
      total_users: data.users.size,
      total_cost: data.total_cost
    })).sort((a, b) => b.date.localeCompare(a.date))
  }
}

// Singleton instance
export const userCreditService = new UserCreditService()