"use client"

import { useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Wand2 } from "lucide-react"
import { ProjectManager } from "@/components/project-manager"
import { ProjectHeader } from "@/components/shared/ProjectHeader"
import { StoryMode } from "@/components/story/StoryMode"
import { MusicVideoMode } from "@/components/music-video/MusicVideoMode"
import { AsyncBoundary } from "@/components/shared/AsyncBoundary"
import { generateBreakdown, generateAdditionalChapterShots } from "./actions-story"
import { generateFullMusicVideoBreakdown, generateAdditionalMusicVideoShots } from "./actions-mv"
import { generateDirectorStyleDetails } from "./actions-shared"
import { useToast } from "@/components/ui/use-toast"
import { curatedFilmDirectors, curatedMusicVideoDirectors } from "@/lib/curated-directors"
import type { FilmDirector, MusicVideoDirector } from "@/lib/director-types"
import { directorDB } from "@/lib/director-db"
import type { ArtistProfile } from "@/lib/artist-types"
import { useAppStore } from "@/stores/app-store"
import { useStoryStore } from "@/stores/story-store"
import { useMusicVideoStore } from "@/stores/music-video-store"
import { useDirectorStore } from "@/stores/director-store"

interface CustomDirector {
  id: string
  name: string
  description: string
  visualLanguage?: string
  visualStyle?: string
  cameraStyle?: string
  colorPalette?: string
  narrativeFocus?: string
  category?: string
  tags?: string[]
  disciplines?: string[]
}

interface CustomMusicVideoDirector {
  id: string
  name: string
  description: string
  visualHallmarks?: string
  narrativeStyle?: string
  pacingAndEnergy?: string
  genres?: string[]
  category?: string
  tags?: string[]
  disciplines?: string[]
}

type Mode = "story" | "music-video"

