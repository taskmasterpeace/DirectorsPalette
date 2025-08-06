"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Film, Camera, Zap, Eye, Palette, Clock, Copy, Clipboard, Check, Plus, Target, Layers, ChevronDown, ChevronRight, BookOpen, PlayCircle, BarChart3, Menu, X, Settings, ChevronLeft, FolderOpen } from 'lucide-react'
import { generateBreakdown, generateAdditionalChapterShots } from "./actions"
import React from "react"
import { ProjectManager } from "@/components/project-manager"
import { projectDB, SavedProject } from "@/lib/indexeddb"

const DIRECTORS = [
  { value: "none", label: "None (Standard Coverage)", icon: Camera, category: "Standard" },
  
  // Contemporary Masters
  {
    value: "taskmasterpeace",
    label: "Taskmasterpeace Style",
    icon: Eye,
    description: "Emotionally-driven visual storytelling with intimate dynamic cinematography",
    category: "Contemporary"
  },
  {
    value: "roger-deakins",
    label: "Roger Deakins Style", 
    icon: Camera,
    description: "Cinematic silhouettes and natural drama",
    category: "Contemporary"
  },
  {
    value: "emmanuel-lubezki",
    label: "Emmanuel Lubezki Style",
    icon: Layers,
    description: "Flowing natural light poetry",
    category: "Contemporary"
  },
  {
    value: "rian-johnson",
    label: "Rian Johnson Style",
    icon: Target,
    description: "Genre-blending creative storytelling",
    category: "Contemporary"
  },

  // Auteur Directors
  {
    value: "wes-anderson",
    label: "Wes Anderson",
    icon: Palette,
    description: "Whimsical symmetrical storytelling",
    category: "Auteur"
  },
  {
    value: "denis-villeneuve",
    label: "Denis Villeneuve",
    icon: Clock,
    description: "Epic atmospheric sci-fi realism",
    category: "Auteur"
  },
  {
    value: "david-fincher",
    label: "David Fincher",
    icon: Eye,
    description: "Precise psychological darkness",
    category: "Auteur"
  },
  {
    value: "christopher-nolan",
    label: "Christopher Nolan",
    icon: Film,
    description: "IMAX-scale mind-bending epics",
    category: "Auteur"
  },
  {
    value: "quentin-tarantino",
    label: "Quentin Tarantino",
    icon: Zap,
    description: "Pop culture saturated genre mashup",
    category: "Auteur"
  },
  {
    value: "ridley-scott",
    label: "Ridley Scott",
    icon: Film,
    description: "Epic cinematic world-building",
    category: "Auteur"
  },
  {
    value: "jordan-peele",
    label: "Jordan Peele",
    icon: Eye,
    description: "Social horror through unconventional framing",
    category: "Auteur"
  },

  // Classic Masters
  {
    value: "spike-lee",
    label: "Spike Lee",
    icon: Zap,
    description: "Dynamic movement, bold colors, social consciousness",
    category: "Classic"
  },
  {
    value: "martin-scorsese",
    label: "Martin Scorsese",
    icon: Camera,
    description: "Kinetic energy, urban grit, character-driven intensity",
    category: "Classic"
  },
  {
    value: "terrence-malick",
    label: "Terrence Malick",
    icon: Layers,
    description: "Poetic naturalism, golden hour, philosophical depth",
    category: "Classic"
  },
  {
    value: "coen-brothers",
    label: "Coen Brothers",
    icon: Film,
    description: "Dark comedy, americana, quirky character details",
    category: "Classic"
  },
  {
    value: "ari-aster",
    label: "Ari Aster",
    icon: Target,
    description: "Symmetrical horror, unsettling beauty, slow dread",
    category: "Classic"
  },
]

const SHOT_CATEGORIES = [
  {
    id: "character-reactions",
    label: "Character Reactions",
    description: "Close-ups and reaction shots for emotional beats",
    icon: Eye,
  },
  {
    id: "dialogue-coverage",
    label: "Dialogue Coverage",
    description: "Over-shoulder, reverse shots, and conversation dynamics",
    icon: Camera,
  },
  {
    id: "environmental-details",
    label: "Environmental Details",
    description: "Location atmosphere, weather, and setting establishment",
    icon: Layers,
  },
  {
    id: "transition-shots",
    label: "Transition Shots",
    description: "Cutaways, inserts, and scene transitions",
    icon: Zap,
  },
  {
    id: "action-coverage",
    label: "Action Coverage",
    description: "Movement, physical actions, and dynamic sequences",
    icon: Target,
  },
  {
    id: "technical-shots",
    label: "Technical Shots",
    description: "Specialized angles, camera movements, and technical coverage",
    icon: Film,
  },
]

interface Chapter {
  id: string
  title: string
  content: string
  startPosition: number
  endPosition: number
  estimatedDuration: string
  keyCharacters: string[]
  primaryLocation: string
  narrativeBeat: 'setup' | 'rising-action' | 'climax' | 'resolution'
}

interface StoryStructure {
  chapters: Chapter[]
  detectionMethod: 'existing' | 'ai-generated' | 'hybrid'
  totalChapters: number
  fullStory: string
}

interface ChapterBreakdown {
  chapterId: string
  characterReferences: string[]
  locationReferences: string[]
  propReferences: string[]
  shots: string[]
  coverageAnalysis: string
  additionalOpportunities: string[]
  titleCards?: {
    id: string
    styleLabel: string
    description: string
  }[]
}

interface BreakdownResult {
  characterReferences: string[]
  locationReferences: string[]
  propReferences: string[]
  shots: string[]
  coverageAnalysis: string
  additionalOpportunities: string[]
  storyStructure?: StoryStructure
  chapterBreakdowns?: ChapterBreakdown[]
  overallAnalysis?: string
}

