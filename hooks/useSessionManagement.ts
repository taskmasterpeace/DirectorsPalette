import { useEffect, useCallback } from 'react'
import { useAppStore } from '@/stores/app-store'
import { useStoryStore } from '@/stores/story-store'
import { useMusicVideoStore } from '@/stores/music-video-store'

const SESSION_KEY = 'dsvb:session:v3'
const SESSION_VERSION = 3

interface SessionData {
  version: number
  mode: 'story' | 'music-video'
  story?: {
    text: string
    directorNotes: string
    selectedDirector: any
    breakdown: any
    additionalShots: any
  }
  musicVideo?: {
    lyrics: string
    songTitle: string
    artist: string
    genre: string
    concept: string
    directorNotes: string
    selectedDirector: any
    breakdown: any
    config: any
    additionalShots: any
  }
  timestamp: number
}

export function useSessionManagement() {
  const { mode } = useAppStore()
  const storyStore = useStoryStore()
  const musicVideoStore = useMusicVideoStore()

  const saveSessionState = useCallback(() => {
    try {
      const sessionData: SessionData = {
        version: SESSION_VERSION,
        mode,
        timestamp: Date.now()
      }

      if (mode === 'story') {
        sessionData.story = {
          text: storyStore.story,
          directorNotes: storyStore.storyDirectorNotes,
          selectedDirector: storyStore.selectedDirector,
          breakdown: storyStore.breakdown,
          additionalShots: storyStore.additionalShots
        }
      } else {
        sessionData.musicVideo = {
          lyrics: musicVideoStore.lyrics,
          songTitle: musicVideoStore.songTitle,
          artist: musicVideoStore.artist,
          genre: musicVideoStore.genre,
          concept: musicVideoStore.mvConcept,
          directorNotes: musicVideoStore.mvDirectorNotes,
          selectedDirector: musicVideoStore.selectedMusicVideoDirector,
          breakdown: musicVideoStore.musicVideoBreakdown,
          config: musicVideoStore.musicVideoConfig,
          additionalShots: musicVideoStore.additionalMusicVideoShots
        }
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }, [mode, storyStore, musicVideoStore])

  const loadSessionState = useCallback(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (!stored) return

      const session = JSON.parse(stored) as SessionData
      if (session.version !== SESSION_VERSION) {
        localStorage.removeItem(SESSION_KEY)
        return
      }

      // Restore mode
      useAppStore.getState().setMode(session.mode)

      // Get store instances directly to avoid dependency issues
      const storyStoreState = useStoryStore.getState()
      const musicVideoStoreState = useMusicVideoStore.getState()

      // Restore story data
      if (session.story) {
        storyStoreState.setStory(session.story.text || '')
        storyStoreState.setStoryDirectorNotes(session.story.directorNotes || '')
        storyStoreState.setSelectedDirector(session.story.selectedDirector)
        storyStoreState.setBreakdown(session.story.breakdown)
        if (session.story.additionalShots) {
          Object.entries(session.story.additionalShots).forEach(([chapterId, shots]) => {
            storyStoreState.setAdditionalShots(chapterId, shots as any)
          })
        }
      }

      // Restore music video data
      if (session.musicVideo) {
        musicVideoStoreState.setLyrics(session.musicVideo.lyrics || '')
        musicVideoStoreState.setSongTitle(session.musicVideo.songTitle || '')
        musicVideoStoreState.setArtist(session.musicVideo.artist || '')
        musicVideoStoreState.setGenre(session.musicVideo.genre || '')
        musicVideoStoreState.setMvConcept(session.musicVideo.concept || '')
        musicVideoStoreState.setMvDirectorNotes(session.musicVideo.directorNotes || '')
        musicVideoStoreState.setSelectedMusicVideoDirector(session.musicVideo.selectedDirector)
        musicVideoStoreState.setMusicVideoBreakdown(session.musicVideo.breakdown)
        musicVideoStoreState.setMusicVideoConfig(session.musicVideo.config)
        if (session.musicVideo.additionalShots) {
          Object.entries(session.musicVideo.additionalShots).forEach(([sectionId, shots]) => {
            musicVideoStoreState.setAdditionalMusicVideoShots(sectionId, shots as any)
          })
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error)
      localStorage.removeItem(SESSION_KEY)
    }
  }, []) // Empty dependencies since we use getState()

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    storyStore.resetStoryState()
    // Reset music video state
    musicVideoStore.setLyrics('')
    musicVideoStore.setSongTitle('')
    musicVideoStore.setArtist('')
    musicVideoStore.setGenre('')
    musicVideoStore.setMvConcept('')
    musicVideoStore.setMvDirectorNotes('')
    musicVideoStore.setSelectedMusicVideoDirector(null)
    musicVideoStore.setMusicVideoBreakdown(null)
    musicVideoStore.setMusicVideoConfig(null)
    musicVideoStore.setAdditionalMusicVideoShots('', [])
    musicVideoStore.setExpandedSections([])
  }, [storyStore, musicVideoStore])

  // Auto-save on changes
  useEffect(() => {
    const interval = setInterval(saveSessionState, 5000) // Save every 5 seconds
    return () => clearInterval(interval)
  }, [saveSessionState])

  // Load on mount - only once
  useEffect(() => {
    loadSessionState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally empty to run only once on mount

  return {
    saveSessionState,
    loadSessionState,
    clearSession
  }
}