export default function Home() {
  const { toast } = useToast()

  // Store selectors
  const {
    mode, setMode,
    isLoading, setIsLoading,
    showProjectManager, setShowProjectManager,
    currentProjectId, setCurrentProjectId,
    showCustomDirectorForm, setShowCustomDirectorForm,
    customDirectorName, setCustomDirectorName,
    customDirectorDescription, setCustomDirectorDescription,
    isGeneratingDirectorStyle, setIsGeneratingDirectorStyle
  } = useAppStore()

  const {
    story, setStory,
    storyDirectorNotes, setStoryDirectorNotes,
    selectedDirector, setSelectedDirector,
    titleCardOptions, setTitleCardOptions,
    promptOptions, setPromptOptions,
    breakdown, setBreakdown,
    additionalShots, setAdditionalShots, addAdditionalShots,
    expandedChapters, setExpandedChapters, toggleChapterExpansion,
    selectedChapter, setSelectedChapter
  } = useStoryStore()

  const {
    lyrics, setLyrics,
    songTitle, setSongTitle,
    artist, setArtist,
    genre, setGenre,
    mvConcept, setMvConcept,
    mvDirectorNotes, setMvDirectorNotes,
    selectedArtistId, setSelectedArtistId,
    selectedArtistProfile, setSelectedArtistProfile,
    selectedMusicVideoDirector, setSelectedMusicVideoDirector,
    musicVideoConfig, setMusicVideoConfig,
    showMusicVideoConfig, setShowMusicVideoConfig,
    musicVideoBreakdown, setMusicVideoBreakdown,
    additionalMusicVideoShots, setAdditionalMusicVideoShots, addAdditionalMusicVideoShots,
    expandedSections, setExpandedSections, toggleSectionExpansion,
    selectedMusicVideoSection, setSelectedMusicVideoSection
  } = useMusicVideoStore()

  const {
    customDirectors, setCustomDirectors, addCustomDirector,
    customMusicVideoDirectors, setCustomMusicVideoDirectors, addCustomMusicVideoDirector,
    directorsLoaded, setDirectorsLoaded
  } = useDirectorStore()

  // Load directors from IndexedDB on mount
  useEffect(() => {
    if (directorsLoaded) return
    
    const loadDirectors = async () => {
      try {
        await directorDB.ensureSeeded()
        const [filmDirectors, musicDirectors] = await Promise.all([directorDB.getAllFilm(), directorDB.getAllMusic()])

        const customFilm = filmDirectors.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description || "",
          visualLanguage: d.visualLanguage,
          visualStyle: d.visualStyle,
          cameraStyle: d.cameraStyle,
          colorPalette: d.colorPalette,
          narrativeFocus: d.narrativeFocus,
          category: d.category,
          tags: d.tags,
          disciplines: d.disciplines,
        }))

        const customMusic = musicDirectors.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description || "",
          visualHallmarks: d.visualHallmarks,
          narrativeStyle: d.narrativeStyle,
          pacingAndEnergy: d.pacingAndEnergy,
          genres: Array.isArray(d.genres)
            ? d.genres
            : typeof d.genres === "string"
              ? d.genres
                  .split(",")
                  .map((g: string) => g.trim())
                  .filter(Boolean)
              : [],
          category: d.category,
          tags: d.tags,
          disciplines: d.disciplines,
        }))

        setCustomDirectors(customFilm)
        setCustomMusicVideoDirectors(customMusic)
        setDirectorsLoaded(true)
      } catch (error) {
        console.error("Failed to load directors:", error)
      }
    }

    loadDirectors()
  }, [directorsLoaded, setCustomDirectors, setCustomMusicVideoDirectors, setDirectorsLoaded])

  const allDirectors = customDirectors.length > 0 ? customDirectors : curatedFilmDirectors
  const allMusicVideoDirectors =
    customMusicVideoDirectors.length > 0 ? customMusicVideoDirectors : curatedMusicVideoDirectors

  const selectedDirectorInfo = allDirectors.find((d) => d.id === selectedDirector)
  const selectedMusicVideoDirectorInfo = allMusicVideoDirectors.find((d) => d.id === selectedMusicVideoDirector)

  // Live mode updates from sidebar
  useEffect(() => {
    const onModeChange = (e: Event) => {
      const ce = e as CustomEvent
      const newMode = ce.detail as Mode | undefined
      if (newMode === "story" || newMode === "music-video") {
        setMode(newMode)
      }
    }
    window.addEventListener("dsvb:mode-change", onModeChange as EventListener)
    return () => window.removeEventListener("dsvb:mode-change", onModeChange as EventListener)
  }, [setMode])

  // Navigate-to-project bridge (from /projects)
  useEffect(() => {
    try {
      const navProjectId = localStorage.getItem("dsvb:navigateToProjectId")
      if (navProjectId) {
        setCurrentProjectId(navProjectId)
        localStorage.removeItem("dsvb:navigateToProjectId")
      }
    } catch {}
  }, [setCurrentProjectId])

  // ===== Handlers =====
  const handleGenerateBreakdown = async () => {
    if (!story.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a story first." })
      return
    }

    setIsLoading(true)
    try {
      const result = await generateBreakdown(
        story,
        selectedDirector,
        titleCardOptions,
        allDirectors,
        promptOptions,
        storyDirectorNotes,
      )
      setBreakdown(result)
      setAdditionalShots({})
      if (result?.storyStructure?.chapters?.length) {
        const first = result.storyStructure.chapters[0]
        setExpandedChapters({ ...expandedChapters, [first.id]: true })
      }
      toast({ title: "Success", description: "Story breakdown generated!" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to generate breakdown" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateMusicVideoBreakdown = async () => {
    if (!lyrics.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter song lyrics first." })
      return
    }

    setIsLoading(true)
    try {
      const result = await generateFullMusicVideoBreakdown(
        lyrics,
        songTitle || "Untitled Song",
        artist || "Unknown Artist",
        genre || "Pop",
        musicVideoConfig,
        selectedMusicVideoDirectorInfo,
        { directorNotes: mvDirectorNotes, videoConcept: mvConcept },
        selectedArtistProfile,
      )

      if (!result.isConfigured) {
        setMusicVideoBreakdown(result)
        setShowMusicVideoConfig(true)
      } else {
        setMusicVideoBreakdown(result)
        setShowMusicVideoConfig(false)
        setAdditionalMusicVideoShots({})
        if (result?.musicVideoStructure?.sections?.length) {
          const first = result.musicVideoStructure.sections[0]
          setExpandedSections({ ...expandedSections, [first.id]: true })
        }
        toast({ title: "Success", description: "Music video breakdown generated!" })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate music video breakdown",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateAdditionalShots = async (chapterId: string, categories: string[], customRequest: string) => {
    if (!breakdown) return

    setIsLoading(true)
    try {
      const result = await generateAdditionalChapterShots(
        {
          story,
          director: selectedDirector,
          storyStructure: breakdown.storyStructure,
          chapterId,
          existingBreakdown: breakdown.chapterBreakdowns.find((cb: any) => cb.chapterId === chapterId),
          existingAdditionalShots: additionalShots[chapterId] || [],
          categories,
          customRequest,
        },
        allDirectors,
        promptOptions,
        storyDirectorNotes,
      )

      addAdditionalShots(chapterId, result.newShots)

      toast({ title: "Success", description: `Generated ${result.newShots.length} additional shots!` })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate additional shots",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateAdditionalMusicVideoShots = async (sectionId: string, customRequest: string) => {
    if (!musicVideoBreakdown) return

    setIsLoading(true)
    try {
      const result = await generateAdditionalMusicVideoShots({
        lyrics,
        musicVideoStructure: musicVideoBreakdown.musicVideoStructure,
        sectionId,
        existingBreakdown: musicVideoBreakdown.sectionBreakdowns.find((sb: any) => sb.sectionId === sectionId),
        existingAdditionalShots: additionalMusicVideoShots[sectionId] || [],
        customRequest,
        config: musicVideoConfig,
        selectedMusicVideoDirectorInfo,
        guidance: { directorNotes: mvDirectorNotes, videoConcept: mvConcept },
        artistProfile: selectedArtistProfile,
      })

      addAdditionalMusicVideoShots(sectionId, result.newShots)

      toast({ title: "Success", description: `Generated ${result.newShots.length} additional shots!` })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate additional shots",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Custom director creation stays the same
  const handleCreateCustomDirector = async () => {
    if (!customDirectorName.trim() || !customDirectorDescription.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in both name and description." })
      return
    }

    setIsGeneratingDirectorStyle(true)
    try {
      if (mode === "story") {
        const styleDetails = await generateDirectorStyleDetails(customDirectorName, customDirectorDescription)

        const newDirector: CustomDirector = {
          id: `custom-${Date.now()}`,
          name: customDirectorName,
          description: customDirectorDescription,
          visualLanguage: `${styleDetails.visualHallmarks}. ${styleDetails.narrativeStyle}`,
          colorPalette: "Varied based on project needs",
          narrativeFocus: styleDetails.narrativeStyle,
          category: "Custom",
          tags: [],
          disciplines: [],
        }

        const filmDirector: FilmDirector = {
          ...newDirector,
          domain: "film",
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: true,
          category: "Custom" as const,
        }
        await directorDB.upsertFilm(filmDirector)

        addCustomDirector(newDirector)
        setSelectedDirector(newDirector.id)
      } else {
        const styleDetails = await generateDirectorStyleDetails(customDirectorName, customDirectorDescription)

        const newDirector: CustomMusicVideoDirector = {
          id: `custom-mv-${Date.now()}`,
          name: customDirectorName,
          description: customDirectorDescription,
          visualHallmarks: styleDetails.visualHallmarks,
          narrativeStyle: styleDetails.narrativeStyle,
          pacingAndEnergy: styleDetails.pacingAndEnergy,
          genres: styleDetails.genres.split(",").map((g: string) => g.trim()),
          category: "Custom",
          tags: [],
          disciplines: [],
        }

        const musicDirector: MusicVideoDirector = {
          ...newDirector,
          domain: "music-video",
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: true,
          category: "Custom" as const,
        }
        await directorDB.upsertMusic(musicDirector)

        addCustomMusicVideoDirector(newDirector)
        setSelectedMusicVideoDirector(newDirector.id)
      }

      setShowCustomDirectorForm(false)
      setCustomDirectorName("")
      setCustomDirectorDescription("")
      toast({ title: "Success", description: "Custom director created!" })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create custom director",
      })
    } finally {
      setIsGeneratingDirectorStyle(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: "Content copied to clipboard!" })
  }

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-6">
        <ProjectHeader 
          mode={mode} 
          currentProjectId={currentProjectId}
          onProjectSelect={(projectId) => setCurrentProjectId(projectId)}
        />

        {mode === "story" ? (
          <AsyncBoundary>
            <StoryMode
              story={story}
              setStory={setStory}
              storyDirectorNotes={storyDirectorNotes}
              setStoryDirectorNotes={setStoryDirectorNotes}
              selectedDirector={selectedDirector}
              setSelectedDirector={setSelectedDirector}
              allDirectors={allDirectors}
              titleCardOptions={titleCardOptions}
              setTitleCardOptions={setTitleCardOptions}
              promptOptions={promptOptions}
              setPromptOptions={setPromptOptions}
              breakdown={breakdown}
              setBreakdown={setBreakdown}
              additionalShots={additionalShots}
              setAdditionalShots={setAdditionalShots}
              expandedChapters={expandedChapters}
              setExpandedChapters={setExpandedChapters}
              isLoading={isLoading}
              onGenerateBreakdown={handleGenerateBreakdown}
              onGenerateAdditionalShots={handleGenerateAdditionalShots}
              onCopyToClipboard={copyToClipboard}
            />
          </AsyncBoundary>
        ) : (
          <AsyncBoundary>
            <MusicVideoMode
              lyrics={lyrics}
              setLyrics={setLyrics}
              songTitle={songTitle}
              setSongTitle={setSongTitle}
              artist={artist}
              setArtist={setArtist}
              genre={genre}
              setGenre={setGenre}
              mvConcept={mvConcept}
              setMvConcept={setMvConcept}
              mvDirectorNotes={mvDirectorNotes}
              setMvDirectorNotes={setMvDirectorNotes}
              selectedArtistId={selectedArtistId}
              setSelectedArtistId={setSelectedArtistId}
              selectedArtistProfile={selectedArtistProfile}
              setSelectedArtistProfile={setSelectedArtistProfile}
              selectedMusicVideoDirector={selectedMusicVideoDirector}
              setSelectedMusicVideoDirector={setSelectedMusicVideoDirector}
              allMusicVideoDirectors={allMusicVideoDirectors}
              musicVideoConfig={musicVideoConfig}
              setMusicVideoConfig={setMusicVideoConfig}
              showMusicVideoConfig={showMusicVideoConfig}
              setShowMusicVideoConfig={setShowMusicVideoConfig}
              musicVideoBreakdown={musicVideoBreakdown}
              setMusicVideoBreakdown={setMusicVideoBreakdown}
              additionalMusicVideoShots={additionalMusicVideoShots}
              setAdditionalMusicVideoShots={setAdditionalMusicVideoShots}
              expandedSections={expandedSections}
              setExpandedSections={setExpandedSections}
              isLoading={isLoading}
              onGenerateMusicVideoBreakdown={handleGenerateMusicVideoBreakdown}
              onGenerateAdditionalMusicVideoShots={handleGenerateAdditionalMusicVideoShots}
              onCopyToClipboard={copyToClipboard}
            />
          </AsyncBoundary>
        )}
      </main>
      
      {showProjectManager && (
        <ProjectManager
          currentProject={null}
          onLoadProject={(project: any) => {
            setCurrentProjectId(project.id)
            setShowProjectManager(false)
          }}
          onNewProject={() => {
            setShowProjectManager(false)
          }}
          currentProjectId={currentProjectId || ""}
          onProjectSaved={(projectId: string) => {
            setCurrentProjectId(projectId)
          }}
        />
      )}
    </div>
  )
}