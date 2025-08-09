"use client"

import { useEffect, useState } from "react"
import { artistDB } from "@/lib/artist-db"
import type { ArtistProfile } from "@/lib/artist-types"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useArtistStore } from "@/lib/artist-store"

type Props = {
  value?: string | null
  onChange?: (artistId: string | null, profile?: ArtistProfile | null) => void
}

export default function ArtistPicker({ value = null, onChange }: Props) {
  const [artists, setArtists] = useState<ArtistProfile[]>([])
  const { activeArtist, setActiveArtist } = useArtistStore()

  useEffect(() => {
    ;(async () => {
      const list = await artistDB.all()
      list.sort((a, b) => a.artist_name.localeCompare(b.artist_name))
      setArtists(list)
      // Default to active artist if nothing selected
      if (!value && activeArtist) onChange?.(activeArtist.artist_id, activeArtist)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-2">
      <Select
        value={value || activeArtist?.artist_id || undefined}
        onValueChange={(id) => {
          const p = artists.find((a) => a.artist_id === id) || null
          setActiveArtist(p)
          onChange?.(id, p || null)
        }}
      >
        <SelectTrigger className="w-full bg-slate-900/60 border-slate-600 text-white">
          <SelectValue placeholder="Select an artist..." />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700 text-white">
          <SelectGroup>
            {artists.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-300">No artists saved yet</div>
            ) : (
              artists.map((a) => (
                <SelectItem
                  className="text-white data-[highlighted]:bg-slate-700"
                  key={a.artist_id}
                  value={a.artist_id}
                >
                  {a.artist_name}
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
