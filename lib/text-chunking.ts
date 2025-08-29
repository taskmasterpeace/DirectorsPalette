// Smart Text Chunking Algorithm for Shot Generation
// Analyzes text for natural break points and generates shot boundaries

export interface TextBoundary {
  position: number // Character position in text
  score: number // Confidence score (0-10)
  type: 'sentence' | 'paragraph' | 'dialogue' | 'scene_change' | 'time_transition'
  reason: string // Human-readable explanation
}

export interface ShotChunk {
  id: string
  text: string
  startPos: number
  endPos: number
  boundaryScore: number
  suggestedScene?: string
}

export interface ChunkingOptions {
  targetShotCount: number
  minWordsPerShot?: number
  maxWordsPerShot?: number
  preferNaturalBreaks?: boolean
  contentType?: 'story' | 'lyrics' | 'children_book' | 'commercial'
  parsingMode?: 'punctuation' | 'lines' | 'hybrid'
}

export class TextChunker {
  private text: string = ''
  private sentences: string[] = []
  private boundaries: TextBoundary[] = []
  private parsingMode: 'punctuation' | 'lines' | 'hybrid' = 'hybrid'

  constructor(text: string, parsingMode: 'punctuation' | 'lines' | 'hybrid' = 'hybrid') {
    this.text = text.trim()
    this.parsingMode = parsingMode
    this.analyzeSentences()
    this.findBoundaries()
  }

  private analyzeSentences(): void {
    // Split into sentences, preserving structure and word boundaries
    this.sentences = this.text
      .split(/(?<=[.!?])\s+(?=[A-Z])/) // Only split at sentence boundaries followed by capital letters
      .filter(s => s.trim().length > 0)
  }

  private findBoundaries(): void {
    this.boundaries = []
    
    if (this.parsingMode === 'lines') {
      // Line-based parsing only
      this.findLineBoundaries()
    } else if (this.parsingMode === 'punctuation') {
      // Punctuation-based parsing only  
      this.findPunctuationBoundaries()
    } else {
      // Hybrid mode - combine line and punctuation boundaries
      this.findLineBoundaries()
      this.findPunctuationBoundaries()
      // Remove duplicates and sort by position
      this.boundaries = this.boundaries
        .filter((boundary, index, arr) => 
          arr.findIndex(b => Math.abs(b.position - boundary.position) < 5) === index
        )
        .sort((a, b) => a.position - b.position)
    }
  }

  private findLineBoundaries(): void {
    const lines = this.text.split('\n')
    let position = 0
    
    for (let i = 0; i < lines.length - 1; i++) {
      position += lines[i].length
      
      // Skip empty lines and section markers like [INTRO], [VERSE 1]
      const currentLine = lines[i].trim()
      const nextLine = lines[i + 1].trim()
      
      if (currentLine.length === 0 || nextLine.length === 0) {
        position += 1 // Account for newline character
        continue
      }
      
      // Skip section markers like [INTRO], [VERSE 1], [HOOK]
      if (currentLine.match(/^\[.*\]$/) || nextLine.match(/^\[.*\]$/)) {
        position += 1
        continue
      }
      
      const boundary: TextBoundary = {
        position: position,
        score: this.calculateLineScore(currentLine, nextLine, i),
        type: 'sentence',
        reason: this.getLineReason(currentLine, nextLine)
      }

      this.boundaries.push(boundary)
      position += 1 // Account for newline character
    }
  }

  private findPunctuationBoundaries(): void {
    // Find all punctuation marks as potential boundaries
    const punctuationRegex = /[.!?,;:](?=\s)/g
    let match
    
    while ((match = punctuationRegex.exec(this.text)) !== null) {
      const position = match.index + 1 // Position after punctuation
      
      // Get surrounding context for scoring
      const beforeText = this.text.slice(Math.max(0, position - 100), position).trim()
      const afterText = this.text.slice(position, position + 100).trim()
      
      // Skip if this would create empty chunks
      if (beforeText.length === 0 || afterText.length === 0) continue
      
      // Skip scene markers like [INTRO], [VERSE 1] in scripts
      if (beforeText.match(/\[.*\]$/) || afterText.match(/^\[.*\]/)) continue
      
      const boundary: TextBoundary = {
        position: position,
        score: this.calculatePunctuationScore(match[0], beforeText, afterText),
        type: this.getPunctuationType(match[0]),
        reason: this.getPunctuationReason(match[0], afterText)
      }

      this.boundaries.push(boundary)
    }
  }

