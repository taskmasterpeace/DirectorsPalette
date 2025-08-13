import { NextRequest, NextResponse } from 'next/server'
import { extractStoryReferences, generateStoryBreakdownWithReferences } from '@/app/actions/story'
import { extractMusicVideoReferences, generateMusicVideoBreakdownWithReferences } from '@/app/actions/music-video'

export async function GET(request: NextRequest) {
  const tests = []

  // Test 1: Story Mode Export Fix
  try {
    if (typeof extractStoryReferences === 'function') {
      tests.push({ test: 'extractStoryReferences export', status: 'PASS' })
    } else {
      tests.push({ test: 'extractStoryReferences export', status: 'FAIL', error: 'Not a function' })
    }
    
    if (typeof generateStoryBreakdownWithReferences === 'function') {
      tests.push({ test: 'generateStoryBreakdownWithReferences export', status: 'PASS' })
    } else {
      tests.push({ test: 'generateStoryBreakdownWithReferences export', status: 'FAIL', error: 'Not a function' })
    }
  } catch (error) {
    tests.push({ test: 'Story mode exports', status: 'FAIL', error: error instanceof Error ? error.message : 'Unknown error' })
  }

  // Test 2: Music Video Mode Export Fix
  try {
    if (typeof extractMusicVideoReferences === 'function') {
      tests.push({ test: 'extractMusicVideoReferences export', status: 'PASS' })
    } else {
      tests.push({ test: 'extractMusicVideoReferences export', status: 'FAIL', error: 'Not a function' })
    }
    
    if (typeof generateMusicVideoBreakdownWithReferences === 'function') {
      tests.push({ test: 'generateMusicVideoBreakdownWithReferences export', status: 'PASS' })
    } else {
      tests.push({ test: 'generateMusicVideoBreakdownWithReferences export', status: 'FAIL', error: 'Not a function' })
    }
  } catch (error) {
    tests.push({ test: 'Music video mode exports', status: 'FAIL', error: error instanceof Error ? error.message : 'Unknown error' })
  }

  // Test 3: API functionality (if API key available)
  if (process.env.OPENAI_API_KEY) {
    try {
      const testStory = "John walked into the dark warehouse. Sarah was waiting for him with a flashlight."
      const result = await extractStoryReferences(testStory, "nolan", "Make it suspenseful")
      
      if (result.success) {
        tests.push({ 
          test: 'Story reference extraction', 
          status: 'PASS',
          details: `Found ${result.data.characters.length} characters, ${result.data.locations.length} locations, ${result.data.props.length} props`
        })
      } else {
        tests.push({ test: 'Story reference extraction', status: 'FAIL', error: result.error })
      }
    } catch (error) {
      tests.push({ test: 'Story reference extraction', status: 'FAIL', error: error instanceof Error ? error.message : 'Unknown error' })
    }

    try {
      const result = await extractMusicVideoReferences(
        "Test Song",
        "Test Artist", 
        "Walking down the street, feeling the beat, dancing in the night",
        "spike-jonze",
        "Make it surreal and creative"
      )
      
      if (result.success) {
        tests.push({ 
          test: 'Music video reference extraction', 
          status: 'PASS',
          details: `Found ${result.data.locations?.length || 0} locations, ${result.data.wardrobe?.length || 0} wardrobe, ${result.data.props?.length || 0} props`
        })
      } else {
        tests.push({ test: 'Music video reference extraction', status: 'FAIL', error: result.error })
      }
    } catch (error) {
      tests.push({ test: 'Music video reference extraction', status: 'FAIL', error: error instanceof Error ? error.message : 'Unknown error' })
    }
  } else {
    tests.push({ test: 'API tests', status: 'SKIP', error: 'No OPENAI_API_KEY found' })
  }

  const summary = {
    total: tests.length,
    passed: tests.filter(t => t.status === 'PASS').length,
    failed: tests.filter(t => t.status === 'FAIL').length,
    skipped: tests.filter(t => t.status === 'SKIP').length,
  }

  return NextResponse.json({
    summary,
    tests,
    timestamp: new Date().toISOString()
  })
}