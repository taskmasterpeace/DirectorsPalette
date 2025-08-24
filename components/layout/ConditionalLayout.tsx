'use client'

import { usePathname } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { LayoutHeader } from "@/components/layout-header"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Landing page should have no sidebar/header - full screen experience
  const isLandingPage = pathname === '/'
  
  if (isLandingPage) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    )
  }
  
  // All other pages get the full app layout with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <LayoutHeader />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </SidebarInset>
    </SidebarProvider>
  )
}