"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import {
  BookOpen,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  Wand2,
  Settings,
  Target,
  Palette,
  Camera,
  Eye,
} from "lucide-react"
import { ProjectManager } from "@/components/project-manager"
import { MusicVideoConfig } from "@/components/music-video-config"
import { LibraryPicker } from "@/components/library-picker"
import { generateBreakdown, generateAdditionalChapterShots } from "./actions-story"
import { generateFullMusicVideoBreakdown, generateAdditionalMusicVideoShots } from "./actions-mv"
import { generateDirectorStyleDetails } from "./actions-shared"
import { useToast } from "@/components/ui/use-toast"
import { curatedFilmDirectors, curatedMusicVideoDirectors } from "@/lib/curated-directors"
import type { FilmDirector, MusicVideoDirector } from "@/lib/director-types"
import { directorDB } from "@/lib/director-db"
import ArtistPicker from "@/components/artist-picker"
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
                  .map((g) => g.trim())
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

  const selectedDirectorInfo = allDirectors.find((d) => d.id === selectedDirector)
  const selectedMusicVideoDirectorInfo = allMusicVideoDirectors.find((d) => d.id === selectedMusicVideoDirector)

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
          disciplines: [],
        }

        const filmDirector: FilmDirector = {
          ...newDirector,
          domain: "film",
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: true,
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
          disciplines: [],
        }

        const musicDirector: MusicVideoDirector = {
          ...newDirector,
          domain: "music-video",
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: true,
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

  const toggleChapterExpansion = (chapterId: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }))
  }

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top navigation removed. Sidebar controls the mode. */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Small mode indicator for clarity */}
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
        </div>

        {mode === "story" ? (
          <div className="space-y-6">
            {/* Story Input Section */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-400" />
                  Story Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your story here..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                />

                {/* Director Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Director Style</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCustomDirectorForm(!showCustomDirectorForm)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Custom
                    </Button>
                  </div>

                  <LibraryPicker
                    value={selectedDirector}
                    onValueChange={setSelectedDirector}
                    directors={allDirectors}
                    placeholder="Select a director style..."
                    domain="film"
                  />

                  {selectedDirectorInfo && (
                    <div className="p-3 bg-slate-900/40 rounded-md border border-slate-700">
                      <div className="text-sm text-slate-300">
                        <div className="font-medium text-white mb-1">{selectedDirectorInfo.name}</div>
                        {selectedDirectorInfo.description && (
                          <div className="mb-2">{selectedDirectorInfo.description}</div>
                        )}
                        {selectedDirectorInfo.visualLanguage && (
                          <div className="text-xs text-slate-400">
                            <span className="text-slate-300 font-medium">Visual Language: </span>
                            {selectedDirectorInfo.visualLanguage}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Director Notes (Story) */}
                <div>
                  <label className="text-sm font-medium text-white mb-1 block">Director's Notes (optional)</label>
                  <Textarea
                    placeholder="Overall creative direction, themes, pacing, references..."
                    value={storyDirectorNotes}
                    onChange={(e) => setStoryDirectorNotes(e.target.value)}
                    rows={3}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                {/* Options */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="text-slate-300 hover:bg-slate-700 p-0">
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Options
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    {/* Title Card Options */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="title-cards"
                          checked={titleCardOptions.enabled}
                          onCheckedChange={(checked) =>
                            setTitleCardOptions((prev) => ({ ...prev, enabled: !!checked }))
                          }
                        />
                        <label htmlFor="title-cards" className="text-sm text-white">
                          Generate Title Cards
                        </label>
                      </div>
                    </div>

                    {/* Prompt Options */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-white">Generation Options</div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="camera-style"
                            checked={promptOptions.includeCameraStyle}
                            onCheckedChange={(checked) =>
                              setPromptOptions((prev) => ({ ...prev, includeCameraStyle: !!checked }))
                            }
                          />
                          <label htmlFor="camera-style" className="text-sm text-slate-300 flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            Include Camera Movement Details
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="color-palette"
                            checked={promptOptions.includeColorPalette}
                            onCheckedChange={(checked) =>
                              setPromptOptions((prev) => ({ ...prev, includeColorPalette: !!checked }))
                            }
                          />
                          <label htmlFor="color-palette" className="text-sm text-slate-300 flex items-center gap-1">
                            <Palette className="h-3 w-3" />
                            Include Color & Lighting Details
                          </label>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Button
                  onClick={handleGenerateBreakdown}
                  disabled={isLoading || !story.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Breakdown...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Generate Story Breakdown
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Story Results */}
            {breakdown && (
              <div className="space-y-6">
                {breakdown.storyStructure.chapters.map((chapter: any, index: number) => {
                  const chapterBreakdown = breakdown.chapterBreakdowns[index]
                  const isExpanded = expandedChapters[chapter.id]
                  const chapterAdditionalShots = additionalShots[chapter.id] || []

                  return (
                    <Card key={chapter.id} className="bg-slate-800/50 border-slate-700">
                      <Collapsible open={isExpanded} onOpenChange={() => toggleChapterExpansion(chapter.id)}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-slate-700/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-white flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-amber-400" />
                                {chapter.title}
                                <Badge variant="secondary" className="bg-slate-600/20 text-slate-300">
                                  {chapter.estimatedDuration}
                                </Badge>
                              </CardTitle>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="space-y-4">
                            <div className="text-sm text-slate-300">
                              <div className="mb-2">
                                <strong>Location:</strong> {chapter.primaryLocation}
                              </div>
                              <div className="mb-2">
                                <strong>Characters:</strong> {chapter.keyCharacters.join(", ")}
                              </div>
                              <div className="mb-4">
                                <strong>Narrative Beat:</strong> {chapter.narrativeBeat}
                              </div>
                            </div>

                            <Separator className="bg-slate-600" />

                            {/* Shots */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-white flex items-center gap-2">
                                  <Eye className="h-4 w-4 text-amber-400" />
                                  Shot List ({chapterBreakdown.shots.length + chapterAdditionalShots.length} shots)
                                </h4>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard([...chapterBreakdown.shots, ...chapterAdditionalShots].join("\n"))
                                  }
                                  className="bg-slate-700 hover:bg-slate-600 text-white"
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {chapterBreakdown.shots.map((shot: string, shotIndex: number) => (
                                  <div
                                    key={shotIndex}
                                    className="p-3 bg-slate-900/40 rounded-md border border-slate-700"
                                  >
                                    <div className="text-sm text-slate-300">{shot}</div>
                                  </div>
                                ))}
                                {chapterAdditionalShots.map((shot: string, shotIndex: number) => (
                                  <div
                                    key={`additional-${shotIndex}`}
                                    className="p-3 bg-purple-900/20 rounded-md border border-purple-700/30"
                                  >
                                    <div className="text-sm text-slate-300">{shot}</div>
                                    <Badge variant="outline" className="mt-2 border-purple-500/30 text-purple-300">
                                      Additional Shot
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Additional Shots Generator */}
                            <div className="p-4 bg-slate-900/30 rounded-md border border-slate-600">
                              <h5 className="font-medium text-white mb-3">Generate Additional Shots</h5>
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                  {["Close-ups", "Wide shots", "Action", "Emotional", "Atmospheric"].map((category) => (
                                    <Badge
                                      key={category}
                                      variant="outline"
                                      className="border-slate-600 text-slate-300 cursor-pointer hover:bg-slate-700"
                                    >
                                      {category}
                                    </Badge>
                                  ))}
                                </div>
                                <input
                                  placeholder="Custom request (optional)..."
                                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleGenerateAdditionalShots(
                                        chapter.id,
                                        ["Close-ups", "Wide shots"],
                                        e.currentTarget.value,
                                      )
                                      e.currentTarget.value = ""
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleGenerateAdditionalShots(chapter.id, ["Close-ups", "Wide shots"], "")
                                  }
                                  disabled={isLoading}
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Generate More Shots
                                </Button>
                              </div>
                            </div>

                            {/* Coverage Analysis */}
                            <div>
                              <h4 className="font-medium text-white mb-2">Coverage Analysis</h4>
                              <div className="p-3 bg-slate-900/40 rounded-md border border-slate-700">
                                <div className="text-sm text-slate-300">{chapterBreakdown.coverageAnalysis}</div>
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Music Video Input Section */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-purple-400" />
                  Music Video Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Artist Picker */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Artist (from Artist Bank)</label>
                  <ArtistPicker
                    value={selectedArtistId}
                    onChange={(id, profile) => {
                      setSelectedArtistId(id)
                      setSelectedArtistProfile(profile)
                      if (profile?.artist_name) {
                        setArtist(profile.artist_name)
                      }
                      if (profile?.genres?.length) {
                        setGenre(profile.genres[0] || "")
                      }
                    }}
                  />
                </div>

                {/* Song Details */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-1 block">Song Title</label>
                    <input
                      placeholder="Enter song title..."
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1 block">Artist Name</label>
                    <input
                      placeholder="Enter artist name..."
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-1 block">Genre</label>
                    <input
                      placeholder="Enter genre..."
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
                    />
                  </div>
                </div>

                <Textarea
                  placeholder="Enter song lyrics here..."
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                />

                {/* Director Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Director Style</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCustomDirectorForm(!showCustomDirectorForm)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Custom
                    </Button>
                  </div>

                  <LibraryPicker
                    value={selectedMusicVideoDirector}
                    onValueChange={setSelectedMusicVideoDirector}
                    directors={allMusicVideoDirectors}
                    placeholder="Select a music video director style..."
                    domain="music-video"
                  />

                  {selectedMusicVideoDirectorInfo && (
                    <div className="p-3 bg-slate-900/40 rounded-md border border-slate-700">
                      <div className="text-sm text-slate-300">
                        <div className="font-medium text-white mb-1">{selectedMusicVideoDirectorInfo.name}</div>
                        {selectedMusicVideoDirectorInfo.description && (
                          <div className="mb-2">{selectedMusicVideoDirectorInfo.description}</div>
                        )}
                        {selectedMusicVideoDirectorInfo.visualHallmarks && (
                          <div className="text-xs text-slate-400 mb-1">
                            <span className="text-slate-300 font-medium">Visual Hallmarks: </span>
                            {selectedMusicVideoDirectorInfo.visualHallmarks}
                          </div>
                        )}
                        {selectedMusicVideoDirectorInfo.genres && selectedMusicVideoDirectorInfo.genres.length > 0 && (
                          <div className="text-xs text-slate-400">
                            <span className="text-slate-300 font-medium">Genres: </span>
                            {selectedMusicVideoDirectorInfo.genres.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Concept + Director Notes */}
                <div>
                  <label className="text-sm font-medium text-white mb-1 block">Video Concept / Story (optional)</label>
                  <Textarea
                    placeholder="Your narrative concept, structure ideas, references..."
                    value={mvConcept}
                    onChange={(e) => setMvConcept(e.target.value)}
                    rows={3}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-1 block">Director's Notes (optional)</label>
                  <Textarea
                    placeholder="Overall creative direction, mood, pacing, visual hallmarks, references..."
                    value={mvDirectorNotes}
                    onChange={(e) => setMvDirectorNotes(e.target.value)}
                    rows={3}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <Button
                  onClick={handleGenerateMusicVideoBreakdown}
                  disabled={isLoading || !lyrics.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Breakdown...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Generate Music Video Breakdown
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Music Video Config */}
            {showMusicVideoConfig && musicVideoBreakdown && (
              <MusicVideoConfig
                treatments={musicVideoBreakdown.treatments}
                selectedTreatment={musicVideoBreakdown.selectedTreatment}
                musicVideoStructure={musicVideoBreakdown.musicVideoStructure}
                lyrics={lyrics}
                onTreatmentChange={(id) => {
                  setMusicVideoConfig((prev: any) => ({ ...(prev || {}), selectedTreatmentId: id }))
                }}
                initialConfig={musicVideoConfig || undefined}
                onBack={() => setShowMusicVideoConfig(false)}
                onConfigurationComplete={(config) => {
                  setMusicVideoConfig({ ...config, isConfigured: true })
                  setShowMusicVideoConfig(false)
                  handleGenerateMusicVideoBreakdown()
                }}
              />
            )}

            {/* Music Video Results */}
            {musicVideoBreakdown && musicVideoBreakdown.isConfigured && (
              <div className="space-y-6">
                {musicVideoBreakdown.musicVideoStructure.sections.map((section: any, index: number) => {
                  const sectionBreakdown = musicVideoBreakdown.sectionBreakdowns[index]
                  const isExpanded = expandedSections[section.id]
                  const sectionAdditionalShots = additionalMusicVideoShots[section.id] || []

                  return (
                    <Card key={section.id} className="bg-slate-800/50 border-slate-700">
                      <Collapsible open={isExpanded} onOpenChange={() => toggleSectionExpansion(section.id)}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-slate-700/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-white flex items-center gap-2">
                                <PlayCircle className="h-5 w-5 text-purple-400" />
                                {section.title}
                                <Badge variant="secondary" className="bg-slate-600/20 text-slate-300">
                                  {section.type}
                                </Badge>
                              </CardTitle>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="space-y-4">
                            <div className="text-sm text-slate-300">
                              <div className="mb-4">
                                <strong>Lyrics:</strong>
                              </div>
                              <div className="p-3 bg-slate-900/40 rounded-md border border-slate-700 mb-4">
                                {section.lyrics}
                              </div>
                            </div>

                            <Separator className="bg-slate-600" />

                            {/* Shots */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-white flex items-center gap-2">
                                  <Eye className="h-4 w-4 text-purple-400" />
                                  Shot List ({sectionBreakdown.shots.length + sectionAdditionalShots.length} shots)
                                </h4>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard([...sectionBreakdown.shots, ...sectionAdditionalShots].join("\n"))
                                  }
                                  className="bg-slate-700 hover:bg-slate-600 text-white"
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {sectionBreakdown.shots.map((shot: string, shotIndex: number) => (
                                  <div
                                    key={shotIndex}
                                    className="p-3 bg-slate-900/40 rounded-md border border-slate-700"
                                  >
                                    <div className="text-sm text-slate-300">{shot}</div>
                                  </div>
                                ))}
                                {sectionAdditionalShots.map((shot: string, shotIndex: number) => (
                                  <div
                                    key={`additional-${shotIndex}`}
                                    className="p-3 bg-purple-900/20 rounded-md border border-purple-700/30"
                                  >
                                    <div className="text-sm text-slate-300">{shot}</div>
                                    <Badge variant="outline" className="mt-2 border-purple-500/30 text-purple-300">
                                      Additional Shot
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Additional Shots Generator */}
                            <div className="p-4 bg-slate-900/30 rounded-md border border-slate-600">
                              <h5 className="font-medium text-white mb-3">Generate Additional Shots</h5>
                              <div className="space-y-3">
                                <input
                                  placeholder="Describe what kind of shots you want..."
                                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleGenerateAdditionalMusicVideoShots(section.id, e.currentTarget.value)
                                      e.currentTarget.value = ""
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleGenerateAdditionalMusicVideoShots(
                                      section.id,
                                      "More creative performance shots",
                                    )
                                  }
                                  disabled={isLoading}
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Generate More Shots
                                </Button>
                              </div>
                            </div>

                            {/* Performance Notes */}
                            {sectionBreakdown.performanceNotes && sectionBreakdown.performanceNotes.length > 0 && (
                              <div>
                                <h4 className="font-medium text-white mb-2">Performance Notes</h4>
                                <div className="space-y-2">
                                  {sectionBreakdown.performanceNotes.map((note: string, noteIndex: number) => (
                                    <div
                                      key={noteIndex}
                                      className="p-3 bg-slate-900/40 rounded-md border border-slate-700"
                                    >
                                      <div className="text-sm text-slate-300">{note}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
      {showProjectManager && (
        <ProjectManager
          isOpen={showProjectManager}
          onClose={() => setShowProjectManager(false)}
          onProjectSelect={(projectId) => {
            setCurrentProjectId(projectId)
          }}
        />
      )}
    </div>
  )
}
