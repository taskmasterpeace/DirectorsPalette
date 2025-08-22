import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { LayoutHeader } from "@/components/layout-header"
import { AuthProvider } from "@/components/auth/AuthProvider"

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Directors Palette",
  description: "Visual story and music video breakdown tool",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <LayoutHeader />
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </SidebarInset>
            </SidebarProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
