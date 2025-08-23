"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, HelpCircle } from "lucide-react"
import { AsyncBoundary } from "@/components/shared/AsyncBoundary"
import { ClientOnly } from "@/components/ClientOnly"
import { ModeSelector } from "@/components/containers/ModeSelector"
import { StoryContainer } from "@/components/containers/StoryContainer"
import { MusicVideoContainer } from "@/components/containers/MusicVideoContainer"
import { CommercialContainer } from "@/components/containers/CommercialContainer"
import { ChildrenBookContainer } from "@/components/containers/ChildrenBookContainer"
import { ActiveArtistIndicator } from "@/components/shared/ActiveArtistIndicator"
import { useSessionManagement } from "@/hooks/useSessionManagement"
import { useAppStore } from "@/stores/app-store"

// Dynamically import ProjectManager to avoid SSR issues
const ProjectManager = dynamic(
  () => import("@/components/project-manager").then(mod => ({ default: mod.ProjectManager })),
  { ssr: false }
)

export default function Home() {
  const router = useRouter()
  const { mode = "story", showProjectManager = false, setShowProjectManager, currentProjectId, isLoading = false } = useAppStore()
  // Session management hook already loads on mount internally
  useSessionManagement()

  return (
    <ClientOnly>
      <div className="min-h-screen bg-slate-900">
        <div className="p-4">
          <div className="container mx-auto max-w-none w-[95%]">
            <div className="space-y-6">
              {/* Mode Selection */}
              <div className="flex justify-center">
                <ModeSelector />
              </div>
              
              {/* Main Content */}
              <AsyncBoundary isLoading={isLoading}>
                {mode === "story" && <StoryContainer />}
                {mode === "music-video" && <MusicVideoContainer />}
                {mode === "commercial" && <CommercialContainer />}
                {mode === "children-book" && <ChildrenBookContainer />}
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

        {/* Active Artist Indicator */}
        <ActiveArtistIndicator />
        </div>
      </div>
    </ClientOnly>
  )
}