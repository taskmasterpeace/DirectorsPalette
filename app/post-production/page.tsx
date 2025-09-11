'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Film, 
  Image as ImageIcon, 
  Layout,
  List,
  Settings,
  Sparkles
} from 'lucide-react'
import { usePostProductionStore } from '@/stores/post-production-store'
import { retrieveTransferredShots } from '@/lib/post-production/transfer'
import { useToast } from '@/components/ui/use-toast'
import LayoutPlanner from './components/layout-planner/LayoutPlanner'
import { LayoutEditorRefactored as CompleteLayoutEditor } from '@/components/layout/LayoutEditorRefactored'
import type { 
  ImageData,
  Gen4ReferenceImage,
  Gen4Generation,
  Gen4Settings,
  LibraryImageReference
} from '@/lib/post-production/enhanced-types'
import { referenceLibraryDB, saveImageToLibrary } from '@/lib/post-production/referenceLibrary'
import CategorySelectionDialog from './components/CategorySelectionDialog'
import FullscreenImageModal from './components/FullscreenImageModal'
import { Gen4TabOptimized as Gen4Tab } from '@/components/post-production/Gen4TabOptimized'
import { WorkspaceTab } from './components/tabs/WorkspaceTab'
import { ShotListTab } from './components/tabs/ShotListTab'
import { ImageEditTabOptimized as ImageEditTab } from '@/components/post-production/ImageEditTabOptimized'

