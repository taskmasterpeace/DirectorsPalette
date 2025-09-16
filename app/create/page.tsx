"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, HelpCircle } from "lucide-react"
import { AsyncBoundary } from "@/components/shared/AsyncBoundary"
import { ClientOnly } from "@/components/ClientOnly"
import { EnhancedModeSelector } from "@/components/containers/EnhancedModeSelector"
import { StoryContainer } from "@/components/containers/StoryContainer"
import { MusicVideoContainer } from "@/components/containers/MusicVideoContainer"
import { CommercialContainer } from "@/components/containers/CommercialContainer"
import { ChildrenBookContainerNew as ChildrenBookContainer } from "@/components/containers/ChildrenBookContainerNew"
import { 
  StoryModeBackground, 
  MusicVideoModeBackground, 
  CommercialModeBackground, 
  ChildrenBookModeBackground 
} from "@/components/shared/ModeBackground"
import { ActiveArtistIndicator } from "@/components/shared/ActiveArtistIndicator"
import { useSessionManagement } from "@/hooks/useSessionManagement"
import { useAppStore } from "@/stores/app-store"
import { UniversalCreditGuard } from "@/components/ui/UniversalCreditGuard"

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

  // Apply mode-specific background to the page
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    
    // Clear any existing mode classes
    root.classList.remove('mode-story', 'mode-music-video', 'mode-commercial', 'mode-children-book')
    
    // Apply current mode
    root.classList.add(`mode-${mode}`)
    
    // Set CSS custom properties for backgrounds
    const backgroundImages = {
      'story': "url('/images/mode-backgrounds/story-mode.png')",
      'music-video': "url('/images/mode-backgrounds/music-video-mode.png')",
      'commercial': "url('/images/mode-backgrounds/commercial-mode.png')",
      'children-book': "url('/images/mode-backgrounds/children-book-mode.png')"
    }
    
    const backgroundOverlays = {
      'story': 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.90))',
      'music-video': 'linear-gradient(135deg, rgba(120, 53, 15, 0.85), rgba(194, 65, 12, 0.80))',
      'commercial': 'linear-gradient(135deg, rgba(133, 77, 14, 0.80), rgba(180, 83, 9, 0.85))',
      'children-book': 'linear-gradient(135deg, rgba(254, 242, 242, 0.90), rgba(254, 215, 215, 0.85))'
    }
    
    root.style.setProperty('--mode-background-image', backgroundImages[mode])
    root.style.setProperty('--mode-background-overlay', backgroundOverlays[mode])
    
    return () => {
      // Cleanup on unmount
      root.classList.remove(`mode-${mode}`)
    }
  }, [mode])

  return (
    <ClientOnly>
      <UniversalCreditGuard
        minCreditsRequired={15}
        operation="generate content"
      >
        <div className="min-h-screen relative">
        {/* Global Mode Background */}
        <div 
          className="fixed inset-0 bg-no-repeat bg-center -z-10"
          style={{
            backgroundImage: 'var(--mode-background-image)',
            backgroundSize: '120% auto',
            backgroundPosition: 'center 25%',
            filter: 'brightness(0.6) contrast(1.1)'
          }}
        />
        <div 
          className="fixed inset-0 -z-10"
          style={{
            background: 'var(--mode-background-overlay)'
          }}
        />
        
        <div className="p-4">
          <div className="container mx-auto max-w-none w-[95%]">
            <div className="space-y-6">
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
      </UniversalCreditGuard>
    </ClientOnly>
  )
}