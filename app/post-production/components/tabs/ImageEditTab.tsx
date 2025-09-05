'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Edit,
  Upload,
  Clipboard,
  Trash2,
  Plus,
  Download,
  Sparkles,
  Image as ImageIcon,
  Save,
  Copy,
  Wand2,
  Target,
  DollarSign,
  Clock,
  ZoomIn,
  ArrowRight,
  X
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { editImageWithQwen } from '@/app/actions/image-edit'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export interface ImageEditSession {
  id: string
  inputImage: string
  prompt: string
  outputImages: string[]
  timestamp: Date
  cost: number
  processingTime: number
}

interface ImageEditTabProps {
  onSendToWorkspace?: (imageUrl: string) => void
  onSendToAIGenerator?: (imageUrl: string) => void
}

export function ImageEditTab({ onSendToWorkspace, onSendToAIGenerator }: ImageEditTabProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Core editing state
  const [inputImage, setInputImage] = useState<string>('')
  const [editPrompt, setEditPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [editResults, setEditResults] = useState<ImageEditSession[]>([])
  
  // Template system
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [editingTemplateText, setEditingTemplateText] = useState('')
  const [templates, setTemplates] = useState(() => {
    // Load templates from localStorage or use defaults
    const savedTemplates = localStorage.getItem('directors-palette-image-edit-templates')
    if (savedTemplates) {
      try {
        return JSON.parse(savedTemplates)
      } catch {
        // Fall back to defaults if parsing fails
      }
    }
    return {
      'different-angle': 'Show this shot from a different camera angle',
      'five-seconds-later': 'Show this same scene 5 seconds later in time',
      'different-time': 'Show this shot at a different time of day',
      'brighter': 'Make this shot brighter and more vibrant',
      'darker': 'Make this shot darker and more moody',
      'remove-background': 'Remove the background from this shot',
      'golden-hour': 'Change the lighting to golden hour/sunset lighting',
      'remove-person': 'Remove any people from this shot'
    }
  })
  
  // Fullscreen image state
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  // Send image to AI Generator
  const handleSendToAIGenerator = (imageUrl: string) => {
    if (onSendToAIGenerator) {
      onSendToAIGenerator(imageUrl)
      toast({
        title: "Sent to AI Generator",
        description: "Image added as reference for Gen4 generation"
      })
    } else {
      // Fallback - store in localStorage for AI Generator to pick up
      localStorage.setItem('directors-palette-ai-gen-reference', imageUrl)
      toast({
        title: "Sent to AI Generator", 
        description: "Switch to AI Generator tab to use this reference"
      })
    }
  }

  // Check for incoming images from other tabs
  useEffect(() => {
    const incomingImage = localStorage.getItem('directors-palette-image-edit-input')
    if (incomingImage) {
      setInputImage(incomingImage)
      localStorage.removeItem('directors-palette-image-edit-input')
      toast({
        title: "Image Loaded",
        description: "Image transferred from Gen4 tab"
      })
    }
  }, [])

  // Handle image upload
  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid Format",
        description: "Please upload a JPEG, PNG, GIF, or WebP image",
        variant: "destructive"
      })
      return
    }

    // Convert to data URL for preview and API
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setInputImage(e.target.result as string)
        toast({
          title: "Image Loaded",
          description: `${file.name} ready for editing`
        })
      }
    }
    reader.readAsDataURL(file)
  }, [toast])

  // Handle paste from clipboard
  const handlePasteImage = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(item.types.find(type => type.startsWith('image/')) || 'image/png')
          const file = new File([blob], 'pasted-image.png', { type: blob.type })
          
          const reader = new FileReader()
          reader.onload = (e) => {
            if (e.target?.result) {
              setInputImage(e.target.result as string)
              toast({
                title: "Image Pasted",
                description: "Image from clipboard loaded for editing"
              })
            }
          }
          reader.readAsDataURL(file)
          return
        }
      }
      
      toast({
        title: "No Image Found",
        description: "No image found in clipboard",
        variant: "destructive"
      })
    } catch (error) {
      toast({
        title: "Paste Failed",
        description: "Could not access clipboard",
        variant: "destructive"
      })
    }
  }, [toast])

  // Simple template prompts for shot editing
  const SHOT_TEMPLATES = {
    'different-angle': 'Show this shot from a different camera angle',
    'five-seconds-later': 'Show this same scene 5 seconds later in time',
    'different-time': 'Show this shot at a different time of day',
    'brighter': 'Make this shot brighter and more vibrant',
    'darker': 'Make this shot darker and more moody',
    'remove-background': 'Remove the background from this shot',
    'golden-hour': 'Change the lighting to golden hour/sunset lighting',
    'remove-person': 'Remove any people from this shot'
  }

  // Save templates to localStorage
  const saveTemplates = useCallback((newTemplates: Record<string, string>) => {
    setTemplates(newTemplates)
    localStorage.setItem('directors-palette-image-edit-templates', JSON.stringify(newTemplates))
  }, [])

  // Handle template selection
  const handleTemplateSelect = useCallback((template: string) => {
    setSelectedTemplate(template)
    
    // Set the prompt directly from template
    if (template && templates[template]) {
      setEditPrompt(templates[template])
    }
  }, [templates])

  // Handle template editing
  const handleEditTemplate = useCallback((templateKey: string) => {
    setEditingTemplate(templateKey)
    setEditingTemplateText(templates[templateKey])
  }, [templates])

  // Save template edits
  const handleSaveTemplate = useCallback(() => {
    if (editingTemplate && editingTemplateText.trim()) {
      const newTemplates = {
        ...templates,
        [editingTemplate]: editingTemplateText.trim()
      }
      saveTemplates(newTemplates)
      setEditingTemplate(null)
      setEditingTemplateText('')
      toast({
        title: "Template Updated",
        description: "Template saved successfully"
      })
    }
  }, [editingTemplate, editingTemplateText, templates, saveTemplates, toast])

  // Delete template
  const handleDeleteTemplate = useCallback((templateKey: string) => {
    const newTemplates = { ...templates }
    delete newTemplates[templateKey]
    saveTemplates(newTemplates)
    
    // Clear selection if deleted template was selected
    if (selectedTemplate === templateKey) {
      setSelectedTemplate('')
      setEditPrompt('')
    }
    
    toast({
      title: "Template Deleted",
      description: "Template removed successfully"
    })
  }, [templates, selectedTemplate, saveTemplates, toast])

  // Handle image editing
  const handleEditImage = useCallback(async () => {
    if (!inputImage || !editPrompt.trim()) {
      toast({
        title: "Missing Requirements",
        description: "Please upload an image and enter editing instructions",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    
    try {
      // Get API key from localStorage
      const replicateKey = localStorage.getItem('directors-palette-replicate-key')
      
      const result = await editImageWithQwen({
        imageData: inputImage,
        prompt: editPrompt,
        apiKey: replicateKey || undefined
      })
      
      if (result.success && result.imageUrl) {
        const session: ImageEditSession = {
          id: `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          inputImage,
          prompt: editPrompt,
          outputImages: [result.imageUrl],
          timestamp: new Date(),
          cost: 0.03,
          processingTime: 3000 // Approximate
        }
        
        setEditResults(prev => [session, ...prev])
        
        toast({
          title: "Image Edited Successfully",
          description: "Your image has been edited"
        })
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (error) {
      toast({
        title: "Editing Failed",
        description: error instanceof Error ? error.message : "Could not edit image",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }, [inputImage, editPrompt, toast])

  // Copy image URL to clipboard with fallback
  const handleCopyImage = useCallback(async (imageUrl: string) => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(imageUrl)
        toast({
          title: "URL Copied",
          description: "Image URL copied to clipboard"
        })
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = imageUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
          toast({
            title: "URL Copied",
            description: "Image URL copied to clipboard"
          })
        } catch (fallbackError) {
          toast({
            title: "Copy Not Available", 
            description: "Please manually copy the URL from browser address bar",
            variant: "destructive"
          })
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (error) {
      console.error('Copy failed:', error)
      toast({
        title: "Copy Failed", 
        description: "Could not copy URL to clipboard",
        variant: "destructive"
      })
    }
  }, [toast])

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-4">
          <div className="text-center">
            <Edit className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <h2 className="text-lg font-bold text-white mb-1">Shot Editor</h2>
            <p className="text-sm text-slate-400">
              Upload an image and edit it with simple instructions
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Image Upload */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                Input Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1 min-h-[44px]" // Mobile touch target
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <Button
                  onClick={handlePasteImage}
                  variant="outline"
                  className="flex-1 min-h-[44px]" // Mobile touch target
                >
                  <Clipboard className="w-4 h-4 mr-2" />
                  Paste
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
              />

              {/* Image preview */}
              {inputImage && (
                <div className="relative">
                  <img
                    src={inputImage}
                    alt="Input for editing"
                    className="w-full max-h-64 object-contain rounded border border-slate-600 bg-slate-800"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setInputImage('')}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Editing Instructions */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-green-400" />
                Edit Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Editable Templates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Quick Templates</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newKey = `custom-${Date.now()}`
                      const newTemplates = {
                        ...templates,
                        [newKey]: 'New custom template'
                      }
                      saveTemplates(newTemplates)
                      handleEditTemplate(newKey)
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Template
                  </Button>
                </div>
                
                {/* Template List with Edit/Delete */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(templates).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-slate-700">
                      {editingTemplate === key ? (
                        <>
                          <Input
                            value={editingTemplateText}
                            onChange={(e) => setEditingTemplateText(e.target.value)}
                            className="flex-1 bg-slate-900 border-slate-600 text-white text-sm"
                            placeholder="Enter template text..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveTemplate()
                              } else if (e.key === 'Escape') {
                                setEditingTemplate(null)
                                setEditingTemplateText('')
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveTemplate}
                            className="h-7 px-2 bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTemplate(null)
                              setEditingTemplateText('')
                            }}
                            className="h-7 px-2"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => handleTemplateSelect(key)}
                            className="flex-1 justify-start text-left p-2 h-auto"
                          >
                            <span className="text-sm text-slate-300 truncate">{value}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTemplate(key)}
                            className="h-7 px-2"
                            title="Edit template"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTemplate(key)}
                            className="h-7 px-2 text-red-400 hover:text-red-300 hover:border-red-500"
                            title="Delete template"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom prompt */}
              <div className="space-y-2">
                <Label className="text-white">Or Write Custom Instructions</Label>
                <Textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter') {
                      e.preventDefault()
                      if (inputImage && editPrompt.trim() && !isProcessing) {
                        handleEditImage()
                      }
                    }
                  }}
                  placeholder="Describe what you want to change... e.g., 'Show this from behind the character' or 'Make the lighting more dramatic'"
                  rows={3}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              {/* Generate button */}
              <Button
                onClick={handleEditImage}
                disabled={!inputImage || !editPrompt.trim() || isProcessing}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white min-h-[44px]"
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault()
                    handleEditImage()
                  }
                }}
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Editing Image...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Image
                  </>
                )}
              </Button>
              <div className="text-xs text-slate-400 text-center">
                Press <kbd className="bg-slate-700 px-1 rounded">Ctrl+Enter</kbd> to edit
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                Edit Results
                {editResults.length > 0 && (
                  <Badge className="bg-green-600 text-white ml-2">
                    {editResults.length} sessions
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                  <p>No edits yet. Upload an image and start editing!</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {editResults.map((result) => (
                      <div key={result.id} className="border border-slate-600 rounded-lg p-3">
                        {/* Session info */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs text-slate-400">
                            {result.timestamp.toLocaleTimeString()} • ${result.cost.toFixed(2)} • {(result.processingTime/1000).toFixed(1)}s
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {result.outputImages.length} image{result.outputImages.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        
                        {/* Prompt */}
                        <div className="text-xs text-slate-300 mb-3 bg-slate-800/50 p-2 rounded">
                          {result.prompt}
                        </div>
                        
                        {/* Output images */}
                        <div className="grid grid-cols-1 gap-2">
                          {result.outputImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Edit result ${index + 1}`}
                                className="w-full max-h-48 object-contain rounded border border-slate-600 bg-slate-800 cursor-pointer transition-all hover:border-purple-500"
                                onClick={() => setFullscreenImage(imageUrl)}
                              />
                              
                              {/* Magnifying glass hover indicator */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn className="w-8 h-8 text-white" />
                              </div>
                              
                              {/* Action buttons */}
                              <div className="absolute top-1 right-1 flex gap-1">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleCopyImage(imageUrl)}
                                  className="h-6 w-6 p-0 opacity-90 hover:opacity-100"
                                  title="Copy image URL"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleSendToAIGenerator(imageUrl)}
                                  className="h-6 w-6 p-0 bg-purple-600 hover:bg-purple-700 text-white"
                                  title="Send to AI Generator"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </Button>
                                
                                {onSendToWorkspace && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => onSendToWorkspace(imageUrl)}
                                    className="h-6 w-6 p-0"
                                    title="Send to Video Studio"
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="w-full h-full object-contain"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setFullscreenImage(null)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}