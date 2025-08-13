"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  Wand2,
  Settings,
  Target,
  Eye,
  Users,
  MapPin,
  Package,
  ArrowRight,
  Camera,
  X,
} from "lucide-react"
import { DirectorSelector } from "@/components/shared/DirectorSelector"
import { StoryReferenceConfigPanel, type StoryReferenceConfig } from "./StoryReferenceConfigPanel"
import { EnhancedStoryAdditionalShots } from "./EnhancedStoryAdditionalShots"
import { useToast } from "@/components/ui/use-toast"
import type { FilmDirector } from "@/lib/director-types"
import type { StoryCharacter } from "./CharacterSelector"
import type { StoryLocation } from "./StoryLocationSelector"
import type { StoryProp } from "./StoryPropSelector"

interface EnhancedStoryModeProps {
  // Story input state
  story: string
  setStory: (story: string) => void
  storyDirectorNotes: string
  setStoryDirectorNotes: (notes: string) => void
  
  // Director selection
  selectedDirector: string
  setSelectedDirector: (directorId: string) => void
  allDirectors: any[]
  
  // Options
  titleCardOptions: {
    enabled: boolean
    format: "full" | "name-only" | "roman-numerals"
    approaches: string[]
  }
  setTitleCardOptions: (options: any) => void
  promptOptions: {
    includeCameraStyle: boolean
    includeColorPalette: boolean
  }
  setPromptOptions: (options: any) => void
  
  // Results
  breakdown: any
  setBreakdown: (breakdown: any) => void
  additionalShots: { [key: string]: string[] }
  setAdditionalShots: (shots: any) => void
  
  // UI state
  expandedChapters: { [key: string]: boolean }
  setExpandedChapters: (chapters: any) => void
  
  // Loading
  isLoading: boolean
  
  // Handlers
  onGenerateBreakdown: (references?: StoryReferenceConfig) => Promise<void>
  onGenerateAdditionalShots: (
    chapterId: string, 
    request: string,
    references?: { characters?: string[], locations?: string[], props?: string[] }
  ) => Promise<void>
  onClearStory: () => void
  onCopyToClipboard: (text: string) => void
}

