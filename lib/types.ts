export interface Chapter {
  id: string
  title: string
  content: string
  startPosition: number
  endPosition: number
  estimatedDuration: string
  keyCharacters: string[]
  primaryLocation: string
  narrativeBeat: 'setup' | 'rising-action' | 'climax' | 'resolution'
}

export interface StoryStructure {
  chapters: Chapter[]
  detectionMethod: 'existing' | 'ai-generated' | 'hybrid'
  totalChapters: number
  fullStory: string
}

export interface TitleCard {
  id: string
  styleLabel: string
  description: string
}

export interface ChapterBreakdown {
  chapterId: string
  characterReferences: string[]
  locationReferences: string[]
  propReferences: string[]
  shots: string[]
  coverageAnalysis: string
  additionalOpportunities: string[]
  titleCards?: TitleCard[]
}

export interface BreakdownResult {
  storyStructure?: StoryStructure
  chapterBreakdowns?: ChapterBreakdown[]
  overallAnalysis?: string
  // These were likely for a flatter structure, keeping them for compatibility if needed
  characterReferences: string[]
  locationReferences: string[]
  propReferences: string[]
}
