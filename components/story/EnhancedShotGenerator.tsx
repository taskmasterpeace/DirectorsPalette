"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Users, MapPin, Package, Camera, Sparkles } from "lucide-react"

interface EnhancedShotGeneratorProps {
  chapterId: string
  chapterCharacters: string[]
  chapterLocations: string[]
  chapterProps: string[]
  onGenerateShot: (
    chapterId: string,
    shotType: string,
    characters: string[],
    location: string,
    customRequest: string
  ) => void
  isLoading?: boolean
}

const SHOT_TYPES = [
  { id: 'establishing', label: 'Establishing', icon: '🏞️' },
  { id: 'wide', label: 'Wide Shot', icon: '📐' },
  { id: 'medium', label: 'Medium Shot', icon: '🎯' },
  { id: 'closeup', label: 'Close-up', icon: '🔍' },
  { id: 'ots', label: 'Over-the-shoulder', icon: '👥' },
  { id: 'action', label: 'Action', icon: '⚡' },
  { id: 'emotional', label: 'Emotional', icon: '❤️' },
  { id: 'atmospheric', label: 'Atmospheric', icon: '🌫️' }
]

export function EnhancedShotGenerator({
  chapterId,
  chapterCharacters,
  chapterLocations,
  chapterProps,
  onGenerateShot,
  isLoading
}: EnhancedShotGeneratorProps) {
  const [selectedShotType, setSelectedShotType] = useState<string>('')
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [customRequest, setCustomRequest] = useState('')

  const toggleCharacter = (character: string) => {
    setSelectedCharacters(prev => 
      prev.includes(character) 
        ? prev.filter(c => c !== character)
        : [...prev, character]
    )
  }

  const handleGenerate = () => {
    if (!selectedShotType) return
    
    onGenerateShot(
      chapterId,
      selectedShotType,
      selectedCharacters,
      selectedLocation,
      customRequest
    )
    
    // Reset selections after generation
    setSelectedShotType('')
    setSelectedCharacters([])
    setSelectedLocation('')
    setCustomRequest('')
  }

  const canGenerate = selectedShotType && (selectedCharacters.length > 0 || selectedLocation)

  return (
    <Card className="bg-slate-900/30 border-slate-600">
      <CardContent className="pt-4 space-y-4">
        <h5 className="font-medium text-white flex items-center gap-2">
          <Camera className="h-4 w-4 text-amber-400" />
          Generate Additional Shots
        </h5>

        {/* Shot Type Selection */}
        <div>
          <label className="text-sm text-slate-300 block mb-2">Shot Type</label>
          <div className="flex flex-wrap gap-2">
            {SHOT_TYPES.map((type) => (
              <Badge
                key={type.id}
                variant={selectedShotType === type.id ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedShotType === type.id 
                    ? 'bg-amber-600 border-amber-600 text-white' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => setSelectedShotType(type.id)}
              >
                <span className="mr-1">{type.icon}</span>
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Character Selection */}
        {chapterCharacters.length > 0 && (
          <div>
            <label className="text-sm text-slate-300 flex items-center gap-1 mb-2">
              <Users className="h-3 w-3" />
              Characters in this chapter
            </label>
            <div className="flex flex-wrap gap-2">
              {chapterCharacters.map((character) => (
                <Badge
                  key={character}
                  variant={selectedCharacters.includes(character) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedCharacters.includes(character)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                  onClick={() => toggleCharacter(character)}
                >
                  @{character}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Location Selection */}
        {chapterLocations.length > 0 && (
          <div>
            <label className="text-sm text-slate-300 flex items-center gap-1 mb-2">
              <MapPin className="h-3 w-3" />
              Locations in this chapter
            </label>
            <div className="flex flex-wrap gap-2">
              {chapterLocations.map((location) => (
                <Badge
                  key={location}
                  variant={selectedLocation === location ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedLocation === location
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedLocation(selectedLocation === location ? '' : location)}
                >
                  @{location}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Props Display (if any) */}
        {chapterProps.length > 0 && (
          <div>
            <label className="text-sm text-slate-300 flex items-center gap-1 mb-2">
              <Package className="h-3 w-3" />
              Props in this chapter
            </label>
            <div className="flex flex-wrap gap-2">
              {chapterProps.map((prop) => (
                <Badge
                  key={prop}
                  variant="outline"
                  className="border-purple-600/30 text-purple-300"
                >
                  @{prop}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Custom Request */}
        <div>
          <label className="text-sm text-slate-300 block mb-2">
            Additional Details (optional)
          </label>
          <Textarea
            placeholder="Any specific requirements for this shot..."
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
            className="bg-slate-800/50 border-slate-600 text-white text-sm h-20"
          />
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {selectedCharacters.length > 0 && (
              <span className="mr-2">{selectedCharacters.length} character(s)</span>
            )}
            {selectedLocation && (
              <span className="mr-2">1 location</span>
            )}
            {selectedShotType && (
              <span>{SHOT_TYPES.find(t => t.id === selectedShotType)?.label}</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? (
              <>
                <Sparkles className="h-4 w-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Generate Shot
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}