'use server'

import { OpenAI } from 'openai'
import type { FilmDirector } from '@/lib/director-types'
import type { TitleCardOptions, PromptOptions } from '@/services'
import type { ExtractedEntities } from '@/lib/story-types'
import type { DirectorQuestion } from '@/components/story/DirectorQuestionCards'

// Re-export all story-related actions from existing files
export { 
  generateBreakdown,
  generateAdditionalChapterShots 
} from '../actions-story'

export {
  generateStoryBreakdown,
  generateAdditionalShots,
  extractStoryEntities,
  generateStoryBreakdownWithEntities
} from './story-actions'