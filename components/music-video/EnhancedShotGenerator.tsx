"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Wand2 } from "lucide-react"
import { type Location } from "./LocationSelector"
import { type WardrobeItem } from "./WardrobeSelector"
import { type Prop } from "./PropSelector"

interface EnhancedShotGeneratorProps {
  sectionId: string
  sectionTitle: string
  locations: Location[]
  wardrobe: WardrobeItem[]
  props: Prop[]
  onGenerate: (sectionId: string, request: string) => void
  isLoading: boolean
}

export function EnhancedShotGenerator({
  sectionId,
  sectionTitle,
  locations,
  wardrobe,
  props,
  onGenerate,
  isLoading
}: EnhancedShotGeneratorProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("none")
  const [selectedWardrobe, setSelectedWardrobe] = useState<string>("none")
  const [selectedProps, setSelectedProps] = useState<string[]>([])
  const [customRequest, setCustomRequest] = useState("")

  const handleGenerate = () => {
    const references = []
    
    if (selectedLocation && selectedLocation !== "none") {
      const location = locations.find(l => l.id === selectedLocation)
      if (location) references.push(`Location: ${location.reference} (${location.name})`)
    }
    
    if (selectedWardrobe && selectedWardrobe !== "none") {
      const outfit = wardrobe.find(w => w.id === selectedWardrobe)
      if (outfit) references.push(`Wardrobe: ${outfit.reference} (${outfit.name})`)
    }
    
    if (selectedProps.length > 0) {
      const propRefs = selectedProps.map(propId => {
        const prop = props.find(p => p.id === propId)
        return prop ? `${prop.reference} (${prop.name})` : propId
      }).join(', ')
      references.push(`Props: ${propRefs}`)
    }
    
    let request = ""
    if (references.length > 0) {
      request += `Use these references: ${references.join(", ")}. `
    }
    if (customRequest.trim()) {
      request += customRequest.trim()
    } else {
      request += "Generate creative additional shots for this section."
    }
    
    onGenerate(sectionId, request)
    
    // Reset form
    setSelectedLocation("none")
    setSelectedWardrobe("none")
    setSelectedProps([])
    setCustomRequest("")
  }

  const toggleProp = (propId: string) => {
    setSelectedProps(prev => 
      prev.includes(propId) 
        ? prev.filter(id => id !== propId)
        : [...prev, propId]
    )
  }

  const hasReferences = locations.length > 0 || wardrobe.length > 0 || props.length > 0

  if (!hasReferences) {
    return (
      <div className="p-4 bg-slate-900/30 rounded-md border border-slate-600">
        <h5 className="font-medium text-white mb-3">Generate Additional Shots</h5>
        <div className="space-y-3">
          <Input
            placeholder="Describe what kind of shots you want..."
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
            className="bg-slate-800/50 border-slate-600 text-white text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && customRequest.trim()) {
                onGenerate(sectionId, customRequest.trim())
                setCustomRequest("")
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => {
              onGenerate(sectionId, customRequest.trim() || "More creative performance shots")
              setCustomRequest("")
            }}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Generate More Shots
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-slate-900/30 rounded-md border border-slate-600">
      <h5 className="font-medium text-white mb-3">Generate Additional Shots for {sectionTitle}</h5>
      
      <div className="space-y-4">
        {/* Reference Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location Selection */}
          {locations.length > 0 && (
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Location (optional)</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue placeholder="Choose location..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="none">No specific location</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.reference} - {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Wardrobe Selection */}
          {wardrobe.length > 0 && (
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Wardrobe (optional)</label>
              <Select value={selectedWardrobe} onValueChange={setSelectedWardrobe}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue placeholder="Choose outfit..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="none">No specific wardrobe</SelectItem>
                  {wardrobe.map((outfit) => (
                    <SelectItem key={outfit.id} value={outfit.id}>
                      {outfit.reference} - {outfit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Props Selection */}
        {props.length > 0 && (
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Props (optional, multi-select)</label>
            <div className="flex flex-wrap gap-2">
              {props.map((prop) => (
                <Button
                  key={prop.id}
                  size="sm"
                  variant={selectedProps.includes(prop.id) ? "default" : "outline"}
                  onClick={() => toggleProp(prop.id)}
                  className={selectedProps.includes(prop.id) 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "border-slate-600 text-slate-300 hover:bg-slate-700"
                  }
                >
                  {prop.reference} - {prop.name}
                </Button>
              ))}
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
                  {locations.find(l => l.id === selectedLocation)?.reference}
                </Badge>
              )}
              {selectedWardrobe && selectedWardrobe !== "none" && (
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  {wardrobe.find(w => w.id === selectedWardrobe)?.reference}
                </Badge>
              )}
              {selectedProps.map(propId => {
                const prop = props.find(p => p.id === propId)
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
              Generating Shots...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Generate Additional Shots
            </>
          )}
        </Button>
      </div>
    </div>
  )
}