import { describe, it, expect, beforeEach } from 'vitest'
import { useMusicVideoStore } from '@/stores/music-video-store'

describe('Music Video Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useMusicVideoStore.setState({
      songTitle: '',
      artist: '',
      genre: '',
      lyrics: '',
      mvConcept: '',
      mvDirectorNotes: '',
      selectedArtistId: null,
      selectedArtistProfile: null,
      selectedMusicVideoDirector: '',
      musicVideoConfig: null,
      showMusicVideoConfig: false,
      musicVideoBreakdown: null,
      additionalMusicVideoShots: {},
      expandedSections: {}
    })
  })

  describe('Basic Fields', () => {
    it('should update song title', () => {
      const store = useMusicVideoStore.getState()
      store.setSongTitle('Test Song')
      
      expect(useMusicVideoStore.getState().songTitle).toBe('Test Song')
    })

    it('should update artist', () => {
      const store = useMusicVideoStore.getState()
      store.setArtist('Test Artist')
      
      expect(useMusicVideoStore.getState().artist).toBe('Test Artist')
    })

    it('should update lyrics', () => {
      const store = useMusicVideoStore.getState()
      const lyrics = 'Verse 1: Test lyrics'
      store.setLyrics(lyrics)
      
      expect(useMusicVideoStore.getState().lyrics).toBe(lyrics)
    })
  })

  describe('Director Management', () => {
    it('should set selected director', () => {
      const store = useMusicVideoStore.getState()
      store.setSelectedMusicVideoDirector('spike-jonze')
      
      expect(useMusicVideoStore.getState().selectedMusicVideoDirector).toBe('spike-jonze')
    })

    it('should update director notes', () => {
      const store = useMusicVideoStore.getState()
      const notes = 'Focus on surreal elements'
      store.setMvDirectorNotes(notes)
      
      expect(useMusicVideoStore.getState().mvDirectorNotes).toBe(notes)
    })
  })

  describe('Breakdown Management', () => {
    it('should set music video breakdown', () => {
      const mockBreakdown = {
        musicVideoStructure: {
          songTitle: 'Test',
          artist: 'Artist',
          genre: 'Pop',
          totalSections: 4,
          sections: [],
          detectionMethod: 'ai-generated' as const
        },
        treatments: [],
        sectionBreakdowns: []
      }
      
      const store = useMusicVideoStore.getState()
      store.setMusicVideoBreakdown(mockBreakdown)
      
      expect(useMusicVideoStore.getState().musicVideoBreakdown).toEqual(mockBreakdown)
    })

    it('should clear breakdown when set to null', () => {
      const store = useMusicVideoStore.getState()
      store.setMusicVideoBreakdown({ /* mock data */ })
      store.setMusicVideoBreakdown(null)
      
      expect(useMusicVideoStore.getState().musicVideoBreakdown).toBeNull()
    })
  })

  describe('Configuration', () => {
    it('should set music video config', () => {
      const mockConfig = {
        isConfigured: true,
        locations: [],
        wardrobe: [],
        props: [],
        visualThemes: ['neon', 'urban']
      }
      
      const store = useMusicVideoStore.getState()
      store.setMusicVideoConfig(mockConfig)
      
      expect(useMusicVideoStore.getState().musicVideoConfig).toEqual(mockConfig)
    })

    it('should toggle config visibility', () => {
      const store = useMusicVideoStore.getState()
      store.setShowMusicVideoConfig(true)
      expect(useMusicVideoStore.getState().showMusicVideoConfig).toBe(true)
      
      store.setShowMusicVideoConfig(false)
      expect(useMusicVideoStore.getState().showMusicVideoConfig).toBe(false)
    })
  })

  describe('Additional Shots', () => {
    it('should add additional shots for a section', () => {
      const store = useMusicVideoStore.getState()
      const sectionId = 'verse-1'
      const shots = ['Shot 1', 'Shot 2']
      
      store.setAdditionalMusicVideoShots(sectionId, shots)
      
      expect(useMusicVideoStore.getState().additionalMusicVideoShots[sectionId]).toEqual(shots)
    })

    it('should clear additional shots when empty section id provided', () => {
      const store = useMusicVideoStore.getState()
      store.setAdditionalMusicVideoShots('verse-1', ['Shot 1'])
      store.setAdditionalMusicVideoShots('', [])
      
      // Should clear or not affect when empty id
      const shots = useMusicVideoStore.getState().additionalMusicVideoShots
      expect(shots['']).toEqual([])
    })
  })

  describe('Section Expansion', () => {
    it('should manage expanded sections', () => {
      const store = useMusicVideoStore.getState()
      const sections = { 'verse-1': true, 'chorus-1': false }
      
      store.setExpandedSections(sections)
      
      expect(useMusicVideoStore.getState().expandedSections).toEqual(sections)
    })
  })
})