"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Home, FolderOpen, Users, Palette, Film, Music, Dna, Mic2, Video, Clapperboard, Briefcase, Settings, BookOpen } from "lucide-react"
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

  function handleModeChange(newMode: "story" | "music-video" | "commercial" | "children-book") {
    if (setMode) {
      setMode(newMode)
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("dsvb:mode-change", { detail: { mode: newMode } }))
    }
    // Always navigate to /create when mode changes
    router.push("/create")
  }

  // Production tools for video generation
  const productionItems = [
    { title: "Story Mode", mode: "story" as const, icon: Film, action: "mode" as const },
    { title: "Music Video Mode", mode: "music-video" as const, icon: Music, action: "mode" as const },
    { title: "Commercial Mode", mode: "commercial" as const, icon: Briefcase, action: "mode" as const },
    { title: "Children's Book Mode", mode: "children-book" as const, icon: BookOpen, action: "mode" as const },
    { title: "Post Production", url: "/post-production", icon: Clapperboard, action: "link" as const },
    { title: "Directors Library", url: "/director-library", icon: Users, action: "link" as const },
  ]

  // Studio tools for music/artist creation
  const studioItems = [
    { title: "Song DNA Replicator", url: "/studio/song-dna", icon: Dna, action: "link" as const },
    { title: "Artist Bank", url: "/studio/artist-bank", icon: Mic2, action: "link" as const },
  ]

  // Project management and settings
  const projectItems = [
    { title: "All Projects", url: "/projects", icon: FolderOpen, action: "link" as const },
    { title: "Settings", url: "/settings", icon: Settings, action: "link" as const },
  ]

  return (
    <Sidebar className="border-r border-slate-800">
      <SidebarHeader className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <img 
              src="/mkl-logo.png" 
              alt="Machine King Labs" 
              className="w-16 h-16 rounded-lg shadow-lg"
            />
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl">Director's Palette</span>
              <span className="text-amber-400 text-sm font-medium">Machine King Labs</span>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-amber-500 to-transparent w-full"></div>
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
