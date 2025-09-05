'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { BookOpen, Wand2, Target, Settings, ChevronDown, Camera, Palette, Trash2 } from 'lucide-react'
import { DirectorSelector } from '@/components/shared/DirectorSelector'
import { useState } from 'react'

interface StoryInputProps {
  // Story data
  story: string
  setStory: (story: string) => void
  storyDirectorNotes: string
  setStoryDirectorNotes: (notes: string) => void
  
  // Director selection
  selectedDirector: string
  setSelectedDirector: (directorId: string) => void
  allDirectors: any[]
  
  // Chapter method
  chapterMethod: string
  setChapterMethod: (method: string) => void
  userChapterCount: number
  setUserChapterCount: (count: number) => void
  
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
  
  // Actions
  onExtractReferences: () => void
  onClear: () => void
  isLoading: boolean
  isExtractingReferences: boolean
  hasBreakdown: boolean
}

export function StoryInput({
  story,
  setStory,
  storyDirectorNotes,
  setStoryDirectorNotes,
  selectedDirector,
  setSelectedDirector,
  allDirectors,
  chapterMethod,
  setChapterMethod,
  userChapterCount,
  setUserChapterCount,
  titleCardOptions,
  setTitleCardOptions,
  promptOptions,
  setPromptOptions,
  onExtractReferences,
  onClear,
  isLoading,
  isExtractingReferences,
  hasBreakdown
}: StoryInputProps) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const selectedDirectorInfo = allDirectors?.find((d) => d?.id === selectedDirector)

  return (
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
          <label className="text-sm font-medium text-white mb-2 block">
            📖 Chapter Generation Method
          </label>
          <Select value={chapterMethod} onValueChange={setChapterMethod}>
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

        {/* Mobile: Stack buttons vertically to prevent overflow */}
        <div className="flex flex-col gap-2 sm:hidden">
          <Button
            onClick={onExtractReferences}
            disabled={isLoading || isExtractingReferences || !story.trim()}
            className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isExtractingReferences ? (
              <>
                <Target className="h-4 w-4 mr-2 animate-spin" />
                Extracting...
              </>
            ) : isLoading ? (
              <>
                <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Extract References
              </>
            )}
          </Button>

          {(story.trim() || hasBreakdown) && (
            <Button
              onClick={onClear}
              disabled={isLoading}
              variant="outline"
              className="w-full h-11 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Story
            </Button>
          )}
        </div>

        {/* Desktop: Side-by-side layout */}
        <div className="hidden sm:flex gap-3">
          <Button
            onClick={onExtractReferences}
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

          {(story.trim() || hasBreakdown) && (
            <Button
              onClick={onClear}
              disabled={isLoading}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}