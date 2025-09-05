'use client'

import { Badge } from '@/components/ui/badge'
import { User, Music } from 'lucide-react'
import { useMusicVideoStore } from '@/stores/music-video-store'
import { useAppStore } from '@/stores/app-store'

export function ActiveArtistIndicator() {
  const { mode } = useAppStore()
  const { artist, selectedArtistProfile } = useMusicVideoStore()
  
  // Only show in Music Video mode
  if (mode !== 'music-video') return null
  
  if (!artist && !selectedArtistProfile) return null

  const displayName = selectedArtistProfile?.artist_name || artist
  const genre = selectedArtistProfile?.genres?.[0] || 'Unknown'

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <Badge className="bg-blue-600/90 backdrop-blur-sm text-white border-blue-500/50 shadow-lg">
        <User className="w-3 h-3 mr-1" />
        <span className="font-medium">{displayName}</span>
        {genre && (
          <>
            <span className="mx-1">•</span>
            <span className="text-blue-100">{genre}</span>
          </>
        )}
      </Badge>
    </div>
  )
}