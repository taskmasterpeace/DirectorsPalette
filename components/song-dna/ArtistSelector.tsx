"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { User, Users, Star } from "lucide-react"
import { artistDB } from "@/lib/artist-db"
import { useArtistStore } from "@/lib/artist-store"
import type { ArtistProfile } from "@/lib/artist-types"

interface ArtistSelectorProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
  showActiveFirst?: boolean
}

export function ArtistSelector({
  selectedId,
  onSelect,
  showActiveFirst = true,
}: ArtistSelectorProps) {
  const [artists, setArtists] = useState<ArtistProfile[]>([])
  const { activeArtist } = useArtistStore()

  useEffect(() => {
    loadArtists()
  }, [])

  async function loadArtists() {
    const all = await artistDB.all()
    setArtists(all)
  }

  // Sort artists with active first if requested
  const sortedArtists = [...artists].sort((a, b) => {
    if (showActiveFirst && activeArtist) {
      if (a.artist_id === activeArtist.artist_id) return -1
      if (b.artist_id === activeArtist.artist_id) return 1
    }
    return (a.artist_name || "").localeCompare(b.artist_name || "")
  })

  const selectedArtist = artists.find(a => a.artist_id === selectedId)

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Artist Selection (Optional)
        </h3>
        
        {activeArtist && (
          <div className="mb-3 p-3 bg-slate-900 rounded border border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-slate-300">Active Artist:</span>
                <span className="text-white font-medium">{activeArtist.artist_name}</span>
              </div>
              <Button
                onClick={() => onSelect(activeArtist.artist_id)}
                variant="outline"
                size="sm"
                className={`text-xs ${
                  selectedId === activeArtist.artist_id
                    ? "bg-amber-600 text-white border-amber-600"
                    : "text-slate-300 border-slate-600"
                }`}
              >
                {selectedId === activeArtist.artist_id ? "Selected" : "Use Active"}
              </Button>
            </div>
          </div>
        )}

        <div>
          <Label className="text-slate-300 text-sm mb-2">Select Artist Profile</Label>
          <Select value={selectedId || "none"} onValueChange={(v) => onSelect(v === "none" ? null : v)}>
            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
              <SelectValue placeholder="No artist selected">
                {selectedArtist ? (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {selectedArtist.artist_name}
                  </div>
                ) : (
                  "No artist selected"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="none" className="text-slate-400">
                No artist (analyze without profile)
              </SelectItem>
              {sortedArtists.map((artist) => (
                <SelectItem key={artist.artist_id} value={artist.artist_id} className="text-slate-200">
                  <div className="flex items-center gap-2">
                    {artist.artist_id === activeArtist?.artist_id && (
                      <Star className="w-3 h-3 text-amber-500" />
                    )}
                    {artist.artist_name || "Unnamed Artist"}
                    <span className="text-xs text-slate-400">
                      ({artist.genres?.slice(0, 2).join(", ")})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedArtist && (
          <div className="mt-3 p-2 bg-slate-900 rounded text-xs text-slate-300">
            <div className="font-medium text-white mb-1">Profile Details:</div>
            <div>Genres: {selectedArtist.genres?.join(", ") || "Not specified"}</div>
            <div>Style: {selectedArtist.vocal_description?.tone_texture || "Not specified"}</div>
            <div>Themes: {selectedArtist.writing_persona?.themes?.slice(0, 3).join(", ") || "Not specified"}</div>
          </div>
        )}

        <div className="mt-3 text-xs text-slate-400">
          Selecting an artist will enhance the generation with their specific style and characteristics
        </div>
      </div>
    </div>
  )
}