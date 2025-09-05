'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { isSupabaseReady, getAuthMode } from '@/lib/auth-supabase'
import { supabase } from '@/lib/supabase'

export default function DebugEnvironmentPage() {
  const [envCheck, setEnvCheck] = useState<any>(null)
  const [supabaseTest, setSupabaseTest] = useState<any>(null)

  useEffect(() => {
    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      // Don't expose service role key in client
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      authMode: getAuthMode(),
      isSupabaseReady: isSupabaseReady()
    }

    setEnvCheck(envVars)
  }, [])

  const testSupabaseConnection = async () => {
    try {
      if (!supabase) {
        setSupabaseTest({ success: false, error: 'Supabase client not initialized' })
        return
      }

      // Test basic connection
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setSupabaseTest({ success: false, error: error.message })
      } else {
        setSupabaseTest({ 
          success: true, 
          session: !!data.session,
          user: data.session?.user?.email || 'No user'
        })
      }
    } catch (error) {
      setSupabaseTest({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      })
    }
  }

  const testGoogleOAuth = async () => {
    try {
      if (!supabase) {
        alert('Supabase not initialized')
        return
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        alert(`OAuth Error: ${error.message}`)
      } else {
        alert('OAuth initiated - should redirect...')
      }
    } catch (error) {
      alert(`OAuth Exception: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">🔍 Environment Variables Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {envCheck ? (
              <div className="space-y-3">
                {Object.entries(envCheck).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                    <span className="text-white font-mono text-sm">{key}</span>
                    <div className="flex items-center gap-2">
                      {value ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {typeof value === 'string' ? 
                              (value.length > 20 ? `${value.substring(0, 20)}...` : value) : 
                              String(value)
                            }
                          </Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <Badge variant="outline" className="text-red-400 border-red-400">
                            Missing
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400">Loading...</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">🧪 Supabase Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testSupabaseConnection} className="w-full">
              Test Supabase Connection
            </Button>
            
            {supabaseTest && (
              <div className="p-3 bg-slate-900/50 rounded">
                <div className="flex items-center gap-2 mb-2">
                  {supabaseTest.success ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-white font-medium">
                    {supabaseTest.success ? 'Connection Success' : 'Connection Failed'}
                  </span>
                </div>
                <pre className="text-xs text-slate-300 bg-slate-800/50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(supabaseTest, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">🔐 Google OAuth Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-yellow-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              This will redirect to Google - test in incognito mode to avoid YouTube extension interference
            </div>
            
            <Button onClick={testGoogleOAuth} className="w-full bg-red-600 hover:bg-red-700">
              Test Google OAuth (Will Redirect)
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">🔗 Expected OAuth Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-300 text-sm space-y-2">
              <div>1. Click "Continue with Google"</div>
              <div>2. Redirect to Google OAuth consent screen</div>
              <div>3. User approves access</div>
              <div>4. Redirect to: <code className="bg-slate-700 px-1 rounded">https://tarohelkwuurakbxjyxm.supabase.co/auth/v1/callback</code></div>
              <div>5. Supabase processes OAuth</div>
              <div>6. Redirect to: <code className="bg-slate-700 px-1 rounded">{window.location.origin}/auth/callback</code></div>
              <div>7. App processes user session and redirects to main app</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}