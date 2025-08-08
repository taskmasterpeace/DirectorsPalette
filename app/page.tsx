"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, PlayCircle, FolderOpen, ChevronDown, ChevronUp, Copy, Plus, Wand2, Settings, FilmIcon, Sparkles, Target, Palette, Camera, Eye, X, Menu } from 'lucide-react'
import { ProjectManager } from "@/components/project-manager"
import { MusicVideoConfig } from "@/components/music-video-config"
import { LibraryPicker } from "@/components/library-picker"
import { 
  generateBreakdown, 
  generateAdditionalChapterShots, 
  generateFullMusicVideoBreakdown, 
  generateAdditionalMusicVideoShots,
  generateDirectorStyleDetails
} from "./actions"
import { useToast } from "@/components/ui/use-toast"
import { curatedFilmDirectors, curatedMusicVideoDirectors } from "@/lib/curated-directors"
import type { FilmDirector, MusicVideoDirector } from "@/lib/director-types"
import { directorDB } from "@/lib/director-db"

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

export default function Home() {
  const { toast } = useToast()
  
  // Mode and UI state
  const [mode, setMode] = useState<Mode>("story")
  const [story, setStory] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [songTitle, setSongTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [genre, setGenre] = useState("")
  
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
  const [additionalShots, setAdditionalShots] = useState<{[key: string]: string[]}>({})
  const [additionalMusicVideoShots, setAdditionalMusicVideoShots] = useState<{[key: string]: string[]}>({})
  
  // Options
  const [titleCardOptions, setTitleCardOptions] = useState({
    enabled: false,
    format: 'full' as 'full' | 'name-only' | 'roman-numerals',
    approaches: [] as string[]
  })
  const [promptOptions, setPromptOptions] = useState({
    includeCameraStyle: true,
    includeColorPalette: true
  })
  
  // Music video specific
  const [musicVideoConfig, setMusicVideoConfig] = useState<any>(null)
  const [showMusicVideoConfig, setShowMusicVideoConfig] = useState(false)
  
  // Expanded sections
  const [expandedChapters, setExpandedChapters] = useState<{[key: string]: boolean}>({})
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({})

  // Project Manager State
  const [showProjectManager, setShowProjectManager] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState("")
  const [selectedMusicVideoSection, setSelectedMusicVideoSection] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Load directors from IndexedDB on mount
  useEffect(() => {
    const loadDirectors = async () => {
      try {
        await directorDB.ensureSeeded()
        const [filmDirectors, musicDirectors] = await Promise.all([
          directorDB.getAllFilm(),
          directorDB.getAllMusic()
        ])
        
        // Convert to the format expected by the UI
        const customFilm = filmDirectors.map(d => ({
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
          disciplines: d.disciplines
        }))
        
        const customMusic = musicDirectors.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description || "",
          visualHallmarks: d.visualHallmarks,
          narrativeStyle: d.narrativeStyle,
          pacingAndEnergy: d.pacingAndEnergy,
          genres: d.genres,
          category: d.category,
          tags: d.tags,
          disciplines: d.disciplines
        }))
        
        setCustomDirectors(customFilm)
        setCustomMusicVideoDirectors(customMusic)
      } catch (error) {
        console.error("Failed to load directors:", error)
      }
    }
    
    loadDirectors()
  }, [])

  const allDirectors = [...curatedFilmDirectors, ...customDirectors]
  const allMusicVideoDirectors = [...curatedMusicVideoDirectors, ...customMusicVideoDirectors]

  const selectedDirectorInfo = allDirectors.find(d => d.id === selectedDirector)
  const selectedMusicVideoDirectorInfo = allMusicVideoDirectors.find(d => d.id === selectedMusicVideoDirector)

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
        promptOptions
      )
      setBreakdown(result)
      setAdditionalShots({})
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
        selectedMusicVideoDirectorInfo
      )
      
      if (!result.isConfigured) {
        setMusicVideoBreakdown(result)
        setShowMusicVideoConfig(true)
      } else {
        setMusicVideoBreakdown(result)
        setShowMusicVideoConfig(false)
        setAdditionalMusicVideoShots({})
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
      const result = await generateAdditionalChapterShots(
        {
          story,
          director: selectedDirector,
          storyStructure: breakdown.storyStructure,
          chapterId,
          existingBreakdown: breakdown.chapterBreakdowns.find((cb: any) => cb.chapterId === chapterId),
          existingAdditionalShots: additionalShots[chapterId] || [],
          categories,
          customRequest
        },
        allDirectors,
        promptOptions
      )
      
      setAdditionalShots(prev => ({
        ...prev,
        [chapterId]: [...(prev[chapterId] || []), ...result.newShots]
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
      const result = await generateAdditionalMusicVideoShots({
        lyrics,
        musicVideoStructure: musicVideoBreakdown.musicVideoStructure,
        sectionId,
        existingBreakdown: musicVideoBreakdown.sectionBreakdowns.find((sb: any) => sb.sectionId === sectionId),
        existingAdditionalShots: additionalMusicVideoShots[sectionId] || [],
        customRequest,
        config: musicVideoConfig,
        selectedMusicVideoDirectorInfo
      })
      
      setAdditionalMusicVideoShots(prev => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] || []), ...result.newShots]
      }))
      
      toast({ title: "Success", description: `Generated ${result.newShots.length} additional shots!` })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to generate additional shots" })
    } finally {
      setIsLoading(false)
    }
  }

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
          disciplines: []
        }
        
        // Save to IndexedDB
        const filmDirector: FilmDirector = {
          ...newDirector,
          domain: "film",
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: true
        }
        await directorDB.upsertFilm(filmDirector)
        
        setCustomDirectors(prev => [...prev, newDirector])
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
          genres: styleDetails.genres.split(',').map(g => g.trim()),
          category: "Custom",
          tags: [],
          disciplines: []
        }
        
        // Save to IndexedDB
        const musicDirector: MusicVideoDirector = {
          ...newDirector,
          domain: "music-video",
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: true
        }
        await directorDB.upsertMusic(musicDirector)
        
        setCustomMusicVideoDirectors(prev => [...prev, newDirector])
        setSelectedMusicVideoDirector(newDirector.id)
      }
      
      setShowCustomDirectorForm(false)
      setCustomDirectorName("")
      setCustomDirectorDescription("")
      toast({ title: "Success", description: "Custom director created!" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create custom director" })
    } finally {
      setIsGeneratingDirectorStyle(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: "Content copied to clipboard!" })
  }

  const toggleChapterExpansion = (chapterId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }))
  }

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Mode Toggle and Title */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2 bg-slate-800/50 rounded-lg p-1">
              <Button 
                size="sm" 
                variant={mode === "story" ? "default" : "ghost"}
                onClick={() => setMode("story")}
                className={mode === "story" ? "bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm" : "text-slate-300 hover:bg-slate-700 text-xs sm:text-sm"}
              >
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">Story Mode</span>
                <span className="xs:hidden">Story</span>
              </Button>
              <Button asChild size="sm" variant="ghost" className="text-slate-300 hover:bg-slate-700 text-xs sm:text-sm">
                <Link href="/director-library">
                  <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden xs:inline">Director Library</span>
                  <span className="xs:hidden">Library</span>
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant={mode === "music-video" ? "default" : "ghost"}
                onClick={() => setMode("music-video")}
                className={mode === "music-video" ? "bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm" : "text-slate-300 hover:bg-slate-700 text-xs sm:text-sm"}
              >
                <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">Music Video Mode</span>
                <span className="xs:hidden">Music</span>
              </Button>
            </div>
            <FilmIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
            <h1 className="text-lg sm:text-xl font-bold text-white hidden sm:block">Visual Story Breakdown</h1>
            <h1 className="text-base font-bold text-white sm:hidden">Breakdown</h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {currentProjectId && (
              <Badge variant="secondary" className="bg-green-600/20 text-green-300 border-green-700/30 hidden sm:block">
                Saved
              </Badge>
            )}

            {/* Always-visible Projects button (all screen sizes) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowProjectManager(true)
                setSelectedChapter("")
                setSelectedMusicVideoSection("")
              }}
              className="text-slate-400 hover:text-white"
            >
              Projects
            </Button>

            {/* Mobile menu toggle */}
            {(breakdown?.storyStructure || musicVideoBreakdown?.musicVideoStructure) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                {sidebarOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
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

                {/* Custom Director Form */}
                {showCustomDirectorForm && (
                  <Card className="bg-slate-900/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Create Custom Director</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-white mb-1 block">Name</label>
                        <input
                          placeholder="e.g., Innovative Storyteller"
                          value={customDirectorName}
                          onChange={(e) => setCustomDirectorName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-1 block">Description/Concept</label>
                        <Textarea
                          placeholder="Describe the director's style, approach, or key characteristics..."
                          value={customDirectorDescription}
                          onChange={(e) => setCustomDirectorDescription(e.target.value)}
                          className="bg-slate-800/50 border-slate-600 text-white text-sm"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateCustomDirector}
                          disabled={isGeneratingDirectorStyle}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          {isGeneratingDirectorStyle ? (
                            <>
                              <Wand2 className="h-4 w-4 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-1" />
                              Create Director
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowCustomDirectorForm(false)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                            setTitleCardOptions(prev => ({ ...prev, enabled: !!checked }))
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
                              setPromptOptions(prev => ({ ...prev, includeCameraStyle: !!checked }))
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
                              setPromptOptions(prev => ({ ...prev, includeColorPalette: !!checked }))
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
                              {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="space-y-4">
                            <div className="text-sm text-slate-300">
                              <div className="mb-2"><strong>Location:</strong> {chapter.primaryLocation}</div>
                              <div className="mb-2"><strong>Characters:</strong> {chapter.keyCharacters.join(", ")}</div>
                              <div className="mb-4"><strong>Narrative Beat:</strong> {chapter.narrativeBeat}</div>
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
                                  onClick={() => copyToClipboard([...chapterBreakdown.shots, ...chapterAdditionalShots].join('\n'))}
                                  className="bg-slate-700 hover:bg-slate-600 text-white"
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {chapterBreakdown.shots.map((shot: string, shotIndex: number) => (
                                  <div key={shotIndex} className="p-3 bg-slate-900/40 rounded-md border border-slate-700">
                                    <div className="text-sm text-slate-300">{shot}</div>
                                  </div>
                                ))}
                                {chapterAdditionalShots.map((shot: string, shotIndex: number) => (
                                  <div key={`additional-${shotIndex}`} className="p-3 bg-purple-900/20 rounded-md border border-purple-700/30">
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
                                    <Badge key={category} variant="outline" className="border-slate-600 text-slate-300 cursor-pointer hover:bg-slate-700">
                                      {category}
                                    </Badge>
                                  ))}
                                </div>
                                <input
                                  placeholder="Custom request (optional)..."
                                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
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

                {/* Custom Director Form */}
                {showCustomDirectorForm && (
                  <Card className="bg-slate-900/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Create Custom Music Video Director</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-white mb-1 block">Name</label>
                        <input
                          placeholder="e.g., Cinematic Storyteller"
                          value={customDirectorName}
                          onChange={(e) => setCustomDirectorName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white mb-1 block">Description/Concept</label>
                        <Textarea
                          placeholder="Describe the director's music video style, visual approach, or key characteristics..."
                          value={customDirectorDescription}
                          onChange={(e) => setCustomDirectorDescription(e.target.value)}
                          className="bg-slate-800/50 border-slate-600 text-white text-sm"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateCustomDirector}
                          disabled={isGeneratingDirectorStyle}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {isGeneratingDirectorStyle ? (
                            <>
                              <Wand2 className="h-4 w-4 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-1" />
                              Create Director
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowCustomDirectorForm(false)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                musicVideoBreakdown={musicVideoBreakdown}
                onConfigComplete={(config) => {
                  setMusicVideoConfig(config)
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
                              {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="space-y-4">
                            <div className="text-sm text-slate-300">
                              <div className="mb-4"><strong>Lyrics:</strong></div>
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
                                  onClick={() => copyToClipboard([...sectionBreakdown.shots, ...sectionAdditionalShots].join('\n'))}
                                  className="bg-slate-700 hover:bg-slate-600 text-white"
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {sectionBreakdown.shots.map((shot: string, shotIndex: number) => (
                                  <div key={shotIndex} className="p-3 bg-slate-900/40 rounded-md border border-slate-700">
                                    <div className="text-sm text-slate-300">{shot}</div>
                                  </div>
                                ))}
                                {sectionAdditionalShots.map((shot: string, shotIndex: number) => (
                                  <div key={`additional-${shotIndex}`} className="p-3 bg-purple-900/20 rounded-md border border-purple-700/30">
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
                                    if (e.key === 'Enter') {
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

                            {/* Performance Notes */}
                            {sectionBreakdown.performanceNotes && sectionBreakdown.performanceNotes.length > 0 && (
                              <div>
                                <h4 className="font-medium text-white mb-2">Performance Notes</h4>
                                <div className="space-y-2">
                                  {sectionBreakdown.performanceNotes.map((note: string, noteIndex: number) => (
                                    <div key={noteIndex} className="p-3 bg-slate-900/40 rounded-md border border-slate-700">
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
