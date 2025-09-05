/**
 * Utility functions for exporting songs between Song DNA and Music Video systems
 */

import type { GeneratedSong, SongDNA } from './song-dna-types'

export interface ExportedSongData {
  songTitle: string
  artist: string
  lyrics: string
  genre?: string
  mvConcept?: string
  metadata?: {
    theme?: string
    mood?: string
    bpm?: number
    key?: string
    generatedAt?: string
    sourceDNA?: string
  }
}

/**
 * Format a generated song for export to Music Video generator
 */
export function formatSongForMusicVideo(song: GeneratedSong, originalDNA?: SongDNA): ExportedSongData {
  // Extract artist from attribution or metadata
  const artist = song.artist_attribution || 
                 originalDNA?.reference_song?.artist || 
                 'AI Generated'
  
  // Build concept from available data
  let mvConcept = ''
  if (song.theme) {
    mvConcept += `Theme: ${song.theme}\n`
  }
  if (song.emotional_tone) {
    mvConcept += `Mood: ${song.emotional_tone}\n`
  }
  if (originalDNA?.emotional?.primary_emotion) {
    mvConcept += `Emotional Core: ${originalDNA.emotional.primary_emotion}\n`
  }
  if (originalDNA?.lyrical?.themes?.length) {
    mvConcept += `Topics: ${originalDNA.lyrical.themes.join(', ')}\n`
  }
  
  return {
    songTitle: song.title || 'Untitled Song',
    artist,
    lyrics: formatLyricsForExport(song.lyrics),
    genre: song.genre || originalDNA?.genre_tags?.join(', '),
    mvConcept: mvConcept.trim(),
    metadata: {
      theme: song.theme,
      mood: song.emotional_tone,
      bpm: song.estimated_bpm,
      key: song.suggested_key,
      generatedAt: song.metadata?.timestamp,
      sourceDNA: originalDNA?.id
    }
  }
}

/**
 * Format lyrics to ensure proper structure for music video
 */
function formatLyricsForExport(lyrics: string): string {
  // Ensure section markers are properly formatted
  let formatted = lyrics
  
  // Add section markers if they're missing
  if (!formatted.includes('[')) {
    // Try to detect verses and choruses based on repetition
    const lines = formatted.split('\n').filter(l => l.trim())
    const sections: string[] = []
    let currentSection: string[] = []
    let sectionCount = 0
    
    for (let i = 0; i < lines.length; i++) {
      currentSection.push(lines[i])
      
      // Start new section every 4-8 lines
      if (currentSection.length >= 4 && (i === lines.length - 1 || currentSection.length >= 8)) {
        const isChorus = sectionCount % 3 === 1 // Every 3rd section is chorus
        const sectionType = isChorus ? 'Chorus' : `Verse ${Math.floor(sectionCount / 3) + 1}`
        sections.push(`[${sectionType}]\n${currentSection.join('\n')}`)
        currentSection = []
        sectionCount++
      }
    }
    
    formatted = sections.join('\n\n')
  }
  
  return formatted
}

/**
 * Store song data for export
 */
export function storeSongForExport(songData: ExportedSongData): void {
  // Store in sessionStorage for cross-page transfer
  sessionStorage.setItem('exportedSong', JSON.stringify({
    ...songData,
    exportedAt: new Date().toISOString(),
    source: 'song-dna-replicator'
  }))
}

/**
 * Retrieve exported song data
 */
export function getExportedSong(): ExportedSongData | null {
  const stored = sessionStorage.getItem('exportedSong')
  if (!stored) return null
  
  try {
    const data = JSON.parse(stored)
    // Clear after reading to prevent duplicate imports
    sessionStorage.removeItem('exportedSong')
    return data
  } catch (error) {
    console.error('Error parsing exported song:', error)
    return null
  }
}

/**
 * Check if there's an exported song waiting
 */
export function hasExportedSong(): boolean {
  return sessionStorage.getItem('exportedSong') !== null
}

/**
 * Format song DNA analysis for music video notes
 */
export function formatDNAInsights(dna: SongDNA): string {
  const insights: string[] = []
  
  // Add structural insights
  if (dna.structure?.pattern?.length) {
    insights.push(`Structure: ${dna.structure.pattern.join('-')}`)
  }
  
  // Add flow insights
  if (dna.lyrical?.syllables_per_line?.average) {
    const flowType = dna.lyrical.syllables_per_line.average > 10 ? 'Dense/Rapid' : 
                     dna.lyrical.syllables_per_line.average > 7 ? 'Moderate' : 'Sparse'
    insights.push(`Flow Type: ${flowType} (${dna.lyrical.syllables_per_line.average.toFixed(1)} syllables/line)`)
  }
  
  // Add rhyme complexity
  if (dna.lyrical?.rhyme_schemes) {
    const schemes = Object.values(dna.lyrical.rhyme_schemes)
    const complexity = schemes.some(s => s && s.length > 4) ? 'Complex' : 'Simple'
    insights.push(`Rhyme Complexity: ${complexity}`)
  }
  
  // Add emotional arc
  if (dna.emotional?.primary_emotion) {
    insights.push(`Primary Emotion: ${dna.emotional.primary_emotion}`)
  }
  
  // Add signature elements
  if (dna.lyrical?.signature_words?.length) {
    insights.push(`Key Words: ${dna.lyrical.signature_words.slice(0, 5).join(', ')}`)
  }
  
  return insights.join('\n')
}