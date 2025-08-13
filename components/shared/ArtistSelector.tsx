'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { User, Plus } from 'lucide-react'
import { artistDB } from '@/lib/artist-db'
import type { ArtistProfile } from '@/lib/artist-types'

interface ArtistSelectorProps {
  selectedArtistId: string | null
  setSelectedArtistId: (id: string | null) => void
  selectedArtistProfile: ArtistProfile | null
  setSelectedArtistProfile: (profile: ArtistProfile | null) => void
}

export function ArtistSelector({
  selectedArtistId,
  setSelectedArtistId,
  selectedArtistProfile,
  setSelectedArtistProfile
}: ArtistSelectorProps) {
  const [artistProfiles, setArtistProfiles] = useState<ArtistProfile[]>([])

  useEffect(() => {
    loadArtistProfiles()
  }, [])

  const loadArtistProfiles = async () => {
    try {
      const profiles = await artistDB.all()
      setArtistProfiles(profiles)
    } catch (error) {
      console.error('Error loading artist profiles:', error)
    }
  }

  const handleArtistChange = (artistId: string) => {
    if (artistId === 'none') {
      setSelectedArtistId(null)
      setSelectedArtistProfile(null)
    } else {
      setSelectedArtistId(artistId)
      const profile = artistProfiles.find(p => p.artist_id === artistId)
      setSelectedArtistProfile(profile || null)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white mb-1 block flex items-center gap-2">
        <User className="h-4 w-4 text-purple-400" />
        Artist Profile (optional)
      </label>
      
      <div className="flex gap-2">
        <Select value={selectedArtistId || 'none'} onValueChange={handleArtistChange}>
          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
            <SelectValue placeholder="Select artist profile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No artist profile</SelectItem>
            {artistProfiles.map(profile => (
              <SelectItem key={profile.artist_id} value={profile.artist_id}>
                {profile.artist_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.location.href = '/artist-bank'}
          className="border-slate-600 hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {selectedArtistProfile && (
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-3 text-sm">
            <div className="space-y-1">
              <div className="text-slate-400">
                <span className="text-slate-300">Genres:</span> {selectedArtistProfile.genres?.join(', ')}
              </div>
              <div className="text-slate-400">
                <span className="text-slate-300">Visual Style:</span> {selectedArtistProfile.visual_style}
              </div>
              {selectedArtistProfile.themes && (
                <div className="text-slate-400">
                  <span className="text-slate-300">Themes:</span> {selectedArtistProfile.themes.join(', ')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}