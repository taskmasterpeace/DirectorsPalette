// Direct server action test
const testStory = `Detective Martinez walked into the abandoned warehouse at midnight. The killer was waiting for her in the shadows, holding a red balloon. "You're too late," he whispered as the balloon floated up toward the broken skylight.

She drew her gun, but her hands were shaking. This was personal - the killer had taken her partner three months ago. The balloon reached the ceiling and popped, echoing through the empty space like a gunshot.

"Drop the weapon!" she shouted, but he was already running toward the back exit. She gave chase, her footsteps echoing on the concrete floor, determined to end this tonight.`

const testPayload = {
  story: testStory,
  selectedDirector: 'christopher-nolan',  
  titleCardOptions: {
    enabled: false,
    format: 'full',
    approaches: []
  },
  allDirectors: [{
    id: 'christopher-nolan',
    name: 'Christopher Nolan',
    description: 'Master of complex narratives and practical effects',
    visualLanguage: 'Bold compositions with practical effects',
    cameraStyle: 'Dramatic angles and precise movements',
    colorPalette: 'Varied based on project needs',
    narrativeFocus: 'Complex storytelling with emotional depth'
  }],
  promptOptions: {
    includeCameraStyle: true,
    includeColorPalette: true
  },
  storyDirectorNotes: 'Focus on dramatic lighting and close-up shots'
}

console.log('🎯 TESTING SERVER ACTION DIRECTLY')
console.log('================================')
console.log('Story length:', testStory.length, 'characters')
console.log('Director:', testPayload.selectedDirector)
console.log('Director notes:', testPayload.storyDirectorNotes)
console.log('')
console.log('This would call generateBreakdown() with:')
console.log('- story:', testStory.substring(0, 100) + '...')
console.log('- director:', testPayload.selectedDirector)
console.log('- directorNotes:', testPayload.storyDirectorNotes)
console.log('')
console.log('Now test in browser at http://localhost:3005')
console.log('Check Network tab for any server action errors')