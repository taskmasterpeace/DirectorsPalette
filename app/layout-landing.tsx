import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth/AuthProvider"

// Minimal layout for landing page - no sidebar or app header
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen antialiased">
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </ThemeProvider>
    </div>
  )
}