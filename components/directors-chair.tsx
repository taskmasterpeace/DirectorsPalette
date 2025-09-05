"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp, Settings, Eye, Sparkles, Users, Palette } from 'lucide-react'
import { commercialDirectors, getCommercialDirectorById, type EnhancedCommercialDirector } from '@/lib/commercial-directors'
import { useToast } from '@/components/ui/use-toast'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export interface DirectorCustomization {
  baseDirectorId: string
  customizations: {
    creativity: number      // 1-10 scale
    authenticity: number    // 1-10 scale  
    pacing: number         // 1-10 scale (1=very slow, 10=very fast)
    formality: number      // 1-10 scale (1=casual, 10=formal)
    energy: number         // 1-10 scale (1=calm, 10=explosive)
    premiumFeel: number    // 1-10 scale (1=accessible, 10=luxury)
  }
  customNotes: string
  name: string
}

interface DirectorsChairProps {
  onCustomizationChange?: (customization: DirectorCustomization) => void
  initialDirectorId?: string
}

export function DirectorsChair({ onCustomizationChange, initialDirectorId }: DirectorsChairProps) {
  const { toast } = useToast()
  const [selectedDirectorId, setSelectedDirectorId] = useState(initialDirectorId || '')
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [customizations, setCustomizations] = useState({
    creativity: 5,
    authenticity: 5,
    pacing: 5,
    formality: 5,
    energy: 5,
    premiumFeel: 5
  })
  const [customNotes, setCustomNotes] = useState('')
  const [customName, setCustomName] = useState('')

  const selectedDirector = selectedDirectorId ? getCommercialDirectorById(selectedDirectorId) : null

  // Initialize customizations when director changes
  useEffect(() => {
    if (selectedDirector) {
      setCustomizations({
        creativity: selectedDirector.commercialStats.creativity,
        authenticity: selectedDirector.commercialStats.authenticity,
        pacing: selectedDirector.pacing === 'slow' ? 3 : selectedDirector.pacing === 'medium' ? 5 : selectedDirector.pacing === 'fast' ? 8 : 5,
        formality: selectedDirector.tags.includes('casual') ? 3 : selectedDirector.tags.includes('professional') ? 7 : 5,
        energy: selectedDirector.commercialStats.engagement,
        premiumFeel: selectedDirector.commercialStats.premiumFeel
      })
      setCustomName(`Custom ${selectedDirector.name}`)
      setCustomNotes('')
    }
  }, [selectedDirector])

  // Notify parent of changes
  useEffect(() => {
    if (selectedDirectorId && onCustomizationChange) {
      const customization: DirectorCustomization = {
        baseDirectorId: selectedDirectorId,
        customizations,
        customNotes,
        name: customName
      }
      onCustomizationChange(customization)
    }
  }, [selectedDirectorId, customizations, customNotes, customName, onCustomizationChange])

  const handleSliderChange = (field: keyof typeof customizations, value: number[]) => {
    setCustomizations(prev => ({
      ...prev,
      [field]: value[0]
    }))
  }

  const resetToDefaults = () => {
    if (selectedDirector) {
      setCustomizations({
        creativity: selectedDirector.commercialStats.creativity,
        authenticity: selectedDirector.commercialStats.authenticity,
        pacing: selectedDirector.pacing === 'slow' ? 3 : selectedDirector.pacing === 'medium' ? 5 : selectedDirector.pacing === 'fast' ? 8 : 5,
        formality: selectedDirector.tags.includes('casual') ? 3 : selectedDirector.tags.includes('professional') ? 7 : 5,
        energy: selectedDirector.commercialStats.engagement,
        premiumFeel: selectedDirector.commercialStats.premiumFeel
      })
      setCustomNotes('')
      toast({
        title: "Reset to Defaults",
        description: `Restored ${selectedDirector.name}'s original style settings`
      })
    }
  }

  const getStyleDescription = () => {
    if (!selectedDirector) return ''
    
    const creativityLevel = customizations.creativity >= 8 ? 'highly innovative' : customizations.creativity >= 6 ? 'creative' : 'traditional'
    const pacingLevel = customizations.pacing >= 8 ? 'fast-paced' : customizations.pacing >= 6 ? 'medium-paced' : 'deliberate'
    const energyLevel = customizations.energy >= 8 ? 'high-energy' : customizations.energy >= 6 ? 'energetic' : 'calm'
    const formalityLevel = customizations.formality >= 7 ? 'formal' : customizations.formality >= 4 ? 'professional' : 'casual'
    const premiumLevel = customizations.premiumFeel >= 8 ? 'luxury' : customizations.premiumFeel >= 6 ? 'premium' : 'accessible'
    
    return `Your custom director will create ${creativityLevel}, ${pacingLevel} commercials with ${energyLevel} delivery and a ${formalityLevel}, ${premiumLevel} feel.`
  }

  return (
    <div className="space-y-6">
      {/* Director Selection */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            Director's Chair - Customize Your Director
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">Base Director</Label>
            <Select value={selectedDirectorId} onValueChange={setSelectedDirectorId}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Choose a director to customize..." />
              </SelectTrigger>
              <SelectContent>
                {commercialDirectors.map((director) => (
                  <SelectItem key={director.id} value={director.id}>
                    {director.name} - {director.description.slice(0, 50)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDirector && (
            <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-400">Original Style</span>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline" className="text-green-400">
                    Creativity: {selectedDirector.commercialStats.creativity}/10
                  </Badge>
                  <Badge variant="outline" className="text-purple-400">
                    Premium: {selectedDirector.commercialStats.premiumFeel}/10
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-slate-300">{selectedDirector.when_to_use}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDirector && (
        <>
          {/* Style Customization */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="h-5 w-5 text-orange-400" />
                  Style Adjustments
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaults}
                  className="text-slate-300 border-slate-600"
                >
                  Reset to Defaults
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Core Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium text-white">Creativity</Label>
                    <Badge variant="outline" className="text-xs">
                      {customizations.creativity}/10
                    </Badge>
                  </div>
                  <Slider
                    value={[customizations.creativity]}
                    onValueChange={(value) => handleSliderChange('creativity', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-400">
                    {customizations.creativity >= 8 ? 'Highly innovative approaches' : 
                     customizations.creativity >= 6 ? 'Creative with some innovation' : 
                     'Traditional, proven approaches'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium text-white">Authenticity</Label>
                    <Badge variant="outline" className="text-xs">
                      {customizations.authenticity}/10
                    </Badge>
                  </div>
                  <Slider
                    value={[customizations.authenticity]}
                    onValueChange={(value) => handleSliderChange('authenticity', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-400">
                    {customizations.authenticity >= 8 ? 'Documentary-style realism' : 
                     customizations.authenticity >= 6 ? 'Natural, believable feel' : 
                     'Polished, produced aesthetic'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium text-white">Pacing</Label>
                    <Badge variant="outline" className="text-xs">
                      {customizations.pacing}/10
                    </Badge>
                  </div>
                  <Slider
                    value={[customizations.pacing]}
                    onValueChange={(value) => handleSliderChange('pacing', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-400">
                    {customizations.pacing >= 8 ? 'Fast cuts, high energy' : 
                     customizations.pacing >= 6 ? 'Medium tempo, engaging' : 
                     'Slow, deliberate pacing'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium text-white">Premium Feel</Label>
                    <Badge variant="outline" className="text-xs">
                      {customizations.premiumFeel}/10
                    </Badge>
                  </div>
                  <Slider
                    value={[customizations.premiumFeel]}
                    onValueChange={(value) => handleSliderChange('premiumFeel', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-400">
                    {customizations.premiumFeel >= 8 ? 'Luxury, aspirational quality' : 
                     customizations.premiumFeel >= 6 ? 'Professional, polished' : 
                     'Accessible, down-to-earth'}
                  </p>
                </div>
              </div>

              {/* Advanced Controls */}
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between text-slate-300">
                    Advanced Settings
                    {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-white">Energy Level</Label>
                        <Badge variant="outline" className="text-xs">
                          {customizations.energy}/10
                        </Badge>
                      </div>
                      <Slider
                        value={[customizations.energy]}
                        onValueChange={(value) => handleSliderChange('energy', value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium text-white">Formality</Label>
                        <Badge variant="outline" className="text-xs">
                          {customizations.formality}/10
                        </Badge>
                      </div>
                      <Slider
                        value={[customizations.formality]}
                        onValueChange={(value) => handleSliderChange('formality', value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-white">Custom Director Name</Label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full p-2 bg-slate-900/50 border border-slate-600 rounded text-white text-sm"
                      placeholder="Enter a name for your custom director..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-white">Additional Notes</Label>
                    <Textarea
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="Any additional creative direction or specific requirements..."
                      rows={3}
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-400" />
                Director's Perspective Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">
                    {customName || `Custom ${selectedDirector.name}`}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {getStyleDescription()}
                </p>
                {customNotes && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-xs text-slate-400 italic">
                      Additional direction: {customNotes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}