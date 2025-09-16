/**
 * Admin API Monitoring Dashboard
 * Monitor all API usage, track external calls, and detect abuse
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Activity,
  Users,
  Zap,
  AlertTriangle,
  TrendingUp,
  Clock,
  Key,
  ExternalLink,
  Shield,
  Database
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

interface APICallLog {
  id: string
  endpoint: string
  method: string
  user_id?: string
  api_key_used: boolean
  call_source: 'internal' | 'external' | 'unknown'
  origin?: string
  status_code: number
  response_time_ms: number
  credits_consumed: number
  model_used?: string
  operation_type?: string
  success: boolean
  error_message?: string
  created_at: string
}

interface UsageStats {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  creditsConsumed: number
  videoGenerations: number
  imageGenerations: number
  externalCalls: number
  avgResponseTime: number
}

export default function APIMonitoringPage() {
  const { user } = useAuth()
  const [apiLogs, setApiLogs] = useState<APICallLog[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'external' | 'internal' | 'errors'>('all')
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h')

  // Check if user is admin
  const isAdmin = user?.email === 'taskmasterpeace@gmail.com'

  useEffect(() => {
    if (!isAdmin) return

    fetchAPILogs()
    fetchUsageStats()

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAPILogs()
      fetchUsageStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [isAdmin, filter, timeframe])

  const fetchAPILogs = async () => {
    try {
      // TODO: Implement API endpoint to fetch logs
      // For now, simulate data
      const mockLogs: APICallLog[] = [
        {
          id: '1',
          endpoint: '/api/video/seedance',
          method: 'POST',
          api_key_used: false,
          call_source: 'internal',
          origin: 'http://localhost:3004',
          status_code: 200,
          response_time_ms: 45000,
          credits_consumed: 150,
          model_used: 'seedance-lite',
          operation_type: 'video_generation',
          success: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          endpoint: '/api/post-production/gen4',
          method: 'POST',
          api_key_used: true,
          call_source: 'external',
          origin: 'https://example.com',
          status_code: 200,
          response_time_ms: 12000,
          credits_consumed: 24,
          model_used: 'nano-banana',
          operation_type: 'image_generation',
          success: true,
          created_at: new Date(Date.now() - 300000).toISOString()
        }
      ]
      setApiLogs(mockLogs)
    } catch (error) {
      console.error('Failed to fetch API logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsageStats = async () => {
    try {
      // TODO: Implement stats endpoint
      setUsageStats({
        totalCalls: 156,
        successfulCalls: 152,
        failedCalls: 4,
        creditsConsumed: 3420,
        videoGenerations: 12,
        imageGenerations: 144,
        externalCalls: 8,
        avgResponseTime: 15500
      })
    } catch (error) {
      console.error('Failed to fetch usage stats:', error)
    }
  }

  const filteredLogs = apiLogs.filter(log => {
    switch (filter) {
      case 'external': return log.call_source === 'external'
      case 'internal': return log.call_source === 'internal'
      case 'errors': return !log.success
      default: return true
    }
  })

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
            <p className="text-slate-400">Admin privileges required to view API monitoring</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-500" />
              API Monitoring Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Track API usage, monitor external calls, and detect abuse</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Live Monitoring</span>
          </div>
        </div>

        {/* Stats Cards */}
        {usageStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total API Calls</p>
                    <p className="text-2xl font-bold text-white">{usageStats.totalCalls.toLocaleString()}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Credits Consumed</p>
                    <p className="text-2xl font-bold text-white">{usageStats.creditsConsumed.toLocaleString()}</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.round((usageStats.successfulCalls / usageStats.totalCalls) * 100)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">External Calls</p>
                    <p className="text-2xl font-bold text-white">{usageStats.externalCalls}</p>
                  </div>
                  <ExternalLink className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Calls</SelectItem>
              <SelectItem value="external">External Only</SelectItem>
              <SelectItem value="internal">Internal Only</SelectItem>
              <SelectItem value="errors">Errors Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => { fetchAPILogs(); fetchUsageStats() }}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>

        {/* API Logs Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5" />
              Recent API Calls ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left p-2 text-slate-300">Time</th>
                    <th className="text-left p-2 text-slate-300">Endpoint</th>
                    <th className="text-left p-2 text-slate-300">Source</th>
                    <th className="text-left p-2 text-slate-300">Status</th>
                    <th className="text-left p-2 text-slate-300">Credits</th>
                    <th className="text-left p-2 text-slate-300">Response Time</th>
                    <th className="text-left p-2 text-slate-300">API Key</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.slice(0, 50).map((log) => (
                    <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-2 text-slate-300">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td className="p-2">
                        <code className="text-xs bg-slate-700 px-2 py-1 rounded text-blue-300">
                          {log.method} {log.endpoint}
                        </code>
                      </td>
                      <td className="p-2">
                        <Badge
                          variant={log.call_source === 'external' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {log.call_source}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge
                          variant={log.success ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {log.status_code}
                        </Badge>
                      </td>
                      <td className="p-2 text-slate-300">
                        {log.credits_consumed || 0}
                      </td>
                      <td className="p-2 text-slate-300">
                        {log.response_time_ms}ms
                      </td>
                      <td className="p-2">
                        {log.api_key_used ? (
                          <Badge variant="outline" className="text-xs text-green-400">
                            <Key className="h-3 w-3 mr-1" />
                            Used
                          </Badge>
                        ) : (
                          <span className="text-slate-500 text-xs">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* API Key Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-yellow-500" />
              API Key Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Current API Key</h3>
                <code className="text-sm bg-slate-800 px-3 py-2 rounded text-green-400 font-mono">
                  dp_beta_2025_machineking_secure_api_key_v1
                </code>
                <p className="text-slate-400 text-sm mt-2">
                  Share this key with your team for external API access
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Internal Calls</h4>
                  <p className="text-slate-400 text-sm">
                    Your Directors Palette app (localhost) - No API key required
                  </p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">External Calls</h4>
                  <p className="text-slate-400 text-sm">
                    Hey You're Hired, TalkAdvantage Pro, etc. - API key required
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}