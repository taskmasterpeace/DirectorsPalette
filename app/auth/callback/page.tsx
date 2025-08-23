'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/?error=auth_failed')
          return
        }

        if (data.session?.user) {
          // Create user profile if it doesn't exist
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
            console.error('Profile creation error:', profileError)
          }

          // Redirect to main app
          router.push('/')
        } else {
          router.push('/?error=no_session')
        }
      } catch (error) {
        console.error('Callback handling error:', error)
        router.push('/?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-white">Completing sign-in...</div>
        <div className="text-slate-400 text-sm">Please wait</div>
      </div>
    </div>
  )
}