  // Score punctuation marks for shot boundaries
  private calculatePunctuationScore(punctuation: string, beforeText: string, afterText: string): number {
    let score = 2 // Base score for punctuation
    
    // Periods get highest priority
    if (punctuation === '.') score += 3
    
    // Exclamation and question marks are also high priority  
    if (punctuation === '!' || punctuation === '?') score += 2
    
    // Commas are good for granular control
    if (punctuation === ',') score += 1
    
    // Semicolons and colons indicate strong breaks
    if (punctuation === ';' || punctuation === ':') score += 2
    
    // Boost for dialogue transitions
    if (beforeText.includes('"') !== afterText.includes('"')) {
      score += 2
    }
    
    // Boost for paragraph breaks
    if (afterText.startsWith('\n') || beforeText.endsWith('\n\n')) {
      score += 3
    }
    
    // Boost for character/scene introductions
    if (this.hasIntroductionPattern(afterText)) {
      score += 1
    }
    
    return Math.min(10, score)
  }

  // Line-based scoring for lyrics and structured content
  private calculateLineScore(currentLine: string, nextLine: string, index: number): number {
    let score = 4 // Base score for line break
    
    // Boost for rhyme patterns (common in rap)
    if (this.linesRhyme(currentLine, nextLine)) {
      score += 1
    }
    
    // Boost for emotional transitions
    if (this.hasEmotionalTransition(currentLine, nextLine)) {
      score += 2
    }
    
    // Boost for section transitions (verse to chorus, etc.)
    if (this.hasSectionTransition(currentLine, nextLine)) {
      score += 3
    }
    
    return Math.min(10, score)
  }
  
  private getLineReason(currentLine: string, nextLine: string): string {
    if (this.hasSectionTransition(currentLine, nextLine)) {
      return 'Section transition - natural break'
    }
    if (this.hasEmotionalTransition(currentLine, nextLine)) {
      return 'Emotional shift - good shot boundary'
    }
    if (this.linesRhyme(currentLine, nextLine)) {
      return 'Rhyme pattern - lyrical structure'
    }
    return 'Line break - structural boundary'
  }
  
  private linesRhyme(line1: string, line2: string): boolean {
    // Simple rhyme detection - check if last words sound similar
    const words1 = line1.trim().split(' ')
    const words2 = line2.trim().split(' ')
    
    if (words1.length === 0 || words2.length === 0) return false
    
    const lastWord1 = words1[words1.length - 1].toLowerCase().replace(/[^a-z]/g, '')
    const lastWord2 = words2[words2.length - 1].toLowerCase().replace(/[^a-z]/g, '')
    
    // Check for common rhyme patterns (ending sounds)
    if (lastWord1.length < 2 || lastWord2.length < 2) return false
    
    const ending1 = lastWord1.slice(-2)
    const ending2 = lastWord2.slice(-2)
    
    return ending1 === ending2
  }
  
  private hasEmotionalTransition(currentLine: string, nextLine: string): boolean {
    const emotionalWords = ['love', 'hate', 'fear', 'joy', 'pain', 'hope', 'dream', 'nightmare']
    
    const currentHasEmotion = emotionalWords.some(word => currentLine.toLowerCase().includes(word))
    const nextHasEmotion = emotionalWords.some(word => nextLine.toLowerCase().includes(word))
    
    return currentHasEmotion !== nextHasEmotion
  }
  
  private hasSectionTransition(currentLine: string, nextLine: string): boolean {
    const sectionMarkers = ['intro', 'verse', 'chorus', 'hook', 'bridge', 'outro']
    
    return sectionMarkers.some(marker => 
      currentLine.toLowerCase().includes(`[${marker}`) || 
      nextLine.toLowerCase().includes(`[${marker}`)
    )
  }
  
