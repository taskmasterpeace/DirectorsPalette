"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { withRetry, ProgressSaver } from "@/lib/error-handling"

// ===== Schemas =====
const ChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  startPosition: z.number(),
  endPosition: z.number(),
  estimatedDuration: z.string(),
  keyCharacters: z.array(z.string()),
  primaryLocation: z.string(),
  narrativeBeat: z.enum(["setup", "rising-action", "climax", "resolution"]),
})

const StoryStructureSchema = z.object({
  chapters: z.array(ChapterSchema),
  detectionMethod: z.enum(["existing", "ai-generated", "hybrid"]),
  totalChapters: z.number(),
  fullStory: z.string(),
})

const TitleCardSchema = z.object({
  id: z.string(),
  styleLabel: z.string(),
  description: z.string(),
})

const ReferenceDescriptionSchema = z.object({
  name: z.string(),
  description: z.string(),
})

const ChapterBreakdownSchema = z.object({
  chapterId: z.string(),
  characterReferences: z.array(z.string()),
  locationReferences: z.array(z.string()),
  propReferences: z.array(z.string()),
  characterDescriptions: z.array(ReferenceDescriptionSchema).optional(),
  locationDescriptions: z.array(ReferenceDescriptionSchema).optional(),
  propDescriptions: z.array(ReferenceDescriptionSchema).optional(),
  shots: z.array(z.string()),
  coverageAnalysis: z.string(),
  additionalOpportunities: z.array(z.string()),
  titleCards: z.array(TitleCardSchema).optional(),
})

const BreakdownResultSchema = z.object({
  storyStructure: StoryStructureSchema,
  chapterBreakdowns: z.array(ChapterBreakdownSchema),
})

