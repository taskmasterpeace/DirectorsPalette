'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { LoginForm } from './LoginForm'
import { universalGetSession, universalLogout, isSupabaseReady, getAuthMode, type User, type AuthSession } from '@/lib/auth-supabase'

interface AuthContextType extends AuthSession {
  login: (user: User) => void
  logout: () => void
  refreshSession: () => void
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
      const currentSession = await universalGetSession()
      setSession(currentSession)
      setIsLoading(false)
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

  // Show login form if not authenticated
  if (!session.isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  // Provide auth context to app
  return (
    <AuthContext.Provider value={{
      ...session,
      login,
      logout,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  )
}