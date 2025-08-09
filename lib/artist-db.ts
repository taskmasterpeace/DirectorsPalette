import type { ArtistProfile } from "./artist-types"

const KEY = "dsvb:artistbank"

function readAll(): ArtistProfile[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ArtistProfile[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(list: ArtistProfile[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(list))
}

export const artistDB = {
  async all(): Promise<ArtistProfile[]> {
    return readAll()
  },
  async upsert(profile: ArtistProfile): Promise<void> {
    const list = readAll()
    const ix = list.findIndex((a) => a.artist_id === profile.artist_id)
    if (ix >= 0) list[ix] = profile
    else list.push(profile)
    writeAll(list)
  },
  async remove(artistId: string): Promise<void> {
    const list = readAll().filter((a) => a.artist_id !== artistId)
    writeAll(list)
  },
}