  private getPunctuationType(punctuation: string): TextBoundary['type'] {
    switch (punctuation) {
      case '.':
      case '!':
      case '?':
        return 'sentence'
      case ',':
        return 'scene_change'
      case ';':
      case ':':
        return 'dialogue'
      default:
        return 'sentence'
    }
  }
  
  private getPunctuationReason(punctuation: string, afterText: string): string {
    switch (punctuation) {
      case '.':
        return 'Sentence end - natural shot boundary'
      case '!':
        return 'Exclamation - emotional peak'
      case '?':
        return 'Question - dialogue moment'
      case ',':
        return 'Comma pause - granular control point'
      case ';':
        return 'Semicolon - strong narrative break'
      case ':':
        return 'Colon - setup/payoff transition'
      default:
        return 'Punctuation boundary'
    }
  }

  private calculateBoundaryScore(current: string, next: string, index: number): number {
    let score = 3 // Base score for sentence boundary

    // Paragraph breaks (double newlines) - highest priority
    if (current.includes('\n\n') || next.startsWith('\n')) {
      score += 4
    }

    // Dialogue transitions
    if (this.isDialogue(current) !== this.isDialogue(next)) {
      score += 2
    }

    // Scene/time transitions
    if (this.hasTransitionWords(next)) {
      score += 3
    }

    // Character/location introductions
    if (this.hasIntroductionPattern(next)) {
      score += 2
    }

    // Emotional/action peaks
    if (this.hasActionWords(current) || this.hasEmotionalWords(current)) {
      score += 1
    }

    // Penalize very short segments
    if (current.split(' ').length < 5) {
      score -= 2
    }

    // Boost for story structure positions
    const totalSentences = this.sentences.length
    const position = index / totalSentences
    if (position < 0.1 || position > 0.9) { // Beginning/end
      score += 1
    } else if (position > 0.4 && position < 0.6) { // Middle climax
      score += 2
    }

    return Math.max(1, Math.min(10, score))
  }

  private getBoundaryType(current: string, next: string): TextBoundary['type'] {
    if (current.includes('\n\n') || next.startsWith('\n')) return 'paragraph'
    if (this.isDialogue(current) !== this.isDialogue(next)) return 'dialogue'
    if (this.hasTransitionWords(next)) return 'time_transition'
    if (this.hasIntroductionPattern(next)) return 'scene_change'
    return 'sentence'
  }

  private getBoundaryReason(current: string, next: string): string {
    if (current.includes('\n\n')) return 'Paragraph break - natural story division'
    if (this.hasTransitionWords(next)) return 'Time/scene transition detected'
    if (this.isDialogue(current) && !this.isDialogue(next)) return 'End of dialogue section'
    if (!this.isDialogue(current) && this.isDialogue(next)) return 'Beginning of dialogue'
    if (this.hasIntroductionPattern(next)) return 'Character/location introduction'
    return 'Sentence boundary'
  }

  private isDialogue(sentence: string): boolean {
    return sentence.includes('"') || sentence.includes("'") || sentence.includes('"')
  }

  private hasTransitionWords(sentence: string): boolean {
    const transitions = [
      'meanwhile', 'later', 'suddenly', 'then', 'next', 'after', 'before',
      'once upon a time', 'the next day', 'hours later', 'meanwhile',
      'in the morning', 'that evening', 'afterwards'
    ]
    const lower = sentence.toLowerCase()
    return transitions.some(word => lower.includes(word))
  }

  private hasIntroductionPattern(sentence: string): boolean {
    const patterns = [
      /^(meet|this is|there was|there lived)/i,
      /^(at|in|on) (the|a) /i,
      /^[A-Z][a-z]+ (was|is|had)/
    ]
    return patterns.some(pattern => pattern.test(sentence.trim()))
  }

  private hasActionWords(sentence: string): boolean {
    const actionWords = ['ran', 'jumped', 'fought', 'discovered', 'found', 'opened', 'closed', 'grabbed']
    return actionWords.some(word => sentence.toLowerCase().includes(word))
  }

  private hasEmotionalWords(sentence: string): boolean {
    const emotionalWords = ['excited', 'scared', 'happy', 'sad', 'amazed', 'shocked', 'surprised']
    return emotionalWords.some(word => sentence.toLowerCase().includes(word))
  }

