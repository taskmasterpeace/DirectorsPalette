'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Shield, Users } from 'lucide-react'
import { loginUser, hasAdminUser, type User } from '@/lib/auth'
import { useToast } from '@/components/ui/use-toast'

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isFirstUser = !hasAdminUser()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = loginUser(email)
      
      if (result.success && result.user) {
        toast({
          title: isFirstUser ? "Welcome, Admin!" : "Welcome back!",
          description: isFirstUser 
            ? "You are now the admin of this Director's Palette instance."
            : `Logged in as ${result.user.name || result.user.email}`,
        })
        onLogin(result.user)
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
            🎬 Director's Palette
          </CardTitle>
          <div className="text-slate-400">
            Machine King Labs Research Project
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isFirstUser && (
            <Alert className="bg-blue-900/20 border-blue-600/30">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-blue-300">
                <strong>First User Setup:</strong> You will become the admin and can invite other users.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert className="bg-red-900/20 border-red-600/30">
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                'Signing in...'
              ) : isFirstUser ? (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Create Admin Account
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-400">
            {isFirstUser ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Admin privileges include:</span>
                </div>
                <ul className="text-xs space-y-1 text-slate-500">
                  <li>• Add and manage users</li>
                  <li>• Configure API keys</li>
                  <li>• Share projects and templates</li>
                  <li>• Access all platform features</li>
                </ul>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                <span>Need access? Contact your admin</span>
              </div>
            )}
          </div>

          <div className="text-center pt-4 border-t border-slate-700">
            <div className="text-xs text-slate-500">
              Machine King Labs Research Project
            </div>
            <div className="text-xs text-slate-600">
              Open Source AI Creativity Platform
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}