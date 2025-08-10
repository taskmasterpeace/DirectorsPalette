"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sparkles, MapPin, Music, Zap, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GenreDrillDown } from "./GenreDrillDown"
import { EnhancedArtistService } from "@/services/enhanced-artist-service"
import type { ArtistProfile } from "@/lib/artist-types"

interface AutoFillRemainingProps {
  currentProfile: Partial<ArtistProfile>
  onProfileUpdate: (updatedProfile: Partial<ArtistProfile>) => void
}

export function AutoFillRemaining({ currentProfile, onProfileUpdate }: AutoFillRemainingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Quick input fields
  const [city, setCity] = useState(currentProfile.artist_identity?.city || "")
  const [primaryGenre, setPrimaryGenre] = useState("")
  const [vibe, setVibe] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>(currentProfile.genres || [])
  const [selectedSubgenres, setSelectedSubgenres] = useState<string[]>(currentProfile.sub_genres || [])  
  const [selectedMicrogenres, setSelectedMicrogenres] = useState<string[]>(currentProfile.micro_genres || [])
  
  const handleAutoFill = async () => {
    setIsLoading(true)
    try {
      const userInputs = {
        city,
        primaryGenre,
        vibe,
        genres: selectedGenres,
        subgenres: selectedSubgenres,
        microgenres: selectedMicrogenres
      }
      
      const { fill } = await EnhancedArtistService.autoFillRemaining(currentProfile, userInputs)
      
      // Merge the filled data with current profile
      const updatedProfile = { ...currentProfile, ...fill }
      onProfileUpdate(updatedProfile)
      
      setIsOpen(false)
    } catch (error) {
      console.error('Auto-fill failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const hasMinimumInputs = city.trim() || selectedGenres.length > 0 || vibe.trim()
  const inputCount = [city.trim(), selectedGenres.length > 0, vibe.trim()].filter(Boolean).length

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white"
        size="lg"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Auto Fill Remaining
        <Badge variant="secondary" className="ml-2 bg-white/20">
          AI
        </Badge>
      </Button>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Auto Fill Remaining Fields
          <Badge variant="outline" className="ml-2">
            Enter {3 - inputCount} more details
          </Badge>
        </CardTitle>
        <p className="text-slate-400 text-sm">
          Give me a few details and I'll intelligently fill out the entire artist profile
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City */}
          <div>
            <label className="text-slate-300 text-sm mb-2 block flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              City/Region
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Atlanta, Brooklyn, Miami"
              className="bg-slate-800 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-500 mt-1">
              Influences accent, slang, and regional music style
            </p>
          </div>

          {/* Vibe/Style */}
          <div>
            <label className="text-slate-300 text-sm mb-2 block flex items-center gap-2">
              <Music className="w-4 h-4" />
              Vibe/Style
            </label>
            <Select value={vibe} onValueChange={setVibe}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Choose overall vibe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="melodic">Melodic & Smooth</SelectItem>
                <SelectItem value="aggressive">Aggressive & Raw</SelectItem>
                <SelectItem value="conscious">Conscious & Thoughtful</SelectItem>
                <SelectItem value="party">Party & Energetic</SelectItem>
                <SelectItem value="emotional">Emotional & Vulnerable</SelectItem>
                <SelectItem value="experimental">Experimental & Artistic</SelectItem>
                <SelectItem value="commercial">Commercial & Radio-Ready</SelectItem>
                <SelectItem value="underground">Underground & Authentic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Genre Selection */}
        <div>
          <label className="text-slate-300 text-sm mb-3 block">
            Genre Selection (Optional - but helps with accuracy)
          </label>
          <GenreDrillDown
            selectedGenres={selectedGenres}
            selectedSubgenres={selectedSubgenres}
            selectedMicrogenres={selectedMicrogenres}
            onGenreChange={(genres, subgenres, microgenres) => {
              setSelectedGenres(genres)
              setSelectedSubgenres(subgenres)
              setSelectedMicrogenres(microgenres)
            }}
          />
        </div>

        <Separator className="bg-slate-700" />

        {/* What Gets Filled */}
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            What I'll intelligently fill:
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-slate-300">
              • Vocal tone & delivery style
              • Signature slang & phrases  
              • Production preferences
              • Visual style & fashion
            </div>
            <div className="text-slate-300">
              • Writing themes & devices
              • Personality traits (MBTI)
              • Material preferences
              • Chat voice & communication
            </div>
          </div>
          {city && (
            <div className="mt-3 p-2 bg-blue-900/20 border border-blue-500/30 rounded">
              <p className="text-blue-300 text-xs">
                🌍 <strong>{city}</strong> will influence: accent, slang, regional music styles, local references
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAutoFill}
            disabled={!hasMinimumInputs || isLoading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Fill Everything ({inputCount}/3 details provided)
              </>
            )}
          </Button>
        </div>

        {!hasMinimumInputs && (
          <p className="text-amber-400 text-sm text-center">
            💡 Add at least one detail (city, genre, or vibe) to get started
          </p>
        )}
      </CardContent>
    </Card>
  )
}