  // Main chunking method with proper word boundary preservation
  public generateChunks(options: ChunkingOptions): ShotChunk[] {
    const { targetShotCount, minWordsPerShot = 3, maxWordsPerShot = 200 } = options
    
    if (targetShotCount <= 1) {
      return [{
        id: 'shot_1',
        text: this.text.trim(),
        startPos: 0,
        endPos: this.text.length,
        boundaryScore: 10
      }]
    }

    // Sort boundaries by score (highest first)
    const sortedBoundaries = [...this.boundaries].sort((a, b) => b.score - a.score)
    
    // Select the best boundaries for our target shot count
    const selectedBoundaries = sortedBoundaries
      .slice(0, targetShotCount - 1)
      .sort((a, b) => a.position - b.position) // Re-sort by position

    // Generate chunks with proper word boundary handling
    const chunks: ShotChunk[] = []
    let lastPosition = 0

    selectedBoundaries.forEach((boundary, index) => {
      // Find the actual space after punctuation to avoid word cutting
      let actualPos = boundary.position
      while (actualPos < this.text.length && !/\s/.test(this.text[actualPos])) {
        actualPos++
      }
      // Skip whitespace to start next chunk at word boundary
      while (actualPos < this.text.length && /\s/.test(this.text[actualPos])) {
        actualPos++
      }
      
      const chunkText = this.text.slice(lastPosition, boundary.position).trim()
      
      if (chunkText.length > 0) {
        chunks.push({
          id: `shot_${index + 1}`,
          text: chunkText,
          startPos: lastPosition,
          endPos: boundary.position,
          boundaryScore: boundary.score
        })
      }
      
      lastPosition = actualPos
    })

    // Add final chunk
    const finalText = this.text.slice(lastPosition).trim()
    if (finalText.length > 0) {
      chunks.push({
        id: `shot_${chunks.length + 1}`,
        text: finalText,
        startPos: lastPosition,
        endPos: this.text.length,
        boundaryScore: 5 // Default score for final chunk
      })
    }

    return chunks.filter(chunk => chunk.text.length > 0)
  }

  // Get all possible boundaries with scores (for UI visualization)
  public getBoundaries(): TextBoundary[] {
    return this.boundaries
  }

  // Suggest optimal shot counts based on text analysis
  public suggestShotCounts(): { count: number; reason: string; confidence: number }[] {
    const wordCount = this.text.split(' ').length
    const paragraphCount = this.text.split('\n\n').length
    const highScoreBoundaries = this.boundaries.filter(b => b.score >= 7).length

    const suggestions = []

    // Conservative (fewer shots)
    if (paragraphCount >= 3) {
      suggestions.push({
        count: paragraphCount,
        reason: `Natural paragraph structure (${paragraphCount} paragraphs)`,
        confidence: 8
      })
    }

    // Moderate (based on high-confidence boundaries)
    if (highScoreBoundaries > 0) {
      suggestions.push({
        count: highScoreBoundaries + 1,
        reason: `Strong narrative breaks detected`,
        confidence: 7
      })
    }

    // Detailed (based on word density)
    const detailedCount = Math.ceil(wordCount / 25) // ~25 words per shot
    if (detailedCount !== paragraphCount && detailedCount <= 20) {
      suggestions.push({
        count: detailedCount,
        reason: `Detailed breakdown (~25 words per shot)`,
        confidence: 6
      })
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }
}

// Utility function for easy use
export function analyzeText(text: string): TextChunker {
  return new TextChunker(text)
}

// Content-specific presets
export const CONTENT_PRESETS: Record<string, Partial<ChunkingOptions>> = {
  children_book: {
    minWordsPerShot: 8,
    maxWordsPerShot: 50,
    preferNaturalBreaks: true
  },
  lyrics: {
    minWordsPerShot: 4,
    maxWordsPerShot: 20,
    preferNaturalBreaks: false
  },
  story: {
    minWordsPerShot: 15,
    maxWordsPerShot: 80,
    preferNaturalBreaks: true
  },
  commercial: {
    minWordsPerShot: 10,
    maxWordsPerShot: 40,
    preferNaturalBreaks: true
  }
}