'use client'

import { useState, useEffect } from 'react'
import { TemplateBanner } from '@/components/shared/TemplateBanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Zap, 
  Clock, 
  Target, 
  Film, 
  Copy,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { generateCommercial } from '@/app/actions/commercial/generate'
import { CommercialStructure, CommercialConfig } from '@/lib/types/commercial-types'
import { commercialDirectors, getCommercialDirectorById } from '@/lib/commercial-directors'
import { DirectorSelector } from '@/components/shared/DirectorSelector'
import { CommercialInput } from '@/components/commercial/CommercialInput'
import { useTemplatesStore, type Template, type CommercialTemplate } from '@/stores/templates-store'
import { CommercialQuestionCards, type CommercialDirectorQuestion } from '@/components/commercial/CommercialQuestionCards'
import { DirectorInsights } from '@/components/commercial/DirectorInsights'
import { CommercialErrorBoundary, useCommercialErrorHandler } from '@/components/commercial/CommercialErrorBoundary'

type WorkflowStage = 'input' | 'director-selection' | 'director-questions' | 'generation' | 'results'

export function CommercialContainer() {
  const { toast } = useToast()
  const { handleError } = useCommercialErrorHandler()
  const { addTemplate, loadSampleTemplates } = useTemplatesStore()
  
  // Workflow state
  const [stage, setStage] = useState<WorkflowStage>('input')
  
  // Commercial brief from input stage
  const [commercialBrief, setCommercialBrief] = useState<{
    brandDescription: string
    campaignGoals: string
    targetAudience: string
    keyMessages: string
    constraints: string
  } | null>(null)
  
  // Director selection
  const [selectedDirector, setSelectedDirector] = useState('')
  const [directorQuestions, setDirectorQuestions] = useState<CommercialDirectorQuestion[]>([])
  const [showQuestions, setShowQuestions] = useState(false)
  
  // Platform and duration selection
  const [duration, setDuration] = useState<'10s' | '30s'>('10s')
  const [platform, setPlatform] = useState<'tiktok' | 'instagram' | 'youtube'>('tiktok')
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCommercial, setGeneratedCommercial] = useState<CommercialStructure | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  
  // Load sample templates on mount
  useEffect(() => {
    loadSampleTemplates()
  }, [loadSampleTemplates])
  
  // Workflow handlers
  const handleCommercialInput = (brief: {
    brandDescription: string
    campaignGoals: string
    targetAudience: string
    keyMessages: string
    constraints: string
  }) => {
    setCommercialBrief(brief)
    setStage('director-selection')
  }

  const handleDirectorSelection = () => {
    if (!selectedDirector) return
    setStage('director-questions')
    setShowQuestions(true)
  }

  const handleQuestionsAnswered = (answers: CommercialDirectorQuestion[]) => {
    setDirectorQuestions(answers)
    setShowQuestions(false)
    setStage('generation')
  }

  const handleSkipQuestions = () => {
    setShowQuestions(false)
    setStage('generation')
  }

  // Template handlers
  const handleSaveTemplate = (brief: any, name: string) => {
    const template: Omit<CommercialTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      type: 'commercial',
      category: 'user',
      content: {
        brandDescription: brief.brandDescription,
        campaignGoals: brief.campaignGoals,
        targetAudience: brief.targetAudience,
        keyMessages: brief.keyMessages,
        constraints: brief.constraints,
        selectedDirector,
        duration,
        platform
      }
    }
    
    addTemplate(template)
    
    toast({
      title: "Template Saved",
      description: `Commercial template "${name}" has been saved successfully.`
    })
  }

  const handleLoadTemplate = (template: Template) => {
    if (template.type !== 'commercial') return
    
    const commercialTemplate = template as CommercialTemplate
    
    // Load the template data - this will be handled by CommercialInput
    // We can also load director and platform settings if they exist
    if (commercialTemplate.content.selectedDirector) {
      setSelectedDirector(commercialTemplate.content.selectedDirector)
    }
    if (commercialTemplate.content.duration) {
      setDuration(commercialTemplate.content.duration)
    }
    if (commercialTemplate.content.platform) {
      setPlatform(commercialTemplate.content.platform)
    }
    
    toast({
      title: "Template Loaded",
      description: `Commercial template "${template.name}" has been loaded.`
    })
  }

  // Helper function to determine if product is product-based vs service-based
  const isProductBased = (productString: string): boolean => {
    const productKeywords = [
      'product', 'device', 'gadget', 'tool', 'equipment', 'item', 'goods',
      'phone', 'laptop', 'car', 'shoe', 'clothing', 'food', 'drink',
      'software', 'app', 'game', 'book', 'furniture', 'appliance'
    ]
    
    return productKeywords.some(keyword => 
      productString.toLowerCase().includes(keyword)
    )
  }

  const handleGenerateCommercial = async () => {
    if (!commercialBrief || !selectedDirector) {
      toast({
        title: "Missing Information",
        description: "Please complete the commercial brief and select a director",
        variant: "destructive"
      })
      return
    }
    
    setIsGenerating(true)
    setGenerationError(null)
    setStage('generation')
    
    try {
      // Extract brand/product from description for config
      const brandName = extractBrandName(commercialBrief.brandDescription)
      const productName = extractProductName(commercialBrief.brandDescription)
      
      // Create commercial config
      const config: CommercialConfig = {
        brand: brandName || 'Brand',
        product: productName || 'Product',
        audience: commercialBrief.targetAudience || 'General audience',
        duration,
        platform,
        director: selectedDirector,
        concept: buildConcept(commercialBrief, directorQuestions),
        contentType: isProductBased(commercialBrief.brandDescription) ? 'product' : 'service',
        locationRequirement: 'flexible'
      }
      
      // Generate commercial using AI
      const result = await generateCommercial(config)
      
      if (result.success && result.commercial) {
        setGeneratedCommercial(result.commercial)
        setStage('results')
        toast({
          title: "Commercial Generated!",
          description: `Created ${result.commercial.shots.length} shots for ${duration} ${platform} commercial`,
          className: "border-green-500"
        })
      } else {
        throw new Error(result.error || 'Generation failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not generate commercial shots'
      setGenerationError(errorMessage)
      setStage('director-selection')
      
      // Log error for debugging
      handleError(error instanceof Error ? error : new Error(errorMessage))
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Helper functions for extraction
  const extractBrandName = (description: string): string => {
    const words = description.split(' ')
    const capitalizedWords = words.filter(word => 
      word.length > 2 && 
      word[0] === word[0].toUpperCase() && 
      !['The', 'Our', 'This', 'We', 'They', 'Brand'].includes(word)
    )
    return capitalizedWords[0] || 'Brand'
  }

  const extractProductName = (description: string): string => {
    const productKeywords = ['sneakers', 'shoes', 'app', 'service', 'platform', 'product', 'device']
    for (const keyword of productKeywords) {
      if (description.toLowerCase().includes(keyword)) {
        return keyword
      }
    }
    return 'Product'
  }

  const buildConcept = (brief: typeof commercialBrief, questions: CommercialDirectorQuestion[]): string => {
    if (!brief) return ''
    
    let concept = brief.campaignGoals || 'Effective commercial'
    
    // Add director question insights to concept
    questions.forEach(q => {
      if (q.selectedValue) {
        const selectedOption = q.options.find(opt => opt.value === q.selectedValue)
        if (selectedOption) {
          concept += ` ${selectedOption.description}`
        }
      }
    })
    
    return concept
  }
  
  const handleCopyAllShots = () => {
    if (!generatedCommercial || generatedCommercial.shots.length === 0) {
      toast({
        title: "No Shots to Copy",
        description: "Generate a commercial first",
        variant: "destructive"
      })
      return
    }
    
    const formattedShots = generatedCommercial.shots
      .map((shot) => `${shot.shotNumber}. ${shot.description}\n   Timing: ${shot.timing}\n   Camera: ${shot.cameraWork}\n   Location: ${shot.location}`)
      .join('\n\n')
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(formattedShots)
        .then(() => {
          toast({
            title: "Shots Copied!",
            description: `Copied ${generatedCommercial.shots.length} commercial shots to clipboard`
          })
        })
        .catch(() => {
          // Fallback for clipboard issues
          fallbackCopyTextToClipboard(formattedShots)
        })
    } else {
      // Fallback for browsers without clipboard API
      fallbackCopyTextToClipboard(formattedShots)
    }
  }

  // Fallback copy function for browsers without clipboard API
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      if (successful) {
        toast({
          title: "Shots Copied!",
          description: `Copied ${generatedCommercial?.shots.length} commercial shots to clipboard`
        })
      } else {
        toast({
          title: "Copy Failed",
          description: "Please manually copy the content below",
          variant: "destructive"
        })
        alert(`Commercial Shots:\n\n${text}`)
      }
    } catch (err) {
      toast({
        title: "Copy Not Supported",
        description: "Please manually copy the content from the alert",
        variant: "destructive"
      })
      alert(`Commercial Shots:\n\n${text}`)
    }

    document.body.removeChild(textArea)
  }
  
  // Render different stages
  const renderStage = () => {
    switch (stage) {
      case 'input':
        return (
          <CommercialInput 
            onNext={handleCommercialInput} 
            onSavePreset={handleSaveTemplate}
            onLoadTemplate={handleLoadTemplate}
          />
        )
        
      case 'director-selection':
        return (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400 text-sm">Brief Complete</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <span className="text-orange-400 text-sm font-medium">Select Director</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500 text-sm">Generate</span>
            </div>

            {/* Director Selection */}
            <DirectorSelector
              selectedDirector={selectedDirector}
              onDirectorChange={setSelectedDirector}
              allDirectors={commercialDirectors}
              selectedDirectorInfo={getCommercialDirectorById(selectedDirector)}
              domain="film"
            />

            {/* Director Insights */}
            {selectedDirector && commercialBrief && (
              <DirectorInsights
                director={getCommercialDirectorById(selectedDirector)!}
                brandContext={commercialBrief}
                onAskQuestion={() => setShowQuestions(true)}
              />
            )}

            {/* Platform & Duration Selection */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Platform & Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Duration</label>
                    <Select value={duration} onValueChange={(value: any) => setDuration(value)}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10s">⚡ 10 seconds (Quick Impact)</SelectItem>
                        <SelectItem value="30s">📺 30 seconds (Full Story)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Platform</label>
                    <Select value={platform} onValueChange={(value: any) => setPlatform(value)}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tiktok">📱 TikTok (9:16, Hook under 2s)</SelectItem>
                        <SelectItem value="instagram">📷 Instagram (1:1, Story Arc)</SelectItem>  
                        <SelectItem value="youtube">📺 YouTube (16:9, Engagement)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setStage('input')}
                className="border-slate-600 text-slate-300"
              >
                ← Back to Brief
              </Button>
              <Button
                onClick={handleDirectorSelection}
                disabled={!selectedDirector}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Continue to Questions
              </Button>
              <Button
                onClick={handleGenerateCommercial}
                disabled={!selectedDirector}
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-900/30"
              >
                Skip Questions & Generate
              </Button>
            </div>
          </div>
        )
        
      case 'generation':
        return (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 text-orange-400 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {getCommercialDirectorById(selectedDirector)?.name} is creating your commercial...
                </h3>
                <p className="text-slate-400">
                  Applying their signature style to your brand story
                </p>
              </CardContent>
            </Card>
          </div>
        )
        
      case 'results':
        return generatedCommercial ? renderResults() : null
        
      default:
        return <CommercialInput onNext={handleCommercialInput} />
    }
  }

  return (
    <CommercialErrorBoundary>
      <div className="space-y-4 sm:space-y-6">
        {/* Template Banner */}
        <TemplateBanner
          mode="commercial"
          templates={[]} // TODO: Add actual templates
          selectedTemplate={null}
          onTemplateSelect={() => {}} // TODO: Implement template selection
          onCreateNew={() => {}} // TODO: Implement template creation
        />
        
        {renderStage()}
        
        {/* Director Question Cards Modal */}
        {selectedDirector && commercialBrief && (
          <CommercialQuestionCards
            isOpen={showQuestions}
            onClose={handleSkipQuestions}
            director={getCommercialDirectorById(selectedDirector)!}
            brandContext={commercialBrief}
            onQuestionsAnswered={handleQuestionsAnswered}
          />
        )}
      </div>
    </CommercialErrorBoundary>
  )

  function renderResults() {
    if (!generatedCommercial) return null
    
    return (
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-green-400 text-sm">Brief Complete</span>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-green-400 text-sm">Director Selected</span>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-green-400 text-sm font-medium">Generated!</span>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-green-400" />
                Generated Commercial ({generatedCommercial.totalDuration})
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-slate-400">
                  {generatedCommercial.shots.length} shots
                </Badge>
                <Badge variant="outline" className="text-slate-400">
                  {generatedCommercial.config.platform.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="text-slate-400 bg-orange-900/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Generated
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Director Info */}
            <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-400">Director Style Applied</span>
                <div className="flex gap-2">
                  {commercialDirectors.find(d => d.id === generatedCommercial.config.director)?.commercialStats && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-400">Creativity: {commercialDirectors.find(d => d.id === generatedCommercial.config.director)?.commercialStats.creativity}/10</span>
                      <span className="text-blue-400">Engagement: {commercialDirectors.find(d => d.id === generatedCommercial.config.director)?.commercialStats.engagement}/10</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-300">{generatedCommercial.directorStyle.styleApplication}</p>
            </div>

            {/* Platform Optimization */}
            <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700">
              <h4 className="text-sm font-medium text-blue-400 mb-2">Platform Optimization</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Aspect Ratio:</span>
                  <span className="text-white ml-1">{generatedCommercial.platformOptimization.aspectRatio}</span>
                </div>
                <div>
                  <span className="text-slate-400">Hook Timing:</span>
                  <span className="text-white ml-1">{generatedCommercial.platformOptimization.hookTiming}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">CTA:</span>
                  <span className="text-white ml-1">{generatedCommercial.platformOptimization.ctaPlacement}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleCopyAllShots}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy All Shots
              </Button>
              <Button
                onClick={() => {
                  // Navigate to export page with commercial data
                  localStorage.setItem('bulk-export-shots', JSON.stringify(
                    generatedCommercial.shots.map((shot) => ({
                      id: shot.id,
                      description: shot.description,
                      shotNumber: shot.shotNumber,
                      projectType: 'commercial',
                      timing: shot.timing,
                      cameraWork: shot.cameraWork,
                      location: shot.location,
                      metadata: {
                        brand: generatedCommercial.config.brand,
                        product: generatedCommercial.config.product,
                        platform: generatedCommercial.config.platform,
                        duration: generatedCommercial.config.duration,
                        director: generatedCommercial.config.director,
                        shotType: shot.shotType,
                        brandIntegration: shot.brandIntegration
                      }
                    }))
                  ))
                  
                  localStorage.setItem('bulk-export-project-data', JSON.stringify({
                    type: 'commercial',
                    brand: generatedCommercial.config.brand,
                    product: generatedCommercial.config.product,
                    platform: generatedCommercial.config.platform,
                    duration: generatedCommercial.config.duration,
                    projectTitle: `${generatedCommercial.config.brand} ${generatedCommercial.config.product} Commercial`,
                    directorStyle: generatedCommercial.directorStyle.directorName,
                    platformOptimization: generatedCommercial.platformOptimization
                  }))
                  
                  window.location.href = '/export'
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export Commercial
              </Button>
              <Button
                onClick={() => setStage('input')}
                variant="outline"
                className="flex items-center gap-2 border-purple-600 text-purple-400"
              >
                <Sparkles className="w-4 h-4" />
                Create Another
              </Button>
            </div>

            {/* Shot List Display */}
            <div className="space-y-3">
              {generatedCommercial.shots.map((shot) => (
                <div key={shot.id} className="p-4 bg-slate-900/40 rounded-md border border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Shot {shot.shotNumber}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {shot.timing}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {shot.shotType.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-300 mb-2">{shot.description}</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Camera:</span>
                          <span className="text-slate-300 ml-1">{shot.cameraWork}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Location:</span>
                          <span className="text-slate-300 ml-1">{shot.location}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Lighting:</span>
                          <span className="text-slate-300 ml-1">{shot.lighting}</span>
                        </div>
                      </div>
                      {shot.brandIntegration && (
                        <div className="mt-2 text-xs">
                          <span className="text-orange-400">Brand Integration:</span>
                          <span className="text-slate-300 ml-1">{shot.brandIntegration}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const shotText = `Shot ${shot.shotNumber} (${shot.timing}): ${shot.description}\nCamera: ${shot.cameraWork}\nLocation: ${shot.location}\nLighting: ${shot.lighting}`
                        if (navigator.clipboard && window.isSecureContext) {
                          navigator.clipboard.writeText(shotText)
                            .then(() => {
                              toast({
                                title: "Shot Copied",
                                description: "Shot details copied to clipboard"
                              })
                            })
                            .catch(() => {
                              fallbackCopyTextToClipboard(shotText)
                            })
                        } else {
                          fallbackCopyTextToClipboard(shotText)
                        }
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Analysis */}
            {generatedCommercial.overallAnalysis && (
              <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700">
                <h4 className="text-sm font-medium text-purple-400 mb-2">Analysis & Recommendations</h4>
                <p className="text-sm text-slate-300">{generatedCommercial.overallAnalysis}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation Error */}
        {generationError && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-400">
                <Target className="h-4 w-4" />
                <span className="font-medium">Generation Failed</span>
              </div>
              <p className="text-sm text-red-300 mt-1">{generationError}</p>
              <Button
                onClick={() => {
                  setGenerationError(null)
                  setStage('director-selection')
                }}
                variant="outline"
                size="sm"
                className="mt-2 border-red-700 text-red-400 hover:bg-red-900/30"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }
}