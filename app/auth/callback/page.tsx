'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔐 OAuth Callback Started')
      console.log('🔍 URL params:', Object.fromEntries(searchParams.entries()))
      
      try {
        setStatus('loading')
        
        if (!supabase) {
          throw new Error('Supabase not initialized - check environment variables')
        }

        // Get session with better error handling
        const { data, error } = await supabase.auth.getSession()
        
        console.log('🔍 Session data:', data)
        console.log('🔍 Session error:', error)
        
        setDebugInfo({ data, error, searchParams: Object.fromEntries(searchParams.entries()) })

        if (error) {
          console.error('❌ Auth callback error:', error)
          setErrorMessage(`Auth error: ${error.message}`)
          setStatus('error')
          return
        }

        if (data.session?.user) {
          console.log('✅ User found:', data.session.user.email)
          
          // Initialize user credits (core requirement)
          try {
            const userCreditModule = await import('@/lib/credits/user-credits')
            const credits = await userCreditModule.userCreditService.getUserCredits(data.session.user.id)
            
            if (!credits) {
              // Initialize credits for new user
              const isAdmin = data.session.user.email === 'taskmasterpeace@gmail.com'
              const tier = isAdmin ? 'pro' : 'pro' // All users get pro for now
              await userCreditModule.userCreditService.initializeUserCredits(data.session.user.id, tier)
              console.log('✅ User credits initialized')
            } else {
              console.log('✅ Existing user credits found')
            }
          } catch (creditError) {
            console.error('⚠️ Credit initialization error (non-critical):', creditError)
          }

          // Optional: Create user profile if custom users table exists
          try {
            const { error: profileError } = await supabase
              .from('users')
              .upsert({
                id: data.session.user.id,
                email: data.session.user.email,
                name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0],
                avatar_url: data.session.user.user_metadata?.avatar_url,
                is_admin: data.session.user.email === 'taskmasterpeace@gmail.com'
              })

            if (profileError) {
              console.log('ℹ️ Custom users table not available (using auth.users instead)')
            } else {
              console.log('✅ User profile created in custom users table')
            }
          } catch (profileError) {
            console.log('ℹ️ Using Supabase auth.users table (recommended approach)')
          }

          setStatus('success')
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          console.error('❌ No session found')
          setErrorMessage('No user session found')
          setStatus('error')
        }
      } catch (error) {
        console.error('💥 Callback handling error:', error)
        setErrorMessage(error instanceof Error ? error.message : 'Unknown callback error')
        setStatus('error')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-white text-lg">Completing Google Sign-In...</div>
          <div className="text-slate-400 text-sm">Processing OAuth callback</div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <CardTitle className="text-white">Sign-In Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-300 mb-4">Welcome to Director's Palette</p>
            <p className="text-slate-400 text-sm">Redirecting to app...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-lg bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
          <CardTitle className="text-white">OAuth Sign-In Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-red-300 mb-2">Error: {errorMessage}</p>
            <p className="text-slate-400 text-sm">
              This might be caused by browser extensions (like YouTube shorts blockers) interfering with the OAuth flow.
            </p>
          </div>

          {debugInfo && (
            <details className="bg-slate-900/50 p-3 rounded">
              <summary className="text-slate-300 cursor-pointer mb-2">Debug Information</summary>
              <pre className="text-xs text-slate-400 overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}

          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Back to Login
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/?mode=incognito'}
              variant="outline"
              className="w-full"
            >
              Try in Incognito Mode
            </Button>
          </div>

          <div className="text-center text-xs text-slate-500">
            <p>Common fixes:</p>
            <p>• Disable browser extensions (especially YouTube-related)</p>
            <p>• Try incognito/private browsing mode</p>
            <p>• Clear browser cookies and cache</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}