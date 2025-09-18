'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NanoBananaPromptLoader } from './NanoBananaPromptLoader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { usePromptLibraryStore, type SavedPrompt, type PromptCategory } from '@/stores/prompt-library-store'
import { supabase } from '@/lib/supabase'
// Import to trigger module-level initialization
import '@/lib/prompt-library-init'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Star,
  StarOff,
  FolderOpen,
  Hash,
  Sparkles,
  BookOpen,
  X,
  Check
} from 'lucide-react'

interface PromptLibraryProps {
  onSelectPrompt?: (prompt: string) => void
  showQuickAccess?: boolean
  className?: string
}

export function PromptLibrary({ onSelectPrompt, showQuickAccess = true, className }: PromptLibraryProps) {
  const { toast } = useToast()
  const [isAddPromptOpen, setIsAddPromptOpen] = useState(false)
  const [isEditPromptOpen, setIsEditPromptOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | null>(null)
  const [isEditingCategories, setIsEditingCategories] = useState(false)
  const [activeTab, setActiveTab] = useState('categories')
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    prompt: '',
    categoryId: 'custom',
    tags: '',
    isQuickAccess: false
  })

  const {
    prompts,
    categories,
    quickPrompts,
    searchQuery,
    selectedCategory,
    selectedPrompt,
    isLoading,
    error,
    addPrompt,
    updatePrompt,
    deletePrompt,
    toggleQuickAccess,
    addCategory,
    updateCategory,
    deleteCategory,
    setSearchQuery,
    setSelectedCategory,
    loadUserPrompts,
    getFilteredPrompts,
    getPromptsByCategory
  } = usePromptLibraryStore()

  // Load user prompts on mount
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        if (supabase) {
          const { data: { user }, error } = await supabase.auth.getUser()
          if (!error && user) {
            await loadUserPrompts(user.id)
          } else {
            // No user or auth error - work in guest mode
            console.log('Prompt Library: Working in guest mode')
            await loadUserPrompts('guest')
          }
        } else {
          // No Supabase - work offline
          console.log('Prompt Library: Working offline - Supabase not available')
          await loadUserPrompts('guest')
        }
      } catch (error) {
        console.warn('Prompt Library: Failed to check auth status, working offline:', error)
        await loadUserPrompts('guest')
      }
    }
    loadPrompts()
  }, [loadUserPrompts])

  const filteredPrompts = useMemo(() => getFilteredPrompts(), [searchQuery, selectedCategory, prompts])
  const categoryPrompts = useMemo(() =>
    selectedCategory ? getPromptsByCategory(selectedCategory) : [],
    [selectedCategory, prompts]
  )

  const handleAddPrompt = async () => {
    if (!newPrompt.title || !newPrompt.prompt) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    await addPrompt({
      title: newPrompt.title,
      prompt: newPrompt.prompt,
      categoryId: newPrompt.categoryId,
      tags: newPrompt.tags.split(',').map(t => t.trim()).filter(t => t),
      isQuickAccess: newPrompt.isQuickAccess
    })

    toast({
      title: 'Success',
      description: 'Prompt added to library'
    })

    setIsAddPromptOpen(false)
    setNewPrompt({
      title: '',
      prompt: '',
      categoryId: 'custom',
      tags: '',
      isQuickAccess: false
    })
  }

  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return

    await updatePrompt(editingPrompt.id, editingPrompt)

    toast({
      title: 'Success',
      description: 'Prompt updated successfully'
    })

    setIsEditPromptOpen(false)
    setEditingPrompt(null)
  }

  const handleDeletePrompt = async (promptId: string) => {
    await deletePrompt(promptId)

    toast({
      title: 'Success',
      description: 'Prompt removed from library'
    })
  }

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    toast({
      title: 'Copied',
      description: 'Prompt copied to clipboard'
    })
  }

  // Function to get random prompt snippet from a category
  const getRandomFromCategory = (categoryId: string): string => {
    const categoryPrompts = getPromptsByCategory(categoryId)

    // If no prompts in category, return the placeholder as-is
    if (categoryPrompts.length === 0) {
      return `@${categoryId}`
    }

    // Get a random prompt from the category
    const randomPrompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)]

    // Extract a meaningful snippet from the prompt (first 50 chars or first phrase)
    const snippet = randomPrompt.prompt.split(',')[0].trim()
    return snippet.length > 50 ? snippet.substring(0, 50) + '...' : snippet
  }

  // Function to replace @ placeholders with content from actual categories
  const processPromptReplacements = (prompt: string): string => {
    let processedPrompt = prompt

    // Map of @ placeholders to category IDs
    const categoryMappings: Record<string, string> = {
      '@cinematic': 'cinematic',
      '@characters': 'characters',
      '@character': 'characters',  // Support both singular and plural
      '@lighting': 'lighting',
      '@environments': 'environments',
      '@environment': 'environments',  // Support both singular and plural
      '@location': 'environments',  // Alias for environments
      '@effects': 'effects',
      '@effect': 'effects',  // Support singular
      '@moods': 'moods',
      '@mood': 'moods',  // Support both singular and plural
      '@camera': 'camera',
      '@styles': 'styles',
      '@style': 'styles'  // Support both singular and plural
    }

    // Replace each placeholder with content from the corresponding category
    Object.entries(categoryMappings).forEach(([placeholder, categoryId]) => {
      const regex = new RegExp(placeholder.replace('@', '\\@'), 'gi')  // Case insensitive
      processedPrompt = processedPrompt.replace(regex, () => {
        return getRandomFromCategory(categoryId)
      })
    })

    return processedPrompt
  }

  const handleSelectPrompt = (prompt: SavedPrompt) => {
    const processedPrompt = processPromptReplacements(prompt.prompt)
    if (onSelectPrompt) {
      onSelectPrompt(processedPrompt)
    }
    handleCopyPrompt(processedPrompt)
  }

  const renderPromptCard = (prompt: SavedPrompt) => (
    <Card key={prompt.id} className="bg-slate-950 border-slate-700 hover:border-slate-600 transition-all shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-white mb-1">{prompt.title}</h4>
            {prompt.reference && (
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 mb-2">
                {prompt.reference}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleQuickAccess(prompt.id)}
              className="h-8 w-8 p-0"
            >
              {prompt.isQuickAccess ? (
                <Star className="w-4 h-4 text-yellow-500" />
              ) : (
                <StarOff className="w-4 h-4 text-gray-400" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingPrompt(prompt)
                setIsEditPromptOpen(true)
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4 text-gray-400" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeletePrompt(prompt.id)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-300 line-clamp-2">{prompt.prompt}</p>
          {prompt.prompt.includes('@') && (
            <p className="text-xs text-blue-400 mt-1 italic">
              Preview: {processPromptReplacements(prompt.prompt)}
            </p>
          )}
        </div>

        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {prompt.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs bg-slate-800 text-slate-400">
                <Hash className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleSelectPrompt(prompt)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Copy className="w-3 h-3 mr-1" />
            Use Prompt
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <NanoBananaPromptLoader />
      <Card className="bg-slate-900/90 border-slate-700 flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Prompt Library
              <Badge variant="outline" className="text-xs">
                {prompts.length} prompts
              </Badge>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddPromptOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Prompt
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="all">All Prompts</TabsTrigger>
              {showQuickAccess && <TabsTrigger value="quick">Quick Access</TabsTrigger>}
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 mt-4">
              <ScrollArea className="h-[500px]">
                <div className="grid gap-3">
                  {filteredPrompts.map(renderPromptCard)}
                </div>
              </ScrollArea>
            </TabsContent>

            {showQuickAccess && (
              <TabsContent value="quick" className="flex-1 mt-4">
                <ScrollArea className="h-[500px]">
                  <div className="grid gap-3">
                    {quickPrompts.map(renderPromptCard)}
                  </div>
                </ScrollArea>
              </TabsContent>
            )}

            <TabsContent value="categories" className="flex-1 mt-4">
              {!selectedCategory ? (
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(category => {
                    const promptCount = getPromptsByCategory(category.id).length
                    return (
                      <Card
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id)
                        }}
                        className="bg-slate-950 border-slate-700 cursor-pointer transition-all hover:border-slate-600 hover:bg-slate-900"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{category.icon}</span>
                              <div>
                                <h4 className="font-medium text-white">{category.name}</h4>
                                <p className="text-sm text-gray-400">{promptCount} prompts</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        ← Back to Categories
                      </Button>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xl">
                          {categories.find(c => c.id === selectedCategory)?.icon}
                        </span>
                        <h3 className="font-medium text-white">
                          {categories.find(c => c.id === selectedCategory)?.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <ScrollArea className="h-[450px]">
                    <div className="grid gap-3">
                      {categoryPrompts.length > 0 ? (
                        categoryPrompts.map(renderPromptCard)
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          No prompts in this category yet
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Prompt Dialog */}
      <Dialog open={isAddPromptOpen} onOpenChange={setIsAddPromptOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white" aria-describedby="add-prompt-description">
          <DialogHeader>
            <DialogTitle>Add New Prompt</DialogTitle>
            <DialogDescription id="add-prompt-description" className="text-gray-400">
              Create a new prompt and add it to your library
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newPrompt.title}
                onChange={(e) => setNewPrompt({ ...newPrompt, title: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prompt">Prompt</Label>
              <textarea
                id="prompt"
                value={newPrompt.prompt}
                onChange={(e) => setNewPrompt({ ...newPrompt, prompt: e.target.value })}
                className="min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newPrompt.categoryId}
                onValueChange={(value) => setNewPrompt({ ...newPrompt, categoryId: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id} className="text-white hover:bg-purple-600/30">
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={newPrompt.tags}
                onChange={(e) => setNewPrompt({ ...newPrompt, tags: e.target.value })}
                placeholder="e.g., hero, dramatic, closeup"
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="quickAccess"
                checked={newPrompt.isQuickAccess}
                onChange={(e) => setNewPrompt({ ...newPrompt, isQuickAccess: e.target.checked })}
                className="rounded border-slate-700"
              />
              <Label htmlFor="quickAccess">Add to Quick Access</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddPromptOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPrompt} className="bg-blue-600 hover:bg-blue-700">
              Add Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Prompt Dialog */}
      <Dialog open={isEditPromptOpen} onOpenChange={setIsEditPromptOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white" aria-describedby="edit-prompt-description">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription id="edit-prompt-description" className="text-gray-400">
              Update your prompt details
            </DialogDescription>
          </DialogHeader>

          {editingPrompt && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingPrompt.title}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, title: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-prompt">Prompt</Label>
                <textarea
                  id="edit-prompt"
                  value={editingPrompt.prompt}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, prompt: e.target.value })}
                  className="min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editingPrompt.categoryId}
                  onValueChange={(value) => setEditingPrompt({ ...editingPrompt, categoryId: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id} className="text-white hover:bg-purple-600/30">
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditPromptOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrompt} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}