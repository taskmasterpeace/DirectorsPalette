"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProjectManager } from "@/components/project-manager"
import { ProjectHeader } from "@/components/shared/ProjectHeader"
import { AsyncBoundary } from "@/components/shared/AsyncBoundary"
import { ModeSelector } from "@/components/containers/ModeSelector"
import { StoryContainer } from "@/components/containers/StoryContainer"
import { MusicVideoContainer } from "@/components/containers/MusicVideoContainer"
import { useSessionManagement } from "@/hooks/useSessionManagement"
import { useAppStore } from "@/stores/app-store"

export default function Home() {
  const { mode, showProjectManager, setShowProjectManager, currentProjectId, isLoading } = useAppStore()
  // Session management hook already loads on mount internally
  useSessionManagement()

  return (
    <div className="p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="space-y-6">
          {/* Main Content */}
          <AsyncBoundary isLoading={isLoading}>
            {mode === "story" ? <StoryContainer /> : <MusicVideoContainer />}
          </AsyncBoundary>
        </div>

        {/* Project Manager Modal */}
        {showProjectManager && (
          <ProjectManager
            isOpen={showProjectManager}
            onClose={() => setShowProjectManager(false)}
          />
        )}
      </div>
    </div>
  )
}