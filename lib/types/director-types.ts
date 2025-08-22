/**
 * Director TypeScript Interfaces
 * Replaces any[] director types with proper type safety
 */

export interface FilmDirector {
  id: string
  name: string
  description: string
  visualLanguage: string
  cameraStyle: string
  colorPalette: string
  lightingPreferences: string
  iconography: string
  notableWorks: string[]
  era: string
  specialty: 'thriller' | 'drama' | 'action' | 'comedy' | 'sci-fi' | 'horror' | 'art-house' | 'commercial'
}

export interface MusicVideoDirector {
  id: string
  name: string
  description: string
  visualHallmarks: string
  narrativeStyle: string
  genres: string[]
  colorAesthetic: string
  cameraPreferences: string
  editingStyle: string
  notableWorks: string[]
  era: string
  specialty: 'performance' | 'narrative' | 'conceptual' | 'experimental' | 'commercial'
}

export interface DirectorQuestion {
  id: string
  question: string
  options: Array<{
    value: string
    label: string
    description: string
  }>
  category: 'visual' | 'narrative' | 'technical' | 'stylistic'
}

export interface DirectorSelectionState {
  selectedDirector: string
  selectedDirectorInfo: FilmDirector | MusicVideoDirector | null
  customDirectors: FilmDirector[] | MusicVideoDirector[]
  domain: 'film' | 'music-video'
}

export type DirectorType = FilmDirector | MusicVideoDirector