"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BookOpen,
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
  Users,
  MapPin,
  Package,
} from "lucide-react"
import { DirectorSelector } from "@/components/shared/DirectorSelector"
import { useToast } from "@/components/ui/use-toast"
import { ProgressBar } from "@/components/ui/progress-bar"
import { MultiStageProgress } from "@/components/ui/multi-stage-progress"
import { StoryEntitiesConfig } from "./story-entities-config"
import { ReferencesPanel } from "./ReferencesPanel"
import { EnhancedShotGenerator } from "./EnhancedShotGenerator"
import type { FilmDirector } from "@/lib/director-types"
import type { StoryEntities, ExtractedEntities } from "./story-entities-config"

interface StoryModeProps {
  // Story input state
  story: string
  setStory: (story: string) => void
  storyDirectorNotes: string
  setStoryDirectorNotes: (notes: string) => void
  
  // Director selection
  selectedDirector: string
  setSelectedDirector: (directorId: string) => void
  curatedDirectors: any[] // TODO: Type this properly
  customDirectors: any[] // TODO: Type this properly
  
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
  breakdown: any // TODO: Type this properly
  setBreakdown: (breakdown: any) => void
  additionalShots: { [key: string]: string[] }
  setAdditionalShots: (shots: any) => void
  
  // UI state
  expandedChapters: { [key: string]: boolean }
  setExpandedChapters: (chapters: any) => void
  
  // Loading
  isLoading: boolean
  isExtractingReferences?: boolean
  
  // Progress tracking
  generationStage: 'idle' | 'structure' | 'breakdowns' | 'complete'
  stageProgress: { current: number; total: number }
  stageMessage: string
  elapsedTime: number
  estimatedTime: number
  
  // Entities
  showEntitiesConfig: boolean
  setShowEntitiesConfig: (show: boolean) => void
  currentEntities: StoryEntities
  setCurrentEntities: (entities: StoryEntities) => void
  extractedEntities: ExtractedEntities | null
  setExtractedEntities: (entities: ExtractedEntities | null) => void
  isExtracting: boolean
  isGeneratingWithEntities: boolean
  
  // Handlers
  onGenerateBreakdown: (chapterMethod: string, userChapterCount: number) => Promise<void>
  onExtractEntities: () => Promise<void>
  onGenerateWithEntities: () => Promise<void>
  onGenerateAdditionalShots: (chapterId: string, categories: string[], customRequest: string) => Promise<void>
  onClearStory: () => void
  onCopyToClipboard: (text: string) => void
}

