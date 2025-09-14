/**
 * Migration Utility: IndexedDB to Supabase
 * Helps users migrate their existing data from IndexedDB to Supabase
 */

import { projectDB } from '@/lib/indexeddb'
import { supabaseService } from './supabase-service'
import type { SavedProject } from './supabase-service'

export interface MigrationResult {
  success: boolean
  message: string
  projectsMigrated: number
  errors: string[]
}

export class MigrationUtility {
  private errors: string[] = []

  async migrateAllData(): Promise<MigrationResult> {
    this.errors = []
    let projectsMigrated = 0

    try {
      // Check if running in browser
      if (typeof window === 'undefined') {
        return {
          success: false,
          message: 'Migration must be run in browser environment',
          projectsMigrated: 0,
          errors: ['Server-side execution not supported']
        }
      }

      console.log('Starting migration from IndexedDB to Supabase...')

      // Get all projects from IndexedDB
      const indexedDBProjects = await projectDB.getAllProjects()
      console.log(`Found ${indexedDBProjects.length} projects in IndexedDB`)

      if (indexedDBProjects.length === 0) {
        return {
          success: true,
          message: 'No projects found to migrate',
          projectsMigrated: 0,
          errors: []
        }
      }

      // Migrate each project
      for (const project of indexedDBProjects) {
        try {
          await this.migrateProject(project)
          projectsMigrated++
          console.log(`Migrated project: ${project.name}`)
        } catch (error) {
          const errorMsg = `Failed to migrate project "${project.name}": ${error}`
          this.errors.push(errorMsg)
          console.error(errorMsg)
        }
      }

      const success = this.errors.length === 0
      const message = success 
        ? `Successfully migrated ${projectsMigrated} projects`
        : `Migrated ${projectsMigrated}/${indexedDBProjects.length} projects with ${this.errors.length} errors`

      return {
        success,
        message,
        projectsMigrated,
        errors: this.errors
      }

    } catch (error) {
      const errorMsg = `Migration failed: ${error}`
      this.errors.push(errorMsg)
      console.error(errorMsg)

      return {
        success: false,
        message: errorMsg,
        projectsMigrated,
        errors: this.errors
      }
    }
  }

  private async migrateProject(project: any): Promise<void> {
    // Transform IndexedDB project to Supabase format
    const supabaseProject: Omit<SavedProject, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      name: project.name,
      type: this.mapProjectType(project),
      
      // Story mode data
      story: project.story,
      selected_director: project.selectedDirector,
      breakdown: project.breakdown,
      additional_shots: project.additionalShots,
      title_card_options: project.titleCardOptions,
      title_card_approaches: project.titleCardApproaches,
      selected_chapter: project.selectedChapter,
      expanded_chapters: project.expandedChapters,

      // Music video mode data
      music_video_data: project.musicVideoData,
      music_video_breakdown: project.musicVideoBreakdown,
      selected_treatment: project.selectedTreatment,
      selected_music_video_section: project.selectedMusicVideoSection,
      music_video_config: project.musicVideoConfig,
      additional_music_video_shots: project.additionalMusicVideoShots,
      selected_music_video_director: project.selectedMusicVideoDirector,
      custom_music_video_directors: project.customMusicVideoDirectors,

      // Shared data
      custom_directors: project.customDirectors,
      prompt_options: project.promptOptions,
      active_artist: project.activeArtist,
    }

    // Save to Supabase
    await supabaseService.saveProject(supabaseProject)
  }

  private mapProjectType(project: any): 'story' | 'music-video' | 'commercial' | 'children-book' {
    if (project.isMusicVideoMode) return 'music-video'
    if (project.type) return project.type
    return 'story' // default
  }

  async checkMigrationNeeded(): Promise<{
    needed: boolean
    indexedDBProjects: number
    supabaseProjects: number
  }> {
    try {
      // Check IndexedDB projects
      const indexedDBProjects = await projectDB.getAllProjects()
      
      // Check Supabase projects
      const supabaseProjects = await supabaseService.getAllProjects()

      return {
        needed: indexedDBProjects.length > 0 && supabaseProjects.length === 0,
        indexedDBProjects: indexedDBProjects.length,
        supabaseProjects: supabaseProjects.length
      }
    } catch (error) {
      console.error('Failed to check migration status:', error)
      return {
        needed: false,
        indexedDBProjects: 0,
        supabaseProjects: 0
      }
    }
  }

  async cleanupIndexedDB(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB cleanup must be run in browser')
    }

    try {
      // Get all projects before deletion
      const projects = await projectDB.getAllProjects()
      
      // Delete each project
      for (const project of projects) {
        await projectDB.deleteProject(project.id)
      }

      console.log(`Cleaned up ${projects.length} projects from IndexedDB`)
    } catch (error) {
      console.error('Failed to cleanup IndexedDB:', error)
      throw error
    }
  }
}

// Export singleton
export const migrationUtility = new MigrationUtility()