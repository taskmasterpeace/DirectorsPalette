"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, PlayCircle, ChevronDown, ChevronUp, Copy, Plus, Wand2, Settings, Target, Palette, Camera, Eye, FolderOpen, Sparkles } from 'lucide-react'
import { MusicVideoConfig } from "@/components/music-video-config"
import { LibraryPicker } from "@/components/library-picker"
import { AppShellLeftNav } from "@/components/app-shell-left-nav"
import { ProjectManagerModal } from "@/components/project-manager-modal"
import { generateBreakdown, generateAdditionalChapterShots, generateFullMusicVideoBreakdown, generateAdditionalMusicVideoShots, generateStoryEntities } from "./actions"
import { useToast } from "@/hooks/use-toast"
import type { FilmDirector, MusicVideoDirector } from "@/lib/director-types"
import { directorDB } from "@/lib/director-db"
import { projectDB, type SavedProject } from "@/lib/indexeddb"
import { DirectorFilmForm } from "@/components/director-film-form"
import { DirectorMusicForm } from "@/components/director-music-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TopActionsMenu } from "@/components/top-actions-menu"
import { EmptyState } from "@/components/empty-state"
import { StoryEntitiesConfig, type StoryEntities } from "@/components/story-entities-config"

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

function withTimeout<T>(p: Promise<T>, ms = 120000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("Request timed out. Please try again.")), ms)),
  ]) as Promise<T>;
}