export default function EnhancedPostProductionPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('shot-list')
  const [mode, setMode] = useState<'seedance'>('seedance')
  const [images, setImages] = useState<ImageData[]>([])
  
  // Gen4 state
  const [gen4ReferenceImages, setGen4ReferenceImages] = useState<Gen4ReferenceImage[]>([])
  const [gen4Prompt, setGen4Prompt] = useState('')
  const [gen4Settings, setGen4Settings] = useState<Gen4Settings>({
    aspectRatio: '16:9',
    resolution: '2K', // Default to 2K for Seedream-4
    seed: undefined,
    model: 'seedream-4', // Default to Seedream-4
    maxImages: 1, // Default single image
    sequentialGeneration: false
  })
  const [gen4Generations, setGen4Generations] = useState<Gen4Generation[]>([])
  const [gen4Processing, setGen4Processing] = useState(false)
  
  // Reference Library state
  const [libraryCategory, setLibraryCategory] = useState<'all' | 'people' | 'places' | 'props' | 'unorganized'>('all')
  const [libraryItems, setLibraryItems] = useState<LibraryImageReference[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)
  
  // Dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [pendingGeneration, setPendingGeneration] = useState<{
    imageUrl: string
    prompt: string
    settings: any
    referenceTags?: string[]
  } | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<LibraryImageReference | null>(null)
  
  // Shot management from store
  const { 
    addShots, 
    shotQueue, 
    completedShots, 
    failedShots 
  } = usePostProductionStore()
  
  // Track generated shot IDs
  const [generatedShotIds, setGeneratedShotIds] = useState<Set<string>>(new Set())
  
  // Check for transferred shots and load library on mount
  useEffect(() => {
    const transferredShots = retrieveTransferredShots()
    if (transferredShots && transferredShots.length > 0) {
      addShots(transferredShots)
      toast({
        title: "Shots Imported",
        description: `Successfully imported ${transferredShots.length} shots from Director's Palette`,
      })
    }
    loadLibraryItems()
  }, [addShots])
  
  // Load library items from IndexedDB
  const loadLibraryItems = async () => {
    setLibraryLoading(true)
    try {
      await referenceLibraryDB.init()
      const items = await referenceLibraryDB.getAllReferences()
      setLibraryItems(items as LibraryImageReference[])
    } catch (error) {
      console.error('Failed to load library:', error)
      toast({
        title: "Library Error",
        description: "Failed to load reference library",
        variant: "destructive"
      })
    } finally {
      setLibraryLoading(false)
    }
  }
  
  // Handle category selection and save to library
  const handleCategorySave = async (category: string, tags: string[]) => {
    console.log('🔍 handleCategorySave called with category:', category, 'tags:', tags)
    console.log('🔍 pendingGeneration:', pendingGeneration)
    
    if (pendingGeneration) {
      try {
        const referenceTag = pendingGeneration.referenceTags?.[0]
        
        console.log('🔍 About to call saveImageToLibrary with:', {
          imageUrl: pendingGeneration.imageUrl,
          tags,
          prompt: pendingGeneration.prompt,
          source: 'generated',
          settings: pendingGeneration.settings,
          category,
          referenceTag
        })
        
        const savedId = await saveImageToLibrary(
          pendingGeneration.imageUrl,
          tags,
          pendingGeneration.prompt,
          'generated',
          pendingGeneration.settings,
          category as any,
          referenceTag
        )
        
        console.log('✅ Image saved to library with ID:', savedId)
        setPendingGeneration(null)
        console.log('🔍 Reloading library items...')
        loadLibraryItems()
        
        toast({
          title: "Saved to Library",
          description: `Image saved to ${category} with ${tags.length} tags`
        })
      } catch (error) {
        console.error('🔴 Error in handleCategorySave:', error)
        toast({
          title: "Save Failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        })
      }
    } else {
      console.log('❌ No pendingGeneration found!')
    }
  }

  // Send generation to workspace
  const sendGenerationToWorkspace = async (imageUrl: string) => {
    try {
      if (!imageUrl) return

      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], `gen4_${Date.now()}.png`, { type: 'image/png' })
      
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const preview = URL.createObjectURL(file)

      const newImage: ImageData = {
        id,
        file,
        preview,
        prompt: '',
        selected: false,
        status: 'idle',
        mode: 'seedance',
      }

      setImages(prev => [...prev, newImage])

      toast({
        title: 'Added to Workspace',
        description: 'Image has been added to your workspace.',
      })
    } catch (error) {
      console.error('Error sending to workspace:', error)
      toast({
        title: 'Error',
        description: 'Failed to add image to workspace.',
        variant: 'destructive',
      })
    }
  }

  // Send generation to Image Edit tab
  const sendToImageEdit = (imageUrl: string) => {
    // Store the image URL in localStorage for the Image Edit tab to pick up
    localStorage.setItem('directors-palette-image-edit-input', imageUrl)
    
    // Switch to Image Edit tab
    setActiveTab('image-edit')
    
    toast({
      title: 'Sent to Image Edit',
      description: 'Image has been loaded in the Image Edit tab',
    })
  }
  
  // Send generation to Layout & Annotation tab
  const sendToLayoutAnnotation = (imageUrl: string) => {
    // Store the image URL in localStorage for Layout tab to pick up
    localStorage.setItem('directors-palette-layout-input', imageUrl)
    
    // Switch to Layout tab
    setActiveTab('layout')
    
    toast({
      title: 'Sent to Layout & Annotation',
      description: 'Image has been loaded in the Layout & Annotation tab',
    })
  }
  
  // Send generation to Reference Library with categorization
  const sendToReferenceLibrary = async (imageUrl: string) => {
    console.log('🔍 sendToReferenceLibrary called with imageUrl:', imageUrl)
    try {
      // For now, we'll save directly and let user categorize in the Reference Library
      const pendingGen = {
        imageUrl,
        prompt: 'Generated image',
        settings: gen4Settings,
        referenceTags: []
      }
      console.log('🔍 Setting pendingGeneration:', pendingGen)
      setPendingGeneration(pendingGen)
      console.log('🔍 Opening category dialog...')
      setCategoryDialogOpen(true)
      
      toast({
        title: 'Opening Save Dialog',
        description: 'Category selection dialog should appear',
      })
    } catch (error) {
      console.error('🔴 Error in sendToReferenceLibrary:', error)
      toast({
        title: 'Save Failed',
        description: 'Failed to save to reference library',
        variant: 'destructive'
      })
    }
  }
  
  return (
    <div className="container mx-auto max-w-none w-[95%] p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Film className="w-8 h-8 text-purple-500" />
              Post Production Studio
            </h1>
            <p className="text-slate-400 mt-1">
              Advanced image generation with Director's Palette integration
            </p>
          </div>
        </div>
        
        {/* Mobile-First Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Mobile: Dropdown Selector + Primary Tabs */}
          <div className="block sm:hidden">
            <div className="mb-3">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full h-12 text-base bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shot-list">
                    <div className="flex items-center gap-2">
                      <List className="w-4 h-4" />
                      Shot List Manager
                    </div>
                  </SelectItem>
                  <SelectItem value="image-edit">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4" />
                      Shot Editor
                    </div>
                  </SelectItem>
                  <SelectItem value="gen4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Shot Creator
                    </div>
                  </SelectItem>
                  <SelectItem value="workspace">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Shot Animator
                    </div>
                  </SelectItem>
                  <SelectItem value="layout">
                    <div className="flex items-center gap-2">
                      <Layout className="w-4 h-4" />
                      Layout & Annotation
                    </div>
                  </SelectItem>
                  <SelectItem value="entity-manager">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Entity Manager
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Desktop: Original Tab Layout */}
          <TabsList className="hidden sm:grid grid-cols-6 w-full max-w-none min-h-[44px]">
            <TabsTrigger value="shot-list" className="flex items-center gap-2 min-h-[44px]">
              <List className="w-4 h-4" />
              <span className="hidden lg:inline">Shot List</span>
            </TabsTrigger>
            <TabsTrigger value="image-edit" className="flex items-center gap-2 min-h-[44px]">
              <Film className="w-4 h-4" />
              <span className="hidden lg:inline">Shot Editor</span>
            </TabsTrigger>
            <TabsTrigger value="gen4" className="flex items-center gap-2 min-h-[44px]">
              <Sparkles className="w-4 h-4" />
              <span className="hidden lg:inline">Shot Creator</span>
            </TabsTrigger>
            <TabsTrigger value="workspace" className="flex items-center gap-2 min-h-[44px]">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Shot Animator</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2 min-h-[44px]">
              <Layout className="w-4 h-4" />
              <span className="hidden lg:inline">Layout & Annotation</span>
            </TabsTrigger>
            <TabsTrigger value="entity-manager" className="flex items-center gap-2 min-h-[44px]">
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">Entity Manager</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Image to Video Tab - Video Generation Only */}
          <TabsContent value="workspace" className="space-y-4">
            <WorkspaceTab
              images={images}
              setImages={setImages}
              libraryItems={libraryItems}
              libraryCategory={libraryCategory}
              setLibraryCategory={setLibraryCategory}
              libraryLoading={libraryLoading}
              onFullscreenImage={setFullscreenImage}
              onCategoryChange={async (itemId: string, newCategory: string) => {
                // TODO: Implement category change functionality
                toast({
                  title: "Category Changed",
                  description: `Item moved to ${newCategory}`
                })
                loadLibraryItems()
              }}
            />
          </TabsContent>

          {/* Shot List Tab - Enhanced Functionality */}
          <TabsContent value="shot-list" className="space-y-4">
            <ShotListTab />
          </TabsContent>

          {/* Image Edit Tab - Qwen-Edit Integration */}
          <TabsContent value="image-edit" className="space-y-4">
            <ImageEditTab 
              onSendToWorkspace={sendGenerationToWorkspace}
              libraryItems={libraryItems}
              libraryCategory={libraryCategory}
              setLibraryCategory={setLibraryCategory}
              libraryLoading={libraryLoading}
              onFullscreenImage={setFullscreenImage}
              onCategoryChange={async (itemId: string, newCategory: string) => {
                // TODO: Implement category change functionality
                toast({
                  title: "Category Changed",
                  description: `Item moved to ${newCategory}`
                })
                loadLibraryItems()
              }}
            />
          </TabsContent>

          {/* Gen4 Tab - Clean Component with Paste Buttons */}
          <TabsContent value="gen4" className="space-y-4">
            <Gen4Tab
              gen4ReferenceImages={gen4ReferenceImages}
              setGen4ReferenceImages={setGen4ReferenceImages}
              gen4Prompt={gen4Prompt}
              setGen4Prompt={setGen4Prompt}
              gen4Settings={gen4Settings}
              setGen4Settings={setGen4Settings}
              gen4Generations={gen4Generations}
              setGen4Generations={setGen4Generations}
              gen4Processing={gen4Processing}
              setGen4Processing={setGen4Processing}
              libraryItems={libraryItems}
              libraryCategory={libraryCategory}
              setLibraryCategory={setLibraryCategory}
              libraryLoading={libraryLoading}
              onFullscreenImage={setFullscreenImage}
              onSendToWorkspace={sendGenerationToWorkspace}
              shotList={[...shotQueue, ...completedShots, ...failedShots]}
              generatedShotIds={generatedShotIds}
              onShotGenerated={(shotId, imageUrl) => {
                console.log('🔴 SHOT GENERATED:', shotId, imageUrl)
                setGeneratedShotIds(prev => new Set([...prev, shotId]))
              }}
              onSendToImageEdit={sendToImageEdit}
              onSendToLayoutAnnotation={sendToLayoutAnnotation}
              onSendToReferenceLibrary={sendToReferenceLibrary}
              onCategoryChange={async (itemId: string, newCategory: string) => {
                // TODO: Implement category change functionality
                toast({
                  title: "Category Changed",
                  description: `Item moved to ${newCategory}`
                })
                loadLibraryItems()
              }}
            />
          </TabsContent>

          {/* Complete Layout & Annotation Editor Tab */}
          <TabsContent value="layout">
            <CompleteLayoutEditor />
          </TabsContent>

          {/* Entity Manager Tab - Find & Replace System */}
          <TabsContent value="entity-manager">
            <div className="space-y-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-400" />
                    Entity Manager - Find & Replace
                  </CardTitle>
                  <p className="text-slate-400 text-sm">
                    Scan shot descriptions and replace entities (@people, @places, @props) across {shotQueue.length + completedShots.length + failedShots.length} shots
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chapter Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">Select Chapter</Label>
                      <Select defaultValue="all">
                        <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                          <SelectValue placeholder="Choose chapter..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">🎬 All Chapters ({shotQueue.length + completedShots.length + failedShots.length} shots)</SelectItem>
                          <SelectItem value="chapter-1">📖 Chapter 1</SelectItem>
                          <SelectItem value="chapter-2">📖 Chapter 2</SelectItem>
                          <SelectItem value="chapter-3">📖 Chapter 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">Quick Actions</Label>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => {
                            // Scan actual shot data for entities
                            const allShots = [...shotQueue, ...completedShots, ...failedShots]
                            const entities = new Set<string>()
                            
                            allShots.forEach(shot => {
                              const matches = shot.description.match(/@\w+/g)
                              if (matches) {
                                matches.forEach(entity => entities.add(entity))
                              }
                            })
                            
                            console.log('🔍 Scanned entities from shots:', Array.from(entities))
                            toast({
                              title: "Entities Scanned",
                              description: `Found ${entities.size} unique entities in ${allShots.length} shots`
                            })
                          }}
                        >
                          🔍 Scan Entities
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          💾 Save Preset
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Entity Detection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">Detected Entities from {shotQueue.length + completedShots.length + failedShots.length} Shots</h4>
                      <Badge variant="outline" className="text-xs">
                        {(() => {
                          const allShots = [...shotQueue, ...completedShots, ...failedShots]
                          const entities = new Set<string>()
                          allShots.forEach(shot => {
                            const matches = shot.description.match(/@\w+/g)
                            if (matches) matches.forEach(entity => entities.add(entity))
                          })
                          return entities.size
                        })()} entities found
                      </Badge>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded p-3 border border-purple-600/30">
                      <div className="text-sm text-slate-300 space-y-2">
                        {(() => {
                          const allShots = [...shotQueue, ...completedShots, ...failedShots]
                          const entities = new Set<string>()
                          allShots.forEach(shot => {
                            const matches = shot.description.match(/@\w+/g)
                            if (matches) matches.forEach(entity => entities.add(entity))
                          })
                          const entityArray = Array.from(entities).sort()
                          
                          if (entityArray.length === 0) {
                            return <div className="text-slate-500">No entities found. Generate a story first.</div>
                          }
                          
                          return (
                            <div className="grid grid-cols-3 gap-2">
                              {entityArray.map(entity => (
                                <div key={entity} className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-slate-600">
                                  <span className="text-purple-300 font-mono text-xs">{entity}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0"
                                    onClick={() => {
                                      console.log(`🔍 Selected entity: ${entity}`)
                                      // TODO: Add to replacement list
                                    }}
                                  >
                                    ✏️
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Placeholder replacement interface */}
                    <div className="text-center py-4 text-slate-500 text-sm">
                      📝 Select entities above to add them to replacement list
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
      
      {/* Category Selection Dialog */}
      <CategorySelectionDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSave={handleCategorySave}
        initialTags={[]}
        imageUrl={pendingGeneration?.imageUrl}
      />
      
      {/* Fullscreen Image Modal */}
      <FullscreenImageModal
        image={fullscreenImage}
        open={!!fullscreenImage}
        onOpenChange={(open) => {
          if (!open) setFullscreenImage(null)
        }}
        onDelete={async (id) => {
          try {
            await referenceLibraryDB.deleteReference(id)
            loadLibraryItems()
            setFullscreenImage(null)
            toast({
              title: "Deleted",
              description: "Reference removed from library"
            })
          } catch (error) {
            toast({
              title: "Delete Failed", 
              description: "Could not remove reference",
              variant: "destructive"
            })
          }
        }}
        onTagEdit={async (id, newTag) => {
          try {
            const ref = await referenceLibraryDB.getReference(id)
            if (ref) {
              const updatedRef = { ...ref, referenceTag: newTag || undefined }
              await referenceLibraryDB.saveReference(updatedRef)
              loadLibraryItems()
              toast({
                title: "Tag Updated",
                description: newTag ? `Reference tag set to @${newTag}` : "Reference tag removed"
              })
            }
          } catch (error) {
            toast({
              title: "Update Failed",
              description: "Could not update reference tag",
              variant: "destructive"
            })
          }
        }}
      />
    </div>
  )
}