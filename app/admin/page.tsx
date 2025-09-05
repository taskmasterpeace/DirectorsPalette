'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Crown, Shield, Eye, EyeOff, Settings, AlertTriangle } from 'lucide-react'
import { ModelConfiguration } from '@/components/admin/ModelConfiguration'
import { EnhancedAdminDashboard } from '@/components/admin/EnhancedAdminDashboard'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'

export default function AdminPage() {
  const { toast } = useToast()
  const { user, isAuthenticated, isAdmin } = useAuth()
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(true)
  const [adminVerified, setAdminVerified] = useState(false)

  // Server-side admin verification
  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!isAuthenticated || !user) {
        setIsVerifyingAdmin(false)
        return
      }

      try {
        const response = await fetch('/api/admin/verify')
        const result = await response.json()
        
        if (result.isAdmin) {
          setAdminVerified(true)
          toast({
            title: "Admin Access Verified",
            description: "Welcome to Director's Palette Admin Panel"
          })
        } else {
          console.warn('🚨 Admin access denied:', result.error)
          toast({
            title: "Access Denied",
            description: "Admin privileges required",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('❌ Admin verification failed:', error)
        toast({
          title: "Verification Failed",
          description: "Unable to verify admin status",
          variant: "destructive"
        })
      } finally {
        setIsVerifyingAdmin(false)
      }
    }

    verifyAdminAccess()
  }, [isAuthenticated, user, toast])

  // Show loading while verifying admin access
  if (isVerifyingAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <div className="text-white font-medium">Verifying admin access...</div>
            <div className="text-slate-400 text-sm">Checking server-side permissions</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Require authentication first
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Authentication Required
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Please sign in to access admin features
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/auth/login'}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check server-verified admin access
  if (!adminVerified) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Admin Access Denied
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Your account does not have admin privileges
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                <Shield className="w-4 h-4" />
                Server-Side Verification Failed
              </div>
              <p className="text-red-300 text-xs">
                Admin access is verified server-side for security. 
                Contact the system administrator if you believe this is an error.
              </p>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="text-slate-300 hover:text-white"
              >
                Return to App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin dashboard with secure access
  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Security notice */}
        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-1">
            <Shield className="w-4 h-4" />
            Secure Admin Session
          </div>
          <p className="text-green-300 text-xs">
            Admin access verified server-side for {user?.email}
          </p>
        </div>
        
        <EnhancedAdminDashboard />
      </div>
    </div>
  )
}