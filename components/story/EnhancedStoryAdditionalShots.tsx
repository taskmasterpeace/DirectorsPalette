"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Wand2, Users, MapPin, Package, Film } from "lucide-react"
import type { StoryCharacter } from "./CharacterSelector"
import type { StoryLocation } from "./StoryLocationSelector"
import type { StoryProp } from "./StoryPropSelector"

interface EnhancedStoryAdditionalShotsProps {
  chapterId: string
  chapterTitle: string
  characters: StoryCharacter[]
  locations: StoryLocation[]
  props: StoryProp[]
  onGenerate: (
    chapterId: string, 
    customRequest: string,
    selectedReferences: {
      characters: string[]
      locations: string[]
      props: string[]
    }
  ) => Promise<void>
  isLoading: boolean
}

export function EnhancedStoryAdditionalShots({
  chapterId,
  chapterTitle,
  characters,
  locations,
  props,
  onGenerate,
  isLoading
}: EnhancedStoryAdditionalShotsProps) {
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("none")
  const [selectedProp, setSelectedProp] = useState<string>("none")
  const [customRequest, setCustomRequest] = useState("")
  const [shotType, setShotType] = useState<string>("none")

  const handleAddCharacter = (characterId: string) => {
    if (characterId !== "none" && !selectedCharacters.includes(characterId)) {
      setSelectedCharacters([...selectedCharacters, characterId])
    }
  }

  const handleRemoveCharacter = (characterId: string) => {
    setSelectedCharacters(selectedCharacters.filter(id => id !== characterId))
  }

  const handleGenerate = async () => {
    const references = {
      characters: selectedCharacters,
      locations: selectedLocation !== "none" ? [selectedLocation] : [],
      props: selectedProp !== "none" ? [selectedProp] : []
    }

    // Build enhanced request based on selections
    let enhancedRequest = customRequest

    // Add shot type context if selected
    if (shotType !== "none") {
      const shotTypeDescriptions: Record<string, string> = {
        closeup: "Generate intimate close-up shots focusing on emotional moments and details",
        wide: "Generate wide establishing shots showing the full scene context",
        action: "Generate dynamic action shots with movement and energy",
        emotional: "Generate emotionally charged shots focusing on character reactions",
        atmospheric: "Generate atmospheric shots emphasizing mood and environment",
        reveal: "Generate reveal shots building suspense or showing key discoveries",
        transition: "Generate transition shots connecting scenes or showing time passage"
      }
      enhancedRequest = `${shotTypeDescriptions[shotType]}. ${enhancedRequest}`
    }

    await onGenerate(chapterId, enhancedRequest, references)

    // Reset form after generation
    setSelectedCharacters([])
    setSelectedLocation("none")
    setSelectedProp("none")
    setCustomRequest("")
    setShotType("none")
  }

  const canGenerate = selectedCharacters.length > 0 || selectedLocation !== "none" || 
                      selectedProp !== "none" || customRequest.trim() || shotType !== "none"

  // Get character display with age variations
  const getCharacterDisplay = (character: StoryCharacter) => {
    if (character.ageVariation) {
      return `${character.name} (${character.ageVariation})`
    }
    return character.name
  }

  // Get location display with type and time
  const getLocationDisplay = (location: StoryLocation) => {
    let display = location.name
    if (location.timeOfDay && location.timeOfDay !== 'various') {
      display += ` - ${location.timeOfDay}`
    }
    return display
  }

  return (
    <Card className="bg-slate-900/30 border-slate-600">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Film className="h-4 w-4 text-amber-400" />
          <h5 className="font-medium text-white">Generate Additional Shots</h5>
        </div>

        {/* Shot Type Selector */}
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Shot Type</label>
          <Select value={shotType} onValueChange={setShotType}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
              <SelectValue placeholder="Select shot type..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="closeup">Close-ups</SelectItem>
              <SelectItem value="wide">Wide shots</SelectItem>
              <SelectItem value="action">Action</SelectItem>
              <SelectItem value="emotional">Emotional</SelectItem>
              <SelectItem value="atmospheric">Atmospheric</SelectItem>
              <SelectItem value="reveal">Reveal</SelectItem>
              <SelectItem value="transition">Transition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Character Selector */}
        <div>
          <label className="text-sm text-slate-400 mb-1 block flex items-center gap-1">
            <Users className="h-3 w-3" />
            Characters
          </label>
          <div className="space-y-2">
            <Select value="none" onValueChange={handleAddCharacter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="Select character..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="none">Select character...</SelectItem>
                {characters.map(character => (
                  <SelectItem 
                    key={character.id} 
                    value={character.id}
                    disabled={selectedCharacters.includes(character.id)}
                  >
                    {getCharacterDisplay(character)} - {character.reference}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Selected Characters */}
            {selectedCharacters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCharacters.map(charId => {
                  const character = characters.find(c => c.id === charId)
                  if (!character) return null
                  return (
                    <Badge 
                      key={charId}
                      variant="secondary" 
                      className="bg-blue-600/20 text-blue-300 cursor-pointer"
                      onClick={() => handleRemoveCharacter(charId)}
                    >
                      {character.reference}
                      <span className="ml-1 text-xs">×</span>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Location Selector */}
        <div>
          <label className="text-sm text-slate-400 mb-1 block flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Location
          </label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
              <SelectValue placeholder="Select location..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="none">None</SelectItem>
              {locations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {getLocationDisplay(location)} - {location.reference}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prop Selector */}
        <div>
          <label className="text-sm text-slate-400 mb-1 block flex items-center gap-1">
            <Package className="h-3 w-3" />
            Prop
          </label>
          <Select value={selectedProp} onValueChange={setSelectedProp}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
              <SelectValue placeholder="Select prop..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="none">None</SelectItem>
              {props.map(prop => (
                <SelectItem key={prop.id} value={prop.id}>
                  {prop.name} ({prop.type}) - {prop.reference}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Request */}
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Additional Instructions</label>
          <Input
            placeholder="Describe specific shots you want (optional)..."
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canGenerate && !isLoading) {
                handleGenerate()
              }
            }}
          />
        </div>

        {/* Context Summary */}
        {(selectedCharacters.length > 0 || selectedLocation !== "none" || selectedProp !== "none") && (
          <div className="p-3 bg-slate-800/40 rounded-md border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Shot Context:</p>
            <div className="flex flex-wrap gap-2">
              {selectedCharacters.map(charId => {
                const character = characters.find(c => c.id === charId)
                if (!character) return null
                return (
                  <Badge key={charId} variant="outline" className="border-blue-500/30 text-blue-300 text-xs">
                    {character.reference}
                  </Badge>
                )
              })}
              {selectedLocation !== "none" && locations.find(l => l.id === selectedLocation) && (
                <Badge variant="outline" className="border-green-500/30 text-green-300 text-xs">
                  {locations.find(l => l.id === selectedLocation)?.reference}
                </Badge>
              )}
              {selectedProp !== "none" && props.find(p => p.id === selectedProp) && (
                <Badge variant="outline" className="border-orange-500/30 text-orange-300 text-xs">
                  {props.find(p => p.id === selectedProp)?.reference}
                </Badge>
              )}
              {shotType !== "none" && (
                <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-xs">
                  {shotType}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
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
              Generate Additional Shots
            </>
          )}
        </Button>

        {/* Tips */}
        <div className="text-xs text-slate-500 space-y-1">
          <p>• Select characters, locations, and props for context-aware shots</p>
          <p>• System will intelligently handle character interactions and age variations</p>
          <p>• Combine selections with custom instructions for best results</p>
        </div>
      </CardContent>
    </Card>
  )
}