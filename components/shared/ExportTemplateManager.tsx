'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Camera, 
  Lightbulb, 
  Settings, 
  Film, 
  Star,
  User,
  Trash2,
  Eye
} from 'lucide-react'
import { useExportTemplatesStore, type ExportTemplate } from '@/stores/export-templates-store'
import { useToast } from '@/components/ui/use-toast'

interface ExportTemplateManagerProps {
  currentPrefix: string
  currentSuffix: string
  onApplyTemplate: (prefix: string, suffix: string) => void
  onSaveTemplate?: (name: string, category: ExportTemplate['category']) => void
}

const categoryConfig = {
  camera: { 
    icon: Camera, 
    label: 'Camera Angles', 
    color: 'bg-blue-600/80',
    description: 'Camera positioning and framing'
  },
  lighting: { 
    icon: Lightbulb, 
    label: 'Lighting', 
    color: 'bg-yellow-600/80',
    description: 'Lighting setup and mood'
  },
  technical: { 
    icon: Settings, 
    label: 'Technical', 
    color: 'bg-gray-600/80',
    description: 'Quality and technical specifications'
  },
  genre: { 
    icon: Film, 
    label: 'Genre Style', 
    color: 'bg-purple-600/80',
    description: 'Genre-specific styling'
  },
  custom: { 
    icon: User, 
    label: 'Custom', 
    color: 'bg-green-600/80',
    description: 'User-created templates'
  }
}

export function ExportTemplateManager({
  currentPrefix,
  currentSuffix,
  onApplyTemplate,
  onSaveTemplate
}: ExportTemplateManagerProps) {
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState<ExportTemplate['category']>('camera')
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  
  const {
    templates,
    addTemplate,
    deleteTemplate,
    getTemplatesByCategory,
    loadDefaultTemplates
  } = useExportTemplatesStore()
  
  // Load default templates on mount
  useEffect(() => {
    loadDefaultTemplates()
  }, [loadDefaultTemplates])
  
  const filteredTemplates = getTemplatesByCategory(selectedCategory)
  
  const handleApplyTemplate = (template: ExportTemplate) => {
    onApplyTemplate(template.prefix, template.suffix)
    
    toast({
      title: "Template Applied",
      description: `Applied "${template.name}" template`
    })
  }
  
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for your template.",
        variant: "destructive"
      })
      return
    }
    
    if (!currentPrefix.trim() && !currentSuffix.trim()) {
      toast({
        title: "No Content to Save",
        description: "Please enter a prefix or suffix before saving.",
        variant: "destructive"
      })
      return
    }
    
    const template = {
      name: templateName.trim(),
      category: 'custom' as const,
      prefix: currentPrefix,
      suffix: currentSuffix,
      description: templateDescription.trim() || undefined
    }
    
    addTemplate(template)
    
    toast({
      title: "Template Saved",
      description: `Export template "${templateName}" has been saved.`
    })
    
    // Reset form
    setTemplateName('')
    setTemplateDescription('')
    setShowSaveForm(false)
    setSelectedCategory('custom') // Switch to custom to see new template
  }
  
  const handleDeleteTemplate = (template: ExportTemplate) => {
    // Prevent deletion of default templates
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
      
      toast({
        title: "Template Deleted",
        description: `Template "${template.name}" has been deleted.`
      })
    }
  }
  
  const getCategoryIcon = (category: ExportTemplate['category']) => {
    const IconComponent = categoryConfig[category].icon
    return <IconComponent className="w-3 h-3" />
  }
  
  return (
    <div className="space-y-4">
      {/* Category Selector */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Template Category:</Label>
        <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(key as ExportTemplate['category'])}
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground ml-auto">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-48">
        <div className="grid grid-cols-1 gap-2">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-2 text-center py-6 text-muted-foreground text-sm">
              No templates in this category.
              {selectedCategory === 'custom' && (
                <div className="mt-1">
                  Save your current prefix/suffix as a template!
                </div>
              )}
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-white text-xs ${categoryConfig[template.category].color} flex-shrink-0 max-w-full`}
                        >
                          {getCategoryIcon(template.category)}
                          <span className="ml-1 truncate">{template.name}</span>
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        {template.prefix && (
                          <div>
                            <span className="font-medium">Prefix:</span> "{template.prefix}"
                          </div>
                        )}
                        {template.suffix && (
                          <div>
                            <span className="font-medium">Suffix:</span> "{template.suffix}"
                          </div>
                        )}
                        {template.description && (
                          <div className="text-xs italic">{template.description}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => handleApplyTemplate(template)}
                        title="Apply template"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      {template.category === 'custom' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteTemplate(template)}
                          title="Delete template"
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

      {/* Save Template Section */}
      <div className="border-t pt-4">
        {!showSaveForm ? (
          <Button
            variant="outline"
            onClick={() => setShowSaveForm(true)}
            className="w-full flex items-center gap-2"
            disabled={!currentPrefix.trim() && !currentSuffix.trim()}
          >
            <Save className="w-4 h-4" />
            Save Current as Template
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Save Export Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                <div><strong>Current Prefix:</strong> "{currentPrefix}"</div>
                <div><strong>Current Suffix:</strong> "{currentSuffix}"</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., My Custom Setup"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-description">Description (optional)</Label>
                <Input
                  id="template-description"
                  placeholder="What this template is for..."
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim()}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveForm(false)
                    setTemplateName('')
                    setTemplateDescription('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}