'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { LoginForm } from './LoginForm'
import { universalGetSession, universalLogout, universalGetToken, isSupabaseReady, getAuthMode, type User, type AuthSession } from '@/lib/auth-supabase'

interface AuthContextType extends AuthSession {
  login: (user: User) => void
  logout: () => void
  refreshSession: () => void
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    isAuthenticated: false,
    isAdmin: false
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        console.log('🔄 AuthProvider: Loading session...')
        const currentSession = await universalGetSession()
        console.log('✅ AuthProvider: Session loaded:', currentSession)
        setSession(currentSession)
      } catch (error) {
        console.error('❌ AuthProvider: Error loading session:', error)
        // Set default session on error
        setSession({
          user: null,
          isAuthenticated: false,
          isAdmin: false
        })
      } finally {
        // Always set loading to false
        console.log('✅ AuthProvider: Setting isLoading to false')
        setIsLoading(false)
      }
    }
    loadSession()
  }, [])

  const login = (user: User) => {
    const newSession = {
      user,
      isAuthenticated: true,
      isAdmin: user.role === 'admin'
    }
    setSession(newSession)
  }

  const logout = async () => {
    await universalLogout()
    setSession({
      user: null,
      isAuthenticated: false,
      isAdmin: false
    })
  }

  const refreshSession = async () => {
    const currentSession = await universalGetSession()
    setSession(currentSession)
  }

  const getToken = async (): Promise<string | null> => {
    return await universalGetToken()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-white">Loading Director's Palette...</div>
          <div className="text-slate-400 text-sm">Machine King Labs</div>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated AND on protected routes
  if (!session.isAuthenticated) {
    // Allow public routes without forcing authentication
    const isPublicRoute = typeof window !== 'undefined' && 
      (window.location.pathname === '/' ||              // Landing page  
       window.location.pathname.startsWith('/help') ||  // Help pages
       window.location.pathname.startsWith('/auth/'))   // Auth callbacks
    
    if (!isPublicRoute) {
      return <LoginForm onLogin={login} />
    }
  }

  // Provide auth context to app
  return (
    <AuthContext.Provider value={{
      ...session,
      login,
      logout,
      refreshSession,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}