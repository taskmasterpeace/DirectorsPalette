'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Music, Wand2, Target, User } from 'lucide-react'
import { DirectorSelector } from '@/components/shared/DirectorSelector'
import { ArtistSelector } from '@/components/shared/ArtistSelector'
import type { ArtistProfile } from '@/lib/artist-types'

interface MusicVideoInputProps {
  // Song data
  songTitle: string
  setSongTitle: (title: string) => void
  artist: string
  setArtist: (artist: string) => void
  genre: string
  setGenre: (genre: string) => void
  lyrics: string
  setLyrics: (lyrics: string) => void
  
  // Concept and notes
  mvConcept: string
  setMvConcept: (concept: string) => void
  mvDirectorNotes: string
  setMvDirectorNotes: (notes: string) => void
  
  // Artist selection
  selectedArtistId: string | null
  setSelectedArtistId: (id: string | null) => void
  selectedArtistProfile: ArtistProfile | null
  setSelectedArtistProfile: (profile: ArtistProfile | null) => void
  artistVisualDescription: string
  setArtistVisualDescription: (description: string) => void
  
  // Director selection
  selectedMusicVideoDirector: string
  setSelectedMusicVideoDirector: (directorId: string) => void
  allDirectors: any[]
  
  // Actions
  onGenerateReferences: () => void
  onClear: () => void
  isLoading: boolean
  hasBreakdown: boolean
}

export function MusicVideoInput({
  songTitle,
  setSongTitle,
  artist,
  setArtist,
  genre,
  setGenre,
  lyrics,
  setLyrics,
  mvConcept,
  setMvConcept,
  mvDirectorNotes,
  setMvDirectorNotes,
  selectedArtistId,
  setSelectedArtistId,
  selectedArtistProfile,
  setSelectedArtistProfile,
  artistVisualDescription,
  setArtistVisualDescription,
  selectedMusicVideoDirector,
  setSelectedMusicVideoDirector,
  allDirectors,
  onGenerateReferences,
  onClear,
  isLoading,
  hasBreakdown
}: MusicVideoInputProps) {
  const selectedDirectorInfo = allDirectors?.find(d => d?.id === selectedMusicVideoDirector)

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Music className="h-5 w-5 text-purple-400" />
          Music Video Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Song Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-white mb-1 block">
              Song Title
            </label>
            <Input
              placeholder="Enter song title"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-1 block">
              Artist
            </label>
            <Input
              placeholder="Enter artist name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-1 block">
              Genre
            </label>
            <Input
              placeholder="e.g., Pop, Rock, Hip-Hop"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Lyrics */}
        <div>
          <label className="text-sm font-medium text-white mb-1 block">
            Lyrics (with timestamps if available)
          </label>
          <Textarea
            placeholder="[00:00] First line of lyrics&#10;[00:05] Second line..."
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="min-h-[150px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
          />
          <p className="text-xs text-slate-400 mt-1">
            Include timestamps in [MM:SS] format for precise section detection
          </p>
        </div>

        {/* Artist Profile Selection */}
        <ArtistSelector
          selectedArtistId={selectedArtistId}
          setSelectedArtistId={(id) => {
            setSelectedArtistId(id)
            // Auto-populate visual description from artist bank
            if (id && allDirectors) {
              // Clear if no selection
              if (!id || id === 'none') {
                setArtistVisualDescription('')
                return
              }
            }
          }}
          selectedArtistProfile={selectedArtistProfile}
          setSelectedArtistProfile={(profile) => {
            setSelectedArtistProfile(profile)
            // Auto-populate visual description from profile
            if (profile?.visual_look?.visual_description) {
              setArtistVisualDescription(profile.visual_look.visual_description)
            } else if (!profile) {
              setArtistVisualDescription('')
            }
          }}
        />

        {/* Artist Visual Description */}
        <div>
          <label className="text-sm font-medium text-white mb-1 block">
            Artist Visual Description (optional)
          </label>
          <Textarea
            placeholder="Detailed visual description: appearance, style, distinctive features (e.g., 'Ron-Ron, a confident Black man with gold chains, designer streetwear, and face tattoos')"
            value={artistVisualDescription}
            onChange={(e) => setArtistVisualDescription(e.target.value)}
            rows={2}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
          />
          <p className="text-xs text-slate-400 mt-1">
            This description will replace @artist in shots when enabled
          </p>
        </div>

        {/* MV Concept */}
        <div>
          <label className="text-sm font-medium text-white mb-1 block">
            Music Video Concept (optional)
          </label>
          <Textarea
            placeholder="Describe your vision for the music video..."
            value={mvConcept}
            onChange={(e) => setMvConcept(e.target.value)}
            rows={3}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>

        {/* Director Selection */}
        <DirectorSelector
          selectedDirector={selectedMusicVideoDirector}
          onDirectorChange={setSelectedMusicVideoDirector}
          allDirectors={allDirectors}
          selectedDirectorInfo={selectedDirectorInfo}
          domain="music-video"
        />

        {/* Director Notes */}
        <div>
          <label className="text-sm font-medium text-white mb-1 block">
            🎯 Director&apos;s Notes (HIGHEST PRIORITY)
          </label>
          <Textarea
            placeholder="Your specific creative guidance for the music video..."
            value={mvDirectorNotes}
            onChange={(e) => setMvDirectorNotes(e.target.value)}
            rows={3}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
          />
          <p className="text-xs text-amber-300 mt-1">
            These notes guide and enhance the selected director&apos;s style
          </p>
        </div>

        {/* Generation Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onGenerateReferences}
            disabled={isLoading || !songTitle.trim() || !lyrics.trim()}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? (
              <>
                <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Extract Video References
              </>
            )}
          </Button>

          {(lyrics.trim() || hasBreakdown) && (
            <Button
              onClick={onClear}
              disabled={isLoading}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}