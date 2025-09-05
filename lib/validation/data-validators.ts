/**
 * Data Validation Utilities
 * Ensures data structures are consistent and prevent runtime errors
 */

import type { StoryBreakdown, Chapter, ChapterBreakdown } from '@/lib/types/story-types'
import type { MusicVideoBreakdown, Section, SectionBreakdown } from '@/lib/types/music-video-types'
import type { PostProductionShot } from '@/lib/post-production/types'

/**
 * Validate story breakdown data structure
 */
export function validateStoryBreakdown(data: any): data is StoryBreakdown {
  if (!data || typeof data !== 'object') return false
  
  // Check required fields
  if (!data.storyStructure || !data.chapterBreakdowns) return false
  
  // Validate structure
  if (!Array.isArray(data.storyStructure.chapters)) return false
  if (!Array.isArray(data.chapterBreakdowns)) return false
  
  // Check chapter structure
  const validChapters = data.storyStructure.chapters.every((chapter: any) => 
    chapter.id && 
    chapter.title && 
    Array.isArray(chapter.keyCharacters) &&
    chapter.primaryLocation &&
    chapter.narrativeBeat
  )
  
  if (!validChapters) return false
  
  // Check chapter breakdown structure
  const validBreakdowns = data.chapterBreakdowns.every((breakdown: any) =>
    Array.isArray(breakdown.shots) &&
    breakdown.chapterId &&
    breakdown.coverageAnalysis
  )
  
  return validBreakdowns
}

/**
 * Validate music video breakdown data structure
 */
export function validateMusicVideoBreakdown(data: any): data is MusicVideoBreakdown {
  if (!data || typeof data !== 'object') return false
  
  // Check required fields
  if (!data.sectionBreakdowns) return false
  if (!Array.isArray(data.sectionBreakdowns)) return false
  
  // Check section breakdown structure
  const validBreakdowns = data.sectionBreakdowns.every((breakdown: any) =>
    breakdown.sectionId &&
    Array.isArray(breakdown.shots) &&
    breakdown.sectionType
  )
  
  if (!validBreakdowns) return false
  
  // Check music video structure if present
  if (data.musicVideoStructure) {
    if (!Array.isArray(data.musicVideoStructure.sections)) return false
    
    const validSections = data.musicVideoStructure.sections.every((section: any) =>
      section.id &&
      section.title &&
      section.type
    )
    
    if (!validSections) return false
  }
  
  return true
}

/**
 * Validate post production shot data structure
 */
export function validatePostProductionShot(data: any): data is PostProductionShot {
  if (!data || typeof data !== 'object') return false
  
  // Check required fields
  const hasRequiredFields = 
    data.id &&
    data.projectId &&
    data.projectType &&
    typeof data.shotNumber === 'number' &&
    data.description &&
    data.status
  
  if (!hasRequiredFields) return false
  
  // Check project type is valid
  if (!['story', 'music-video'].includes(data.projectType)) return false
  
  // Check status is valid
  if (!['pending', 'processing', 'completed', 'failed'].includes(data.status)) return false
  
  return true
}

/**
 * Validate and fix shot data for post production
 */
export function normalizePostProductionShot(shot: any): PostProductionShot | null {
  if (!shot || !shot.description) return null
  
  // Create standardized shot structure
  const normalized: PostProductionShot = {
    id: shot.id || `shot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectId: shot.projectId || 'unknown',
    projectType: shot.projectType || 'story',
    shotNumber: shot.shotNumber || 1,
    description: shot.description,
    status: shot.status || 'pending',
    metadata: shot.metadata || {}
  }
  
  // Handle legacy field names
  if (shot.chapter && !shot.sourceChapter) {
    normalized.sourceChapter = shot.chapter
  } else if (shot.sourceChapter) {
    normalized.sourceChapter = shot.sourceChapter
  }
  
  if (shot.section && !shot.sourceSection) {
    normalized.sourceSection = shot.section
  } else if (shot.sourceSection) {
    normalized.sourceSection = shot.sourceSection
  }
  
  return normalized
}

/**
 * Validate array of shots and normalize them
 */
export function validateAndNormalizeShotArray(shots: any[]): PostProductionShot[] {
  if (!Array.isArray(shots)) return []
  
  const validShots = shots
    .map(shot => normalizePostProductionShot(shot))
    .filter((shot): shot is PostProductionShot => shot !== null)
  
  console.log(`📊 Shot validation: ${validShots.length}/${shots.length} shots valid`)
  
  return validShots
}

/**
 * Create standardized shot for consistent data structure
 */
export function createStandardShot(params: {
  description: string
  sourceChapter?: string
  sourceSection?: string
  projectType: 'story' | 'music-video'
  shotNumber: number
  directorStyle?: string
}): PostProductionShot {
  return {
    id: `${params.projectType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectId: `${params.projectType}-project`,
    projectType: params.projectType,
    shotNumber: params.shotNumber,
    description: params.description,
    sourceChapter: params.sourceChapter,
    sourceSection: params.sourceSection,
    status: 'pending',
    metadata: {
      directorStyle: params.directorStyle,
      timestamp: new Date().toISOString(),
      sourceType: params.projectType
    }
  }
}

/**
 * Validate export configuration
 */
export function validateExportConfig(config: {
  prefix?: string
  suffix?: string
  selectedShots?: Set<string>
  allShots?: any[]
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.allShots || config.allShots.length === 0) {
    errors.push('No shots available for export')
  }
  
  if (config.selectedShots && config.selectedShots.size > 0) {
    const selectedCount = config.allShots?.filter(shot => 
      config.selectedShots?.has(shot.id)
    ).length || 0
    
    if (selectedCount === 0) {
      errors.push('Selected shots not found in available shots')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}