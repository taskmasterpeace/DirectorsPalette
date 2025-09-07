// Enhanced Authentication with Supabase Integration
import { supabase, getCurrentUser, signInWithGoogle, signOut, createUserProfile } from './supabase'
import { getAuthSession, loginUser, logoutUser, hasAdminUser, type User, type AuthSession } from './auth'

// Feature flag for Supabase integration
const USE_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Universal Auth Functions - works with both localStorage and Supabase
 */

export async function universalLogin(email: string): Promise<{ success: boolean; user?: User; error?: string }> {
  if (USE_SUPABASE) {
    try {
      // Use Supabase email auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'temporary-password' // For demo - replace with proper password system
      })
      
      if (error) {
        // If user doesn't exist, create them
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: 'temporary-password'
        })
        
        if (signUpError) {
          return { success: false, error: signUpError.message }
        }
        
        if (signUpData.user) {
          await createUserProfile(signUpData.user)
          return { 
            success: true, 
            user: {
              id: signUpData.user.id,
              email: signUpData.user.email!,
              name: signUpData.user.user_metadata?.full_name,
              role: email === 'taskmasterpeace@gmail.com' ? 'admin' : 'user',
              createdAt: new Date(),
              lastLogin: new Date(),
              permissions: {
                canCreateProjects: true,
                canManageUsers: email === 'taskmasterpeace@gmail.com',
                canAccessApiKeys: email === 'taskmasterpeace@gmail.com',
                canShareProjects: true
              }
            }
          }
        }
      }
      
      if (data.user) {
        return { 
          success: true, 
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name,
            role: email === 'taskmasterpeace@gmail.com' ? 'admin' : 'user',
            createdAt: new Date(),
            lastLogin: new Date(),
            permissions: {
              canCreateProjects: true,
              canManageUsers: email === 'taskmasterpeace@gmail.com',
              canAccessApiKeys: email === 'taskmasterpeace@gmail.com',
              canShareProjects: true
            }
          }
        }
      }
      
      return { success: false, error: 'Login failed' }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  } else {
    // Fallback to localStorage auth
    return loginUser(email)
  }
}

export async function universalGoogleLogin(): Promise<{ success: boolean; user?: User; error?: string }> {
  console.log('🔐 universalGoogleLogin called')
  console.log('🔍 USE_SUPABASE:', USE_SUPABASE)
  console.log('🔍 supabase client exists:', !!supabase)
  
  if (USE_SUPABASE && supabase) {
    try {
      console.log('🚀 Attempting Supabase Google OAuth...')
      
      // Get the correct redirect URL based on environment
      const getRedirectUrl = () => {
        if (typeof window === 'undefined') return 'https://v0-director-style-workflow.vercel.app/auth/callback'
        
        const { protocol, host } = window.location
        console.log('🔍 Current host for OAuth redirect:', host)
        
        // Use current host for development (supports any port: 3000, 3001, 3002, etc.)
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
          const redirectUrl = `${protocol}//${host}/auth/callback`
          console.log('🔍 OAuth redirect URL:', redirectUrl)
          return redirectUrl
        } else {
          // Production URL - update this when deploying
          return 'https://v0-director-style-workflow.vercel.app/auth/callback'
        }
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      console.log('🔍 OAuth response:', { data, error })
      
      if (error) {
        console.error('❌ OAuth error:', error)
        return { success: false, error: error.message }
      }
      
      console.log('✅ OAuth initiated - should redirect')
      // Supabase will handle the redirect - don't return user yet
      return { success: true }
    } catch (error) {
      console.error('💥 OAuth exception:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Google sign-in failed' }
    }
  } else {
    console.log('⚠️ Falling back to localStorage auth')
    // Fallback to localStorage (temporary for demo)
    return loginUser('taskmasterpeace@gmail.com')
  }
}

export async function universalLogout(): Promise<void> {
  if (USE_SUPABASE) {
    await signOut()
  } else {
    logoutUser()
  }
}

export async function universalGetToken(): Promise<string | null> {
  if (USE_SUPABASE) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        return null
      }
      return session.access_token
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return null
    }
  }
  
  // For localStorage mode, we don't have tokens
  return null
}

export async function universalGetSession(): Promise<AuthSession> {
  if (USE_SUPABASE) {
    try {
      const user = await getCurrentUser()
      if (!user) {
        return { user: null, isAuthenticated: false, isAdmin: false }
      }
      
      return {
        user: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name,
          role: user.email === 'taskmasterpeace@gmail.com' ? 'admin' : 'user',
          createdAt: new Date(),
          lastLogin: new Date(),
          permissions: {
            canCreateProjects: true,
            canManageUsers: user.email === 'taskmasterpeace@gmail.com',
            canAccessApiKeys: user.email === 'taskmasterpeace@gmail.com',
            canShareProjects: true
          }
        },
        isAuthenticated: true,
        isAdmin: user.email === 'taskmasterpeace@gmail.com'
      }
    } catch (error) {
      return { user: null, isAuthenticated: false, isAdmin: false }
    }
  } else {
    // Fallback to localStorage
    return getAuthSession()
  }
}

/**
 * Check if Supabase is configured and ready
 */
export function isSupabaseReady(): boolean {
  return USE_SUPABASE || false
}

/**
 * Get authentication mode
 */
export function getAuthMode(): 'supabase' | 'localStorage' {
  return USE_SUPABASE ? 'supabase' : 'localStorage'
}

/**
 * Re-export functions needed by components
 */
export { hasAdminUser, type User, type AuthSession } from './auth'