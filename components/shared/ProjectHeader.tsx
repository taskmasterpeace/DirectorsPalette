"use client"

import { BookOpen, PlayCircle } from "lucide-react"

interface ProjectHeaderProps {
  mode: "story" | "music-video"
  currentProjectId?: string | null
  onProjectSelect?: (projectId: string) => void
}

export function ProjectHeader({ mode, currentProjectId, onProjectSelect }: ProjectHeaderProps) {
  return (
    <div className="mb-4">
      <span className="inline-flex items-center gap-2 rounded-md bg-slate-800/60 px-2 py-1 text-xs text-slate-300">
        {mode === "story" ? (
          <>
            <BookOpen className="h-3.5 w-3.5 text-amber-400" /> Story Mode
          </>
        ) : (
          <>
            <PlayCircle className="h-3.5 w-3.5 text-purple-400" /> Music Video Mode
          </>
        )}
      </span>
      
      {/* TODO: Add project selector/manager button here if currentProjectId is set */}
      {currentProjectId && (
        <div className="mt-2 text-xs text-slate-400">
          Project: {currentProjectId}
        </div>
      )}
    </div>
  )
}