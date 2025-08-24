'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Shield, Users } from 'lucide-react'
import { universalLogin, universalGoogleLogin, hasAdminUser } from '@/lib/auth-supabase'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

interface LoginModalProps {
  children: React.ReactNode
  onLoginSuccess?: () => void
}

export function LoginModal({ children, onLoginSuccess }: LoginModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isFirstUser = !hasAdminUser()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await universalLogin(email)
      
      if (result.success && result.user) {
        toast({
          title: isFirstUser ? "Welcome, Admin!" : "Welcome back!",
          description: isFirstUser 
            ? "You are now the admin of this Director's Palette instance."
            : `Logged in as ${result.user.name || result.user.email}`,
        })
        setIsOpen(false)
        if (onLoginSuccess) {
          onLoginSuccess()
        } else {
          router.push('/create')
        }
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const result = await universalGoogleLogin()
      if (result.success && result.user) {
        toast({
          title: "Google Sign-In Successful!",
          description: `Welcome ${result.user.name || result.user.email}`
        })
        setIsOpen(false)
        if (onLoginSuccess) {
          onLoginSuccess()
        } else {
          router.push('/create')
        }
      }
    } catch (err) {
      setError('Google sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-center text-xl">
            🎬 Sign In to Director's Palette
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isFirstUser && (
            <Alert className="bg-blue-900/20 border-blue-600/30">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-blue-300">
                <strong>First User Setup:</strong> You will become the admin and can invite other users.
              </AlertDescription>
            </Alert>
          )}

          {/* Google OAuth Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-2 text-slate-400">Or sign in with email</span>
            </div>
          </div>

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
                  <li>• Configure AI models and costs</li>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}