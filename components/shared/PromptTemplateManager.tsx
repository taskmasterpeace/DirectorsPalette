'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Wand2, 
  User, 
  MapPin, 
  Camera, 
  Palette, 
  Star,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye
} from 'lucide-react'
import { 
  usePromptTemplatesStore, 
  type PromptTemplate,
  extractTagsFromTemplate 
} from '@/stores/prompt-templates-store'
import { useToast } from '@/components/ui/use-toast'

interface PromptTemplateManagerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onApplyTemplate: (processedPrompt: string) => void
  referenceImageTags?: string[] // Tags from current reference images
}

const categoryConfig = {
  character: { 
    icon: User, 
    label: 'Character', 
    color: 'bg-blue-600/80',
    description: 'Character-focused templates'
  },
  location: { 
    icon: MapPin, 
    label: 'Location', 
    color: 'bg-green-600/80',
    description: 'Location and environment templates'
  },
  action: { 
    icon: Camera, 
    label: 'Action', 
    color: 'bg-red-600/80',
    description: 'Action and movement templates'
  },
  style: { 
    icon: Palette, 
    label: 'Style', 
    color: 'bg-purple-600/80',
    description: 'Photography and visual style templates'
  },
  custom: { 
    icon: Star, 
    label: 'Custom', 
    color: 'bg-orange-600/80',
    description: 'User-created templates'
  }
}

