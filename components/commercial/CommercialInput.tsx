"use client"

import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Sparkles, 
  Target, 
  Lightbulb,
  Save,
  Upload,
  FolderOpen
} from 'lucide-react'
import { TemplateManager } from '@/components/shared/TemplateManager'
import type { Template, CommercialTemplate } from '@/stores/templates-store'

export interface CommercialBrief {
  brandDescription: string
  campaignGoals: string
  targetAudience: string
  keyMessages: string
  constraints: string
}

interface CommercialInputProps {
  onNext: (commercialBrief: CommercialBrief) => void
  initialValues?: Partial<CommercialBrief>
  onSavePreset?: (brief: CommercialBrief, name: string) => void
  onLoadTemplate?: (template: Template) => void
}

export function CommercialInput({ onNext, initialValues, onSavePreset, onLoadTemplate }: CommercialInputProps) {
  const [brandDescription, setBrandDescription] = useState(initialValues?.brandDescription || '')
  const [campaignGoals, setCampaignGoals] = useState(initialValues?.campaignGoals || '')
  const [targetAudience, setTargetAudience] = useState(initialValues?.targetAudience || '')
  const [keyMessages, setKeyMessages] = useState(initialValues?.keyMessages || '')
  const [constraints, setConstraints] = useState(initialValues?.constraints || '')
  const [presetName, setPresetName] = useState('')
  const [showSavePreset, setShowSavePreset] = useState(false)

  const handleSubmit = useCallback(() => {
    if (!brandDescription.trim()) return
    
    const brief: CommercialBrief = {
      brandDescription: brandDescription.trim(),
      campaignGoals: campaignGoals.trim(),
      targetAudience: targetAudience.trim(),
      keyMessages: keyMessages.trim(),
      constraints: constraints.trim()
    }
    
    onNext(brief)
  }, [brandDescription, campaignGoals, targetAudience, keyMessages, constraints, onNext])

  const handleSavePreset = useCallback(() => {
    if (!presetName.trim() || !onSavePreset) return
    
    const brief: CommercialBrief = {
      brandDescription: brandDescription.trim(),
      campaignGoals: campaignGoals.trim(),
      targetAudience: targetAudience.trim(),
      keyMessages: keyMessages.trim(),
      constraints: constraints.trim()
    }
    
    onSavePreset(brief, presetName.trim())
    setShowSavePreset(false)
    setPresetName('')
  }, [brandDescription, campaignGoals, targetAudience, keyMessages, constraints, presetName, onSavePreset])

  const canProceed = useMemo(() => 
    brandDescription.trim().length > 20
  , [brandDescription])

  const hasContent = useMemo(() => 
    brandDescription.trim() || campaignGoals.trim() || targetAudience.trim()
  , [brandDescription, campaignGoals, targetAudience])

  const handleLoadTemplate = useCallback((template: Template) => {
    if (template.type !== 'commercial') return
    
    const commercialTemplate = template as CommercialTemplate
    setBrandDescription(commercialTemplate.content.brandDescription)
    setCampaignGoals(commercialTemplate.content.campaignGoals)
    setTargetAudience(commercialTemplate.content.targetAudience)
    setKeyMessages(commercialTemplate.content.keyMessages)
    setConstraints(commercialTemplate.content.constraints)
    
    if (onLoadTemplate) {
      onLoadTemplate(template)
    }
  }, [onLoadTemplate])

  const getCurrentData = useMemo(() => ({
    brandDescription,
    campaignGoals,
    targetAudience,
    keyMessages,
    constraints
  }), [brandDescription, campaignGoals, targetAudience, keyMessages, constraints])

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-orange-400" />
                Commercial Creator
              </CardTitle>
              <p className="text-slate-400 text-sm">
                Tell me about your brand, product, or service. I'll work with a director to create the perfect commercial.
              </p>
            </div>
            <TemplateManager
              type="commercial"
              currentData={getCurrentData}
              onLoadTemplate={handleLoadTemplate}
              trigger={
                <Button
                  variant="outline" 
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              }
            />
          </div>
        </CardHeader>
      </Card>

      {/* Brand & Product Description */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg">Brand & Product Details</CardTitle>
              <p className="text-slate-400 text-sm mt-1">
                Describe your brand, product/service, and what makes it special
              </p>
            </div>
            <Badge variant="outline" className="text-slate-400">
              Required
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={brandDescription}
            onChange={(e) => setBrandDescription(e.target.value)}
            placeholder="Example: Nike is a premium athletic brand focused on empowering athletes. Our new Air Max sneakers feature revolutionary cushioning technology that provides superior comfort and performance. The sneakers target serious runners and fitness enthusiasts who demand both style and functionality..."
            rows={6}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-500">
              Be descriptive - this helps directors understand your brand personality
            </span>
            <span className="text-xs text-slate-400">
              {brandDescription.length} characters
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Goals */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-white text-lg">Campaign Goals</CardTitle>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            What do you want this commercial to achieve?
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={campaignGoals}
            onChange={(e) => setCampaignGoals(e.target.value)}
            placeholder="Example: Increase brand awareness among Gen Z consumers, drive online sales, create viral social media content, position Nike as the premium choice for serious athletes..."
            rows={4}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
          />
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white text-lg">Target Audience</CardTitle>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Who are you trying to reach? Demographics, psychographics, behavior
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="Example: Active Gen Z and millennials (16-35), fitness enthusiasts and casual athletes, fashion-conscious individuals who value both performance and style, early adopters of athletic trends..."
            rows={4}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
          />
        </CardContent>
      </Card>

      {/* Key Messages */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <CardTitle className="text-white text-lg">Key Messages</CardTitle>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            What are the most important points to communicate?
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={keyMessages}
            onChange={(e) => setKeyMessages(e.target.value)}
            placeholder="Example: Revolutionary cushioning technology, superior comfort and performance, premium quality at accessible price, perfect for both training and lifestyle wear..."
            rows={3}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
          />
        </CardContent>
      </Card>

      {/* Constraints & Requirements */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Constraints & Requirements</CardTitle>
          <p className="text-slate-400 text-sm mt-1">
            Any specific requirements, limitations, or must-haves? (Optional)
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="Example: Must include product shots, budget under $50K, shoot in Los Angeles, no celebrities, family-friendly content, specific call-to-action required..."
            rows={3}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
          />
        </CardContent>
      </Card>

      {/* Action Buttons - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        {hasContent && onSavePreset && (
          <Button
            variant="outline"
            onClick={() => setShowSavePreset(true)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full sm:w-auto"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Preset
          </Button>
        )}
        
        <Button
          onClick={handleSubmit}
          disabled={!canProceed}
          className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto px-6 py-3"
          size={canProceed ? "default" : "sm"}
        >
          {canProceed ? (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Continue to Director Selection</span>
              <span className="sm:hidden">Continue</span>
            </>
          ) : (
            <>
              <Briefcase className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Enter Brand Details to Continue</span>
              <span className="sm:hidden">Enter Brand Details</span>
            </>
          )}
        </Button>
      </div>

      {/* Save Preset Modal */}
      {showSavePreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <Card className="w-full max-w-md bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Save as Preset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Preset Name</label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g., Nike Air Max Campaign"
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded text-white"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSavePreset(false)
                    setPresetName('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePreset}
                  disabled={!presetName.trim()}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tips */}
      <Card className="bg-blue-900/20 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-blue-300 font-medium mb-1">💡 Pro Tips</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Be specific about your product's unique benefits</li>
                <li>• Include brand personality (playful, professional, luxury, etc.)</li>
                <li>• Mention any existing brand guidelines or visual identity</li>
                <li>• Directors will ask follow-up questions based on your input</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}