export default function StoryBreakdownPage() {
  const [story, setStory] = useState("")
  const [selectedDirector, setSelectedDirector] = useState("none")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingMore, setIsGeneratingMore] = useState(false)
  const [breakdown, setBreakdown] = useState<BreakdownResult | null>(null)
  const [additionalShots, setAdditionalShots] = useState<{ [chapterId: string]: string[] }>({})
  const [error, setError] = useState("")
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [customRequest, setCustomRequest] = useState("")
  const [expandedChapters, setExpandedChapters] = useState<{ [chapterId: string]: boolean }>({})
  const [activeChapterForGeneration, setActiveChapterForGeneration] = useState<string>("")
  const [titleCardOptions, setTitleCardOptions] = useState<{enabled: boolean, format: string}>({
    enabled: false,
    format: 'full'
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [searchFilter, setSearchFilter] = useState<'all' | 'characters' | 'locations' | 'props' | 'shots'>('all')
  const [targetedGeneration, setTargetedGeneration] = useState<{character?: string, location?: string, element?: string}>({})
  const [selectedChapter, setSelectedChapter] = useState<string>("")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [customDirectors, setCustomDirectors] = useState<Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>>([])
  const [showDirectorCreator, setShowDirectorCreator] = useState(false)
  const [newDirector, setNewDirector] = useState({
    name: "",
    description: "",
    visualStyle: "",
    cameraStyle: "",
    colorPalette: "",
    narrativeFocus: ""
  })

  // New dynamic prompting options
  const [promptOptions, setPromptOptions] = useState({
    includeCameraStyle: true,
    includeColorPalette: true
  })

  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [editablePrompts, setEditablePrompts] = useState({
    structureDetection: "",
    chapterBreakdown: "",
    additionalShots: "",
    titleCard: ""
  })
  const [showTitleCardGenerator, setShowTitleCardGenerator] = useState(false)
  const [titleCardChapter, setTitleCardChapter] = useState("")

  // Add title card approach selection state after the other state declarations:
  const [titleCardApproaches, setTitleCardApproaches] = useState<string[]>(['character-focus', 'location-focus', 'abstract-thematic'])

  const [currentProjectId, setCurrentProjectId] = useState<string>("")
  const [showProjectManager, setShowProjectManager] = useState(false)

  // Add this useEffect after the other state declarations
  React.useEffect(() => {
    const loadDefaultPrompts = async () => {
      if (!editablePrompts.structureDetection) {
        const { getDefaultPrompts } = await import('./actions')
        const defaults = getDefaultPrompts()
        setEditablePrompts(defaults)
      }
    }
    loadDefaultPrompts()
  }, [])

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setStory(text)
    } catch (err) {
      console.error("Failed to paste text: ", err)
    }
  }

  const handleGenerate = async () => {
    if (!story.trim()) {
      setError("Please enter a story to analyze")
      return
    }

    setIsGenerating(true)
    setError("")
    setAdditionalShots({})

    try {
      const result = await generateBreakdown(story, selectedDirector, {
        enabled: titleCardOptions.enabled,
        format: titleCardOptions.format as 'full' | 'name-only' | 'roman-numerals',
        approaches: titleCardApproaches
      }, customDirectors, promptOptions)
      setBreakdown(result)
      
      // Auto-select first chapter
      if (result.storyStructure?.chapters.length > 0) {
        setSelectedChapter(result.storyStructure.chapters[0].id)
        setExpandedChapters({ [result.storyStructure.chapters[0].id]: true })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate breakdown. Please try again."

      if (errorMessage.includes("API key")) {
        setError(
          "⚠️ OpenAI API Key Required: Please add your OPENAI_API_KEY environment variable to use this feature. You can get an API key from https://platform.openai.com/api-keys",
        )
      } else {
        setError(errorMessage)
      }

      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateMoreShots = async (chapterId: string) => {
    if (!breakdown?.storyStructure || (selectedCategories.length === 0 && !customRequest.trim())) {
      setError("Please select shot categories or provide a custom request")
      return
    }

    const chapterBreakdown = breakdown.chapterBreakdowns?.find(cb => cb.chapterId === chapterId)
    if (!chapterBreakdown) {
      setError("Chapter breakdown not found")
      return
    }

    setIsGeneratingMore(true)
    setError("")

    try {
      const result = await generateAdditionalChapterShots({
        story,
        director: selectedDirector,
        storyStructure: breakdown.storyStructure,
        chapterId,
        existingBreakdown: chapterBreakdown,
        existingAdditionalShots: additionalShots[chapterId] || [],
        categories: selectedCategories,
        customRequest: customRequest.trim(),
      }, customDirectors, promptOptions)

      setAdditionalShots(prev => ({
        ...prev,
        [chapterId]: [...(prev[chapterId] || []), ...result.newShots]
      }))

      // Update the chapter's coverage analysis
      if (breakdown.chapterBreakdowns) {
        const updatedChapterBreakdowns = breakdown.chapterBreakdowns.map(cb =>
          cb.chapterId === chapterId ? { ...cb, coverageAnalysis: result.coverageAnalysis } : cb
        )
        setBreakdown(prev => prev ? { ...prev, chapterBreakdowns: updatedChapterBreakdowns } : null)
      }

      setSelectedCategories([])
      setCustomRequest("")
      setActiveChapterForGeneration("")
      setTargetedGeneration({})
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate additional shots."
      setError(errorMessage)
      console.error(err)
    } finally {
      setIsGeneratingMore(false)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }))
  }

  const getNarrativeBeatColor = (beat: string) => {
    switch (beat) {
      case 'setup': return 'bg-blue-600/20 text-blue-300 border-blue-700/30'
      case 'rising-action': return 'bg-orange-600/20 text-orange-300 border-orange-700/30'
      case 'climax': return 'bg-red-600/20 text-red-300 border-red-700/30'
      case 'resolution': return 'bg-green-600/20 text-green-300 border-green-700/30'
      default: return 'bg-slate-600/20 text-slate-300 border-slate-700/30'
    }
  }

  const filterContent = (content: string, type: 'character' | 'location' | 'prop' | 'shot' = 'shot') => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    const contentLower = content.toLowerCase()
    
    // If we have a specific filter active, only show that type
    if (searchFilter === 'characters' && type !== 'character') return false
    if (searchFilter === 'locations' && type !== 'location') return false
    if (searchFilter === 'props' && type !== 'prop') return false
    if (searchFilter === 'shots' && type !== 'shot') return false
    
    return contentLower.includes(query)
  }

  const getSearchPresets = () => {
    if (!breakdown) return []
    
    const presets = []
    
    // Character presets
    breakdown.characterReferences.forEach(ref => {
      const match = ref.match(/@(\w+)/)
      if (match) presets.push({ label: match[1], type: 'character', query: match[1] })
    })
    
    // Location presets
    breakdown.locationReferences.forEach(ref => {
      const match = ref.match(/@(\w+)/)
      if (match) presets.push({ label: match[1], type: 'location', query: match[1] })
    })
    
    return presets
  }

  const createCustomDirector = () => {
    if (!newDirector.name.trim()) return
    
    const customDirector = {
      id: `custom-${Date.now()}`,
      name: newDirector.name,
      description: newDirector.description,
      visualStyle: newDirector.visualStyle,
      cameraStyle: newDirector.cameraStyle,
      colorPalette: newDirector.colorPalette,
      narrativeFocus: newDirector.narrativeFocus
    }
    
    setCustomDirectors(prev => [...prev, customDirector])
    setNewDirector({
      name: "",
      description: "",
      visualStyle: "",
      cameraStyle: "",
      colorPalette: "",
      narrativeFocus: ""
    })
    setShowDirectorCreator(false)
  }

  const getAllDirectors = () => {
    const customDirectorOptions = customDirectors.map(director => ({
      value: director.id,
      label: director.name,
      icon: Palette,
      description: director.description,
      isCustom: true,
      category: 'Custom'
    }))
    
    return [...DIRECTORS, ...customDirectorOptions]
  }

  const selectedDirectorInfo = getAllDirectors().find((d) => d.value === selectedDirector)
  const isCustomDirector = customDirectors.find(d => d.id === selectedDirector)
  const totalShots = breakdown?.chapterBreakdowns?.reduce((sum, chapter) => 
    sum + chapter.shots.length + (additionalShots[chapter.chapterId]?.length || 0), 0
  ) || 0

  const selectChapter = (chapterId: string) => {
    setSelectedChapter(chapterId)
    if (!expandedChapters[chapterId]) {
      setExpandedChapters(prev => ({ ...prev, [chapterId]: true }))
    }
  }

  const getCurrentChapterBreakdown = () => {
    if (!selectedChapter || !breakdown?.chapterBreakdowns) return null
    return breakdown.chapterBreakdowns.find(cb => cb.chapterId === selectedChapter)
  }

  const getCurrentChapter = () => {
    if (!selectedChapter || !breakdown?.storyStructure) return null
    return breakdown.storyStructure.chapters.find(c => c.id === selectedChapter)
  }

  const handleLoadProject = (project: SavedProject) => {
    setStory(project.story)
    setSelectedDirector(project.selectedDirector)
    setBreakdown(project.breakdown)
    setAdditionalShots(project.additionalShots)
    setTitleCardOptions(project.titleCardOptions)
    setTitleCardApproaches(project.titleCardApproaches)
    setCustomDirectors(project.customDirectors)
    setPromptOptions(project.promptOptions)
    setSelectedChapter(project.selectedChapter)
    setExpandedChapters(project.expandedChapters)
    setCurrentProjectId(project.id)
    setShowProjectManager(false)
    
    // If there's a breakdown, show it
    if (project.breakdown?.storyStructure) {
      setSelectedChapter(project.selectedChapter || project.breakdown.storyStructure.chapters[0]?.id || "")
    }
  }

  const handleNewProject = () => {
    setBreakdown(null)
    setStory("")
    setAdditionalShots({})
    setSelectedChapter("")
    setExpandedChapters({})
    setActiveChapterForGeneration("")
    setError("")
    setSearchQuery("")
    setTitleCardChapter("")
    setCurrentProjectId("")
    setShowProjectManager(false)
  }

  const handleProjectSaved = (projectId: string) => {
    setCurrentProjectId(projectId)
  }

  const getCurrentProjectData = () => ({
    name: currentProjectId ? "Current Project" : `Project ${new Date().toLocaleDateString()}`,
    story,
    selectedDirector,
    breakdown,
    additionalShots,
    titleCardOptions,
    titleCardApproaches,
    customDirectors,
    promptOptions,
    selectedChapter,
    expandedChapters
  })

  // Auto-save functionality
  React.useEffect(() => {
    const autoSave = async () => {
      if (currentProjectId && breakdown?.storyStructure && story.trim()) {
        try {
          await projectDB.updateProject(currentProjectId, getCurrentProjectData())
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }
    }

    // Auto-save every 30 seconds if there's a current project
    const interval = setInterval(autoSave, 30000)
    return () => clearInterval(interval)
  }, [currentProjectId, story, breakdown, additionalShots, selectedChapter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Film className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Visual Story Breakdown</h1>
            {breakdown?.storyStructure && (
              <div className="flex gap-2 ml-4">
                <Button
                  onClick={() => setShowProjectManager(!showProjectManager)}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
                >
                  <FolderOpen className="h-4 w-4 mr-1" />
                  Projects
                </Button>
                <Button
                  onClick={() => {
                    // Just hide the breakdown view, don't clear data
                    setSelectedChapter("")
                    setSidebarOpen(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-600/20"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Input
                </Button>
                <Button
                  onClick={handleNewProject}
                  variant="outline"
                  size="sm"
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-600/20"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Story
                </Button>
              </div>
            )}
          </div>
          {breakdown?.storyStructure && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        {breakdown?.storyStructure && (
          <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 fixed lg:relative z-30 w-80 bg-slate-800/90 backdrop-blur-sm border-r border-slate-700 h-full overflow-y-auto`}>
            <div className="p-4 space-y-4">
              {/* Story Overview */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-amber-400" />
                  <h3 className="text-white font-semibold">Story Overview</h3>
                </div>
                <div className="flex gap-2 mb-3">
                  <Badge variant="secondary" className="bg-amber-600/20 text-amber-300 text-xs">
                    {breakdown.storyStructure.totalChapters} chapters
                  </Badge>
                  <Badge variant="outline" className="border-slate-500 text-slate-300 text-xs">
                    {totalShots} total shots
                  </Badge>
                </div>
                <p className="text-slate-400 text-xs">
                  {breakdown.storyStructure.detectionMethod === 'existing' ? 'Detected existing structure' :
                   breakdown.storyStructure.detectionMethod === 'hybrid' ? 'Enhanced existing structure' :
                   'AI-generated structure'}
                </p>
              </div>

              {/* Search */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-green-400" />
                  <h3 className="text-white font-semibold">Search</h3>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Search shots, characters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'characters', label: 'Characters' },
                      { key: 'locations', label: 'Locations' },
                      { key: 'shots', label: 'Shots' }
                    ].map(({ key, label }) => (
                      <Button
                        key={key}
                        size="sm"
                        variant={searchFilter === key ? 'default' : 'outline'}
                        onClick={() => setSearchFilter(key as any)}
                        className={`h-6 px-2 text-xs ${
                          searchFilter === key 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  {searchQuery && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setTargetedGeneration({ element: searchQuery })
                        setCustomRequest(`Generate more shots featuring ${searchQuery}`)
                        setActiveChapterForGeneration(selectedChapter || breakdown.storyStructure.chapters[0]?.id || "")
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      More "{searchQuery}" Shots
                    </Button>
                  )}
                </div>
              </div>

              {/* Chapter Navigation */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <h3 className="text-white font-semibold mb-3">Chapters</h3>
                <div className="space-y-2">
                  {breakdown.storyStructure.chapters.map((chapter, index) => {
                    const chapterBreakdown = breakdown.chapterBreakdowns?.find(cb => cb.chapterId === chapter.id)
                    const chapterAdditionalShots = additionalShots[chapter.id] || []
                    const chapterTotalShots = (chapterBreakdown?.shots.length || 0) + chapterAdditionalShots.length
                    const isSelected = selectedChapter === chapter.id
                    
                    return (
                      <Button
                        key={chapter.id}
                        variant="ghost"
                        onClick={() => selectChapter(chapter.id)}
                        className={`w-full h-auto p-3 justify-start transition-all ${
                          isSelected 
                            ? 'bg-amber-600/20 border border-amber-500/30 hover:bg-amber-600/30' 
                            : 'hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                              isSelected 
                                ? 'bg-amber-500 text-slate-900' 
                                : 'bg-amber-600/20 text-amber-300'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="text-left">
                              <div className="text-white font-medium text-sm">{chapter.title}</div>
                              <Badge className={`text-xs mt-1 ${getNarrativeBeatColor(chapter.narrativeBeat)}`}>
                                {chapter.narrativeBeat.replace('-', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-slate-600/20 text-slate-300 text-xs">
                            {chapterTotalShots}
                          </Badge>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Project Manager */}
            {showProjectManager && (
              <div className="max-w-4xl mx-auto mb-6">
                <ProjectManager
                  currentProject={getCurrentProjectData()}
                  onLoadProject={handleLoadProject}
                  onNewProject={handleNewProject}
                  currentProjectId={currentProjectId}
                  onProjectSaved={handleProjectSaved}
                />
              </div>
            )}

            {!breakdown?.storyStructure || !selectedChapter ? (
              /* Input Section */
              <div className="max-w-2xl mx-auto space-y-6">
                {breakdown?.storyStructure && (
                  <div className="mb-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-semibold">Breakdown Generated</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Your story breakdown is ready with {breakdown.storyStructure.totalChapters} chapters. 
                      You can modify settings below and regenerate, or{" "}
                      <button 
                        onClick={() => setSelectedChapter(breakdown.storyStructure!.chapters[0].id)}
                        className="text-green-400 hover:text-green-300 underline"
                      >
                        view your results
                      </button>.
                    </p>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <p className="text-slate-300 text-lg">
                    Transform any narrative into chapter-organized visual shot breakdowns optimized for Runway ML Gen 4
                  </p>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Camera className="h-5 w-5 text-amber-400" />
                      Story Input
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Paste your story, script, or narrative content below
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Textarea
                        placeholder="Enter your story here... The system will auto-detect chapters or create logical divisions for optimal visual breakdown."
                        value={story}
                        onChange={(e) => setStory(e.target.value)}
                        className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 resize-none pr-20"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={pasteFromClipboard}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                          title="Paste from clipboard"
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                        {story && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(story, "story")}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                            title="Copy story"
                          >
                            {copiedStates.story ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-slate-400 mt-2">
                      {story.length} characters • Auto-detects chapters and story structure
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Film className="h-5 w-5 text-amber-400" />
                      Director Style
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Choose a director's cinematographic approach
                    </CardDescription>
                  </CardHeader>
                  
                  {/* Category Filter */}
                  <CardContent>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-white mb-2 block">Browse by Category</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'all', label: 'All Styles' },
                          { key: 'Contemporary', label: 'Contemporary' },
                          { key: 'Auteur', label: 'Auteur Directors' },
                          { key: 'Classic', label: 'Classic Masters' },
                          { key: 'Custom', label: 'Custom' }
                        ].map(({ key, label }) => (
                          <Button
                            key={key}
                            size="sm"
                            variant={selectedCategory === key ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(key)}
                            className={`h-7 px-3 text-xs ${
                              selectedCategory === key 
                                ? 'bg-amber-600 hover:bg-amber-700' 
                                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {label}
                            {key !== 'all' && (
                              <Badge variant="secondary" className="ml-1 bg-slate-600/20 text-slate-400 text-xs">
                                {key === 'Custom' 
                                  ? customDirectors.length 
                                  : getAllDirectors().filter(d => d.category === key).length
                                }
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Select value={selectedDirector} onValueChange={setSelectedDirector}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600 max-h-80">
                        {getAllDirectors()
                          .filter(director => 
                            selectedCategory === 'all' || 
                            director.category === selectedCategory ||
                            (selectedCategory === 'Custom' && director.isCustom)
                          )
                          .map((director) => {
                            const IconComponent = director.icon
                            return (
                              <SelectItem
                                key={director.value}
                                value={director.value}
                                className="text-white hover:bg-slate-700 focus:bg-slate-700"
                              >
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4 text-amber-400" />
                                  <div className="flex flex-col items-start">
                                    <span>{director.label}</span>
                                    {director.description && (
                                      <span className="text-xs text-slate-400">{director.description}</span>
                                    )}
                                  </div>
                                  {director.isCustom && (
                                    <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs ml-auto">
                                      Custom
                                    </Badge>
                                  )}
                                  {director.category && !director.isCustom && (
                                    <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-xs ml-auto">
                                      {director.category}
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                  

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => setShowDirectorCreator(!showDirectorCreator)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Create Custom Director
                      </Button>
                      {customDirectors.length > 0 && (
                        <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                          {customDirectors.length} custom
                        </Badge>
                      )}
                    </div>

                    {showDirectorCreator && (
                      <div className="mt-4 p-4 bg-purple-900/10 border border-purple-700/30 rounded-lg space-y-4">
                        <h4 className="text-purple-400 font-semibold">Create Custom Director Style</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-white mb-1 block">Director Name</label>
                            <input
                              type="text"
                              placeholder="e.g., My Unique Style"
                              value={newDirector.name}
                              onChange={(e) => setNewDirector(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-white mb-1 block">Brief Description</label>
                            <input
                              type="text"
                              placeholder="e.g., Dreamy surrealism, soft focus"
                              value={newDirector.description}
                              onChange={(e) => setNewDirector(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-white mb-1 block">Visual Style</label>
                          <Textarea
                            placeholder="Describe the visual approach: lighting, composition, framing style..."
                            value={newDirector.visualStyle}
                            onChange={(e) => setNewDirector(prev => ({ ...prev, visualStyle: e.target.value }))}
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 text-sm"
                            rows={2}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-white mb-1 block">Camera Style</label>
                            <input
                              type="text"
                              placeholder="e.g., Handheld, static, sweeping movements"
                              value={newDirector.cameraStyle}
                              onChange={(e) => setNewDirector(prev => ({ ...prev, cameraStyle: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-white mb-1 block">Color Palette</label>
                            <input
                              type="text"
                              placeholder="e.g., Warm earth tones, high contrast"
                              value={newDirector.colorPalette}
                              onChange={(e) => setNewDirector(prev => ({ ...prev, colorPalette: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-white mb-1 block">Narrative Focus</label>
                          <input
                            type="text"
                            placeholder="e.g., Character emotions, environmental storytelling, action sequences"
                            value={newDirector.narrativeFocus}
                            onChange={(e) => setNewDirector(prev => ({ ...prev, narrativeFocus: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={createCustomDirector}
                            disabled={!newDirector.name.trim()}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Create Director
                          </Button>
                          <Button
                            onClick={() => setShowDirectorCreator(false)}
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedDirectorInfo && selectedDirectorInfo.description && (
                      <div className="mt-3 p-3 bg-slate-900/30 rounded-lg border border-slate-600">
                        <p className="text-sm text-slate-300">{selectedDirectorInfo.description}</p>
                        {isCustomDirector && (
                          <div className="mt-2 pt-2 border-t border-slate-600">
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                              {isCustomDirector.visualStyle && <div><span className="text-purple-400">Visual:</span> {isCustomDirector.visualStyle}</div>}
                              {isCustomDirector.cameraStyle && <div><span className="text-purple-400">Camera:</span> {isCustomDirector.cameraStyle}</div>}
                              {isCustomDirector.colorPalette && <div><span className="text-purple-400">Colors:</span> {isCustomDirector.colorPalette}</div>}
                              {isCustomDirector.narrativeFocus && <div><span className="text-purple-400">Focus:</span> {isCustomDirector.narrativeFocus}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Dynamic Prompting Options */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5 text-amber-400" />
                      Prompt Options
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Control what elements are included in the AI prompts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-camera-style"
                        checked={promptOptions.includeCameraStyle}
                        onCheckedChange={(checked) => 
                          setPromptOptions(prev => ({ ...prev, includeCameraStyle: !!checked }))
                        }
                      />
                      <label htmlFor="include-camera-style" className="text-sm font-medium text-white cursor-pointer">
                        Include camera movement & style descriptions
                      </label>
                    </div>
                    <p className="text-xs text-slate-400 ml-6">
                      When enabled, shots will include detailed camera movements, angles, and technical specifications
                    </p>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-color-palette"
                        checked={promptOptions.includeColorPalette}
                        onCheckedChange={(checked) => 
                          setPromptOptions(prev => ({ ...prev, includeColorPalette: !!checked }))
                        }
                      />
                      <label htmlFor="include-color-palette" className="text-sm font-medium text-white cursor-pointer">
                        Include color palette & lighting descriptions
                      </label>
                    </div>
                    <p className="text-xs text-slate-400 ml-6">
                      When enabled, shots will include color grading, lighting conditions, and mood descriptions
                    </p>

                    <div className="mt-4 p-3 bg-blue-900/10 border border-blue-700/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-blue-400 font-semibold text-sm">Current Settings</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>Camera Style: <span className={promptOptions.includeCameraStyle ? 'text-green-400' : 'text-red-400'}>{promptOptions.includeCameraStyle ? 'Enabled' : 'Disabled'}</span></div>
                        <div>Color Palette: <span className={promptOptions.includeColorPalette ? 'text-green-400' : 'text-red-400'}>{promptOptions.includeColorPalette ? 'Enabled' : 'Disabled'}</span></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Palette className="h-5 w-5 text-amber-400" />
                      Standalone Title Card Generator
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Generate title cards without needing a full story breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Chapter Title</label>
                      <input
                        type="text"
                        placeholder="e.g., The Beginning, The Final Battle, etc."
                        value={titleCardChapter}
                        onChange={(e) => setTitleCardChapter(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Director Style</label>
                        <Select value={selectedDirector} onValueChange={setSelectedDirector}>
                          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            {getAllDirectors().map((director) => {
                              const IconComponent = director.icon
                              return (
                                <SelectItem
                                  key={director.value}
                                  value={director.value}
                                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                                >
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-3 w-3 text-amber-400" />
                                    <span className="text-sm">{director.label}</span>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">Title Format</label>
                        <Select 
                          value={titleCardOptions.format} 
                          onValueChange={(value) => setTitleCardOptions(prev => ({ ...prev, format: value }))}
                        >
                          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="full" className="text-white hover:bg-slate-700 focus:bg-slate-700">
                              Chapter 1: Title
                            </SelectItem>
                            <SelectItem value="roman-numerals" className="text-white hover:bg-slate-700 focus:bg-slate-700">
                              Chapter I: Title
                            </SelectItem>
                            <SelectItem value="name-only" className="text-white hover:bg-slate-700 focus:bg-slate-700">
                              Title Only
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-white mb-3 block">Visual Approaches</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: 'character-focus', label: 'Character Focus', desc: 'Feature characters in cinematic poses' },
                          { id: 'location-focus', label: 'Location/Object Focus', desc: 'Highlight locations or objects' },
                          { id: 'abstract-thematic', label: 'Abstract/Thematic', desc: 'Conceptual theme representations' }
                        ].map(approach => (
                          <div key={approach.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`standalone-${approach.id}`}
                              checked={titleCardApproaches.includes(approach.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTitleCardApproaches(prev => [...prev, approach.id])
                                } else {
                                  setTitleCardApproaches(prev => prev.filter(a => a !== approach.id))
                                }
                              }}
                            />
                            <label htmlFor={`standalone-${approach.id}`} className="text-sm text-white cursor-pointer">
                              <span className="font-medium">{approach.label}</span>
                              <span className="text-slate-400 block text-xs">{approach.desc}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      onClick={async () => {
                        if (!titleCardChapter.trim()) {
                          setError("Please enter a chapter title")
                          return
                        }
                        
                        if (titleCardApproaches.length === 0) {
                          setError("Please select at least one visual approach")
                          return
                        }
                        
                        setIsGenerating(true)
                        setError("")
                        
                        try {
                          const { generateStandaloneTitleCards } = await import('./actions')
                          const titleCards = await generateStandaloneTitleCards(
                            titleCardChapter,
                            selectedDirector,
                            titleCardOptions.format,
                            titleCardApproaches,
                            customDirectors,
                            promptOptions
                          )
                          
                          // Display results in a temporary breakdown
                          setBreakdown({
                            characterReferences: [],
                            locationReferences: [],
                            propReferences: [],
                            shots: [],
                            coverageAnalysis: `Standalone title cards generated for "${titleCardChapter}"`,
                            additionalOpportunities: [],
                            storyStructure: {
                              chapters: [{
                                id: "standalone-1",
                                title: titleCardChapter,
                                content: "Standalone title card generation",
                                startPosition: 0,
                                endPosition: 100,
                                estimatedDuration: "N/A",
                                keyCharacters: [],
                                primaryLocation: "",
                                narrativeBeat: "setup"
                              }],
                              detectionMethod: "ai-generated",
                              totalChapters: 1,
                              fullStory: "Standalone title card generation"
                            },
                            chapterBreakdowns: [{
                              chapterId: "standalone-1",
                              characterReferences: [],
                              locationReferences: [],
                              propReferences: [],
                              shots: [],
                              coverageAnalysis: `Generated ${titleCards.length} title card options`,
                              additionalOpportunities: [],
                              titleCards
                            }],
                            overallAnalysis: `Standalone title card generation complete for "${titleCardChapter}"`
                          })
                          
                          setSelectedChapter("standalone-1")
                          
                        } catch (err) {
                          const errorMessage = err instanceof Error ? err.message : "Failed to generate title cards"
                          setError(errorMessage)
                        } finally {
                          setIsGenerating(false)
                        }
                      }}
                      disabled={isGenerating || !titleCardChapter.trim() || titleCardApproaches.length === 0}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Generating Title Cards...
                        </>
                      ) : (
                        <>
                          <Palette className="h-4 w-4 mr-2" />
                          Generate Title Cards ({titleCardApproaches.length} approaches)
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Palette className="h-5 w-5 text-amber-400" />
                      Title Cards
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Generate cinematic title cards for each chapter (optional)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable-title-cards"
                        checked={titleCardOptions.enabled}
                        onCheckedChange={(checked) => 
                          setTitleCardOptions(prev => ({ ...prev, enabled: !!checked }))
                        }
                      />
                      <label htmlFor="enable-title-cards" className="text-sm font-medium text-white cursor-pointer">
                        Generate title cards for chapters
                      </label>
                    </div>

                    {titleCardOptions.enabled && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Title Format</label>
                          <Select 
                            value={titleCardOptions.format} 
                            onValueChange={(value) => 
                              setTitleCardOptions(prev => ({ ...prev, format: value }))
                            }
                          >
                            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="full" className="text-white hover:bg-slate-700 focus:bg-slate-700">
                                Chapter 5: The Gate
                              </SelectItem>
                              <SelectItem value="roman-numerals" className="text-white hover:bg-slate-700 focus:bg-slate-700">
                                Chapter V: The Gate
                              </SelectItem>
                              <SelectItem value="name-only" className="text-white hover:bg-slate-700 focus:bg-slate-700">
                                The Gate
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-3 block">Visual Approaches</label>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="character-focus"
                                checked={titleCardApproaches.includes('character-focus')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setTitleCardApproaches(prev => [...prev, 'character-focus'])
                                  } else {
                                    setTitleCardApproaches(prev => prev.filter(a => a !== 'character-focus'))
                                  }
                                }}
                              />
                              <label htmlFor="character-focus" className="text-sm text-white cursor-pointer">
                                <span className="font-medium">Character Focus</span>
                                <span className="text-slate-400 block text-xs">Feature key characters in cinematic poses</span>
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="location-focus"
                                checked={titleCardApproaches.includes('location-focus')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setTitleCardApproaches(prev => [...prev, 'location-focus'])
                                  } else {
                                    setTitleCardApproaches(prev => prev.filter(a => a !== 'location-focus'))
                                  }
                                }}
                              />
                              <label htmlFor="location-focus" className="text-sm text-white cursor-pointer">
                                <span className="font-medium">Location/Object Focus</span>
                                <span className="text-slate-400 block text-xs">Highlight primary locations or significant objects</span>
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="abstract-thematic"
                                checked={titleCardApproaches.includes('abstract-thematic')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setTitleCardApproaches(prev => [...prev, 'abstract-thematic'])
                                  } else {
                                    setTitleCardApproaches(prev => prev.filter(a => a !== 'abstract-thematic'))
                                  }
                                }}
                              />
                              <label htmlFor="abstract-thematic" className="text-sm text-white cursor-pointer">
                                <span className="font-medium">Abstract/Thematic</span>
                                <span className="text-slate-400 block text-xs">Create conceptual compositions representing themes</span>
                              </label>
                            </div>
                          </div>

                          {titleCardApproaches.length === 0 && (
                            <p className="text-red-400 text-xs mt-2">Select at least one visual approach</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !story.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Analyzing Structure & Generating Breakdown...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-5 w-5 mr-2" />
                      Generate Chapter-Based Breakdown
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                    <p className="text-red-300">{error}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Results Section */
              <div className="space-y-6">
                {/* Chapter-Specific Additional Shots Generation */}
                {activeChapterForGeneration && (
                  <Card className="bg-slate-800/50 border-slate-700 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Plus className="h-5 w-5 text-green-400" />
                        Generate Additional Shots
                        <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                          {breakdown.storyStructure.chapters.find(c => c.id === activeChapterForGeneration)?.title}
                        </Badge>
                        {targetedGeneration.element && (
                          <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                            Focus: {targetedGeneration.element}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Shot Categories</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {SHOT_CATEGORIES.map((category) => {
                            const IconComponent = category.icon
                            return (
                              <div
                                key={category.id}
                                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
                              >
                                <Checkbox
                                  id={category.id}
                                  checked={selectedCategories.includes(category.id)}
                                  onCheckedChange={() => handleCategoryToggle(category.id)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <label
                                    htmlFor={category.id}
                                    className="flex items-center gap-2 text-sm font-medium text-white cursor-pointer"
                                  >
                                    <IconComponent className="h-4 w-4 text-amber-400" />
                                    {category.label}
                                  </label>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Custom Request</h4>
                        <Textarea
                          placeholder="Describe specific shots needed..."
                          value={customRequest}
                          onChange={(e) => setCustomRequest(e.target.value)}
                          className="min-h-[80px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 text-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleGenerateMoreShots(activeChapterForGeneration)}
                          disabled={isGeneratingMore || (selectedCategories.length === 0 && !customRequest.trim())}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                          {isGeneratingMore ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Generate ({selectedCategories.length + (customRequest.trim() ? 1 : 0)})
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setActiveChapterForGeneration("")
                            setTargetedGeneration({})
                          }}
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Selected Chapter Content */}
                {selectedChapter && getCurrentChapter() && getCurrentChapterBreakdown() && (
                  <div>
                    {(() => {
                      const chapter = getCurrentChapter()!
                      const chapterBreakdown = getCurrentChapterBreakdown()!
                      const chapterAdditionalShots = additionalShots[selectedChapter] || []
                      const allChapterShots = [...chapterBreakdown.shots, ...chapterAdditionalShots]
                      const chapterIndex = breakdown.storyStructure!.chapters.findIndex(c => c.id === selectedChapter)

                      return (
                        <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
                          <CardHeader className="border-l-4 border-amber-500">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-slate-900 text-xl font-bold shadow-lg">
                                  {chapterIndex + 1}
                                </div>
                                <div>
                                  <CardTitle className="text-white text-2xl">{chapter.title}</CardTitle>
                                  <CardDescription className="text-slate-300 mt-1">
                                    {chapter.keyCharacters.join(', ')} • {chapter.primaryLocation}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={`${getNarrativeBeatColor(chapter.narrativeBeat)}`}>
                                  {chapter.narrativeBeat.replace('-', ' ')}
                                </Badge>
                                <Badge variant="secondary" className="bg-amber-600/20 text-amber-300">
                                  {chapterBreakdown.shots.length} initial
                                </Badge>
                                {chapterAdditionalShots.length > 0 && (
                                  <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                                    +{chapterAdditionalShots.length} additional
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-6">
                            {/* Chapter Actions */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(allChapterShots.join("\n\n"), `chapter-${selectedChapter}`)}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                              >
                                {copiedStates[`chapter-${selectedChapter}`] ? (
                                  <Check className="h-3 w-3 mr-1 text-green-400" />
                                ) : (
                                  <Copy className="h-3 w-3 mr-1" />
                                )}
                                Copy All Shots
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setActiveChapterForGeneration(
                                  activeChapterForGeneration === selectedChapter ? "" : selectedChapter
                                )}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add More Shots
                              </Button>
                            </div>

                            {/* Title Cards */}
                            {chapterBreakdown.titleCards && chapterBreakdown.titleCards.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Palette className="h-4 w-4 text-purple-400" />
                                  <h4 className="text-purple-400 font-semibold">Title Cards</h4>
                                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 text-xs">
                                    {chapterBreakdown.titleCards.length} options
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                  {chapterBreakdown.titleCards.map((titleCard, cardIndex) => (
                                    <div key={titleCard.id} className="p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-purple-400 font-semibold">{titleCard.styleLabel}</span>
                                          <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                                            Option {cardIndex + 1}
                                          </Badge>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => copyToClipboard(titleCard.description, `title-card-${titleCard.id}`)}
                                          className="h-6 px-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700"
                                        >
                                          {copiedStates[`title-card-${titleCard.id}`] ? (
                                            <Check className="h-3 w-3 mr-1 text-green-400" />
                                          ) : (
                                            <Copy className="h-3 w-3 mr-1" />
                                          )}
                                          Copy
                                        </Button>
                                      </div>
                                      <p className="text-slate-200 font-mono text-sm leading-relaxed">{titleCard.description}</p>
                                    </div>
                                  ))}
                                </div>
                                <Separator className="bg-slate-600 mt-4" />
                              </div>
                            )}

                            {/* Initial Shots */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                                <h4 className="text-amber-400 font-semibold">Initial Breakdown</h4>
                                <Badge variant="secondary" className="bg-amber-600/20 text-amber-300 text-xs">
                                  {chapterBreakdown.shots.length} shots
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {chapterBreakdown.shots.filter(shot => filterContent(shot, 'shot')).map((shot, shotIndex) => (
                                  <div key={shotIndex} className="p-3 bg-slate-900/30 rounded-lg border border-slate-600">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs text-amber-400 font-semibold">INITIAL</span>
                                      <span className="text-xs text-slate-500">#{shotIndex + 1}</span>
                                    </div>
                                    <p className="text-slate-200 font-mono text-sm leading-relaxed">{shot}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Additional Shots */}
                            {chapterAdditionalShots.length > 0 && (
                              <div>
                                <Separator className="bg-slate-600" />
                                <div className="flex items-center gap-2 mb-3 mt-4">
                                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                  <h4 className="text-green-400 font-semibold">Additional Shots</h4>
                                  <Badge variant="secondary" className="bg-green-600/20 text-green-300 text-xs">
                                    {chapterAdditionalShots.length} shots
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  {chapterAdditionalShots.filter(shot => filterContent(shot, 'shot')).map((shot, shotIndex) => (
                                    <div key={shotIndex} className="p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Plus className="h-3 w-3 text-green-400" />
                                        <span className="text-xs text-green-400 font-semibold">ADDITIONAL</span>
                                        <span className="text-xs text-slate-500">#{chapterBreakdown.shots.length + shotIndex + 1}</span>
                                      </div>
                                      <p className="text-slate-200 font-mono text-sm leading-relaxed">{shot}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Chapter Coverage Analysis */}
                            <div className="p-3 bg-slate-900/20 rounded-lg border border-slate-600">
                              <h5 className="text-slate-300 font-semibold mb-2">Coverage Analysis</h5>
                              <p className="text-slate-400 text-sm whitespace-pre-line">{chapterBreakdown.coverageAnalysis}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })()}
                  </div>
                )}

                {/* Global References */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Global References</CardTitle>
                    <CardDescription className="text-slate-300">
                      Consistent references across all chapters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {breakdown.characterReferences.filter(ref => filterContent(ref, 'character')).length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-amber-400 font-semibold">Characters</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(breakdown.characterReferences.filter(ref => filterContent(ref, 'character')).join("\n"), "characters")}
                            className="h-6 px-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            {copiedStates.characters ? (
                              <Check className="h-3 w-3 mr-1 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3 mr-1" />
                            )}
                            Copy
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {breakdown.characterReferences.filter(ref => filterContent(ref, 'character')).map((ref, idx) => (
                            <div key={idx} className="p-2 bg-slate-900/30 rounded text-sm text-slate-300 font-mono">
                              {ref}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {breakdown.locationReferences.filter(ref => filterContent(ref, 'location')).length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-amber-400 font-semibold">Locations</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(breakdown.locationReferences.filter(ref => filterContent(ref, 'location')).join("\n"), "locations")}
                            className="h-6 px-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            {copiedStates.locations ? (
                              <Check className="h-3 w-3 mr-1 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3 mr-1" />
                            )}
                            Copy
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {breakdown.locationReferences.filter(ref => filterContent(ref, 'location')).map((ref, idx) => (
                            <div key={idx} className="p-2 bg-slate-900/30 rounded text-sm text-slate-300 font-mono">
                              {ref}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Overall Analysis */}
                {breakdown.overallAnalysis && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-amber-400" />
                        Overall Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 whitespace-pre-line">{breakdown.overallAnalysis}</p>
                    </CardContent>
                  </Card>
                )}

                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                    <p className="text-red-300">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
