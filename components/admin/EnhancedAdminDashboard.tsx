'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  Users, 
  Activity, 
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  Calendar,
  DollarSign,
  Server,
  Wifi,
  WifiOff
} from 'lucide-react'
import { userCreditService, type UserCredits } from '@/lib/credits/user-credits'
import { useAPIHealth, type APIHealthSummary } from '@/lib/monitoring/api-health'
import { 
  OPENROUTER_MODELS, 
  FUNCTION_MODEL_CONFIG,
  getAllFunctionTypes,
  getModelsForFunction,
  saveAdminModelConfig,
  loadAdminModelConfig,
  type AdminModelSelection
} from '@/lib/ai-providers/openrouter-config'

export function EnhancedAdminDashboard() {
  const [users, setUsers] = useState<Array<UserCredits & { recent_usage: number; total_usage: number }>>([])
  const [systemUsage, setSystemUsage] = useState<Array<{ date: string; total_points: number; total_users: number; total_cost: number }>>([])
  const [modelConfig, setModelConfig] = useState<AdminModelSelection>({})
  const [isLoading, setIsLoading] = useState(true)
  const { healthSummary, isLoading: healthLoading, refreshHealth } = useAPIHealth()

  useEffect(() => {
    const loadAdminData = async () => {
      setIsLoading(true)
      try {
        const [usersData, systemData] = await Promise.all([
          userCreditService.getAllUsersWithUsage(),
          userCreditService.getSystemDailyUsage(30)
        ])
        
        setUsers(usersData)
        setSystemUsage(systemData)
        
        // Load current model configuration
        const currentConfig = loadAdminModelConfig()
        setModelConfig(currentConfig)
      } catch (error) {
        console.error('❌ Failed to load admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminData()
  }, [])

  const handleModelConfigChange = (functionName: string, modelId: string) => {
    const newConfig = { ...modelConfig, [functionName]: modelId }
    setModelConfig(newConfig)
    saveAdminModelConfig(newConfig)
  }

  const totalActiveUsers = users.length
  const totalSystemPoints = systemUsage.reduce((sum, day) => sum + day.total_points, 0)
  const totalSystemCost = systemUsage.reduce((sum, day) => sum + day.total_cost, 0)
  const avgPointsPerUser = totalActiveUsers > 0 ? Math.round(totalSystemPoints / totalActiveUsers) : 0

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Director's Palette Admin</h1>
            <p className="text-slate-400">System-wide monitoring and configuration</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={refreshHealth}
          disabled={healthLoading}
          className="text-slate-300 hover:text-white"
        >
          <Activity className="w-4 h-4 mr-2" />
          {healthLoading ? 'Checking...' : 'Refresh APIs'}
        </Button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalActiveUsers}</div>
            <p className="text-xs text-blue-300 mt-1">with recent activity</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-400">Total Points Used</CardTitle>
            <Zap className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSystemPoints.toLocaleString()}</div>
            <p className="text-xs text-amber-300 mt-1">last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">System Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalSystemCost.toFixed(2)}</div>
            <p className="text-xs text-green-300 mt-1">last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">Avg per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{avgPointsPerUser}</div>
            <p className="text-xs text-purple-300 mt-1">points/month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* AI Models Configuration */}
        <TabsContent value="models">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                System-Wide Model Configuration
              </CardTitle>
              <p className="text-slate-400 text-sm">Set default models for each AI function across the platform</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {getAllFunctionTypes().map(functionName => {
                const config = FUNCTION_MODEL_CONFIG[functionName]
                const availableModels = getModelsForFunction(functionName)
                const currentModel = modelConfig[functionName] || config.defaultModel
                
                return (
                  <div key={functionName} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium capitalize">
                          {functionName.replace('-', ' ')}
                        </Label>
                        <p className="text-slate-400 text-xs">{config.description}</p>
                      </div>
                      <Badge className="bg-blue-900/30 text-blue-300 border-blue-400/30">
                        {OPENROUTER_MODELS[currentModel]?.name || 'Unknown Model'}
                      </Badge>
                    </div>
                    
                    <Select 
                      value={currentModel} 
                      onValueChange={(value) => handleModelConfigChange(functionName, value)}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-600">
                        {availableModels.map(model => (
                          <SelectItem key={model.id} value={model.id} className="text-white">
                            <div className="flex items-center justify-between w-full">
                              <span>{model.name}</span>
                              {model.isFree && <Badge className="ml-2 bg-green-700 text-green-200">FREE</Badge>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}
              
              <div className="mt-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
                  <Crown className="w-4 h-4" />
                  Configuration Saved
                </div>
                <p className="text-amber-300 text-xs">
                  Model selections are automatically saved and applied system-wide. 
                  All AI functions will use your selected models.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                User Management & Points Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user.id} className="p-4 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.user_id.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.user_id}</div>
                            <div className="text-slate-400 text-xs">
                              Tier: {user.tier.toUpperCase()} | 
                              Last Reset: {new Date(user.last_reset_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-white font-medium">{user.current_points.toLocaleString()} points</div>
                          <div className="text-slate-400 text-xs">
                            Used: {user.recent_usage} (7d) | Total: {user.total_usage}
                          </div>
                          <Progress 
                            value={(user.current_points / user.monthly_allocation) * 100} 
                            className="w-32 h-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {users.length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                      No users found or database not configured
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health */}
        <TabsContent value="system">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Health Status */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-green-400" />
                  API Health Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {healthLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                  </div>
                ) : healthSummary ? (
                  <>
                    {/* OpenRouter Status */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            healthSummary.openrouter.overall === 'healthy' ? 'bg-green-400' :
                            healthSummary.openrouter.overall === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                          }`} />
                          <span className="text-white font-medium">OpenRouter</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm">{Math.round(healthSummary.openrouter.avgResponseTime)}ms</div>
                          <div className="text-slate-400 text-xs">{healthSummary.openrouter.uptime.toFixed(1)}% uptime</div>
                        </div>
                      </div>
                      
                      <div className="ml-5 space-y-2">
                        {Object.entries(healthSummary.openrouter.models).map(([modelId, status]) => (
                          <div key={modelId} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">{status.modelId}</span>
                            <div className="flex items-center gap-2">
                              {status.status === 'healthy' ? 
                                <CheckCircle className="w-3 h-3 text-green-400" /> :
                                status.status === 'degraded' ?
                                <AlertTriangle className="w-3 h-3 text-yellow-400" /> :
                                <XCircle className="w-3 h-3 text-red-400" />
                              }
                              <span className="text-slate-400">{Math.round(status.responseTime)}ms</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Replicate Status */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            healthSummary.replicate.overall === 'healthy' ? 'bg-green-400' :
                            healthSummary.replicate.overall === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                          }`} />
                          <span className="text-white font-medium">Replicate</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm">{Math.round(healthSummary.replicate.avgResponseTime)}ms</div>
                          <div className="text-slate-400 text-xs">{healthSummary.replicate.uptime.toFixed(1)}% uptime</div>
                        </div>
                      </div>
                      
                      <div className="ml-5 space-y-2">
                        {Object.entries(healthSummary.replicate.services).map(([serviceId, status]) => (
                          <div key={serviceId} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">{status.modelId}</span>
                            <div className="flex items-center gap-2">
                              {status.status === 'healthy' ? 
                                <Wifi className="w-3 h-3 text-green-400" /> :
                                <WifiOff className="w-3 h-3 text-red-400" />
                              }
                              <span className="text-slate-400">{Math.round(status.responseTime)}ms</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400 py-8">
                    Click refresh to check API health status
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily System Usage */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Daily System Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemUsage.slice(0, 7).map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-slate-400 text-sm">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <Badge className="bg-slate-700 text-slate-300 text-xs">
                          {day.total_users} users
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{day.total_points.toLocaleString()}</div>
                        <div className="text-slate-400 text-xs">${day.total_cost.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Revenue vs Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-slate-300">Estimated Monthly Revenue</span>
                    <span className="text-green-400 font-bold">${(totalActiveUsers * 20).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-slate-300">Monthly System Cost</span>
                    <span className="text-red-400 font-bold">${totalSystemCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                    <span className="text-amber-400 font-medium">Estimated Profit</span>
                    <span className="text-amber-400 font-bold">${((totalActiveUsers * 20) - totalSystemCost).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Model Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400 text-center py-8">
                  Model usage analytics will be implemented here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}