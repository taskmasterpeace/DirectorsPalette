/**
 * Database Hook
 * Unified interface for all database operations using Supabase
 * Replaces direct IndexedDB calls throughout the app
 */

import { useState, useEffect } from 'react'
import { supabaseService } from '@/lib/database/supabase-service'
import { useAuth } from '@/components/auth/AuthProvider'
import type { 
  SavedProject,
  ArtistProfile,
  FilmDirector,
  MusicVideoDirector 
} from '@/lib/database/supabase-service'

export function useProjects() {
  const { isAuthenticated } = useAuth()
  const [projects, setProjects] = useState<SavedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects()
    } else {
      setProjects([])
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.getAllProjects()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const saveProject = async (projectData: Omit<SavedProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const id = await supabaseService.saveProject(projectData)
      await loadProjects() // Refresh list
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project')
      throw err
    }
  }

  const updateProject = async (projectId: string, updates: Partial<SavedProject>) => {
    try {
      await supabaseService.updateProject(projectId, updates)
      await loadProjects() // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
      throw err
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      await supabaseService.deleteProject(projectId)
      await loadProjects() // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
      throw err
    }
  }

  return {
    projects,
    loading,
    error,
    saveProject,
    updateProject,
    deleteProject,
    refresh: loadProjects
  }
}

export function useArtistProfiles() {
  const { isAuthenticated } = useAuth()
  const [artists, setArtists] = useState<ArtistProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadArtists()
    } else {
      setArtists([])
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadArtists = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.getArtistProfiles()
      setArtists(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artists')
      setArtists([])
    } finally {
      setLoading(false)
    }
  }

  const saveArtist = async (artistData: Omit<ArtistProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const id = await supabaseService.saveArtistProfile(artistData)
      await loadArtists() // Refresh list
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save artist')
      throw err
    }
  }

  const updateArtist = async (artistId: string, updates: Partial<ArtistProfile>) => {
    try {
      await supabaseService.updateArtistProfile(artistId, updates)
      await loadArtists() // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update artist')
      throw err
    }
  }

  const deleteArtist = async (artistId: string) => {
    try {
      await supabaseService.deleteArtistProfile(artistId)
      await loadArtists() // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete artist')
      throw err
    }
  }

  return {
    artists,
    loading,
    error,
    saveArtist,
    updateArtist,
    deleteArtist,
    refresh: loadArtists
  }
}

export function useFilmDirectors() {
  const { isAuthenticated } = useAuth()
  const [directors, setDirectors] = useState<FilmDirector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadDirectors()
    } else {
      setDirectors([])
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadDirectors = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.getFilmDirectors()
      setDirectors(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directors')
      setDirectors([])
    } finally {
      setLoading(false)
    }
  }

  const saveDirector = async (directorData: Omit<FilmDirector, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const id = await supabaseService.saveFilmDirector(directorData)
      await loadDirectors() // Refresh list
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save director')
      throw err
    }
  }

  return {
    directors,
    loading,
    error,
    saveDirector,
    refresh: loadDirectors
  }
}

export function useMusicVideoDirectors() {
  const { isAuthenticated } = useAuth()
  const [directors, setDirectors] = useState<MusicVideoDirector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadDirectors()
    } else {
      setDirectors([])
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadDirectors = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.getMusicVideoDirectors()
      setDirectors(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load music video directors')
      setDirectors([])
    } finally {
      setLoading(false)
    }
  }

  const saveDirector = async (directorData: Omit<MusicVideoDirector, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const id = await supabaseService.saveMusicVideoDirector(directorData)
      await loadDirectors() // Refresh list
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save music video director')
      throw err
    }
  }

  return {
    directors,
    loading,
    error,
    saveDirector,
    refresh: loadDirectors
  }
}

/**
 * Migration hook to help users migrate from IndexedDB
 */
export function useMigration() {
  const [migrationStatus, setMigrationStatus] = useState<{
    needed: boolean
    indexedDBProjects: number
    supabaseProjects: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkMigrationNeeded = async () => {
    try {
      setLoading(true)
      const { migrationUtility } = await import('@/lib/database/migration-utility')
      const status = await migrationUtility.checkMigrationNeeded()
      setMigrationStatus(status)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check migration status')
    } finally {
      setLoading(false)
    }
  }

  const runMigration = async () => {
    try {
      setLoading(true)
      const { migrationUtility } = await import('@/lib/database/migration-utility')
      const result = await migrationUtility.migrateAllData()
      
      if (!result.success) {
        setError(`Migration completed with errors: ${result.message}`)
      } else {
        setError(null)
      }

      // Refresh migration status
      await checkMigrationNeeded()
      
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Migration failed'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return {
    migrationStatus,
    loading,
    error,
    checkMigrationNeeded,
    runMigration
  }
}

/**
 * Unified database hook that provides all database operations
 */
export function useDatabase() {
  const projects = useProjects()
  const artists = useArtistProfiles()
  const filmDirectors = useFilmDirectors()
  const musicVideoDirectors = useMusicVideoDirectors()
  const migration = useMigration()

  const trackAIUsage = async (modelId: string, functionType: string, tokensUsed: number, costUsd: number, metadata?: any) => {
    try {
      await supabaseService.trackAIUsage(modelId, functionType, tokensUsed, costUsd, metadata)
    } catch (error) {
      console.error('Failed to track AI usage:', error)
      // Don't throw - AI tracking shouldn't break the app
    }
  }

  return {
    projects,
    artists,
    filmDirectors,
    musicVideoDirectors,
    migration,
    trackAIUsage
  }
}