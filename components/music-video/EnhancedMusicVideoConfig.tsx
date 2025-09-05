"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, PlayCircle, Sparkles } from "lucide-react"
import { ReferenceConfigPanel, type ReferenceConfig } from "./ReferenceConfigPanel"
import { type Location } from "./LocationSelector"
import { type WardrobeItem } from "./WardrobeSelector"
import { type Prop } from "./PropSelector"

interface Treatment {
  id: string
  name: string
  concept: string
  visualTheme: string
  performanceRatio: number
  hookStrategy: string
}

interface MusicVideoSection {
  id: string
  title: string
  type: string
  startTime?: string
  endTime?: string
  isHook?: boolean
  repetitionNumber?: number
  lyrics: string
}

interface MusicVideoStructure {
  sections: MusicVideoSection[]
  songTitle: string
  artist: string
  genre: string
}

interface EnhancedMusicVideoConfigProps {
  treatments: Treatment[]
  selectedTreatment: Treatment
  musicVideoStructure: MusicVideoStructure
  lyrics: string
  onTreatmentChange: (treatmentId: string) => void
  onConfigurationComplete: (config: ReferenceConfig) => void
  onBack: () => void
  initialConfig?: ReferenceConfig
}

export function EnhancedMusicVideoConfig({
  treatments,
  selectedTreatment,
  musicVideoStructure,
  lyrics,
  onTreatmentChange,
  onConfigurationComplete,
  onBack,
  initialConfig
}: EnhancedMusicVideoConfigProps) {
  const [step, setStep] = useState<'treatment' | 'references'>('treatment')
  const [currentTreatmentId, setCurrentTreatmentId] = useState(selectedTreatment.id)
  const [referenceConfig, setReferenceConfig] = useState<ReferenceConfig>(
    initialConfig || {
      locations: [],
      wardrobe: [],
      props: [],
      selectedTreatmentId: selectedTreatment.id
    }
  )
  const [isGenerating, setIsGenerating] = useState(false)

  const currentTreatment = treatments.find(t => t.id === currentTreatmentId) || selectedTreatment

  // Generate initial suggestions when we move to references step
  const handleContinueToReferences = async () => {
    setStep('references')
    if (referenceConfig.locations.length === 0 && referenceConfig.wardrobe.length === 0 && referenceConfig.props.length === 0) {
      await generateAutoSuggestions()
    }
  }

  const generateAutoSuggestions = async () => {
    setIsGenerating(true)
    try {
      // Generate sample locations based on treatment
      const sampleLocations: Location[] = [
        {
          id: 'location1',
          reference: '@location1',
          name: 'Urban Rooftop',
          description: 'City rooftop with skyline backdrop, golden hour lighting',
          atmosphere: 'Expansive and cinematic',
          why: 'Perfect for chorus moments and wide performance shots',
          sections: [
            { type: 'chorus', emoji: '🚀', reason: 'High energy, expansive feel' },
            { type: 'outro', emoji: '🎵', reason: 'Cinematic conclusion' }
          ]
        },
        {
          id: 'location2', 
          reference: '@location2',
          name: 'Industrial Warehouse',
          description: 'Raw concrete space with dramatic lighting and shadows',
          atmosphere: 'Intimate and intense',
          why: 'Great for verses and emotional close-ups',
          sections: [
            { type: 'verse', emoji: '🎤', reason: 'Intimate storytelling' },
            { type: 'bridge', emoji: '🌉', reason: 'Dramatic contrast' }
          ]
        }
      ]

      // Generate sample wardrobe based on treatment  
      const artistRef = musicVideoStructure.artist.toLowerCase().replace(/\s+/g, '')
      const sampleWardrobe: WardrobeItem[] = [
        {
          id: 'wardrobe1',
          reference: `@${artistRef}_streetwear`,
          name: 'streetwear',
          description: 'Urban casual look for authentic performance',
          breakdown: {
            top: 'Oversized black hoodie with minimal graphics',
            bottom: 'Distressed dark jeans with good fit',
            footwear: 'White leather sneakers, clean and fresh',
            accessories: 'Gold chain necklace, simple watch'
          },
          sections: [
            { type: 'verse', emoji: '🎤', reason: 'Relatable and authentic' },
            { type: 'chorus', emoji: '🚀', reason: 'Urban energy matches beat' }
          ]
        },
        {
          id: 'wardrobe2', 
          reference: `@${artistRef}_elevated`,
          name: 'elevated',
          description: 'Elevated casual for bridge and climax moments',
          breakdown: {
            top: 'Black fitted t-shirt under open leather jacket',
            bottom: 'Dark slim-fit trousers, tailored',
            footwear: 'Black leather boots with subtle details',
            accessories: 'Silver rings, leather bracelet'
          },
          sections: [
            { type: 'bridge', emoji: '🌉', reason: 'Elevated emotion, refined look' },
            { type: 'outro', emoji: '🎵', reason: 'Strong final impression' }
          ]
        }
      ]

      // Generate sample props
      const sampleProps: Prop[] = [
        {
          id: 'prop1',
          reference: '@prop1',
          name: 'Vintage Microphone',
          description: 'Classic chrome microphone on stand',
          purpose: 'Performance anchor and visual focus',
          storyEnhancement: 'Connects to music authenticity and classic performance',
          sections: [
            { type: 'verse', emoji: '🎤', reason: 'Central to performance narrative' },
            { type: 'chorus', emoji: '🚀', reason: 'Strong visual anchor' }
          ]
        }
      ]

      setReferenceConfig({
        ...referenceConfig,
        locations: sampleLocations,
        wardrobe: sampleWardrobe,
        props: sampleProps,
        selectedTreatmentId: currentTreatmentId
      })
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTreatmentSelect = (treatmentId: string) => {
    setCurrentTreatmentId(treatmentId)
    onTreatmentChange(treatmentId)
    setReferenceConfig({
      ...referenceConfig,
      selectedTreatmentId: treatmentId
    })
  }

  if (step === 'references') {
    return (
      <ReferenceConfigPanel
        config={referenceConfig}
        onConfigChange={setReferenceConfig}
        onContinue={() => onConfigurationComplete(referenceConfig)}
        onBack={() => setStep('treatment')}
        artistName={musicVideoStructure.artist}
        treatmentName={currentTreatment.name}
        isGenerating={isGenerating}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Input
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white">Choose Treatment</h2>
            <p className="text-slate-400 text-sm">
              Select a visual treatment for "{musicVideoStructure.songTitle}" by {musicVideoStructure.artist}
            </p>
          </div>
        </div>
      </div>

      {/* Treatment Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Available Treatments</h3>
          <Badge variant="outline" className="border-purple-500/30 text-purple-300">
            {treatments.length} options
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {treatments.map((treatment) => (
            <Card
              key={treatment.id}
              className={`cursor-pointer transition-all border ${
                currentTreatmentId === treatment.id 
                  ? "bg-purple-900/20 border-purple-500/50 ring-2 ring-purple-500/30" 
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/70"
              }`}
              onClick={() => handleTreatmentSelect(treatment.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{treatment.name}</CardTitle>
                  {currentTreatmentId === treatment.id && (
                    <Badge className="bg-purple-600/20 text-purple-300 border-purple-700/30">
                      Selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-300 text-sm line-clamp-3">{treatment.concept}</p>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-purple-400 text-xs font-semibold">Visual Theme:</span>
                    <p className="text-slate-400 text-xs line-clamp-2">{treatment.visualTheme}</p>
                  </div>
                  
                  <div>
                    <span className="text-purple-400 text-xs font-semibold">Performance Focus:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${treatment.performanceRatio}%` }}
                        />
                      </div>
                      <span className="text-purple-300 text-xs font-semibold">
                        {treatment.performanceRatio}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-purple-400 text-xs font-semibold">Hook Strategy:</span>
                    <p className="text-slate-400 text-xs line-clamp-2">{treatment.hookStrategy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Treatment Details */}
        {currentTreatment && (
          <Card className="bg-slate-800/30 border-purple-700/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-purple-400" />
                "{currentTreatment.name}" Treatment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-purple-400 font-semibold mb-2">Concept</h4>
                <p className="text-slate-300">{currentTreatment.concept}</p>
              </div>
              
              <div>
                <h4 className="text-purple-400 font-semibold mb-2">Visual Approach</h4>
                <p className="text-slate-300">{currentTreatment.visualTheme}</p>
              </div>
              
              <div>
                <h4 className="text-purple-400 font-semibold mb-2">Hook Strategy</h4>
                <p className="text-slate-300">{currentTreatment.hookStrategy}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400">
                  Performance ratio: <span className="text-purple-300 font-semibold">{currentTreatment.performanceRatio}%</span>
                </div>
                
                <Button
                  onClick={handleContinueToReferences}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      Generating References...
                    </>
                  ) : (
                    <>
                      Continue to References
                      <ChevronLeft className="h-4 w-4 ml-2 rotate-180" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}