export function PromptTemplateManager({
  isOpen,
  onOpenChange,
  onApplyTemplate,
  referenceImageTags = []
}: PromptTemplateManagerProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse')
  const [selectedCategory, setSelectedCategory] = useState<PromptTemplate['category']>('character')
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [tagValues, setTagValues] = useState<{ [key: string]: string }>({})
  const [processedPrompt, setProcessedPrompt] = useState('')
  
  // Template creation state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    template: '',
    description: '',
    category: 'custom' as PromptTemplate['category']
  })
  
  const {
    templates,
    addTemplate,
    deleteTemplate,
    getTemplatesByCategory,
    processTemplate,
    loadDefaultTemplates
  } = usePromptTemplatesStore()
  
  // Load default templates on mount
  useEffect(() => {
    loadDefaultTemplates()
  }, [loadDefaultTemplates])
  
  const filteredTemplates = getTemplatesByCategory(selectedCategory)
  
  // Auto-populate tag values from reference images
  useEffect(() => {
    if (selectedTemplate) {
      const newTagValues = { ...tagValues }
      
      // Auto-fill character-tag if we have reference image tags
      if (referenceImageTags.length > 0 && selectedTemplate.tags.includes('character-tag')) {
        newTagValues['character-tag'] = referenceImageTags[0] || ''
      }
      
      setTagValues(newTagValues)
    }
  }, [selectedTemplate, referenceImageTags])
  
  // Update processed prompt when template or tag values change
  useEffect(() => {
    if (selectedTemplate) {
      let processed = selectedTemplate.template
      
      Object.entries(tagValues).forEach(([tag, value]) => {
        if (value.trim()) {
          const regex = new RegExp(`\\[${tag}\\]`, 'g')
          processed = processed.replace(regex, value)
        }
      })
      
      setProcessedPrompt(processed)
    }
  }, [selectedTemplate, tagValues])
  
  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template)
    
    // Initialize tag values
    const initialTagValues: { [key: string]: string } = {}
    template.tags.forEach(tag => {
      initialTagValues[tag] = ''
    })
    
    // Auto-populate from reference images if available
    if (referenceImageTags.length > 0 && template.tags.includes('character-tag')) {
      initialTagValues['character-tag'] = referenceImageTags[0]
    }
    
    setTagValues(initialTagValues)
  }
  
  const handleApplyTemplate = () => {
    if (!selectedTemplate || !processedPrompt.trim()) {
      toast({
        title: "Template Not Ready",
        description: "Please select a template and fill in the required tags.",
        variant: "destructive"
      })
      return
    }
    
    onApplyTemplate(processedPrompt)
    onOpenChange(false)
    
    toast({
      title: "Template Applied",
      description: `Applied "${selectedTemplate.name}" template to Gen4 prompt.`
    })
  }
  
  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.template.trim()) {
      toast({
        title: "Template Incomplete",
        description: "Please fill in template name and content.",
        variant: "destructive"
      })
      return
    }
    
    const extractedTags = extractTagsFromTemplate(newTemplate.template)
    
    addTemplate({
      ...newTemplate,
      tags: extractedTags
    })
    
    toast({
      title: "Template Created",
      description: `Template "${newTemplate.name}" has been created.`
    })
    
    // Reset form
    setNewTemplate({
      name: '',
      template: '',
      description: '',
      category: 'custom'
    })
    setActiveTab('browse')
  }
  
  const handleDeleteTemplate = (template: PromptTemplate) => {
    if (template.id.startsWith('default_')) {
      toast({
        title: "Cannot Delete Default Template",
        description: "Default templates cannot be deleted.",
        variant: "destructive"
      })
      return
    }
    
    if (confirm(`Delete template "${template.name}"?`)) {
      deleteTemplate(template.id)
      
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null)
      }
      
      toast({
        title: "Template Deleted",
        description: `Template "${template.name}" has been deleted.`
      })
    }
  }
  
  const getCategoryIcon = (category: PromptTemplate['category']) => {
    const IconComponent = categoryConfig[category].icon
    return <IconComponent className="w-4 h-4" />
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[90vh] w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Prompt Templates
          </DialogTitle>
          <DialogDescription>
            Use templates with tag replacement for consistent, professional prompts.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'browse' ? 'default' : 'outline'}
            onClick={() => setActiveTab('browse')}
            className="flex-1"
          >
            Browse Templates
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'outline'}
            onClick={() => setActiveTab('create')}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Browse Templates Tab */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Template Selection */}
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(key as PromptTemplate['category'])}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{template.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  [{tag}]
                                </Badge>
                              ))}
                              {template.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {template.category === 'custom' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTemplate(template)
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Tag Input & Preview */}
            {selectedTemplate ? (
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {selectedTemplate.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tag Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTemplate.tags.map((tag) => (
                        <div key={tag} className="space-y-1">
                          <Label className="text-xs font-medium">{tag.replace('-', ' ')}</Label>
                          <Input
                            placeholder={`Enter ${tag.replace('-', ' ')}...`}
                            value={tagValues[tag] || ''}
                            onChange={(e) => setTagValues(prev => ({
                              ...prev,
                              [tag]: e.target.value
                            }))}
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Template Preview */}
                    <div className="space-y-2">
                      <Label>Generated Prompt Preview</Label>
                      <Card>
                        <CardContent className="p-3">
                          <div className="text-sm font-mono whitespace-pre-wrap">
                            {processedPrompt || selectedTemplate.template}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="lg:col-span-2 flex items-center justify-center h-64 text-muted-foreground">
                Select a template to customize and preview
              </div>
            )}
          </div>
        )}

        {/* Create Template Tab */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g., My Custom Character Shot"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={newTemplate.category} 
                    onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(key as PromptTemplate['category'])}
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Input
                    placeholder="What this template is for..."
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label>Template Content</Label>
                  <Textarea
                    placeholder="Enter your template with [tag-name] placeholders..."
                    value={newTemplate.template}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, template: e.target.value }))}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Use [tag-name] format for replaceable elements. Example: [character-tag], [location], [mood]
                  </div>
                </div>
                
                {/* Detected Tags */}
                {newTemplate.template && (
                  <div>
                    <Label>Detected Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {extractTagsFromTemplate(newTemplate.template).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          [{tag}]
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {activeTab === 'browse' ? (
            <>
              <div className="text-sm text-muted-foreground flex-1">
                {selectedTemplate ? `${selectedTemplate.tags.length} tags to fill` : 'Select a template'}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                {selectedTemplate && (
                  <Button
                    onClick={handleApplyTemplate}
                    disabled={!processedPrompt.trim()}
                    className="flex items-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Apply Template
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground flex-1">
                {newTemplate.template ? `${extractTagsFromTemplate(newTemplate.template).length} tags detected` : 'Enter template content'}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveTab('browse')}>
                  Back to Browse
                </Button>
                <Button
                  onClick={handleCreateTemplate}
                  disabled={!newTemplate.name.trim() || !newTemplate.template.trim()}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Template
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}