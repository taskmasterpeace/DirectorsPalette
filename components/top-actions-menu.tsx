"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Film, Music2, Plus, FolderOpen, Wand2 } from 'lucide-react'

type Props = {
  mode: "story" | "music-video"
  onOpenProjects: () => void
  onNewProject: () => void
  onGenerate: () => void
  canGenerate: boolean
  className?: string
}

export function TopActionsMenu({ mode, onOpenProjects, onNewProject, onGenerate, canGenerate, className }: Props) {
  return (
    <header className={cn("sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur", className)}>
      <div className="mx-auto max-w-7xl px-4 py-2 lg:pl-64">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            {mode === "story" ? <Film className="h-4 w-4 text-amber-400" /> : <Music2 className="h-4 w-4 text-purple-400" />}
            <span className="text-sm">{mode === "story" ? "Story Mode" : "Music Video Mode"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onOpenProjects} className="border-slate-700 text-slate-200 hover:bg-slate-800">
              <FolderOpen className="h-4 w-4 mr-2" />
              Projects
            </Button>
            <Button variant="ghost" onClick={onNewProject} className="text-slate-200 hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
            <Button
              onClick={onGenerate}
              disabled={!canGenerate}
              className={cn(
                "text-white",
                mode === "story" ? "bg-amber-600 hover:bg-amber-700" : "bg-purple-600 hover:bg-purple-700"
              )}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {mode === "story" ? "Generate Breakdown" : "Generate MV Breakdown"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
