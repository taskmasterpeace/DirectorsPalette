'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Activity, Settings as SettingsIcon, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SettingsTab } from '@/app/post-production/components/tabs/SettingsTab'
import { UserDashboard } from '@/components/dashboard/UserDashboard'
import { defaultSettings } from '@/lib/post-production/settings-data'
import { useAuth } from '@/components/auth/AuthProvider'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [settings, setSettings] = useState(defaultSettings)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="container mx-auto max-w-7xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Director's Palette
              </Button>
            </div>
            {user && (
              <div className="text-right">
                <div className="text-white font-medium">{user.name || user.email}</div>
                <div className="text-slate-400 text-sm">{user.role?.toUpperCase()} Account</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="container mx-auto max-w-7xl p-6">
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Usage & Points
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="production" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Production Settings
            </TabsTrigger>
          </TabsList>

          {/* Usage Dashboard */}
          <TabsContent value="usage">
            <UserDashboard />
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-sm">Email Address</label>
                    <div className="text-white font-medium">{user?.email}</div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm">Display Name</label>
                    <div className="text-white font-medium">{user?.name || 'Not set'}</div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm">Account Role</label>
                    <div className="text-white font-medium">{user?.role?.toUpperCase() || 'USER'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-400">Account management features will be implemented here.</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Production Settings */}
          <TabsContent value="production">
            <SettingsTab settings={settings} setSettings={setSettings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}