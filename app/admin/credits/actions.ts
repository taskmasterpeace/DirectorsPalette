'use server'

import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/supabase'

// Create admin client with service role for database access
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getAdminCreditData() {
  try {
    // For now, allow admin access (you can add proper auth later)
    // TODO: Add proper admin authentication check

    // Fetch user credits with auth user data
    const { data: userCredits, error: creditsError } = await adminSupabase
      .from('user_credits')
      .select(`
        *
      `)
      .order('updated_at', { ascending: false })

    if (creditsError) {
      throw new Error(`Credits fetch error: ${creditsError.message}`)
    }

    // Fetch auth users for email mapping
    const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers()
    
    if (authError) {
      console.warn('Auth users fetch error:', authError.message)
    }

    // Map user emails to credit records
    const userEmailMap = (authUsers?.users || []).reduce((acc, user) => {
      acc[user.id] = {
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0]
      }
      return acc
    }, {} as Record<string, { email: string; name: string }>)

    const enrichedCredits = (userCredits || []).map(credit => ({
      ...credit,
      user_email: userEmailMap[credit.user_id]?.email || 'Unknown',
      user_name: userEmailMap[credit.user_id]?.name || 'Unknown'
    }))

    // Fetch recent usage logs
    const { data: usage, error: usageError } = await adminSupabase
      .from('usage_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (usageError) {
      throw new Error(`Usage fetch error: ${usageError.message}`)
    }

    const enrichedUsage = (usage || []).map(entry => ({
      ...entry,
      user_email: userEmailMap[entry.user_id]?.email || 'Unknown'
    }))

    // Calculate daily stats for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentUsage, error: recentError } = await adminSupabase
      .from('usage_log')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (recentError) {
      throw new Error(`Recent usage fetch error: ${recentError.message}`)
    }

    // Group by date for analytics
    const dailyStats = (recentUsage || []).reduce((acc, entry) => {
      const date = new Date(entry.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          users: new Set(),
          total_points_used: 0,
          total_cost_usd: 0
        }
      }
      acc[date].users.add(entry.user_id)
      acc[date].total_points_used += entry.points_consumed
      acc[date].total_cost_usd += entry.cost_usd
      return acc
    }, {} as any)

    const formattedDailyStats = Object.values(dailyStats).map((stat: any) => ({
      date: stat.date,
      total_users: stat.users.size,
      total_points_used: stat.total_points_used,
      total_cost_usd: stat.total_cost_usd,
      active_users: stat.users.size
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return {
      success: true,
      userCredits: enrichedCredits,
      recentUsage: enrichedUsage,
      dailyStats: formattedDailyStats,
      totalStats: {
        totalUsers: enrichedCredits.length,
        totalPoints: enrichedCredits.reduce((sum, user) => sum + user.current_points, 0),
        totalSpent: enrichedUsage.reduce((sum, entry) => sum + entry.points_consumed, 0),
        totalRevenue: enrichedUsage.reduce((sum, entry) => sum + entry.cost_usd, 0)
      }
    }
  } catch (error) {
    console.error('Admin credit data fetch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      userCredits: [],
      recentUsage: [],
      dailyStats: [],
      totalStats: { totalUsers: 0, totalPoints: 0, totalSpent: 0, totalRevenue: 0 }
    }
  }
}