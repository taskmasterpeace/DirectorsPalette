export const FILM_CATEGORY_LABELS = {
  Auteur: "Auteur",
  Classic: "Classic",
  Contemporary: "Contemporary",
  AvantGarde: "Avant‑Garde & Indie",
  Action: "Action & Thriller",
  Drama: "Drama",
  Comedy: "Comedy",
  Custom: "Custom",
} as const

export const MUSIC_CATEGORY_LABELS = {
  HipHop: "Hip‑Hop & R&B",
  Pop: "Pop & Spectacle",
  AltIndie: "Alt/Indie Visionaries",
  Electronic: "Electronic",
  DirectorDuo: "Director Duos",
  ClassicMV: "Classic MV Era",
  Custom: "Custom",
} as const

// Suggested tags to help auto-categorize
export const SUGGESTED_FILM_TAGS = [
  "auteur",
  "classic",
  "contemporary",
  "avant-garde",
  "indie",
  "thriller",
  "action",
  "drama",
  "comedy",
  "noir",
  "stylized",
  "grounded",
  "experimental",
]

export const SUGGESTED_MUSIC_TAGS = [
  "hip-hop",
  "r&b",
  "pop",
  "spectacle",
  "alt",
  "indie",
  "electronic",
  "duo",
  "classic-mv",
  "dance",
  "surreal",
  "narrative",
]

// Heuristic mapping from tags -> category
export function categorizeDirectorByTags(
  d: { category?: string; tags?: string[] },
  domain: "film" | "music-video",
): string {
  if (d.category && d.category.trim().length) return d.category
  const tags = (d.tags || []).map((t) => t.toLowerCase())

  if (domain === "film") {
    if (tags.some((t) => ["auteur", "visionary", "art-house", "arthouse"].includes(t)))
      return FILM_CATEGORY_LABELS.Auteur
    if (tags.some((t) => ["classic", "golden-age", "noir"].includes(t))) return FILM_CATEGORY_LABELS.Classic
    if (tags.some((t) => ["avant-garde", "experimental", "indie"].includes(t))) return FILM_CATEGORY_LABELS.AvantGarde
    if (tags.some((t) => ["thriller", "action", "crime"].includes(t))) return FILM_CATEGORY_LABELS.Action
    if (tags.some((t) => ["drama", "character", "intimate"].includes(t))) return FILM_CATEGORY_LABELS.Drama
    if (tags.some((t) => ["comedy", "satire"].includes(t))) return FILM_CATEGORY_LABELS.Comedy
    if (tags.length) return FILM_CATEGORY_LABELS.Contemporary
    return FILM_CATEGORY_LABELS.Custom
  } else {
    if (tags.some((t) => ["hip-hop", "r&b", "rap"].includes(t))) return MUSIC_CATEGORY_LABELS.HipHop
    if (tags.some((t) => ["pop", "spectacle", "glossy"].includes(t))) return MUSIC_CATEGORY_LABELS.Pop
    if (tags.some((t) => ["alt", "indie", "art"].includes(t))) return MUSIC_CATEGORY_LABELS.AltIndie
    if (tags.some((t) => ["electronic", "edm"].includes(t))) return MUSIC_CATEGORY_LABELS.Electronic
    if (tags.some((t) => ["duo"].includes(t))) return MUSIC_CATEGORY_LABELS.DirectorDuo
    if (tags.some((t) => ["classic-mv", "mtv-era", "retro"].includes(t))) return MUSIC_CATEGORY_LABELS.ClassicMV
    if (tags.length) return MUSIC_CATEGORY_LABELS.AltIndie
    return MUSIC_CATEGORY_LABELS.Custom
  }
}
