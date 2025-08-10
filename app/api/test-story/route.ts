/**
 * Test API route to verify story generation is working
 */
import { NextResponse } from 'next/server'
import { StoryService } from '@/services'

export async function GET() {
  try {
    // Test basic service functionality
    const testStory = "Once upon a time, in a small village, there lived a young girl named Alice who discovered a magical door in her grandmother's attic."
    
    // Test with minimal parameters
    const result = await StoryService.generateBreakdown(
      testStory,
      'Christopher Nolan', // Use a known director
      {
        enabled: false,
        format: 'full' as const,
        approaches: []
      },
      [], // empty custom directors array
      {
        includeCameraStyle: true,
        includeColorPalette: true
      },
      '' // no director notes
    )
    
    return NextResponse.json({
      success: true,
      message: 'Story generation is working!',
      result: {
        storyStructure: result.storyStructure,
        chaptersCount: result.chapterBreakdowns?.length || 0,
        firstChapterTitle: result.chapterBreakdowns?.[0]?.chapterId || 'N/A'
      }
    })
    
  } catch (error) {
    console.error('Story generation test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}