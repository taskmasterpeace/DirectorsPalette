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
  const hometown = [id.neighborhood, id.city || id.hometown_city, id.state || id.hometown_state]
    .filter(Boolean)
    .join(", ")
  const zip = id.zip ? ` (${id.zip})` : ""
  const glance = [artist.artist_name, identity, id.accent, hometown ? `${hometown}${zip}` : ""]
    .filter(Boolean)
    .join(" — ")

  return (
    <Card
      onClick={onClick}
      className={[
        "cursor-pointer bg-slate-900 border-slate-700 transition",
        active ? "ring-2 ring-amber-500/60" : "hover:bg-slate-800/50",
      ].join(" ")}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <img
          src={artist.image_data_url || "/placeholder.svg?height=48&width=48&query=artist"}
          alt="Artist"
          className="w-10 h-10 rounded border border-slate-700 object-cover"
        />
        <div className="min-w-0">
          <div className="text-white text-sm font-medium truncate">{artist.artist_name || "Untitled Artist"}</div>
          <div className="text-xs text-slate-400 truncate">{glance || "—"}</div>
        </div>
      </CardContent>
    </Card>
  )
}
