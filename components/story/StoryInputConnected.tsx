'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { BookOpen, Wand2, Target, Settings, ChevronDown, Camera, Palette } from 'lucide-react'
import { DirectorSelector } from '@/components/shared/DirectorSelector'
import { TemplateManager } from '@/components/shared/TemplateManager'
import { useState } from 'react'
import { useStoryStore } from '@/stores/story-store'
import { useStoryWorkflowStore } from '@/stores/story-workflow-store'
import { useAppStore } from '@/stores/app-store'
import { useDirectorManagement } from '@/hooks/useDirectorManagement'
import { curatedFilmDirectors } from '@/lib/curated-directors'

interface StoryInputConnectedProps {
  onExtractReferences: () => void
  onClear: () => void
}

/**
 * StoryInput component connected directly to stores
 * Eliminates prop drilling by accessing state directly
 */
export function StoryInputConnected({
  onExtractReferences,
  onClear
}: StoryInputConnectedProps) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  
  // Access stores directly
  const {
    story,
    setStory,
    storyDirectorNotes,
    setStoryDirectorNotes,
    selectedDirector,
    setSelectedDirector,
    titleCardOptions,
    setTitleCardOptions,
    promptOptions,
    setPromptOptions,
    breakdown
  } = useStoryStore()
  
  const {
    chapterMethod,
    setChapterMethod,
    userChapterCount,
    setUserChapterCount,
    isExtractingRefs
  } = useStoryWorkflowStore()
  
  const { isLoading } = useAppStore()
  const { customDirectors } = useDirectorManagement()
  
  // Combine directors
  const allDirectors = [...(curatedFilmDirectors || []), ...(customDirectors || [])]
  const selectedDirectorInfo = allDirectors?.find((d) => d?.id === selectedDirector)
  const hasBreakdown = !!breakdown

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-amber-400" />
          Story Creator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your story here... (Ctrl+Enter to extract references)"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && story.trim() && !isLoading && !isExtractingRefs) {
              e.preventDefault()
              onExtractReferences()
            }
          }}
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

        {/* Template Manager */}
        <TemplateManager
          type="story"
          currentData={{
            story,
            storyDirectorNotes,
            selectedDirector
          }}
          onLoadTemplate={(template) => {
            const content = template.content as any
            setStory(content.story || '')
            setStoryDirectorNotes(content.storyDirectorNotes || '')
            if (content.selectedDirector) {
              setSelectedDirector(content.selectedDirector)
            }
          }}
        />

        {/* Generation Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onExtractReferences}
            disabled={isLoading || isExtractingRefs || !story.trim()}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isExtractingRefs ? (
              <>
                <Target className="h-4 w-4 mr-2 animate-spin" />
                Extracting References...
              </>
            ) : isLoading ? (
              <>
                <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                Creating your story breakdown...
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