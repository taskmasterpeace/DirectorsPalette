'use client'

import { useState, useEffect } from 'react'
import { getAdminCreditData } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface UserCredit {
  id: string
  user_id: string
  current_points: number
  monthly_allocation: number
  last_reset_date: string
  tier: 'free' | 'pro' | 'studio'
  total_purchased_points: number
  created_at: string
  updated_at: string
  user_email?: string
  user_name?: string
}

interface UsageEntry {
  id: string
  user_id: string
  action_type: string
  model_id: string
  model_name: string
  points_consumed: number
  cost_usd: number
  function_name: string
  created_at: string
  user_email?: string
}

interface DailyStats {
  date: string
  total_users: number
  total_points_used: number
  total_cost_usd: number
  active_users: number
}

export default function AdminCreditsPage() {
  const [userCredits, setUserCredits] = useState<UserCredit[]>([])
  const [recentUsage, setRecentUsage] = useState<UsageEntry[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const refreshData = async () => {
    setLoading(true)
    try {
      const data = await getAdminCreditData()
      if (data.success) {
        setUserCredits(data.userCredits)
        setRecentUsage(data.recentUsage)
        setDailyStats(data.dailyStats)
      } else {
        console.error('Admin data fetch failed:', data.error)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
  }, [])

  const filteredUsers = (userCredits || []).filter(user => 
    user.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id?.includes(searchTerm)
  )

  const totalStats = {
    totalUsers: (userCredits || []).length,
    totalPoints: (userCredits || []).reduce((sum, user) => sum + (user?.current_points || 0), 0),
    totalSpent: (recentUsage || []).reduce((sum, entry) => sum + (entry?.points_consumed || 0), 0),
    totalRevenue: (recentUsage || []).reduce((sum, entry) => sum + (entry?.cost_usd || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-yellow-400 text-2xl">👑</div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Credit Dashboard</h1>
              <p className="text-slate-400">Monitor user credits and system usage</p>
            </div>
          </div>
          <Button onClick={refreshData} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            🔄 Refresh Data
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                👥 Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                📈 Active Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{totalStats.totalPoints.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                📅 Credits Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{totalStats.totalSpent.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                💰 API Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">${totalStats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">User Credits</TabsTrigger>
            <TabsTrigger value="usage" className="data-[state=active]:bg-slate-700">Recent Usage</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">Daily Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Input
                  placeholder="🔍 Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="text-slate-400">
                {filteredUsers.length} of {userCredits.length} users
              </div>
            </div>

            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {user.user_email || (user.user_id?.slice(0, 8) || 'Unknown')}
                          </span>
                          <Badge variant={user.tier === 'pro' ? 'default' : 'secondary'} className="text-xs">
                            {user.tier.toUpperCase()}
                          </Badge>
                          {user.user_email === 'taskmasterpeace@gmail.com' && (
                            <Badge className="bg-yellow-600 text-xs">👑 ADMIN</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">
                          ID: {user.user_id?.slice(0, 8) || 'Unknown'}... • Last updated: {new Date(user.updated_at || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-lg font-semibold text-blue-400">
                          {user.current_points.toLocaleString()} credits
                        </div>
                        <div className="text-sm text-slate-400">
                          Monthly: {user.monthly_allocation.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-400">
                          Purchased: {user.total_purchased_points.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <div className="text-slate-400 mb-4">
              Recent {recentUsage.length} transactions (last 100)
            </div>
            <div className="grid gap-2">
              {recentUsage.map((entry) => (
                <Card key={entry.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {entry.user_email || (entry.user_id?.slice(0, 8) || 'Unknown')}
                          </span>
                          <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                            {entry.model_name}
                          </Badge>
                          <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                            {entry.action_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">
                          {entry.function_name} • {new Date(entry.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-lg font-semibold text-red-400">
                          -{entry.points_consumed} credits
                        </div>
                        <div className="text-sm text-slate-400">
                          API Cost: ${entry.cost_usd.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="text-slate-400 mb-4">
              Daily usage analytics (last 30 days)
            </div>
            <div className="grid gap-4">
              {dailyStats.slice(0, 14).map((stat) => (
                <Card key={stat.date} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-white">
                          📅 {new Date(stat.date).toLocaleDateString()}
                        </div>
                        <p className="text-sm text-slate-400">
                          👥 {stat.active_users} active users
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-lg font-semibold text-red-400">
                          -{stat.total_points_used.toLocaleString()} credits
                        </div>
                        <div className="text-sm text-slate-400">
                          💰 API Cost: ${stat.total_cost_usd.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="text-white text-center">
                <div className="text-2xl mb-2">⏳</div>
                <div>Loading admin data...</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}