"use client"

import { useState } from "react"
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
  Palette,
  Camera,
  Eye,
} from "lucide-react"
import { DirectorSelector } from "@/components/shared/DirectorSelector"
import { useToast } from "@/components/ui/use-toast"
import type { FilmDirector } from "@/lib/director-types"

interface StoryModeProps {
  // Story input state
  story: string
  setStory: (story: string) => void
  storyDirectorNotes: string
  setStoryDirectorNotes: (notes: string) => void
  
  // Director selection
  selectedDirector: string
  setSelectedDirector: (directorId: string) => void
  allDirectors: any[] // TODO: Type this properly
  
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
  
  // Handlers
  onGenerateBreakdown: () => Promise<void>
  onGenerateAdditionalShots: (chapterId: string, categories: string[], customRequest: string) => Promise<void>
  onCopyToClipboard: (text: string) => void
}

export function StoryMode({
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
  onCopyToClipboard,
}: StoryModeProps) {
  const { toast } = useToast()
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  const selectedDirectorInfo = allDirectors.find((d) => d.id === selectedDirector)

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
            <label className="text-sm font-medium text-white mb-1 block">Director&apos;s Notes (optional)</label>
            <Textarea
              placeholder="Overall creative direction, themes, pacing, references..."
              value={storyDirectorNotes}
              onChange={(e) => setStoryDirectorNotes(e.target.value)}
              rows={3}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
            />
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

          <Button
            onClick={onGenerateBreakdown}
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
                          <Button
                            size="sm"
                            onClick={() =>
                              onCopyToClipboard([...chapterBreakdown.shots, ...chapterAdditionalShots].join("\n"))
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
                                onGenerateAdditionalShots(
                                  chapter.id,
                                  ["Close-ups", "Wide shots"],
                                  e.currentTarget.value
                                )
                                e.currentTarget.value = ""
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              onGenerateAdditionalShots(chapter.id, ["Close-ups", "Wide shots"], "")
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
  )
}