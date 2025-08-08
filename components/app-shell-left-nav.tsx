"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, PlayCircle, FolderOpen, Menu, X } from 'lucide-react'

type ActiveKey = "story" | "library" | "music"

interface AppShellLeftNavProps {
active: ActiveKey
// Provide either callbacks or hrefs for navigation
onStory?: () => void
onMusic?: () => void
onOpenProjects?: () => void
storyHref?: string
libraryHref?: string
musicHref?: string
projectsHref?: string
currentProjectId?: string | null
}

export function AppShellLeftNav({
active,
onStory,
onMusic,
onOpenProjects,
storyHref = "/",
libraryHref = "/director-library",
musicHref = "/",
projectsHref = "/",
currentProjectId = null,
}: AppShellLeftNavProps) {
const [mobileOpen, setMobileOpen] = useState(false)

const NavItem = ({
isActive,
label,
icon,
onClick,
href,
className = "",
}: {
isActive: boolean
label: string
icon: React.ReactNode
onClick?: () => void
href?: string
className?: string
}) => {
const base = isActive
  ? "bg-emerald-600/0 text-white"
  : "text-slate-300 hover:bg-slate-700"
const content = (
  <>
    {icon}
    <span>{label}</span>
  </>
)

if (onClick) {
  return (
    <Button
      size="sm"
      variant={isActive ? "default" : "ghost"}
      onClick={onClick}
      className={`${base} h-9 px-3 text-sm leading-none justify-start w-full ${isActive ? "" : ""} ${className}`}
    >
      {content}
    </Button>
  )
}

return (
  <Button
    asChild
    size="sm"
    variant={isActive ? "default" : "ghost"}
    className={`${base} h-9 px-3 text-sm leading-none justify-start w-full ${className}`}
  >
    <Link href={href || "#"}>{content}</Link>
  </Button>
)
}

const ProjectsItem = ({
inDrawer,
}: {
inDrawer?: boolean
}) => {
const content = (
  <>
    <FolderOpen className="h-4 w-4 mr-2" />
    <span>Projects</span>
  </>
)
if (onOpenProjects) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        onOpenProjects()
        if (inDrawer) setMobileOpen(false)
      }}
      className="text-slate-300 hover:text-white hover:bg-slate-700 h-9 px-3 text-sm leading-none justify-start w-full"
    >
      {content}
    </Button>
  )
}
return (
  <Button
    asChild
    variant="ghost"
    size="sm"
    className="text-slate-300 hover:text-white hover:bg-slate-700 h-9 px-3 text-sm leading-none justify-start w-full"
  >
    <Link href={projectsHref || "/"}>{content}</Link>
  </Button>
)
}

return (
<>
  {/* Desktop Sidebar */}
  <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/70 border-r border-slate-700 backdrop-blur supports-[backdrop-filter]:bg-slate-900/40">
    <div className="flex h-full w-full flex-col p-4 gap-4">
      <Link href="/" className="flex items-center gap-2" aria-label="Director’s Palette home">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%207%2C%202025%2C%2008_30_14%20PM-oBogq2jLqDMdXhi3pQ49H4FQryDlff.png"
          alt="Director’s Palette"
          width={112}
          height={112}
          className="h-28 w-28 rounded-md shadow-lg shadow-black/30 ring-1 ring-white/10"
          decoding="async"
          fetchPriority="high"
        />
      </Link>

      <nav className="flex flex-col gap-2">
        <NavItem
          isActive={active === "story"}
          label="Story Mode"
          icon={<BookOpen className="h-4 w-4 mr-2" />}
          onClick={onStory}
          href={!onStory ? storyHref : undefined}
        />
        <NavItem
          isActive={active === "library"}
          label="Director Library"
          icon={<FolderOpen className="h-4 w-4 mr-2" />}
          href={libraryHref}
        />
        <NavItem
          isActive={active === "music"}
          label="Music Video Mode"
          icon={<PlayCircle className="h-4 w-4 mr-2" />}
          onClick={onMusic}
          href={!onMusic ? musicHref : undefined}
        />
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        {currentProjectId && (
          <Badge variant="secondary" className="bg-green-600/20 text-green-300 border-green-700/30">
            Saved
          </Badge>
        )}
        <ProjectsItem />
      </div>
    </div>
  </aside>

  {/* Mobile Top Bar */}
  <div className="lg:hidden sticky top-0 z-30 bg-slate-800/70 backdrop-blur border-b border-slate-700 px-3 py-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen((v) => !v)}
          className="h-9 w-9 text-slate-300 hover:text-white"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link href="/" className="flex items-center gap-2" aria-label="Director’s Palette home">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%207%2C%202025%2C%2008_30_14%20PM-oBogq2jLqDMdXhi3pQ49H4FQryDlff.png"
            alt="Director’s Palette"
            width={36}
            height={36}
            className="h-9 w-9 rounded-md shadow-lg shadow-black/30 ring-1 ring-white/10"
            decoding="async"
            fetchPriority="high"
          />
          <span className="text-white font-medium">Director’s Palette</span>
        </Link>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (onOpenProjects) onOpenProjects()
          else if (projectsHref) window.location.href = projectsHref
        }}
        className="text-slate-300 hover:text-white h-9 px-3 text-sm leading-none"
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        Projects
      </Button>
    </div>
  </div>

  {/* Mobile Sidebar Drawer */}
  {mobileOpen && (
    <div className="lg:hidden fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <div className="absolute left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="Director’s Palette home"
            onClick={() => setMobileOpen(false)}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%207%2C%202025%2C%2008_30_14%20PM-oBogq2jLqDMdXhi3pQ49H4FQryDlff.png"
              alt="Director’s Palette"
              width={36}
              height={36}
              className="h-9 w-9 rounded-md ring-1 ring-white/10"
              decoding="async"
              fetchPriority="high"
            />
            <span className="text-white font-semibold">Director’s Palette</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="h-9 w-9">
            <X className="h-5 w-5 text-slate-300" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem
            isActive={active === "story"}
            label="Story Mode"
            icon={<BookOpen className="h-4 w-4 mr-2" />}
            onClick={
              onStory
                ? () => {
                    onStory()
                    setMobileOpen(false)
                  }
                : undefined
            }
            href={!onStory ? storyHref : undefined}
            className=""
          />
          <NavItem
            isActive={active === "library"}
            label="Director Library"
            icon={<FolderOpen className="h-4 w-4 mr-2" />}
            href={libraryHref}
          />
          <NavItem
            isActive={active === "music"}
            label="Music Video Mode"
            icon={<PlayCircle className="h-4 w-4 mr-2" />}
            onClick={
              onMusic
                ? () => {
                    onMusic()
                    setMobileOpen(false)
                  }
                : undefined
            }
            href={!onMusic ? musicHref : undefined}
          />
        </nav>

        <div className="mt-6 border-t border-slate-700 pt-3">
          <ProjectsItem inDrawer />
        </div>
      </div>
    </div>
  )}
</>
)
}