export default function Home() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Mode and inputs
  const [mode, setMode] = useState<Mode>("story")
  const [story, setStory] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [songTitle, setSongTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [genre, setGenre] = useState("")

  // Directors
  const [selectedDirector, setSelectedDirector] = useState("")
  const [selectedMusicVideoDirector, setSelectedMusicVideoDirector] = useState("")
  const [customDirectors, setCustomDirectors] = useState<CustomDirector[]>([])
  const [customMusicVideoDirectors, setCustomMusicVideoDirectors] = useState<CustomMusicVideoDirector[]>([])

  // Create Director modal
  const [createOpen, setCreateOpen] = useState(false)

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

  // Music video config
  const [musicVideoConfig, setMusicVideoConfig] = useState<any>(null)
  const [showMusicVideoConfig, setShowMusicVideoConfig] = useState(false)

  // Expanded UI
  const [expandedChapters, setExpandedChapters] = useState<{ [key: string]: boolean }>({})
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

  // Projects
  const [showProjects, setShowProjects] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string>("")
  const [selectedChapter, setSelectedChapter] = useState("")
  const [selectedMusicVideoSection, setSelectedMusicVideoSection] = useState("")

  // Story entities
  const [storyEntities, setStoryEntities] = useState<StoryEntities | null>(null)
  const [isExtractingEntities, setIsExtractingEntities] = useState(false)

  // Load directors on mount
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
            ? d.genres.split(",").map((g) => g.trim()).filter(Boolean)
            : [],
          category: d.category,
          tags: d.tags,
          disciplines: d.disciplines,
        }))

        const dedupeById = <T extends { id: string }>(arr: T[]) => Array.from(new Map(arr.map((a) => [a.id, a])).values())

        setCustomDirectors(dedupeById(customFilm))
        setCustomMusicVideoDirectors(dedupeById(customMusic))
      } catch (error) {
        console.error("Failed to load directors:", error)
      }
    }
    loadDirectors()
  }, [])

  // Load project from ?project=
  useEffect(() => {
    const loadFromQuery = async () => {
      const id = searchParams.get("project")
      if (!id) return
      try {
        const project = await projectDB.getProject(id)
        if (project) {
          applyLoadedProject(project)
          setCurrentProjectId(project.id)
          toast({ title: "Loaded", description: `Project "${project.name}" opened.` })
        }
      } catch (e) {
        console.error("Failed to load project from query:", e)
      } finally {
        router.replace("/")
      }
    }
    loadFromQuery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const allDirectors = customDirectors
  const allMusicVideoDirectors = customMusicVideoDirectors
  const selectedDirectorInfo = allDirectors.find((d) => d.id === selectedDirector)
  const selectedMusicVideoDirectorInfo = allMusicVideoDirectors.find((d) => d.id === selectedMusicVideoDirector)

  const currentProject: any = {
    name: mode === "music-video" ? songTitle || "Untitled MV Project" : "Story Project",
    isMusicVideoMode: mode === "music-video",
    story,
    breakdown,
    additionalShots,
    selectedDirector,
    musicVideoData: { songTitle, artist, genre, lyrics },
    musicVideoBreakdown,
    musicVideoConfig,
    additionalMusicVideoShots,
    selectedMusicVideoDirector,
    selectedMusicVideoSection,
    customDirectors,
    customMusicVideoDirectors,
    promptOptions,
    titleCardOptions,
    selectedChapter,
    expandedChapters,
    expandedSections,
    storyEntities,
  }

  const applyLoadedProject = (project: SavedProject) => {
    setMode(project.isMusicVideoMode ? "music-video" : "story")
    setStory(project.story || "")
    setBreakdown(project.breakdown || null)
    setAdditionalShots(project.additionalShots || {})
    setSelectedDirector(project.selectedDirector ?? "")

    setLyrics(project.musicVideoData?.lyrics || "")
    setSongTitle(project.musicVideoData?.songTitle || "")
    setArtist(project.musicVideoData?.artist || "")
    setGenre(project.musicVideoData?.genre || "")
    setMusicVideoBreakdown(project.musicVideoBreakdown || null)
    setAdditionalMusicVideoShots(project.additionalMusicVideoShots || {})
    setSelectedMusicVideoDirector(project.selectedMusicVideoDirector ?? "")
    setSelectedMusicVideoSection(project.selectedMusicVideoSection || "")

    setMusicVideoConfig(project.musicVideoConfig ? project.musicVideoConfig : null)

    setSelectedChapter(project.selectedChapter || "")
    setExpandedChapters(project.expandedChapters || {})
    setExpandedSections(project.expandedSections || {})
    setStoryEntities(project.storyEntities || null)
  }

  const handleLoadProject = (project: SavedProject) => {
    applyLoadedProject(project)
    setCurrentProjectId(project.id)
    setShowProjects(false)
  }

  const handleNewProject = () => {
    setMode("story")
    setStory("")
    setBreakdown(null)
    setAdditionalShots({})
    setLyrics("")
    setSongTitle("")
    setArtist("")
    setGenre("")
    setMusicVideoBreakdown(null)
    setMusicVideoConfig(null)
    setAdditionalMusicVideoShots({})
    setSelectedChapter("")
    setSelectedMusicVideoSection("")
    setCurrentProjectId("")
    setShowProjects(false)
    setSelectedDirector("")
    setSelectedMusicVideoDirector("")
    setStoryEntities(null)
  }

  const handleProjectSaved = (projectId: string) => setCurrentProjectId(projectId)

  const handleCreateFilmDirector = async (director: FilmDirector) => {
    try {
      await directorDB.upsertFilm(director)
      setCreateOpen(false)
      setSelectedDirector(director.id)
      setCustomDirectors((prev) => (prev.some((d) => d.id === director.id) ? prev : [...prev, {
        id: director.id,
        name: director.name,
        description: director.description || "",
        visualLanguage: director.visualLanguage,
        colorPalette: director.colorPalette,
        narrativeFocus: director.narrativeFocus,
        category: director.category,
        tags: director.tags,
        disciplines: director.disciplines,
      }]))
      toast({ title: "Created", description: "Film director added to your library." })
    } catch (e) {
      console.error(e)
      toast({ variant: "destructive", title: "Save failed", description: "Unable to create director." })
    }
  }

  const handleCreateMusicDirector = async (director: MusicVideoDirector) => {
    try {
      await directorDB.upsertMusic(director)
      setCreateOpen(false)
      setSelectedMusicVideoDirector(director.id)
      setCustomMusicVideoDirectors((prev) => (prev.some((d) => d.id === director.id) ? prev : [...prev, {
        id: director.id,
        name: director.name,
        description: director.description || "",
        visualHallmarks: director.visualHallmarks,
        narrativeStyle: director.narrativeStyle,
        pacingAndEnergy: director.pacingAndEnergy,
        genres: Array.isArray(director.genres) ? director.genres : [],
        category: director.category,
        tags: director.tags,
        disciplines: director.disciplines,
      }]))
      toast({ title: "Created", description: "Music video director added to your library." })
    } catch (e) {
      console.error(e)
      toast({ variant: "destructive", title: "Save failed", description: "Unable to create director." })
    }
  }

  const handleGenerateBreakdown = async () => {
    if (!story.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a story first." })
      return
    }
    setIsLoading(true)
    try {
      const result = await withTimeout(
        generateBreakdown(
          story,
          selectedDirector,
          titleCardOptions,
          allDirectors,
          promptOptions
        ),
        180000
      )
      setBreakdown(result)
      console.log("Story breakdown result:", result)
      setStoryEntities(result.entities || null)
      setAdditionalShots({})

      if (result?.storyStructure?.chapters?.length) {
        const first = result.storyStructure.chapters[0];
        setExpandedChapters(prev => ({ ...prev, [first.id]: true }));
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
      const result = await withTimeout(
        generateFullMusicVideoBreakdown(
          lyrics,
          songTitle || "Untitled Song",
          artist || "Unknown Artist",
          genre || "Pop",
          musicVideoConfig,
          selectedMusicVideoDirectorInfo
        ),
        180000
      )

      if (!result.isConfigured) {
        setMusicVideoBreakdown(result)
        setShowMusicVideoConfig(true)
      } else {
        setMusicVideoBreakdown(result)
        setShowMusicVideoConfig(false)
        setAdditionalMusicVideoShots({})

        if (result?.musicVideoStructure?.sections?.length && result.isConfigured) {
          const first = result.musicVideoStructure.sections[0];
          setExpandedSections(prev => ({ ...prev, [first.id]: true }));
        }

        toast({ title: "Success", description: "Music video breakdown generated!" })
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to generate music video breakdown" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateAdditionalShots = async (chapterId: string, categories: string[], customRequest: string) => {
    if (!breakdown) return
    setIsLoading(true)
    try {
      const result = await withTimeout(
        generateAdditionalChapterShots(
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
          promptOptions
        ),
        120000
      )

      setAdditionalShots((prev) => ({
        ...prev,
        [chapterId]: [...(prev[chapterId] || []), ...result.newShots],
      }))

      toast({ title: "Success", description: `Generated ${result.newShots.length} additional shots!` })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to generate additional shots" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateAdditionalMusicVideoShots = async (sectionId: string, customRequest: string) => {
    if (!musicVideoBreakdown) return
    setIsLoading(true)
    try {
      const result = await withTimeout(
        generateAdditionalMusicVideoShots({
          lyrics,
          musicVideoStructure: musicVideoBreakdown.musicVideoStructure,
          sectionId,
          existingBreakdown: musicVideoBreakdown.sectionBreakdowns.find((sb: any) => sb.sectionId === sectionId),
          existingAdditionalShots: additionalMusicVideoShots[sectionId] || [],
          customRequest,
          config: musicVideoConfig,
          selectedMusicVideoDirectorInfo,
        }),
        120000
      )

      setAdditionalMusicVideoShots((prev) => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] || []), ...result.newShots],
      }))

      toast({ title: "Success", description: `Generated ${result.newShots.length} additional shots!` })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to generate additional shots" })
    } finally {
      setIsLoading(false)
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

  const handleAutoGenerateEntities = async () => {
    if (!story.trim() || !breakdown?.storyStructure) return
    setIsExtractingEntities(true)
    try {
      const result = await generateStoryEntities(story, breakdown.storyStructure, selectedDirectorInfo)
      setStoryEntities(result)
      toast({ title: "Updated", description: "Entities extracted from story." })
    } catch (e: any) {
      console.error(e)
      toast({ variant: "destructive", title: "Error", description: e?.message || "Failed to extract entities" })
    } finally {
      setIsExtractingEntities(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <TopActionsMenu
        mode={mode}
        onOpenProjects={() => {
          setShowProjects(true)
          setSelectedChapter("")
          setSelectedMusicVideoSection("")
        }}
        onNewProject={handleNewProject}
        onGenerate={mode === "story" ? handleGenerateBreakdown : handleGenerateMusicVideoBreakdown}
        canGenerate={mode === "story" ? Boolean(story.trim()) : Boolean(lyrics.trim())}
      />
      <AppShellLeftNav
        active={mode === "music-video" ? "music" : "story"}
        onStory={() => setMode("story")}
        onMusic={() => setMode("music-video")}
        libraryHref="/director-library"
        projectsHref="/"
        onOpenProjects={() => {
          setShowProjects(true)
          setSelectedChapter("")
          setSelectedMusicVideoSection("")
        }}
        currentProjectId={currentProjectId || null}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        {mode === "story" ? (
          <div className="space-y-6">
            {/* Story Input */}
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

                {/* Director selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Director Style</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCreateOpen(true)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
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
                        {selectedDirectorInfo.description && <div className="mb-2">{selectedDirectorInfo.description}</div>}
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

                {/* Advanced options */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="text-slate-300 hover:bg-slate-700 p-0">
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Options
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="title-cards"
                          checked={titleCardOptions.enabled}
                          onCheckedChange={(checked) => setTitleCardOptions((prev) => ({ ...prev, enabled: !!checked }))}
                        />
                        <label htmlFor="title-cards" className="text-sm text-white">
                          Generate Title Cards
                        </label>
                      </div>
                    </div>

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

            {breakdown && (
              <StoryEntitiesConfig
                chapters={breakdown.storyStructure.chapters.map((c: any) => ({ id: c.id, title: c.title }))}
                initial={storyEntities}
                onChange={setStoryEntities}
                onAutoGenerate={handleAutoGenerateEntities}
                isGenerating={isExtractingEntities}
              />
            )}

            {breakdown && Array.isArray(breakdown?.storyStructure?.chapters) && breakdown.storyStructure.chapters.length === 0 && (
              <EmptyState
                title="No chapters detected"
                description="The generator returned no chapters for this story. Try a longer excerpt, include clearer paragraph breaks, or retry."
                primaryAction={{ label: "Retry Generation", onClick: handleGenerateBreakdown, disabled: isLoading || !story.trim() }}
                secondaryAction={{
                  label: "Show Debug JSON",
                  onClick: () => {
                    // simple inline toggle via query param to avoid extra state
                    const e = document.getElementById("debug-breakdown")
                    if (e) e.classList.toggle("hidden")
                  },
                }}
                icon={<BookOpen className="h-12 w-12" />}
                className="border-slate-700/80 bg-slate-900/50"
              />
            )}

            {/* Debug JSON (toggle via 'Show Debug JSON') */}
            {breakdown && (
              <pre
                id="debug-breakdown"
                className="hidden whitespace-pre-wrap break-words rounded-md border border-slate-700 bg-slate-900/60 p-4 text-xs text-slate-300"
                aria-label="Debug breakdown JSON"
              >
                {JSON.stringify(breakdown, null, 2)}
              </pre>
            )}

            {!breakdown && (
              <EmptyState
                title="No chapters yet"
                description="Paste your story and generate a breakdown to see chapters with shot lists and coverage notes."
                primaryAction={{ label: "Generate Story Breakdown", onClick: handleGenerateBreakdown, disabled: !story.trim() }}
                secondaryAction={{
                  label: "Open Projects",
                  onClick: () => {
                    setShowProjects(true)
                    setSelectedChapter("")
                    setSelectedMusicVideoSection("")
                  },
                }}
                icon={<BookOpen className="h-12 w-12" />}
                className="border-slate-700/80 bg-slate-900/50"
              />
            )}

            {/* Results */}
            {breakdown && (
              <div className="space-y-6">
                {breakdown.storyStructure.chapters.map((chapter: any, index: number) => {
                  const chapterBreakdown = breakdown?.chapterBreakdowns?.[index]
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
                            {!chapterBreakdown || !Array.isArray(chapterBreakdown.shots) ? (
                              <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-md text-red-200 text-sm">
                                {"This chapter breakdown could not be generated. Try regenerating or adjusting the story."}
                              </div>
                            ) : null}

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
                                  Shot List {(chapterBreakdown?.shots?.length || 0) + chapterAdditionalShots.length > 0
                                    ? `(${(chapterBreakdown?.shots?.length || 0) + chapterAdditionalShots.length} shots)`
                                    : ""}
                                </h4>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard([...(chapterBreakdown?.shots || []), ...(chapterAdditionalShots || [])].join("\n"))
                                  }
                                  className="bg-slate-700 hover:bg-slate-600 text-white"
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {(chapterBreakdown?.shots || []).map((shot: string, i: number) => (
                                  <div key={i} className="p-3 bg-slate-900/40 rounded-md border border-slate-700">
                                    <div className="text-sm text-slate-300">{shot}</div>
                                  </div>
                                ))}
                                {chapterAdditionalShots.map((shot: string, i: number) => (
                                  <div key={`additional-${i}`} className="p-3 bg-purple-900/20 rounded-md border border-purple-700/30">
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
                                    <Badge key={category} variant="outline" className="border-slate-600 text-slate-300">
                                      {category}
                                    </Badge>
                                  ))}
                                </div>
                                <input
                                  placeholder="Custom request (optional)..."
                                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleGenerateAdditionalShots(chapter.id, ["Close-ups", "Wide shots"], e.currentTarget.value)
                                      e.currentTarget.value = ""
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleGenerateAdditionalShots(chapter.id, ["Close-ups", "Wide shots"], "")}
                                  disabled={isLoading}
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Generate More Shots
                                </Button>
                              </div>
                            </div>

                            {/* Coverage Analysis */}
                            {chapterBreakdown?.coverageAnalysis ? (
                              <div>
                                <h4 className="font-medium text-white mb-2">Coverage Analysis</h4>
                                <div className="p-3 bg-slate-900/40 rounded-md border border-slate-700">
                                  <div className="text-sm text-slate-300">{chapterBreakdown.coverageAnalysis}</div>
                                </div>
                              </div>
                            ) : null}
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
            {/* Music Video Input */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-purple-400" />
                  Music Video Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <label className="text-sm font-medium text-white mb-1 block">Artist</label>
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

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Director Style</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCreateOpen(true)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
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
                      </div>
                    </div>
                  )}
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

            {!musicVideoBreakdown && (
              <EmptyState
                title="No sections yet"
                description="Enter lyrics and generate a music video breakdown to see sections with shot lists and performance notes."
                primaryAction={{
                  label: "Generate Music Video Breakdown",
                  onClick: handleGenerateMusicVideoBreakdown,
                  disabled: !lyrics.trim(),
                }}
                secondaryAction={{
                  label: "Open Projects",
                  onClick: () => {
                    setShowProjects(true)
                    setSelectedChapter("")
                    setSelectedMusicVideoSection("")
                  },
                }}
                icon={<PlayCircle className="h-12 w-12" />}
                className="border-slate-700/80 bg-slate-900/50"
              />
            )}

            {showMusicVideoConfig && musicVideoBreakdown && (
              <MusicVideoConfig
                treatments={musicVideoBreakdown.treatments}
                selectedTreatment={musicVideoBreakdown.selectedTreatment}
                musicVideoStructure={musicVideoBreakdown.musicVideoStructure}
                lyrics={lyrics}
                onTreatmentChange={() => {}}
                onBack={() => setShowMusicVideoConfig(false)}
                onConfigurationComplete={(config) => {
                  setMusicVideoConfig({ ...config, isConfigured: true })
                  setShowMusicVideoConfig(false)
                  handleGenerateMusicVideoBreakdown()
                }}
                initialConfig={musicVideoConfig || undefined}
              />
            )}

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
                              <div className="p-3 bg-slate-900/40 rounded-md border border-slate-700 mb-4">{section.lyrics}</div>
                            </div>

                            <Separator className="bg-slate-600" />

                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-white flex items-center gap-2">
                                  <Eye className="h-4 w-4 text-purple-400" />
                                  Shot List {(sectionBreakdown.shots.length + sectionAdditionalShots.length) > 0
                                    ? `(${sectionBreakdown.shots.length + sectionAdditionalShots.length} shots)` : ""}
                                </h4>
                                <Button
                                  size="sm"
                                  onClick={() => copyToClipboard([...sectionBreakdown.shots, ...sectionAdditionalShots].join("\n"))}
                                  className="bg-slate-700 hover:bg-slate-600 text-white"
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {sectionBreakdown.shots.map((shot: string, i: number) => (
                                  <div key={i} className="p-3 bg-slate-900/40 rounded-md border border-slate-700">
                                    <div className="text-sm text-slate-300">{shot}</div>
                                  </div>
                                ))}
                                {sectionAdditionalShots.map((shot: string, i: number) => (
                                  <div key={`additional-${i}`} className="p-3 bg-purple-900/20 rounded-md border border-purple-700/30">
                                    <div className="text-sm text-slate-300">{shot}</div>
                                    <Badge variant="outline" className="mt-2 border-purple-500/30 text-purple-300">
                                      Additional Shot
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>

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
                                  onClick={() => handleGenerateAdditionalMusicVideoShots(section.id, "More creative performance shots")}
                                  disabled={isLoading}
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Generate More Shots
                                </Button>
                              </div>
                            </div>

                            {sectionBreakdown.performanceNotes?.length > 0 ? (
                              <div>
                                <h4 className="font-medium text-white mb-2">Performance Notes</h4>
                                <div className="space-y-2">
                                  {sectionBreakdown.performanceNotes.map((note: string, i: number) => (
                                    <div key={i} className="p-3 bg-slate-900/40 rounded-md border border-slate-700">
                                      <div className="text-sm text-slate-300">{note}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
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

      {/* Projects Overlay */}
      <ProjectManagerModal
        open={showProjects}
        onOpenChange={setShowProjects}
        currentProject={currentProject}
        onLoadProject={handleLoadProject}
        onNewProject={handleNewProject}
        currentProjectId={currentProjectId}
        onProjectSaved={handleProjectSaved}
      />

      {/* Creation Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="z-50 flex h-screen w-screen flex-col bg-slate-950 border border-slate-800 p-0 sm:h-[85vh] sm:w-[92vw] sm:max-w-3xl sm:rounded-xl">
          <DialogHeader className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950 px-4 py-3 sm:px-6">
            <DialogTitle className="text-white">
              {mode === "music-video" ? "New Music Video Director" : "New Film Director"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-6">
            {mode === "music-video" ? (
              <DirectorMusicForm onCancel={() => setCreateOpen(false)} onSave={handleCreateMusicDirector} />
            ) : (
              <DirectorFilmForm onCancel={() => setCreateOpen(false)} onSave={handleCreateFilmDirector} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
