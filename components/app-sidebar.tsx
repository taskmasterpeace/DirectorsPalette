"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Home, FolderOpen, Users, Palette, Film, Music } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [currentMode, setCurrentMode] = useState<"story" | "music-video">("story")

  // Load current mode from localStorage on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("dsvb:mode") as "story" | "music-video"
      if (savedMode) {
        setCurrentMode(savedMode)
      }
    } catch {}
  }, [])

  function handleModeChange(mode: "story" | "music-video") {
    try {
      localStorage.setItem("dsvb:mode", mode)
      setCurrentMode(mode)
      window.dispatchEvent(new CustomEvent("mode-change", { detail: { mode } }))
    } catch {}
    if (pathname !== "/") {
      router.push("/")
    }
  }

  const navItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Projects", url: "/projects", icon: FolderOpen },
    { title: "Director Library", url: "/director-library", icon: Users },
    { title: "Artist Bank", url: "/artist-bank", icon: Palette },
  ]

  const modeItems = [
    { title: "Story Mode", mode: "story" as const, icon: Film },
    { title: "Music Video Mode", mode: "music-video" as const, icon: Music },
  ]

  return (
    <Sidebar className="border-r border-slate-800">
      <SidebarHeader className="p-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <img src="/directors-palette-logo.png" alt="Director's Palette" className="w-8 h-8 rounded" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} className="text-slate-200">
                    <Link href={item.url} className="hover:text-white">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300">Modes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleModeChange(item.mode)}
                    isActive={currentMode === item.mode}
                    className="text-slate-200 hover:text-white cursor-pointer data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                    {currentMode === item.mode && (
                      <div className="ml-auto w-2 h-2 bg-amber-400 rounded-full" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
