/**
 * Unified Action Exports
 * Single point of entry for all server actions
 */

// Story Actions
export {
  extractStoryReferences,
  generateStoryBreakdownWithReferences,
  generateStoryBreakdown,
  generateAdditionalChapterShots,
  extractStoryEntities,
  generateStoryBreakdownWithEntities
} from './story'

// Music Video Actions
export {
  extractMusicVideoReferences,
  generateMusicVideoBreakdownWithReferences,
  generateFullMusicVideoBreakdown,
  generateAdditionalMusicVideoShots,
  generateMusicVideoSuggestions
} from './music-video'

// Director Actions
export { generateDirectorStyleDetails } from './actions-director'

// Shared Types
export type { 
  GenerationResult,
  StoryReferences,
  MusicVideoReferences 
} from './types'