export function EnhancedStoryMode({
  story,
  setStory,
  storyDirectorNotes,
  setStoryDirectorNotes,
  selectedDirector,
  setSelectedDirector,
  allDirectors,
  titleCardOptions,
  setTitleCardOptions,
  promptOptions,
  setPromptOptions,
  breakdown,
  setBreakdown,
  additionalShots,
  setAdditionalShots,
  expandedChapters,
  setExpandedChapters,
  isLoading,
  onGenerateBreakdown,
  onGenerateAdditionalShots,
  onClearStory,
  onCopyToClipboard,
}: EnhancedStoryModeProps) {
  const { toast } = useToast()
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [showReferenceConfig, setShowReferenceConfig] = useState(false)
  const [referenceConfig, setReferenceConfig] = useState<StoryReferenceConfig>({
    characters: [],
    locations: [],
    props: [],
    storyId: `story_${Date.now()}`
  })
  const [isExtractingReferences, setIsExtractingReferences] = useState(false)

  const selectedDirectorInfo = allDirectors.find((d) => d.id === selectedDirector)

  const toggleChapterExpansion = (chapterId: string) => {
    setExpandedChapters((prev: any) => ({ ...prev, [chapterId]: !prev[chapterId] }))
  }

  // Extract available chapters from breakdown
  const getAvailableChapters = () => {
    if (!breakdown?.storyStructure?.chapters) return []
    return breakdown.storyStructure.chapters.map((ch: any) => ({
      id: ch.id,
      title: ch.title
    }))
  }

  // Auto-extract references from story (mock implementation - will be replaced with actual AI extraction)
  const handleExtractReferences = async () => {
    setIsExtractingReferences(true)
    try {
      // In a real implementation, this would call an AI service to extract entities
      // For now, we'll show the reference config panel for manual configuration
      const mockExtractedCharacters: StoryCharacter[] = [
        {
          id: 'character1',
          reference: '@protagonist',
          name: 'Main Character',
          description: 'The story protagonist',
          role: 'protagonist',
          chapters: []
        }
      ]
      
      const mockExtractedLocations: StoryLocation[] = [
        {
          id: 'location1',
          reference: '@main_location',
          name: 'Primary Setting',
          description: 'Where the story takes place',
          type: 'interior',
          chapters: []
        }
      ]
      
      setReferenceConfig({
        ...referenceConfig,
        characters: mockExtractedCharacters,
        locations: mockExtractedLocations
      })
      
      setShowReferenceConfig(true)
      toast({ 
        title: "References Ready", 
        description: "Review and customize extracted references before generating breakdown" 
      })
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to extract references" 
      })
    } finally {
      setIsExtractingReferences(false)
    }
  }

  const handleGenerateWithReferences = async () => {
    setShowReferenceConfig(false)
    await onGenerateBreakdown(referenceConfig)
  }

  const handleGenerateAdditionalShotsWithReferences = async (
    chapterId: string,
    customRequest: string,
    selectedReferences: {
      characters: string[]
      locations: string[]
      props: string[]
    }
  ) => {
    // Build request with references
    let request = ""
    
    if (selectedReferences.characters.length > 0) {
      const chars = selectedReferences.characters.map(id => {
        const char = referenceConfig.characters.find(c => c.id === id)
        return char ? `${char.reference} (${char.name})` : id
      }).join(", ")
      request += `Characters: ${chars}. `
    }
    
    if (selectedReferences.locations.length > 0) {
      const locs = selectedReferences.locations.map(id => {
        const loc = referenceConfig.locations.find(l => l.id === id)
        return loc ? `${loc.reference} (${loc.name})` : id
      }).join(", ")
      request += `Locations: ${locs}. `
    }
    
    if (selectedReferences.props.length > 0) {
      const prps = selectedReferences.props.map(id => {
        const prop = referenceConfig.props.find(p => p.id === id)
        return prop ? `${prop.reference} (${prop.name})` : id
      }).join(", ")
      request += `Props: ${prps}. `
    }
    
    if (customRequest) {
      request += customRequest
    }
    
    await onGenerateAdditionalShots(chapterId, request, selectedReferences)
  }

  // Show reference configuration if we have a story but no breakdown yet
  if (showReferenceConfig && !breakdown) {
    return (
      <StoryReferenceConfigPanel
        config={referenceConfig}
        onConfigChange={setReferenceConfig}
        onContinue={handleGenerateWithReferences}
        onBack={() => setShowReferenceConfig(false)}
        storyTitle={story.substring(0, 50) + "..."}
        availableChapters={getAvailableChapters()}
        isGenerating={isLoading}
      />
    )
  }

  return (
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
          <DirectorSelector
            selectedDirector={selectedDirector}
            onDirectorChange={setSelectedDirector}
            allDirectors={allDirectors}
            selectedDirectorInfo={selectedDirectorInfo}
            domain="film"
          />

          {/* Director Notes */}
          <div>
            <label className="text-sm font-medium text-white mb-1 block">
              🎯 Director&apos;s Notes (HIGHEST PRIORITY)
            </label>
            <Textarea
              placeholder="Your specific creative direction, themes, visual style, mood..."
              value={storyDirectorNotes}
              onChange={(e) => setStoryDirectorNotes(e.target.value)}
              rows={3}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
            />
            <p className="text-xs text-amber-300 mt-1">
              These notes are mandatory and will override default director style
            </p>
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="text-slate-300 hover:bg-slate-700 p-0">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Options
                {showAdvancedOptions ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
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
                      setTitleCardOptions((prev: any) => ({ ...prev, enabled: !!checked }))
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="camera-style"
                    checked={promptOptions.includeCameraStyle}
                    onCheckedChange={(checked) =>
                      setPromptOptions((prev: any) => ({ ...prev, includeCameraStyle: !!checked }))
                    }
                  />
                  <label htmlFor="camera-style" className="text-sm text-white">
                    Include Camera Style
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="color-palette"
                    checked={promptOptions.includeColorPalette}
                    onCheckedChange={(checked) =>
                      setPromptOptions((prev: any) => ({ ...prev, includeColorPalette: !!checked }))
                    }
                  />
                  <label htmlFor="color-palette" className="text-sm text-white">
                    Include Color Palette
                  </label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!breakdown && (
              <Button
                onClick={handleExtractReferences}
                disabled={isLoading || !story.trim() || isExtractingReferences}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isExtractingReferences ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting References...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Configure References
                  </>
                )}
              </Button>
            )}
            
            <Button
              onClick={() => onGenerateBreakdown()}
              disabled={isLoading || !story.trim()}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isLoading ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  {breakdown ? "Regenerate" : "Quick Generate"} Breakdown
                </>
              )}
            </Button>

            {(story.trim() || breakdown) && (
              <Button
                onClick={onClearStory}
                disabled={isLoading}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Reference Summary */}
          {referenceConfig.characters.length > 0 || referenceConfig.locations.length > 0 || referenceConfig.props.length > 0 ? (
            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-300 mb-2">Active References:</p>
              <div className="flex flex-wrap gap-2">
                {referenceConfig.characters.map(char => (
                  <Badge key={char.id} variant="outline" className="border-blue-500/30 text-blue-300">
                    {char.reference}
                  </Badge>
                ))}
                {referenceConfig.locations.map(loc => (
                  <Badge key={loc.id} variant="outline" className="border-green-500/30 text-green-300">
                    {loc.reference}
                  </Badge>
                ))}
                {referenceConfig.props.map(prop => (
                  <Badge key={prop.id} variant="outline" className="border-orange-500/30 text-orange-300">
                    {prop.reference}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Story Results */}
      {breakdown && (
        <div className="space-y-6">
          {/* Story Structure */}
          {breakdown.storyStructure && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Story Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white">{breakdown.storyStructure.title}</h3>
                    <p className="text-slate-300 text-sm mt-1">{breakdown.storyStructure.genre}</p>
                    <p className="text-slate-400 text-sm mt-2">{breakdown.storyStructure.logline}</p>
                  </div>
                  
                  <Separator className="bg-slate-600" />
                  
                  <div>
                    <h4 className="font-medium text-white mb-2">Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {breakdown.storyStructure.themes?.map((theme: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-300">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chapter Breakdowns */}
          {breakdown.chapterBreakdowns?.map((chapter: any, index: number) => {
            const isExpanded = expandedChapters[chapter.chapterId]
            const chapterAdditionalShots = additionalShots[chapter.chapterId] || []

            return (
              <Card key={chapter.chapterId} className="bg-slate-800/50 border-slate-700">
                <Collapsible open={isExpanded} onOpenChange={() => toggleChapterExpansion(chapter.chapterId)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-amber-400" />
                          Chapter {index + 1}: {chapter.chapterTitle}
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
                      {/* Chapter Summary */}
                      <div>
                        <h4 className="font-medium text-white mb-2">Summary</h4>
                        <p className="text-slate-300 text-sm">{chapter.summary}</p>
                      </div>

                      <Separator className="bg-slate-600" />

                      {/* Shots */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white flex items-center gap-2">
                            <Camera className="h-4 w-4 text-amber-400" />
                            Shot List ({chapter.shots.length + chapterAdditionalShots.length} shots)
                          </h4>
                          <Button
                            size="sm"
                            onClick={() => onCopyToClipboard([...chapter.shots, ...chapterAdditionalShots].join("\n"))}
                            className="bg-slate-700 hover:bg-slate-600 text-white"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {chapter.shots.map((shot: string, shotIndex: number) => (
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
                              className="p-3 bg-amber-900/20 rounded-md border border-amber-700/30"
                            >
                              <div className="text-sm text-slate-300">{shot}</div>
                              <Badge variant="outline" className="mt-2 border-amber-500/30 text-amber-300">
                                Additional Shot
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Enhanced Additional Shots Generator */}
                      <EnhancedStoryAdditionalShots
                        chapterId={chapter.chapterId}
                        chapterTitle={chapter.chapterTitle}
                        characters={referenceConfig.characters}
                        locations={referenceConfig.locations}
                        props={referenceConfig.props}
                        onGenerate={handleGenerateAdditionalShotsWithReferences}
                        isLoading={isLoading}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}