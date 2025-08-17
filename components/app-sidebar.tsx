"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Home, FolderOpen, Users, Palette, Film, Music, Dna, Mic2, Video, Clapperboard } from "lucide-react"
import { useAppStore } from "@/stores/app-store"
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
  const { mode = "story", setMode } = useAppStore()

  function handleModeChange(newMode: "story" | "music-video") {
    if (setMode) {
      setMode(newMode)
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("dsvb:mode-change", { detail: { mode: newMode } }))
    }
    if (pathname !== "/") {
      router.push("/")
    }
  }

  // Production tools for video generation
  const productionItems = [
    { title: "Story Mode", mode: "story" as const, icon: Film, action: "mode" as const },
    { title: "Music Video Mode", mode: "music-video" as const, icon: Music, action: "mode" as const },
    { title: "Post Production", url: "/post-production", icon: Clapperboard, action: "link" as const },
    { title: "Directors Library", url: "/director-library", icon: Users, action: "link" as const },
  ]

  // Studio tools for music/artist creation
  const studioItems = [
    { title: "Song DNA Replicator", url: "/studio/song-dna", icon: Dna, action: "link" as const },
    { title: "Artist Bank", url: "/studio/artist-bank", icon: Mic2, action: "link" as const },
  ]

  // Project management
  const projectItems = [
    { title: "All Projects", url: "/projects", icon: FolderOpen, action: "link" as const },
  ]

  return (
    <Sidebar className="border-r border-slate-800">
      <SidebarHeader className="p-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-amber-500" />
          <span className="text-white font-semibold">Director's Palette</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Production Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 flex items-center gap-2">
            🎬 Production
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {productionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.action === "mode" ? (
                    <SidebarMenuButton
                      onClick={() => handleModeChange(item.mode!)}
                      isActive={pathname === "/" && mode === item.mode}
                      className="text-slate-200 hover:text-white cursor-pointer"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {pathname === "/" && mode === item.mode && (
                        <div className="ml-auto w-2 h-2 bg-amber-400 rounded-full" />
                      )}
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild isActive={pathname === item.url} className="text-slate-200">
                      <Link href={item.url!} className="hover:text-white">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Studio Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 flex items-center gap-2">
            🎵 Studio
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studioItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url || (item.title === "Artist Bank" && pathname === "/artist-bank")} 
                    className="text-slate-200"
                  >
                    <Link href={item.url!} className="hover:text-white">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 flex items-center gap-2">
            📁 Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} className="text-slate-200">
                    <Link href={item.url!} className="hover:text-white">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
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
