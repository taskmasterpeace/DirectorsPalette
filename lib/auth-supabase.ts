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