// ===== Helper Functions =====
function detectChapters(story: string, chapterMethod: string, userChapterCount?: number) {
  const lines = story.split('\n')
  const chapters: any[] = []
  
  if (chapterMethod === 'auto-detect') {
    // Logic for auto-detecting chapters from headings
    const chapterRegex = /^(Chapter\s+\d+|#+\s+.+|Part\s+\d+|Act\s+\d+|\d+\.|[IVX]+\.)/i
    let currentChapter: any = null
    let currentContent: string[] = []
    
    lines.forEach((line, index) => {
      if (chapterRegex.test(line.trim())) {
        if (currentChapter) {
          currentChapter.content = currentContent.join('\n').trim()
          currentChapter.endPosition = currentContent.length
          chapters.push(currentChapter)
        }
        currentChapter = {
          id: `chapter-${chapters.length + 1}`,
          title: line.trim(),
          startPosition: index,
          content: '',
        }
        currentContent = []
      } else if (currentChapter) {
        currentContent.push(line)
      }
    })
    
    if (currentChapter) {
      currentChapter.content = currentContent.join('\n').trim()
      currentChapter.endPosition = lines.length
      chapters.push(currentChapter)
    }
  }
  
  // Return null if no chapters detected or other methods selected
  return chapters.length > 0 ? chapters : null
}

// ===== Main Export =====
export async function generateStoryBreakdown(
  story: string,
  director: string = "",
  directorNotes: string = "",
  titleCardOptions?: {
    enabled: boolean
    format: "full" | "name-only" | "roman-numerals"
    approaches: string[]
  },
  promptOptions?: {
    includeCameraStyle: boolean
    includeColorPalette: boolean
  },
  chapterMethod: string = "ai-suggested",
  userChapterCount: number = 4
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  const progressSaver = new ProgressSaver(`story-${Date.now()}`)
  
  try {
    // Try to detect existing chapters
    const detectedChapters = detectChapters(story, chapterMethod, userChapterCount)
    
    // Check for saved progress
    let storyStructure = progressSaver.get('structure')
    
    if (!storyStructure) {
      // Generate story structure with retry
      const structurePrompt = `
Analyze this story and create a chapter structure.
${chapterMethod === 'user-specified' ? `Split into exactly ${userChapterCount} chapters.` : ''}
${chapterMethod === 'ai-suggested' ? 'Suggest 3-5 chapters based on natural story beats.' : ''}
${chapterMethod === 'single' ? 'Treat as a single chapter.' : ''}
${detectedChapters ? 'Use these detected chapters: ' + JSON.stringify(detectedChapters.map(c => c.title)) : ''}

IMPORTANT: Return a JSON object with this EXACT structure:
{
  "chapters": [
    {
      "id": "chapter-1" (or meaningful id),
      "title": "Chapter title",
      "content": "The actual content/text of this chapter from the story",
      "startPosition": 0 (character position in original story),
      "endPosition": 1000 (character position in original story),
      "estimatedDuration": "5 minutes" (reading time),
      "keyCharacters": ["character1", "character2"],
      "primaryLocation": "main location",
      "narrativeBeat": "setup" (must be one of: setup, rising-action, climax, resolution)
    }
  ],
  "detectionMethod": "${detectedChapters ? 'existing' : 'ai-generated'}",
  "totalChapters": (number of chapters),
  "fullStory": (the full story text)
}

Ensure each chapter's content field contains the ACTUAL TEXT from that portion of the story.
The startPosition and endPosition should indicate where each chapter begins and ends in the original story text.
`

      storyStructure = await withRetry(
        async () => {
          const { object } = await generateObject({
            model: openai("gpt-4o-mini"),
            schema: StoryStructureSchema,
            prompt: structurePrompt + `\n\nSTORY TO ANALYZE:\n"""\n${story}\n"""`,
            system: `You are analyzing a story for film adaptation. Create a precise chapter structure with all required fields.`,
          })
          return object
        },
        {
          maxRetries: 3,
          onRetry: (attempt, error) => {
            console.log(`Retry attempt ${attempt} for story structure:`, error.message)
          }
        }
      )
      
      // Save progress
      progressSaver.save('structure', storyStructure)
    }

    // Generate breakdown for each chapter
    const chapterBreakdowns = []
    
    // Check for saved chapter progress
    const savedChapters = progressSaver.get('chapters') || []
    
    for (let i = 0; i < storyStructure.chapters.length; i++) {
      const chapter = storyStructure.chapters[i]
      
      // Skip if already processed
      if (savedChapters[i]) {
        chapterBreakdowns.push(savedChapters[i])
        continue
      }
      const breakdownPrompt = `
Generate a shot list for this chapter of the story.

Director Style: ${director || 'cinematic'}
Director Notes (HIGHEST PRIORITY): ${directorNotes || 'None'}

Chapter: ${chapter.title}
Content: ${chapter.content}

IMPORTANT: Return a JSON object with this EXACT structure:
{
  "chapterId": "${chapter.id}",
  "characterReferences": [array of character names/IDs referenced in shots],
  "locationReferences": [array of location names/IDs referenced in shots],
  "propReferences": [array of prop names/IDs referenced in shots],
  "shots": [array of 8-12 shot descriptions as STRINGS, not objects],
  "coverageAnalysis": "analysis of shot coverage",
  "additionalOpportunities": [array of additional shot opportunities],
  "characterDescriptions": [{"name": "character name", "description": "how they appear"}],
  "locationDescriptions": [{"name": "location name", "description": "atmospheric details"}],
  "propDescriptions": [{"name": "prop name", "description": "visual significance"}]
  ${titleCardOptions?.enabled ? ',"titleCards": [{"id": "cardId", "styleLabel": "label", "description": "description"}]' : ''}
}

For the shots array, each element should be a single STRING describing the shot, including:
1. Shot type and framing
2. Character references (use @name format)
3. Location references (use @location format)  
4. Prop references (use @prop format)
5. ${promptOptions?.includeCameraStyle ? 'Camera movement details' : ''}
6. ${promptOptions?.includeColorPalette ? 'Color and lighting notes' : ''}

Example shot string: "Medium shot of @protagonist at @warehouse entrance, holding @briefcase. Slow dolly in as shadows fall across face. Cool blue tones with harsh backlighting."
`

      const breakdown = await withRetry(
        async () => {
          const { object } = await generateObject({
            model: openai("gpt-4o-mini"),
            schema: ChapterBreakdownSchema,
            prompt: breakdownPrompt,
            system: `You are a cinematographer creating a shot list in the style of ${director || 'a skilled filmmaker'}.`,
          })
          return object
        },
        {
          maxRetries: 3,
          onRetry: (attempt, error) => {
            console.log(`Retry attempt ${attempt} for chapter ${i + 1}:`, error.message)
          }
        }
      )
      
      chapterBreakdowns.push(breakdown)
      
      // Save progress after each chapter
      progressSaver.save('chapters', chapterBreakdowns)
    }

    // Clear progress on successful completion
    progressSaver.clear()
    
    return {
      success: true,
      data: {
        storyStructure,
        chapterBreakdowns,
        chapters: storyStructure.chapters,
        generatedAt: new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error('Error generating breakdown:', error)
    
    // Check if we have partial progress
    const savedStructure = progressSaver.get('structure')
    const savedChapters = progressSaver.get('chapters')
    
    if (savedStructure && savedChapters && savedChapters.length > 0) {
      console.log('Returning partial progress:', savedChapters.length, 'chapters')
      return {
        success: true,
        partial: true,
        data: {
          storyStructure: savedStructure,
          chapterBreakdowns: savedChapters,
          chapters: savedStructure.chapters,
          generatedAt: new Date().toISOString(),
        }
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate breakdown'
    }
  }
}
