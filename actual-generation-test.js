// AUTOMATED ACTUAL GENERATION TEST
// This will import and test the actual server action directly

import { generateBreakdown } from './app/actions-story.js'

const testStory = `Detective Martinez walked into the abandoned warehouse at midnight. The killer was waiting for her in the shadows, holding a red balloon. "You're too late," he whispered as the balloon floated up toward the broken skylight.

She drew her gun, but her hands were shaking. This was personal - the killer had taken her partner three months ago. The balloon reached the ceiling and popped, echoing through the empty space like a gunshot.

"Drop the weapon!" she shouted, but he was already running toward the back exit. She gave chase, her footsteps echoing on the concrete floor, determined to end this tonight.`

const allDirectors = [{
  id: 'christopher-nolan',
  name: 'Christopher Nolan', 
  description: 'Master of complex narratives and practical effects',
  visualLanguage: 'Bold compositions with practical effects',
  cameraStyle: 'Dramatic angles and precise movements', 
  colorPalette: 'Varied based on project needs',
  narrativeFocus: 'Complex storytelling with emotional depth'
}]

async function runTest() {
  console.log('🎬 RUNNING ACTUAL GENERATION TEST')
  console.log('=================================')
  console.log('Story length:', testStory.length, 'characters')
  console.log('Expected characters: Detective Martinez, killer')
  console.log('Expected locations: warehouse, shadows, skylight') 
  console.log('Expected props: red balloon, gun')
  console.log('')
  
  const startTime = Date.now()
  console.log('⏰ Starting generation at:', new Date().toISOString())
  
  try {
    const result = await generateBreakdown(
      testStory,
      'christopher-nolan',
      { enabled: false, format: 'full', approaches: [] },
      allDirectors,
      { includeCameraStyle: true, includeColorPalette: true },
      'Focus on dramatic lighting and close-up shots'
    )
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log('✅ GENERATION COMPLETED')
    console.log('Duration:', duration, 'seconds')
    console.log('')
    
    if (result.storyStructure && result.storyStructure.chapters) {
      console.log('📖 STORY STRUCTURE:')
      result.storyStructure.chapters.forEach((chapter, i) => {
        console.log(`Chapter ${i+1}: "${chapter.title}"`)
        console.log(`  Characters: ${chapter.keyCharacters?.join(', ') || 'None'}`)
        console.log(`  Location: ${chapter.primaryLocation || 'Unknown'}`)
        console.log(`  Content preview: ${chapter.content?.substring(0, 100)}...`)
      })
      console.log('')
    }
    
    if (result.chapterBreakdowns && result.chapterBreakdowns.length > 0) {
      console.log('🎥 FIRST CHAPTER SHOTS:')
      const firstBreakdown = result.chapterBreakdowns[0]
      if (firstBreakdown.shots) {
        firstBreakdown.shots.slice(0, 3).forEach((shot, i) => {
          console.log(`Shot ${i+1}: ${shot.substring(0, 120)}...`)
        })
      }
      console.log('')
    }
    
    // Check for success indicators
    const resultString = JSON.stringify(result).toLowerCase()
    const hasExpectedContent = ['martinez', 'warehouse', 'balloon'].some(term => 
      resultString.includes(term)
    )
    const hasUnexpectedContent = ['clean', 'sister', 'marcus'].some(term =>
      resultString.includes(term)
    )
    
    console.log('🔍 CONTENT ANALYSIS:')
    console.log('Contains expected content (Martinez/warehouse/balloon):', hasExpectedContent)
    console.log('Contains unexpected content (Clean/sister/Marcus):', hasUnexpectedContent)
    console.log('Generation time acceptable (<60s):', duration < 60)
    
    if (hasExpectedContent && !hasUnexpectedContent && duration < 60) {
      console.log('🎉 TEST PASSED!')
    } else {
      console.log('❌ TEST FAILED!')
    }
    
  } catch (error) {
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log('❌ GENERATION FAILED')
    console.log('Duration before error:', duration, 'seconds')
    console.log('Error:', error.message)
    console.log('Stack:', error.stack?.split('\n').slice(0, 5).join('\n'))
  }
}

runTest().catch(console.error)