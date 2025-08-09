"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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

  function setMode(mode: "story" | "music-video") {
    try {
      localStorage.setItem("dsvb:mode", mode)
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
          <img src="/directors-palette-logo.png" alt="Directors Palette" className="w-7 h-7 rounded" />
          <div className="text-white font-semibold">Directors Palette</div>
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
                    onClick={() => setMode(item.mode)}
                    className="text-slate-200 hover:text-white cursor-pointer"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
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
