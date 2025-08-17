"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Wand2, ChevronDown, ChevronUp } from "lucide-react"
import { type Location } from "./LocationSelector"
import { type WardrobeItem } from "./WardrobeSelector"
import { type Prop } from "./PropSelector"

interface EnhancedShotGeneratorProps {
  sectionId: string
  sectionTitle: string
  locations: Location[]
  wardrobe: WardrobeItem[]
  props: Prop[]
  currentShots?: string[]
  onGenerateShots: (sectionId: string, request: string) => void
  isLoading: boolean
}

export function EnhancedShotGenerator({
  sectionId,
  sectionTitle,
  locations,
  wardrobe,
  props,
  currentShots,
  onGenerateShots,
  isLoading
}: EnhancedShotGeneratorProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("none")
  const [selectedWardrobe, setSelectedWardrobe] = useState<string>("none")
  const [selectedProps, setSelectedProps] = useState<string[]>([])
  const [customRequest, setCustomRequest] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleGenerate = () => {
    const references = []
    
    if (selectedLocation && selectedLocation !== "none") {
      const locationIndex = selectedLocation.startsWith('location-') ? 
        parseInt(selectedLocation.replace('location-', '')) : null
      const location = locationIndex !== null ? 
        locations[locationIndex] : 
        locations.find(l => l.id === selectedLocation)
      if (location) references.push(`Location: ${location.reference} (${location.name})`)
    }
    
    if (selectedWardrobe && selectedWardrobe !== "none") {
      const wardrobeIndex = selectedWardrobe.startsWith('wardrobe-') ?
        parseInt(selectedWardrobe.replace('wardrobe-', '')) : null
      const outfit = wardrobeIndex !== null ?
        wardrobe[wardrobeIndex] :
        wardrobe.find(w => w.id === selectedWardrobe)
      if (outfit) references.push(`Wardrobe: ${outfit.reference} (${outfit.name})`)
    }
    
    if (selectedProps.length > 0) {
      const propRefs = selectedProps.map(propId => {
        const propIndex = propId.startsWith('prop-') ?
          parseInt(propId.replace('prop-', '')) : null
        const prop = propIndex !== null ?
          props[propIndex] :
          props.find(p => p.id === propId)
        return prop ? `${prop.reference} (${prop.name})` : propId
      }).join(', ')
      references.push(`Props: ${propRefs}`)
    }
    
    const request = customRequest.trim() || `Generate additional shots for ${sectionTitle}`
    const finalRequest = references.length > 0 
      ? `${request}\n\nYOU MUST INCORPORATE THESE ELEMENTS:\n${references.join('\n')}\nEnsure each shot uses at least one of these references.`
      : request
    
    onGenerateShots(sectionId, finalRequest)
    
    // Reset form
    setSelectedLocation("none")
    setSelectedWardrobe("none")
    setSelectedProps([])
    setCustomRequest("")
    setIsExpanded(false)
  }

  const toggleProp = (propId: string) => {
    setSelectedProps(prev => 
      prev.includes(propId) 
        ? prev.filter(id => id !== propId)
        : [...prev, propId]
    )
  }

  // Quick generate presets - @artist format for the artist parameter
  const quickGenerateOptions = [
    {
      label: "Performance Shots",
      icon: "🎤",
      onClick: () => {
        onGenerateShots(sectionId, `More performance shots of @artist`)
      }
    },
    {
      label: "Cinematic B-Roll", 
      icon: "🎬",
      onClick: () => {
        onGenerateShots(sectionId, "Cinematic b-roll shots")
      }
    },
    {
      label: "Emotional Close-ups",
      icon: "👁️",
      onClick: () => {
        onGenerateShots(sectionId, `Emotional close-up shots of @artist`)
      }
    }
  ]

  return (
    <div className="mt-4 p-4 bg-slate-900/40 rounded-lg border border-slate-700">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="ghost"
        className="w-full justify-between text-slate-300 hover:text-white hover:bg-slate-800"
      >
        <span className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Generate Additional Shots
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </Button>
      
      {isExpanded && (
      <div className="space-y-4 mt-4">
        {/* Quick Generate Options */}
        <div className="grid grid-cols-3 gap-2">
          {quickGenerateOptions.map((option, index) => (
            <Button
              key={`quick-${index}`}
              size="sm"
              variant="outline"
              onClick={option.onClick}
              disabled={isLoading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-900/40 px-2 text-slate-400">Or configure custom shot</span>
          </div>
        </div>

        {/* Location Selection */}
        {locations && locations.length > 0 && (
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Location Reference</label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="Select a location..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="none">No specific location</SelectItem>
                {locations.map((location, index) => (
                  <SelectItem key={location.id || `location-${index}`} value={location.id || `location-${index}`}>
                    {location.reference} - {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Wardrobe Selection */}
        {wardrobe && wardrobe.length > 0 && (
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Wardrobe Reference</label>
            <Select value={selectedWardrobe} onValueChange={setSelectedWardrobe}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="Select wardrobe..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="none">No specific wardrobe</SelectItem>
                {wardrobe.map((outfit, index) => (
                  <SelectItem key={outfit.id || `wardrobe-${index}`} value={outfit.id || `wardrobe-${index}`}>
                    {outfit.reference} - {outfit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Props Selection */}
        {props && props.length > 0 && (
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Props (click to select)</label>
            <div className="flex flex-wrap gap-2">
              {props.map((prop, index) => {
                const propId = prop.id || `prop-${index}`
                return (
                  <Button
                    key={propId}
                    size="sm"
                    variant={selectedProps.includes(propId) ? "default" : "outline"}
                    onClick={() => toggleProp(propId)}
                    className={selectedProps.includes(propId) 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "border-slate-600 text-slate-300 hover:bg-slate-700"
                    }
                  >
                    {prop.reference} - {prop.name}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Custom Request */}
        <div>
          <label className="text-sm font-medium text-white mb-2 block">Additional Instructions (optional)</label>
          <Input
            placeholder="Any specific shot ideas or directions..."
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
            className="bg-slate-800/50 border-slate-600 text-white text-sm"
          />
        </div>

        {/* Preview Selected References */}
        {(selectedLocation && selectedLocation !== "none" || selectedWardrobe && selectedWardrobe !== "none" || selectedProps.length > 0) && (
          <div className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
            <p className="text-sm text-slate-400 mb-2">Will use these references:</p>
            <div className="flex flex-wrap gap-2">
              {selectedLocation && selectedLocation !== "none" && (
                <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                  {(() => {
                    const locationIndex = selectedLocation.startsWith('location-') ?
                      parseInt(selectedLocation.replace('location-', '')) : null
                    const location = locationIndex !== null ?
                      locations[locationIndex] :
                      locations.find(l => l.id === selectedLocation)
                    return location?.reference
                  })()}
                </Badge>
              )}
              {selectedWardrobe && selectedWardrobe !== "none" && (
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  {(() => {
                    const wardrobeIndex = selectedWardrobe.startsWith('wardrobe-') ?
                      parseInt(selectedWardrobe.replace('wardrobe-', '')) : null
                    const outfit = wardrobeIndex !== null ?
                      wardrobe[wardrobeIndex] :
                      wardrobe.find(w => w.id === selectedWardrobe)
                    return outfit?.reference
                  })()}
                </Badge>
              )}
              {selectedProps.map(propId => {
                const propIndex = propId.startsWith('prop-') ?
                  parseInt(propId.replace('prop-', '')) : null
                const prop = propIndex !== null ?
                  props[propIndex] :
                  props.find(p => p.id === propId)
                return prop ? (
                  <Badge key={propId} variant="outline" className="border-green-500/30 text-green-300">
                    {prop.reference}
                  </Badge>
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isLoading ? (
            <>
              <Wand2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Generate Custom Shots
            </>
          )}
        </Button>
      </div>
      )}
    </div>
  )
}