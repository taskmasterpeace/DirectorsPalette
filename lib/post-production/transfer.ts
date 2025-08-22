/**
 * Shot Transfer Utilities
 * Handles transferring shots from Director's Palette to Post Production
 */

import type { PostProductionShot } from './types'
import type { ChapterBreakdown } from '@/lib/types'

/**
 * Convert story shots to Post Production format
 */
export function convertStoryShots(
  chapterBreakdowns: ChapterBreakdown[],
  projectId: string
): PostProductionShot[] {
  const shots: PostProductionShot[] = []
  
  chapterBreakdowns.forEach((chapter) => {
    chapter.shots.forEach((shotDescription, index) => {
      shots.push({
        id: `${chapter.chapterId}_shot_${index + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        projectId,
        projectType: 'story',
        shotNumber: index + 1,
        description: shotDescription,
        sourceChapter: chapter.chapterId,
        status: 'pending',
        metadata: {
          timestamp: new Date().toISOString()
        }
      })
    })
  })
  
  return shots
}

/**
 * Convert music video shots to Post Production format
 */
export function convertMusicVideoShots(
  sectionBreakdowns: any[], // Update type based on your music video types
  projectId: string
): PostProductionShot[] {
  const shots: PostProductionShot[] = []
  
  sectionBreakdowns.forEach((section) => {
    if (section.shots && Array.isArray(section.shots)) {
      section.shots.forEach((shotDescription: string, index: number) => {
        shots.push({
          id: `${section.sectionId}_shot_${index + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          projectId,
          projectType: 'music-video',
          shotNumber: index + 1,
          description: shotDescription,
          sourceSection: section.sectionId,
          status: 'pending',
          metadata: {
            timestamp: new Date().toISOString()
          }
        })
      })
    }
  })
  
  return shots
}

/**
 * Store shots for transfer to Post Production
 */
export function storeShotsForTransfer(shots: PostProductionShot[]): void {
  console.log('🔴 STORING SHOTS FOR TRANSFER')
  console.log('🔍 Number of shots to store:', shots.length)
  console.log('🔍 Sample shot:', shots[0])
  
  try {
    const transferData = {
      shots,
      transferredAt: new Date().toISOString(),
      source: 'directors-palette'
    }
    
    // Store in sessionStorage for transfer
    sessionStorage.setItem('postProductionShots', JSON.stringify(transferData))
    console.log('✅ Shots stored successfully in sessionStorage')
    console.log('🔍 Storage key: postProductionShots')
    
    // Verify storage worked
    const verification = sessionStorage.getItem('postProductionShots')
    console.log('🔍 Verification - data stored:', verification ? 'Yes' : 'No')
    
  } catch (error) {
    console.error('❌ Failed to store shots:', error)
  }
}

/**
 * Retrieve transferred shots in Post Production
 */
export function retrieveTransferredShots(): PostProductionShot[] | null {
  console.log('🔍 RETRIEVING TRANSFERRED SHOTS')
  
  const stored = sessionStorage.getItem('postProductionShots')
  console.log('🔍 SessionStorage data:', stored ? 'Found' : 'Not found')
  
  if (!stored) {
    console.log('❌ No transferred shots in sessionStorage')
    return null
  }
  
  try {
    const data = JSON.parse(stored)
    console.log('🔍 Parsed shot data:', data)
    console.log('🔍 Number of shots:', data.shots?.length || 0)
    
    // Clear after reading to prevent duplicate imports
    sessionStorage.removeItem('postProductionShots')
    console.log('✅ Successfully retrieved', data.shots?.length || 0, 'shots')
    
    return data.shots
  } catch (error) {
    console.error('❌ Error parsing transferred shots:', error)
    return null
  }
}

/**
 * Check if there are shots waiting to be transferred
 */
export function hasTransferredShots(): boolean {
  return sessionStorage.getItem('postProductionShots') !== null
}