export type FilmDirectorCategory = "Contemporary" | "Auteur" | "Classic" | "Custom"
export type FilmDirectorDiscipline =
  | "composition"
  | "camera-movement"
  | "color-lighting"
  | "editing-rhythm"
  | "world-building"
  | "performance-direction"
  | "tone-mood"

export interface FilmDirector {
  id: string
  domain: "film"
  name: string
  description?: string

  // New unified field
  visualLanguage?: string

  // Deprecated, kept for backward compatibility and migration
  visualStyle?: string
  cameraStyle?: string

  colorPalette?: string
  narrativeFocus?: string
  category?: FilmDirectorCategory
  tags?: string[]
  disciplines?: FilmDirectorDiscipline[]
  createdAt: Date
  updatedAt: Date
  isCustom?: boolean
}
