export { analyzeSongDNA, quickAnalyze } from "./analyze"
export { generateFromDNA, generateSongTitle } from "./generate"
export { analyzeSongDNAEnhanced } from "./analyze-enhanced"
export { generateFromDNAEnhanced, generateSongTitleEnhanced } from "./generate-enhanced"

// Re-export types for convenience
export type {
  SongDNA,
  SongStructure,
  LyricalPatterns,
  MusicalDNA,
  EmotionalMapping,
  GenerationOptions,
  GeneratedSong,
  AnalysisRequest,
  AnalysisResult,
} from "@/lib/song-dna-types"