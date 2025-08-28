'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Zap, 
  TrendingUp, 
  Calendar, 
  Activity, 
  Sparkles,
  BarChart3,
  Clock,
  Star
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { userCreditService, type UserCredits, type DailyUsage } from '@/lib/credits/user-credits'
import { BoostPacks } from '@/components/billing/BoostPacks'

export function UserDashboard() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        const [creditsData, usageData] = await Promise.all([
          userCreditService.getUserCredits(user.id),
          userCreditService.getDailyUsage(user.id, 7) // Last 7 days
        ])
        
        setCredits(creditsData)
        setDailyUsage(usageData)
      } catch (error) {
        console.error('❌ Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user?.id])

  const handleBoostPurchase = async (packType: 'quick' | 'power' | 'mega') => {
    if (!user?.id) return

    const packConfig = {
      quick: { points: 500, cost: 4 },
      power: { points: 1500, cost: 10 },
      mega: { points: 5000, cost: 30 }
    }

    const config = packConfig[packType]
    
    // TODO: Integrate with Stripe payment
    const result = await userCreditService.addBoostPack(
      user.id,
      packType,
      config.points,
      config.cost,
      `demo-payment-${Date.now()}` // Replace with real Stripe payment ID
    )

    if (result.success && result.newBalance) {
      // Refresh credits
      const updatedCredits = await userCreditService.getUserCredits(user.id)
      setCredits(updatedCredits)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    )
  }

  const creditPercentage = credits ? (credits.current_points / credits.monthly_allocation) * 100 : 0
  const totalUsedThisMonth = credits ? credits.monthly_allocation - credits.current_points : 0

  return (
    <div className="space-y-6">
      {/* Credit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-400">Current Points</CardTitle>
            <Zap className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{credits?.current_points.toLocaleString() || 0}</div>
            <p className="text-xs text-amber-300 mt-1">
              of {credits?.monthly_allocation.toLocaleString() || 0} monthly
            </p>
            <Progress value={creditPercentage} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Used This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalUsedThisMonth.toLocaleString()}</div>
            <p className="text-xs text-blue-300 mt-1">
              {Math.round((totalUsedThisMonth / (credits?.monthly_allocation || 1)) * 100)}% of allocation
            </p>
            <Badge className="mt-2 bg-blue-900/30 text-blue-300 border-blue-400/30">
              {credits?.tier.toUpperCase()} Tier
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Boost Packs</CardTitle>
            <Sparkles className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{credits?.total_purchased_points.toLocaleString() || 0}</div>
            <p className="text-xs text-green-300 mt-1">lifetime purchased</p>
            <Button 
              size="sm" 
              className="mt-2 bg-green-700 hover:bg-green-600 text-white"
              onClick={() => {/* TODO: Open boost pack modal */}}
            >
              Buy Boost
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Usage Analytics */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Daily Usage
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Daily Usage Chart */}
        <TabsContent value="daily" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Last 7 Days Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyUsage.length > 0 ? (
                <div className="space-y-4">
                  {dailyUsage.map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-slate-400 text-sm font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-white font-medium">{day.total_points} points</div>
                          <div className="text-slate-400 text-xs">${day.total_cost.toFixed(3)} cost</div>
                        </div>
                        <div className="w-16 bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                            style={{ width: `${Math.min((day.total_points / Math.max(...dailyUsage.map(d => d.total_points))) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  No usage data available for the last 7 days
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Breakdown */}
        <TabsContent value="breakdown" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Usage by Action Type</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyUsage.length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(
                    dailyUsage.reduce((acc, day) => {
                      Object.entries(day.action_breakdown).forEach(([action, points]) => {
                        acc[action] = (acc[action] || 0) + points
                      })
                      return acc
                    }, {} as { [action: string]: number })
                  ).map(([action, points]) => (
                    <div key={action} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div className="text-slate-300 capitalize">{action.replace('-', ' ')}</div>
                      <div className="text-white font-medium">{points} points</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  No breakdown data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage History */}
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-slate-400 text-center py-8">
                Detailed usage history will be loaded here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Boost Packs Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Need More Points?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BoostPacks onPurchase={handleBoostPurchase} />
        </CardContent>
      </Card>
    </div>
  )
}