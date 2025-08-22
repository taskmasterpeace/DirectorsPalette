'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  FileText, 
  Music, 
  Star,
  User,
  TestTube,
  Clock,
  Target
} from 'lucide-react'
import { useTemplatesStore, type Template, type StoryTemplate, type MusicVideoTemplate, type CommercialTemplate } from '@/stores/templates-store'
import { useToast } from '@/components/ui/use-toast'

interface TemplateManagerProps {
  type: 'story' | 'music-video' | 'commercial'
  currentData?: any
  onLoadTemplate: (template: Template) => void
  trigger?: React.ReactNode
}

export function TemplateManager({ 
  type, 
  currentData, 
  onLoadTemplate,
  trigger 
}: TemplateManagerProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'load' | 'save'>('load')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'sample' | 'user' | 'test-data'>('all')
  const [templateName, setTemplateName] = useState('')
  const [templateCategory, setTemplateCategory] = useState<'user' | 'test-data'>('user')
  
  const {
    templates,
    addTemplate,
    deleteTemplate,
    getTemplatesByType,
    loadSampleTemplates
  } = useTemplatesStore()
  
  // Load sample templates on first render
  useEffect(() => {
    loadSampleTemplates()
  }, [loadSampleTemplates])
  
  // Filter templates by type and category
  const filteredTemplates = getTemplatesByType(type).filter(template => {
    if (selectedCategory === 'all') return true
    return template.category === selectedCategory
  }).sort((a, b) => {
    // Sort by category (sample first) then by creation date
    if (a.category !== b.category) {
      const order = { sample: 0, user: 1, 'test-data': 2 }
      return order[a.category] - order[b.category]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for your template.",
        variant: "destructive"
      })
      return
    }
    
    if (!currentData) {
      toast({
        title: "No Data to Save", 
        description: "Please enter some content before saving a template.",
        variant: "destructive"
      })
      return
    }
    
    const template = {
      name: templateName.trim(),
      type,
      category: templateCategory,
      content: currentData
    }
    
    addTemplate(template)
    
    toast({
      title: "Template Saved",
      description: `Template "${templateName}" has been saved successfully.`
    })
    
    setTemplateName('')
    setActiveTab('load') // Switch to load tab to see the new template
  }
  
  const handleLoadTemplate = (template: Template) => {
    onLoadTemplate(template)
    setIsOpen(false)
    
    toast({
      title: "Template Loaded",
      description: `Loaded template "${template.name}"` 
    })
  }
  
  const handleDeleteTemplate = (template: Template) => {
    if (template.category === 'sample') {
      toast({
        title: "Cannot Delete Sample",
        description: "Sample templates cannot be deleted.",
        variant: "destructive"
      })
      return
    }
    
    if (confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      deleteTemplate(template.id)
      
      toast({
        title: "Template Deleted",
        description: `Template "${template.name}" has been deleted.`
      })
    }
  }
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sample': return <Star className="w-3 h-3" />
      case 'user': return <User className="w-3 h-3" />
      case 'test-data': return <TestTube className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sample': return 'bg-yellow-600/80'
      case 'user': return 'bg-blue-600/80'
      case 'test-data': return 'bg-green-600/80'
      default: return 'bg-gray-600/80'
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2"
        >
          <FolderOpen className="w-4 h-4" />
          Templates
        </Button>
      )}
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'story' ? <FileText className="w-5 h-5" /> : type === 'music-video' ? <Music className="w-5 h-5" /> : <Target className="w-5 h-5" />}
            {type === 'story' ? 'Story' : type === 'music-video' ? 'Music Video' : 'Commercial'} Templates
          </DialogTitle>
          <DialogDescription>
            Save your current work as a template or load a previously saved template.
          </DialogDescription>
        </DialogHeader>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'load' ? 'default' : 'outline'}
            onClick={() => setActiveTab('load')}
            className="flex-1"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Load Template
          </Button>
          <Button
            variant={activeTab === 'save' ? 'default' : 'outline'}
            onClick={() => setActiveTab('save')}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
        
        {/* Load Templates Tab */}
        {activeTab === 'load' && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Label>Category:</Label>
              <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sample">Sample Templates</SelectItem>
                  <SelectItem value="user">My Templates</SelectItem>
                  <SelectItem value="test-data">Test Data</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground ml-auto">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            {/* Templates List */}
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates found in this category.
                    {selectedCategory === 'user' && (
                      <div className="mt-2 text-sm">
                        Try saving your current work as a template!
                      </div>
                    )}
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <Card key={template.id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge 
                                variant="secondary" 
                                className={`text-white ${getCategoryColor(template.category)}`}
                              >
                                {getCategoryIcon(template.category)}
                                <span className="ml-1">{template.category}</span>
                              </Badge>
                            </div>
                            
                            {/* Preview of content */}
                            <div className="text-sm text-muted-foreground mb-2">
                              {type === 'story' ? (
                                <span>{(template as StoryTemplate).content.story.substring(0, 100)}...</span>
                              ) : type === 'music-video' ? (
                                <div>
                                  <span className="font-medium">{(template as MusicVideoTemplate).content.songTitle || 'Untitled'}</span>
                                  {(template as MusicVideoTemplate).content.artist && (
                                    <span> by {(template as MusicVideoTemplate).content.artist}</span>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <span className="font-medium">{(template as CommercialTemplate).content.brandDescription.substring(0, 60)}...</span>
                                  <div className="text-xs">
                                    Target: {(template as CommercialTemplate).content.targetAudience.substring(0, 40)}...
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(template.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="flex gap-1 ml-4">
                            <Button
                              size="sm"
                              onClick={() => handleLoadTemplate(template)}
                            >
                              Load
                            </Button>
                            {template.category !== 'sample' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteTemplate(template)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Save Template Tab */}
        {activeTab === 'save' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="Enter a name for your template..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && templateName.trim()) {
                    handleSaveTemplate()
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={templateCategory} onValueChange={(value: any) => setTemplateCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">My Templates</SelectItem>
                  <SelectItem value="test-data">Test Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Preview of current data */}
            {currentData && (
              <div className="space-y-2">
                <Label>Current Content Preview</Label>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-sm text-muted-foreground">
                      {type === 'story' ? (
                        <div>
                          <div className="font-medium mb-1">Story:</div>
                          <div className="line-clamp-3">{currentData.story?.substring(0, 200)}...</div>
                          {currentData.storyDirectorNotes && (
                            <div className="mt-2">
                              <div className="font-medium">Director Notes:</div>
                              <div className="line-clamp-2">{currentData.storyDirectorNotes.substring(0, 100)}...</div>
                            </div>
                          )}
                        </div>
                      ) : type === 'music-video' ? (
                        <div>
                          <div className="flex gap-4 mb-2">
                            {currentData.songTitle && <span className="font-medium">{currentData.songTitle}</span>}
                            {currentData.artist && <span>by {currentData.artist}</span>}
                            {currentData.genre && <Badge variant="outline">{currentData.genre}</Badge>}
                          </div>
                          {currentData.lyrics && (
                            <div className="line-clamp-4">{currentData.lyrics.substring(0, 200)}...</div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium mb-1">Brand Brief:</div>
                          <div className="line-clamp-2">{currentData.brandDescription?.substring(0, 150)}...</div>
                          <div className="mt-2">
                            <div className="font-medium">Target Audience:</div>
                            <div className="line-clamp-1">{currentData.targetAudience?.substring(0, 100)}...</div>
                          </div>
                          {currentData.selectedDirector && (
                            <div className="mt-2">
                              <Badge variant="outline">{currentData.selectedDirector}</Badge>
                              {currentData.platform && <Badge variant="outline" className="ml-2">{currentData.platform}</Badge>}
                              {currentData.duration && <Badge variant="outline" className="ml-2">{currentData.duration}</Badge>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          {activeTab === 'save' && (
            <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}