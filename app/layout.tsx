import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"

export const metadata: Metadata = {
  title: "Directors Palette",
  description: "Director style workflow",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-200">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-slate-700" />
              <div className="text-sm text-slate-300">Directors Palette</div>
            </header>
            <div className="p-4 bg-slate-900 px-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}
