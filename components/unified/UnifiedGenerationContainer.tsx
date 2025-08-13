'use client'

import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Film, Music, Wand2, Target, Trash2 } from 'lucide-react'
import { useUnifiedStore, selectCurrentContent, selectReferences, selectIsReady } from '@/stores/unified-app-store'
import { generationService } from '@/services/unified-generation-service'
import { useToast } from '@/components/ui/use-toast'

// Import existing components (we'll gradually replace these)
import { StoryInputConnected } from '@/components/story/StoryInputConnected'
import { MusicVideoInput } from '@/components/music-video/MusicVideoInput'
import { StoryReferenceConfig } from '@/components/story/StoryReferenceConfig'
import { MusicVideoReferenceConfig } from '@/components/music-video/MusicVideoReferenceConfig'

/**
 * Unified Generation Container
 * Handles both story and music video modes with consistent behavior
 */
export function UnifiedGenerationContainer() {
  const { toast } = useToast()
  const store = useUnifiedStore()
  const content = selectCurrentContent(store)
  const references = selectReferences(store)
  const isReady = selectIsReady(store)

  // Extract references using unified service
  const handleExtractReferences = useCallback(async () => {
    if (!isReady) {
      toast({
        title: "Input Required",
        description: store.current === 'story' 
          ? "Please enter a story to extract references"
          : "Please enter song title and lyrics",
        variant: "destructive"
      })
      return
    }

    store.setLoading(true)
    store.setWorkflowStage('extracting')
    store.updateWorkflowProgress(0, 1, 'Extracting references...')

    try {
      const result = await generationService.extractReferences({
        mode: store.current,
        content: store.current === 'story' ? store.story.text : store.musicVideo.lyrics,
        metadata: store.current === 'story' 
          ? {
              director: store.story.director,
              directorNotes: store.story.directorNotes
            }
          : {
              title: store.musicVideo.songTitle,
              artist: store.musicVideo.artist,
              director: store.musicVideo.director,
              directorNotes: store.musicVideo.directorNotes,
              concept: store.musicVideo.concept
            }
      })

      if (result.success && result.data) {
        store.setExtractedReferences(result.data)
        store.setShowReferenceConfig(true)
        store.setWorkflowStage('configuring')
        
        toast({
          title: "References Extracted",
          description: `Found ${result.data.characters.length} characters, ${result.data.locations.length} locations, ${result.data.props.length} props`
        })
      } else {
        throw new Error(result.error || 'Failed to extract references')
      }
    } catch (error) {
      console.error('Extract references error:', error)
      store.setError(error instanceof Error ? error.message : 'Failed to extract references')
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Failed to extract references",
        variant: "destructive"
      })
    } finally {
      store.setLoading(false)
      store.updateWorkflowProgress(1, 1, '')
    }
  }, [store, isReady, toast])

  // Generate breakdown with configured references
  const handleGenerateBreakdown = useCallback(async (configuredRefs?: any) => {
    const refs = configuredRefs || references
    if (!refs) {
      toast({
        title: "References Required",
        description: "Please extract and configure references first",
        variant: "destructive"
      })
      return
    }

    store.setLoading(true)
    store.setWorkflowStage('generating')
    store.updateWorkflowProgress(0, 1, 'Generating breakdown...')

    try {
      const result = await generationService.generateBreakdown({
        mode: store.current,
        content: store.current === 'story' ? store.story.text : store.musicVideo.lyrics,
        references: refs,
        director: store.current === 'story' ? store.story.director : store.musicVideo.director,
        directorNotes: store.current === 'story' ? store.story.directorNotes : store.musicVideo.directorNotes,
        options: store.current === 'story' 
          ? {
              chapterMethod: store.story.chapterMethod,
              chapterCount: store.story.chapterCount
            }
          : {}
      })

      if (result.success && result.data) {
        store.setBreakdown(result.data)
        store.setShowReferenceConfig(false)
        store.setWorkflowStage('complete')
        
        toast({
          title: "Breakdown Generated",
          description: `Successfully generated ${result.data.sections.length} sections`
        })
      } else {
        throw new Error(result.error || 'Failed to generate breakdown')
      }
    } catch (error) {
      console.error('Generate breakdown error:', error)
      store.setError(error instanceof Error ? error.message : 'Failed to generate breakdown')
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate breakdown",
        variant: "destructive"
      })
    } finally {
      store.setLoading(false)
      store.updateWorkflowProgress(1, 1, '')
    }
  }, [store, references, toast])

  // Clear everything
  const handleClear = useCallback(() => {
    store.resetWorkflow()
    toast({
      title: "Cleared",
      description: "All generation data has been cleared"
    })
  }, [store, toast])

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Mode Tabs */}
      <Tabs value={store.current} onValueChange={(v) => store.setMode(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="story" className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            Story Mode
          </TabsTrigger>
          <TabsTrigger value="music-video" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Music Video Mode
          </TabsTrigger>
        </TabsList>

        {/* Story Mode */}
        <TabsContent value="story" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Story Input</span>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExtractReferences}
                    disabled={store.isLoading || !store.story.text.trim()}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {store.isLoading && store.workflow.stage === 'extracting' ? (
                      <>
                        <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Extract References
                      </>
                    )}
                  </Button>
                  {store.breakdown && (
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Use existing component for now */}
              <StoryInputConnected
                onExtractReferences={handleExtractReferences}
                onClear={handleClear}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Music Video Mode */}
        <TabsContent value="music-video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Music Video Input</span>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExtractReferences}
                    disabled={store.isLoading || !store.musicVideo.songTitle.trim() || !store.musicVideo.lyrics.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {store.isLoading && store.workflow.stage === 'extracting' ? (
                      <>
                        <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Extract References
                      </>
                    )}
                  </Button>
                  {store.breakdown && (
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Will be replaced with unified input */}
              <div className="text-slate-400">Music video input component here</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reference Configuration (shared) */}
      {store.ui.showReferenceConfig && references && (
        <Card>
          <CardHeader>
            <CardTitle>Configure References</CardTitle>
          </CardHeader>
          <CardContent>
            {store.current === 'story' ? (
              <StoryReferenceConfig
                references={references}
                isLoading={store.isLoading}
                onConfigurationComplete={(refs) => {
                  store.setConfiguredReferences(refs)
                  handleGenerateBreakdown(refs)
                }}
                onCancel={() => {
                  store.setShowReferenceConfig(false)
                  store.setExtractedReferences(null)
                }}
              />
            ) : (
              <MusicVideoReferenceConfig
                references={references}
                isLoading={store.isLoading}
                onConfigurationComplete={(refs) => {
                  store.setConfiguredReferences(refs)
                  handleGenerateBreakdown(refs)
                }}
                onCancel={() => {
                  store.setShowReferenceConfig(false)
                  store.setExtractedReferences(null)
                }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Breakdown Display (unified) */}
      {store.breakdown && (
        <Card>
          <CardHeader>
            <CardTitle>{store.breakdown.title} - Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {store.breakdown.sections.map(section => (
                <div key={section.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{section.title}</h3>
                  <div className="space-y-2">
                    {section.shots.map(shot => (
                      <div key={shot.id} className="p-2 bg-slate-800 rounded">
                        {shot.description}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}