/**
 * Service layer exports
 */
export { DirectorService } from './director-service'
export { StoryService } from './story-service'
export { MusicVideoService } from './music-video-service'
export { ArtistService } from './artist-service'
export { ServiceError } from './base'

// Re-export types
export type { DirectorStyle } from './director-service'
export type {
  StoryStructure,
  Chapter,
  ChapterBreakdown,
  TitleCard,
  AdditionalShots,
  TitleCardOptions,
  PromptOptions,
  DirectorInfo,
} from './story-service'
export type {
  MusicVideoStructure,
  MusicVideoSection,
  Treatment,
  MusicVideoSectionBreakdown,
  AdditionalMusicVideoShots,
  MusicVideoConfig,
  MusicVideoGuidance,
} from './music-video-service'