'use client'

import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { AppErrorBoundary } from '@/components/error-boundaries/AppErrorBoundary'

interface AppContainerProps {
  children: ReactNode
}

export function AppContainer({ children }: AppContainerProps) {
  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-background">
        {children}
        <Toaster />
      </div>
    </AppErrorBoundary>
  )
}