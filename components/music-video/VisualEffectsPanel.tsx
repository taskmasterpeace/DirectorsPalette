"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { 
  Zap, 
  Sun, 
  Moon, 
  Cloud, 
  Sparkles, 
  Eye, 
  Camera, 
  Palette,
  Lightbulb,
  Wind
} from "lucide-react"

export interface VisualEffectsConfig {
  lighting: {
    primary: string
    mood: string
    intensity: number
  }
  atmosphere: {
    style: string
    elements: string[]
  }
  effects: {
    visual: string[]
    camera: string[]
  }
  colorGrading: {
    tone: string
    saturation: number
  }
}

interface VisualEffectsPanelProps {
  config: VisualEffectsConfig
  onConfigChange: (config: VisualEffectsConfig) => void
  performanceRatio: number
}

export function VisualEffectsPanel({ config, onConfigChange, performanceRatio }: VisualEffectsPanelProps) {
  const [activeTab, setActiveTab] = useState<'lighting' | 'atmosphere' | 'effects' | 'grading'>('lighting')

  const updateConfig = (section: keyof VisualEffectsConfig, updates: any) => {
    onConfigChange({
      ...config,
      [section]: { ...config[section], ...updates }
    })
  }

  const toggleEffect = (section: 'visual' | 'camera', effect: string) => {
    const currentEffects = config.effects[section]
    const newEffects = currentEffects.includes(effect)
      ? currentEffects.filter(e => e !== effect)
      : [...currentEffects, effect]
    
    updateConfig('effects', { ...config.effects, [section]: newEffects })
  }

  const toggleAtmosphereElement = (element: string) => {
    const currentElements = config.atmosphere.elements
    const newElements = currentElements.includes(element)
      ? currentElements.filter(e => e !== element)
      : [...currentElements, element]
    
    updateConfig('atmosphere', { ...config.atmosphere, elements: newElements })
  }

  const lightingOptions = [
    { id: 'natural', name: 'Natural Light', desc: 'Soft, realistic lighting' },
    { id: 'studio', name: 'Studio Setup', desc: 'Controlled, professional' },
    { id: 'neon', name: 'Neon/LED', desc: 'Colorful, modern vibes' },
    { id: 'dramatic', name: 'Dramatic', desc: 'High contrast, moody' },
    { id: 'warm', name: 'Warm Tone', desc: 'Golden, inviting feel' },
    { id: 'cool', name: 'Cool Tone', desc: 'Blue, crisp atmosphere' },
    { id: 'backlit', name: 'Backlit', desc: 'Silhouette emphasis' },
    { id: 'practical', name: 'Practical Lights', desc: 'Lamps, candles, signs' }
  ]

  const moodOptions = [
    'Bright & Energetic', 'Dark & Moody', 'Soft & Intimate', 'Harsh & Edgy',
    'Dreamy & Ethereal', 'Gritty & Raw', 'Warm & Cozy', 'Cold & Stark'
  ]

  const atmosphereStyles = [
    { id: 'clean', name: 'Clean', desc: 'Minimal, clear air' },
    { id: 'smoky', name: 'Smoky', desc: 'Haze and atmosphere' },
    { id: 'foggy', name: 'Foggy', desc: 'Dense, mysterious' },
    { id: 'dusty', name: 'Dusty', desc: 'Particles in air' },
    { id: 'steamy', name: 'Steamy', desc: 'Humid, hot feel' },
    { id: 'sparkly', name: 'Sparkly', desc: 'Glitter, confetti' }
  ]

  const atmosphereElements = [
    'Smoke machines', 'Fog effects', 'Haze', 'Practical smoke',
    'Confetti/glitter', 'Bubbles', 'Steam', 'Dust motes',
    'Lens flares', 'Light rays', 'Particles', 'Atmospheric depth'
  ]

  const visualEffects = [
    'Slow motion', 'Speed ramping', 'Reverse shots', 'Double exposure',
    'Split screen', 'Multiple angles', 'Kaleidoscope', 'Prism effects',
    'Light leaks', 'Bokeh', 'Lens distortion', 'Color separation',
    'Vintage film grain', 'Digital glitches', 'Motion blur', 'Zoom blur'
  ]

  const cameraEffects = [
    'Handheld shake', 'Smooth gimbal', 'Locked off tripod', 'Dolly moves',
    'Crane shots', 'Drone footage', 'Steadicam flow', 'Whip pans',
    'Focus pulls', 'Rack focus', 'Tilt shift', 'Fisheye lens',
    'Wide angle distortion', 'Telephoto compression', 'Macro details', 'Time-lapse'
  ]

  const colorTones = [
    'Natural', 'Warm', 'Cool', 'High Contrast', 'Desaturated', 
    'Vintage', 'Cinematic', 'Neon Pop', 'Monochrome', 'Sepia'
  ]

  const getPerformanceBias = () => {
    if (performanceRatio > 70) return 'performance-heavy'
    if (performanceRatio < 30) return 'narrative-heavy'
    return 'balanced'
  }

  const getRecommendations = () => {
    const bias = getPerformanceBias()
    
    if (bias === 'performance-heavy') {
      return {
        lighting: ['studio', 'neon', 'dramatic'],
        atmosphere: ['smoky', 'sparkly'],
        effects: ['Slow motion', 'Multiple angles', 'Light leaks']
      }
    } else if (bias === 'narrative-heavy') {
      return {
        lighting: ['natural', 'practical', 'warm'],
        atmosphere: ['clean', 'dusty'],
        effects: ['Focus pulls', 'Double exposure', 'Vintage film grain']
      }
    } else {
      return {
        lighting: ['studio', 'natural', 'backlit'],
        atmosphere: ['smoky', 'clean'],
        effects: ['Speed ramping', 'Light leaks', 'Handheld shake']
      }
    }
  }

  const recommendations = getRecommendations()

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Visual Effects & Atmosphere
          <Badge variant="outline" className="ml-2">
            {getPerformanceBias()}
          </Badge>
        </CardTitle>
        
        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
          {[
            { id: 'lighting', icon: Lightbulb, label: 'Lighting' },
            { id: 'atmosphere', icon: Wind, label: 'Atmosphere' },
            { id: 'effects', icon: Zap, label: 'Effects' },
            { id: 'grading', icon: Palette, label: 'Color' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                activeTab === id
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lighting Tab */}
        {activeTab === 'lighting' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-3">Primary Lighting Style</h4>
              <div className="grid grid-cols-2 gap-2">
                {lightingOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => updateConfig('lighting', { primary: option.id })}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      config.lighting.primary === option.id
                        ? 'border-amber-500 bg-amber-900/20 text-amber-300'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs opacity-75">{option.desc}</div>
                    {recommendations.lighting.includes(option.id) && (
                      <Badge variant="outline" className="mt-1 text-xs">Recommended</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Lighting Mood</h4>
              <div className="grid grid-cols-2 gap-2">
                {moodOptions.map(mood => (
                  <button
                    key={mood}
                    onClick={() => updateConfig('lighting', { mood })}
                    className={`p-2 rounded text-sm transition-colors ${
                      config.lighting.mood === mood
                        ? 'bg-blue-900/30 border border-blue-500 text-blue-300'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">
                Lighting Intensity: {config.lighting.intensity}%
              </h4>
              <Slider
                value={[config.lighting.intensity]}
                onValueChange={(values) => updateConfig('lighting', { intensity: values[0] })}
                max={100}
                min={10}
                step={10}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Atmosphere Tab */}
        {activeTab === 'atmosphere' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-3">Atmosphere Style</h4>
              <div className="grid grid-cols-3 gap-2">
                {atmosphereStyles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => updateConfig('atmosphere', { style: style.id })}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      config.atmosphere.style === style.id
                        ? 'border-purple-500 bg-purple-900/20 text-purple-300'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-medium">{style.name}</div>
                    <div className="text-xs opacity-75">{style.desc}</div>
                    {recommendations.atmosphere.includes(style.id) && (
                      <Badge variant="outline" className="mt-1 text-xs">Recommended</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Atmosphere Elements</h4>
              <div className="grid grid-cols-2 gap-2">
                {atmosphereElements.map(element => (
                  <label key={element} className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 cursor-pointer">
                    <Checkbox
                      checked={config.atmosphere.elements.includes(element)}
                      onCheckedChange={() => toggleAtmosphereElement(element)}
                    />
                    <span className="text-sm text-slate-300">{element}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-3">Visual Effects</h4>
              <div className="grid grid-cols-2 gap-2">
                {visualEffects.map(effect => (
                  <label key={effect} className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 cursor-pointer">
                    <Checkbox
                      checked={config.effects.visual.includes(effect)}
                      onCheckedChange={() => toggleEffect('visual', effect)}
                    />
                    <span className="text-sm text-slate-300">{effect}</span>
                    {recommendations.effects.includes(effect) && (
                      <Badge variant="outline" className="ml-auto text-xs">Rec</Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-700" />

            <div>
              <h4 className="text-white font-medium mb-3">Camera Techniques</h4>
              <div className="grid grid-cols-2 gap-2">
                {cameraEffects.map(effect => (
                  <label key={effect} className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 cursor-pointer">
                    <Checkbox
                      checked={config.effects.camera.includes(effect)}
                      onCheckedChange={() => toggleEffect('camera', effect)}
                    />
                    <span className="text-sm text-slate-300">{effect}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Color Grading Tab */}
        {activeTab === 'grading' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-3">Color Tone</h4>
              <div className="grid grid-cols-3 gap-2">
                {colorTones.map(tone => (
                  <button
                    key={tone}
                    onClick={() => updateConfig('colorGrading', { tone })}
                    className={`p-3 rounded border text-center transition-colors ${
                      config.colorGrading.tone === tone
                        ? 'border-green-500 bg-green-900/20 text-green-300'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">
                Color Saturation: {config.colorGrading.saturation}%
              </h4>
              <Slider
                value={[config.colorGrading.saturation]}
                onValueChange={(values) => updateConfig('colorGrading', { saturation: values[0] })}
                max={150}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Desaturated</span>
                <span>Natural</span>
                <span>Hyper-saturated</span>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <h4 className="text-white font-medium mb-2">Current Configuration</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Lighting:</span>
              <span className="text-white ml-2">{config.lighting.primary} ({config.lighting.intensity}%)</span>
            </div>
            <div>
              <span className="text-slate-400">Atmosphere:</span>
              <span className="text-white ml-2">{config.atmosphere.style}</span>
            </div>
            <div>
              <span className="text-slate-400">Visual FX:</span>
              <span className="text-white ml-2">{config.effects.visual.length} active</span>
            </div>
            <div>
              <span className="text-slate-400">Color:</span>
              <span className="text-white ml-2">{config.colorGrading.tone}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}