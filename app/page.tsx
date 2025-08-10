"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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

type Mode = "story" | "music-video"

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

const SESSION_KEY = "dsvb:session:v3"

export default function Home() {
  const { toast } = useToast()

  // Mode and UI state (controlled by left sidebar)
  const [mode, setMode] = useState<Mode>("story")
  const [story, setStory] = useState("")
  const [storyDirectorNotes, setStoryDirectorNotes] = useState("")

  const [lyrics, setLyrics] = useState("")
  const [songTitle, setSongTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [genre, setGenre] = useState("")
  const [mvConcept, setMvConcept] = useState("")
  const [mvDirectorNotes, setMvDirectorNotes] = useState("")

  // Artist selection
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null)
  const [selectedArtistProfile, setSelectedArtistProfile] = useState<ArtistProfile | undefined>(undefined)

  // Director selection
  const [selectedDirector, setSelectedDirector] = useState("nolan")
  const [selectedMusicVideoDirector, setSelectedMusicVideoDirector] = useState("hype-williams")
  const [customDirectors, setCustomDirectors] = useState<CustomDirector[]>([])
  const [customMusicVideoDirectors, setCustomMusicVideoDirectors] = useState<CustomMusicVideoDirector[]>([])

  // Custom director creation
  const [showCustomDirectorForm, setShowCustomDirectorForm] = useState(false)
  const [customDirectorName, setCustomDirectorName] = useState("")
  const [customDirectorDescription, setCustomDirectorDescription] = useState("")
  const [isGeneratingDirectorStyle, setIsGeneratingDirectorStyle] = useState(false)

  // Results
  const [breakdown, setBreakdown] = useState<any>(null)
  const [musicVideoBreakdown, setMusicVideoBreakdown] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [additionalShots, setAdditionalShots] = useState<{ [key: string]: string[] }>({})
  const [additionalMusicVideoShots, setAdditionalMusicVideoShots] = useState<{ [key: string]: string[] }>({})

  // Options
  const [titleCardOptions, setTitleCardOptions] = useState({
    enabled: false,
    format: "full" as "full" | "name-only" | "roman-numerals",
    approaches: [] as string[],
  })
  const [promptOptions, setPromptOptions] = useState({
    includeCameraStyle: true,
    includeColorPalette: true,
  })

  // Music video specific
  const [musicVideoConfig, setMusicVideoConfig] = useState<any>(null)
  const [showMusicVideoConfig, setShowMusicVideoConfig] = useState(false)

  // Expanded sections
  const [expandedChapters, setExpandedChapters] = useState<{ [key: string]: boolean }>({})
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

  // Project Manager State
  const [showProjectManager, setShowProjectManager] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState("")
  const [selectedMusicVideoSection, setSelectedMusicVideoSection] = useState("")

  // Load directors from IndexedDB on mount
  useEffect(() => {
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
      } catch (error) {
        console.error("Failed to load directors:", error)
      }
    }

    loadDirectors()
  }, [])

  const allDirectors = customDirectors.length > 0 ? customDirectors : curatedFilmDirectors
  const allMusicVideoDirectors =
    customMusicVideoDirectors.length > 0 ? customMusicVideoDirectors : curatedMusicVideoDirectors

  const selectedDirectorInfo = allDirectors.find((d: any) => d.id === selectedDirector)
  const selectedMusicVideoDirectorInfo = allMusicVideoDirectors.find((d: any) => d.id === selectedMusicVideoDirector)

  // ----- Session + Mode Persistence: Restore on mount -----
  const loadedRef = useRef(false)
  useEffect(() => {
    if (loadedRef.current) return
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        setMode(s.mode ?? "story")
        setStory(s.story ?? "")
        setStoryDirectorNotes(s.storyDirectorNotes ?? "")
        setLyrics(s.lyrics ?? "")
        setSongTitle(s.songTitle ?? "")
        setArtist(s.artist ?? "")
        setGenre(s.genre ?? "")
        setMvConcept(s.mvConcept ?? "")
        setMvDirectorNotes(s.mvDirectorNotes ?? "")
        setSelectedDirector(s.selectedDirector ?? "nolan")
        setSelectedMusicVideoDirector(s.selectedMusicVideoDirector ?? "hype-williams")
        setSelectedArtistId(s.selectedArtistId ?? null)
        setSelectedArtistProfile(s.selectedArtistProfile ?? undefined)
        setBreakdown(s.breakdown ?? null)
        setMusicVideoBreakdown(s.musicVideoBreakdown ?? null)
        setAdditionalShots(s.additionalShots ?? {})
        setAdditionalMusicVideoShots(s.additionalMusicVideoShots ?? {})
        setTitleCardOptions(s.titleCardOptions ?? { enabled: false, format: "full", approaches: [] })
        setPromptOptions(s.promptOptions ?? { includeCameraStyle: true, includeColorPalette: true })
        setMusicVideoConfig(s.musicVideoConfig ?? null)
        setShowMusicVideoConfig(s.showMusicVideoConfig ?? false)
        setExpandedChapters(s.expandedChapters ?? {})
        setExpandedSections(s.expandedSections ?? {})
        setSelectedChapter(s.selectedChapter ?? "")
        setSelectedMusicVideoSection(s.selectedMusicVideoSection ?? "")
      }

      // Apply mode requested from sidebar if present
      try {
        const sidebarMode = localStorage.getItem("dsvb:mode")
        if (sidebarMode === "story" || sidebarMode === "music-video") {
          setMode(sidebarMode)
        }
      } catch {}

      // Navigate-to-project bridge (from /projects)
      try {
        const navProjectId = localStorage.getItem("dsvb:navigateToProjectId")
        if (navProjectId) {
          setCurrentProjectId(navProjectId)
          localStorage.removeItem("dsvb:navigateToProjectId")
        }
      } catch {}
    } catch (e) {
      console.warn("Failed to restore session:", e)
    } finally {
      loadedRef.current = true
    }
  }, [])

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
  }, [])

  // ----- Session Persistence: Auto-save (debounced) -----
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const snapshot = useMemo(
    () => ({
      mode,
      story,
      storyDirectorNotes,
      lyrics,
      songTitle,
      artist,
      genre,
      mvConcept,
      mvDirectorNotes,
      selectedDirector,
      selectedMusicVideoDirector,
      selectedArtistId,
      selectedArtistProfile,
      breakdown,
      musicVideoBreakdown,
      additionalShots,
      additionalMusicVideoShots,
      titleCardOptions,
      promptOptions,
      musicVideoConfig,
      showMusicVideoConfig,
      expandedChapters,
      expandedSections,
      selectedChapter,
      selectedMusicVideoSection,
    }),
    [
      mode,
      story,
      storyDirectorNotes,
      lyrics,
      songTitle,
      artist,
      genre,
      mvConcept,
      mvDirectorNotes,
      selectedDirector,
      selectedMusicVideoDirector,
      selectedArtistId,
      selectedArtistProfile,
      breakdown,
      musicVideoBreakdown,
      additionalShots,
      additionalMusicVideoShots,
      titleCardOptions,
      promptOptions,
      musicVideoConfig,
      showMusicVideoConfig,
      expandedChapters,
      expandedSections,
      selectedChapter,
      selectedMusicVideoSection,
    ],
  )

  useEffect(() => {
    if (!loadedRef.current) return
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot))
      } catch (e) {
        console.warn("Failed to persist session:", e)
      }
    }, 400)
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [snapshot])

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
        setExpandedChapters((prev) => ({ ...prev, [first.id]: true }))
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
          setExpandedSections((prev) => ({ ...prev, [first.id]: true }))
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

      setAdditionalShots((prev) => ({
        ...prev,
        [chapterId]: [...(prev[chapterId] || []), ...result.newShots],
      }))

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

      setAdditionalMusicVideoShots((prev) => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] || []), ...result.newShots],
      }))

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
          disciplines: [] as any,
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

        setCustomDirectors((prev) => [...prev, newDirector])
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
          disciplines: [] as any,
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

        setCustomMusicVideoDirectors((prev) => [...prev, newDirector])
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