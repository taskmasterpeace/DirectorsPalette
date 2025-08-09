"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { ArtistProfile } from "@/lib/artist-types"

export function ArtistCard({
  artist,
  active,
  onClick,
}: {
  artist: ArtistProfile
  active?: boolean
  onClick?: () => void
}) {
  const id = artist.artist_identity || ({} as any)
  const identity = [id.gender, id.race_ethnicity, id.age_range].filter(Boolean).join(", ")
  const genres = (artist.genres || []).slice(0, 2).join(", ")

  return (
    <Card
      onClick={onClick}
      className={[
        "cursor-pointer bg-slate-900 border-slate-700 transition hover:bg-slate-800/50",
        active ? "ring-2 ring-amber-500/60" : "",
      ].join(" ")}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded border border-slate-700 bg-slate-800 overflow-hidden flex-shrink-0">
          {artist.image_data_url ? (
            <img
              src={artist.image_data_url || "/placeholder.svg"}
              alt="Artist"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No Image</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm font-medium truncate">{artist.artist_name || "Untitled Artist"}</div>
          <div className="text-xs text-slate-400 truncate">{identity || "—"}</div>
          {genres && <div className="text-xs text-slate-500 truncate">{genres}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
