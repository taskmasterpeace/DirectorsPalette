'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Crown, Shield, Eye, EyeOff, Settings } from 'lucide-react'
import { ModelConfiguration } from '@/components/admin/ModelConfiguration'
import { useToast } from '@/components/ui/use-toast'

// Admin authentication check
const ADMIN_EMAIL = 'taskmasterpeace@gmail.com'

export default function AdminPage() {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [showAdminEmail, setShowAdminEmail] = useState(false)

  // Check if user is admin
  const checkAdminAccess = () => {
    if (adminEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setIsAuthenticated(true)
      localStorage.setItem('admin-authenticated', 'true')
      toast({
        title: "Admin Access Granted",
        description: "Welcome to Director's Palette Admin Panel"
      })
    } else {
      toast({
        title: "Access Denied",
        description: "Only the application owner can access admin settings",
        variant: "destructive"
      })
    }
  }

  // Check existing authentication
  useEffect(() => {
    const saved = localStorage.getItem('admin-authenticated')
    if (saved === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Admin Access Required
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Enter your admin credentials to access system-wide settings
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white text-sm font-medium mb-2 block">Admin Email</Label>
              <div className="relative">
                <Input
                  type={showAdminEmail ? "text" : "password"}
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter your admin email"
                  className="bg-slate-900 border-slate-600 text-white pr-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      checkAdminAccess()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-white"
                  onClick={() => setShowAdminEmail(!showAdminEmail)}
                >
                  {showAdminEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={checkAdminAccess}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Access Admin Panel
            </Button>
            
            <div className="text-xs text-slate-500 text-center">
              🔐 Admin-only features: Model selection, cost monitoring, system configuration
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Admin Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Director's Palette Admin</h1>
                <p className="text-slate-400">System-wide configuration and model management</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsAuthenticated(false)
                localStorage.removeItem('admin-authenticated')
              }}
              className="text-slate-300 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="models" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="costs">Cost Monitoring</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          {/* Model Configuration */}
          <TabsContent value="models">
            <ModelConfiguration isAdmin={true} />
          </TabsContent>

          {/* Cost Monitoring */}
          <TabsContent value="costs">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Cost Monitoring Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400">
                  Cost tracking and budget monitoring will be implemented here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400">
                  User permissions and access control will be implemented here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Health */}
          <TabsContent value="system">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400">
                  API status monitoring and system diagnostics will be implemented here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}