export function StoryMode({
  story,
  setStory,
  storyDirectorNotes,
  setStoryDirectorNotes,
  selectedDirector,
  setSelectedDirector,
  curatedDirectors,
  customDirectors,
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
  isExtractingReferences,
  generationStage,
  stageProgress,
  stageMessage,
  elapsedTime,
  estimatedTime,
  showEntitiesConfig,
  setShowEntitiesConfig,
  currentEntities,
  setCurrentEntities,
  extractedEntities,
  setExtractedEntities,
  isExtracting,
  isGeneratingWithEntities,
  onGenerateBreakdown,
  onExtractEntities,
  onGenerateWithEntities,
  onGenerateAdditionalShots,
  onClearStory,
  onCopyToClipboard,
}: StoryModeProps) {
  const { toast } = useToast()
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [chapterMethod, setChapterMethod] = useState<'auto-detect' | 'user-specified' | 'ai-suggested' | 'single'>('ai-suggested')
  const [userChapterCount, setUserChapterCount] = useState(4)

  const allDirectors = [...(curatedDirectors || []), ...(customDirectors || [])]
  const selectedDirectorInfo = allDirectors?.find((d) => d?.id === selectedDirector)

  // Extract references from breakdown
  const extractedReferences = useMemo(() => {
    if (!breakdown) return { characters: [], locations: [], props: [] }
    
    const allRefs = {
      characters: new Map<string, { name: string; description: string; chapters: string[] }>(),
      locations: new Map<string, { name: string; description: string; chapters: string[] }>(),
      props: new Map<string, { name: string; description: string; chapters: string[] }>()
    }
    
    breakdown.chapterBreakdowns?.forEach((cb: any, idx: number) => {
      const chapter = breakdown.storyStructure.chapters[idx]
      const chapterNum = (idx + 1).toString()
      
      // Create description lookups
      const charDescMap = new Map(cb.characterDescriptions?.map((d: any) => [d.name, d.description]) || [])
      const locDescMap = new Map(cb.locationDescriptions?.map((d: any) => [d.name, d.description]) || [])
      const propDescMap = new Map(cb.propDescriptions?.map((d: any) => [d.name, d.description]) || [])
      
      // Extract characters with director-style descriptions
      cb.characterReferences?.forEach((ref: string) => {
        const cleanRef = ref.replace('@', '').trim()
        if (!allRefs.characters.has(cleanRef)) {
          allRefs.characters.set(cleanRef, {
            name: cleanRef,
            description: charDescMap.get(cleanRef) || `Character appearing in the story`,
            chapters: [chapterNum]
          })
        } else {
          const existing = allRefs.characters.get(cleanRef)!
          if (!existing.chapters.includes(chapterNum)) {
            existing.chapters.push(chapterNum)
          }
        }
      })
      
      // Extract locations with atmospheric descriptions
      cb.locationReferences?.forEach((ref: string) => {
        const cleanRef = ref.replace('@', '').trim()
        if (!allRefs.locations.has(cleanRef)) {
          allRefs.locations.set(cleanRef, {
            name: cleanRef,
            description: locDescMap.get(cleanRef) || `Location in the story`,
            chapters: [chapterNum]
          })
        } else {
          const existing = allRefs.locations.get(cleanRef)!
          if (!existing.chapters.includes(chapterNum)) {
            existing.chapters.push(chapterNum)
          }
        }
      })
      
      // Extract props with visual significance descriptions
      cb.propReferences?.forEach((ref: string) => {
        const cleanRef = ref.replace('@', '').trim()
        if (!allRefs.props.has(cleanRef)) {
          allRefs.props.set(cleanRef, {
            name: cleanRef,
            description: propDescMap.get(cleanRef) || `Important prop/object in the story`,
            chapters: [chapterNum]
          })
        } else {
          const existing = allRefs.props.get(cleanRef)!
          if (!existing.chapters.includes(chapterNum)) {
            existing.chapters.push(chapterNum)
          }
        }
      })
    })
    
    return {
      characters: Array.from(allRefs.characters.values()).map((v, i) => ({ id: `char-${i}`, ...v })),
      locations: Array.from(allRefs.locations.values()).map((v, i) => ({ id: `loc-${i}`, ...v })),
      props: Array.from(allRefs.props.values()).map((v, i) => ({ id: `prop-${i}`, ...v }))
    }
  }, [breakdown])

  const toggleChapterExpansion = (chapterId: string) => {
    setExpandedChapters((prev: any) => ({ ...prev, [chapterId]: !prev[chapterId] }))
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
            <label className="text-sm font-medium text-white mb-1 block">🎯 Director&apos;s Notes (HIGHEST PRIORITY)</label>
            <Textarea
              placeholder="Your specific creative guidance, themes, visual style, mood..."
              value={storyDirectorNotes}
              onChange={(e) => setStoryDirectorNotes(e.target.value)}
              rows={3}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
            />
            <p className="text-xs text-amber-300 mt-1">
              These notes guide and enhance the selected director&apos;s style
            </p>
          </div>

          {/* Chapter Method Selection */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">📖 Chapter Generation Method</label>
            <Select value={chapterMethod} onValueChange={(value: any) => setChapterMethod(value)}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto-detect">🔍 Auto-detect from headings</SelectItem>
                <SelectItem value="user-specified">🎚️ User-specified count</SelectItem>
                <SelectItem value="ai-suggested">🤖 AI-suggested (3-5 chapters)</SelectItem>
                <SelectItem value="single">📄 Single chapter (no breakdown)</SelectItem>
              </SelectContent>
            </Select>
            
            {chapterMethod === 'user-specified' && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Chapter count:</span>
                  <span className="text-sm font-medium text-white">{userChapterCount} chapters</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="8" 
                  value={userChapterCount}
                  onChange={(e) => setUserChapterCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            )}
            
            <p className="text-xs text-slate-400 mt-1">
              {chapterMethod === 'auto-detect' && 'Looks for existing headings like "Chapter 1", "# Title", etc.'}
              {chapterMethod === 'user-specified' && `Story will be split into exactly ${userChapterCount} chapters`}
              {chapterMethod === 'ai-suggested' && 'AI determines optimal chapter count based on story structure'}
              {chapterMethod === 'single' && 'Treats entire story as one chapter for shot generation'}
            </p>
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
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
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="camera-style"
                      checked={promptOptions.includeCameraStyle}
                      onCheckedChange={(checked) =>
                        setPromptOptions((prev: any) => ({ ...prev, includeCameraStyle: !!checked }))
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
                        setPromptOptions((prev: any) => ({ ...prev, includeColorPalette: !!checked }))
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

          {/* Generation Options */}
          <div className="flex gap-3">
            <Button
              onClick={() => onGenerateBreakdown(chapterMethod, userChapterCount)}
              disabled={isLoading || isExtractingReferences || !story.trim()}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isExtractingReferences ? (
                <>
                  <Target className="h-4 w-4 mr-2 animate-spin" />
                  Extracting References...
                </>
              ) : isLoading ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Extract Story References
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
                Clear
              </Button>
            )}
          </div>
          
          {/* Entity Summary */}
          {(currentEntities.characters.length > 0 || currentEntities.locations.length > 0 || currentEntities.props.length > 0) && (
            <Card className="bg-purple-900/20 border-purple-700/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-4 text-sm">
                  {currentEntities.characters.length > 0 && (
                    <div className="flex items-center gap-1 text-purple-300">
                      <Users className="h-3 w-3" />
                      {currentEntities.characters.length} characters
                    </div>
                  )}
                  {currentEntities.locations.length > 0 && (
                    <div className="flex items-center gap-1 text-purple-300">
                      <MapPin className="h-3 w-3" />
                      {currentEntities.locations.length} locations
                    </div>
                  )}
                  {currentEntities.props.length > 0 && (
                    <div className="flex items-center gap-1 text-purple-300">
                      <Package className="h-3 w-3" />
                      {currentEntities.props.length} props
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Multi-Stage Progress Tracking */}
      <MultiStageProgress
        stage={generationStage}
        currentStep={stageProgress.current}
        totalSteps={stageProgress.total}
        message={stageMessage}
        elapsedTime={elapsedTime / 1000} // Convert ms to seconds
        estimatedTime={estimatedTime / 1000} // Convert ms to seconds
      />

      {/* Legacy Progress Bar (keep for entities generation) */}
      {isGeneratingWithEntities && (
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6">
            <div className="text-center mb-2">
              <p className="text-sm text-slate-300">
                {isGeneratingWithEntities 
                  ? "Generating enhanced breakdown with entity context..." 
                  : "Generating story breakdown..."}
              </p>
            </div>
            <ProgressBar 
              isActive={isLoading || isGeneratingWithEntities} 
              duration={34000} // 34 seconds based on actual timing
              showPercentage={true}
            />
          </CardContent>
        </Card>
      )}

      {/* References Panel - Show after generation */}
      {breakdown && (
        <ReferencesPanel
          characters={extractedReferences.characters}
          locations={extractedReferences.locations}
          props={extractedReferences.props}
          selectedDirector={selectedDirectorInfo?.name}
        />
      )}

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
                          <div className="flex flex-wrap gap-1">
                            {chapter.keyCharacters?.slice(0, 2).map((character: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="bg-blue-600/20 text-blue-300 text-xs">
                                <Users className="h-2 w-2 mr-1" />
                                {character}
                              </Badge>
                            ))}
                            {chapter.primaryLocation && (
                              <Badge variant="secondary" className="bg-green-600/20 text-green-300 text-xs">
                                <MapPin className="h-2 w-2 mr-1" />
                                {chapter.primaryLocation}
                              </Badge>
                            )}
                            {chapter.keyCharacters?.length > 2 && (
                              <Badge variant="secondary" className="bg-slate-600/20 text-slate-300 text-xs">
                                +{chapter.keyCharacters.length - 2} more
                              </Badge>
                            )}
                          </div>
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
                      {/* Chapter details */}
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
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                onCopyToClipboard([...chapterBreakdown.shots, ...chapterAdditionalShots].join("\n"))
                              }
                              className="bg-slate-700 hover:bg-slate-600 text-white"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy Chapter
                            </Button>
                            {breakdown && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  const allShots = breakdown.chapterBreakdowns
                                    .flatMap((cb: any, idx: number) => [
                                      `\n=== ${breakdown.storyStructure.chapters[idx].title} ===`,
                                      ...cb.shots,
                                      ...(additionalShots[cb.chapterId] || [])
                                    ])
                                    .join("\n")
                                  onCopyToClipboard(allShots)
                                }}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy All
                              </Button>
                            )}
                          </div>
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

                      {/* Enhanced Shot Generator - Now with ALL references available */}
                      <EnhancedShotGenerator
                        chapterId={chapter.id}
                        chapterCharacters={Array.from(allRefs.characters.keys())}
                        chapterLocations={Array.from(allRefs.locations.keys())}
                        chapterProps={Array.from(allRefs.props.keys())}
                        onGenerateShot={(chapterId, shotType, characters, location, customReq) => {
                          // Build categories from shot type
                          const categories = [shotType]
                          
                          // Build custom request with selected elements
                          let enhancedRequest = customReq
                          if (characters.length > 0) {
                            // Add @ only if not already present
                            enhancedRequest += ` Include characters: ${characters.map(c => c.startsWith('@') ? c : `@${c}`).join(', ')}.`
                          }
                          if (location) {
                            // Add @ only if not already present
                            enhancedRequest += ` Set at location: ${location.startsWith('@') ? location : `@${location}`}.`
                          }
                          
                          onGenerateAdditionalShots(chapterId, categories, enhancedRequest)
                        }}
                        isLoading={isLoading}
                      />

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
      
      {/* Story Entities Configuration Dialog */}
      <StoryEntitiesConfig
        isOpen={showEntitiesConfig}
        onClose={() => setShowEntitiesConfig(false)}
        story={story}
        extractedEntities={extractedEntities}
        currentEntities={currentEntities}
        onEntitiesUpdate={setCurrentEntities}
        onExtractEntities={onExtractEntities}
        onGenerateWithEntities={onGenerateWithEntities}
        isExtracting={isExtracting}
        isGenerating={isGeneratingWithEntities}
      />
    </div>
  )
}