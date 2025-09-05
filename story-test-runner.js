#!/usr/bin/env node

/**
 * STORY GENERATION TESTING SUITE
 * Tests real stories with complex director modifications
 */

// Simple test runner without imports
console.log('🎬 STORY GENERATION TEST ANALYSIS')
console.log('=' .repeat(60))

// Test Stories
const CLEAN_STORY = `# The Story of Clean: When Family Calls, You Answer

## The Call That Changed Everything

Clean's world shifted the moment his phone started blowing up that morning. He's a night owl by nature - the kind of guy who stays up until 6 or 7 AM, lost in his own routine. So when his phone started going crazy while he was still deep in sleep, something in his gut told him this wasn't normal. His brothers and sisters don't call like that. Not all at once. Not with that urgency.

His brother's voice cut through the drowsiness instantly: "Bro, I'm on my way, gang."

"All right, what's going on?"

"He put his hands on sis. Come and get me. It ain't nothing to talk about."

The line went dead. No discussion needed. Ten minutes later, his brother was at his door. Fifteen minutes after that, they were pulling up to the projects.

## What Happened to His Twin

Clean's twin sister - she's just like him, he says, except she doesn't care about the fame or the internet. She keeps to herself, has her own spot, lives her own life. The night before, she'd been with her boyfriend. They'd been drinking, and when things got tense, he got out of the car, acting like he wanted to walk home - mind you, the man doesn't even have a vehicle of his own.

She tried to be reasonable, tried to get him back in the car. "Get back in the car, what are you doing?" But the moment he got back in, something snapped in him. He grabbed her phone right off the charger and hurled it across the parking lot.

Now, Clean makes it clear - his sister isn't the type to take that lying down. She confronted him about throwing her phone, and that's when he hit her. She had to walk around with a swollen face because this man couldn't control himself.

## The Phone Call Before the Storm

Before Clean pulled up, the boyfriend had been talking tough on the phone. Bragging about how many people he'd beaten up in prison, how Clean was so small he'd "break him apart," detailing all the things he was going to do when Clean showed up.

"All right, cool," Clean had said. And he meant it.

The sister had even warned her boyfriend: "You know you're going to have to see my brothers after this."

His response? "F*** them, I don't give a f*** about them ho ass n****s."

## Pulling Up to the Projects

Clean kicked the door. Not knocked - kicked. Three times. "Wayne, bring your ass outside!"

For five minutes, nothing. Clean knew they were in there - the boyfriend, his father, and his brother. They had guns in the house. Clean could picture them scrambling, probably placing weapons strategically, preparing for whatever was about to go down.

The projects were small - walk through the front door, go straight ahead, and you hit the back door. No way they didn't hear him. The neighbors certainly did. Clean was yelling, making sure everyone knew exactly why he was there.

Finally, the father answered. He came out on crutches, looking, as Clean colorfully puts it, "like Lieutenant Dan" - no legs, just crutches.

"I ain't even here to holler at you, my man. Where Lil Wayne at? Tell him to come outside. He know what this is. We talked about this already. Bring your ass outside. You like putting your hands on women. Come outside."

## The Confrontation

When the boyfriend finally emerged, he tried to play it cool, walking toward Clean with open hands. "Bro, what's up, bro? We family."

Clean had warned him immediately: "Don't walk up on me, bro. I'm doing the walking ups. I'm advancing towards you."

But he kept coming. That's when the first slap landed. 

*SMACK.*

"You like putting your hands on females?"

The slaps kept coming. Five, six times. Each one deliberate. Each one recorded by Clean's brother, who Clean had specifically instructed to stay in the car and just film. "This one's mine," Clean had told him. "You had the last one. This is my turn."

Clean's father had always told him that slapping a man multiple times was worse than beating him up. It was about humiliation, about making a point that would stick.

## The Glasses Come Off

The moment that went viral - when Clean slapped the glasses clean off the man's face - happened after the boyfriend's brother acted like he was going to get a gun from the car. The neighbor, who'd been watching the whole thing unfold, even called out the brother for being "b****" for not helping, for walking back into the house while his brother was getting slapped around.

But here's what struck Clean the most: after each slap, when the boyfriend would "unscrew" (back down) and act like he didn't want to fight, Clean would give him another chance. And each time, nothing. No fight back. No resistance. Just taking it.

"My sister got to walk around with a swollen face," Clean said. "So how you think you going to have to walk around now? You got to walk around like a b****, knowing that I smacked the glasses off your face, knowing that every day you go on Facebook, you viral now."`

// Director Test Cases
const DIRECTOR_TESTS = [
  {
    name: "UNDERWATER_TRANSFORMATION",
    directorNotes: "Transform this entire story to take place underwater in a submerged city. All characters have underwater breathing apparatus. The projects become underwater housing units. The confrontation happens in floating water with debris. Make it visually stunning with underwater cinematography.",
    expectedKeywords: ["underwater", "submerged", "breathing apparatus", "floating", "debris"]
  },
  {
    name: "ADD_NEW_CHARACTER", 
    directorNotes: "Add a mysterious witness character named Elena who was hiding nearby and saw the entire confrontation. She becomes important to the story. Include her in multiple scenes with dialogue.",
    expectedKeywords: ["Elena", "witness", "hiding", "saw everything", "dialogue"]
  },
  {
    name: "ADD_HOSPITAL_SCENE",
    directorNotes: "Add a completely new scene where Clean visits his sister in the hospital after the incident. Include emotional dialogue between them about family, protection, and consequences. Make it powerful and moving.",
    expectedKeywords: ["hospital", "dialogue", "family", "protection", "emotional", "consequences"]
  },
  {
    name: "NOIR_VISUAL_STYLE",
    directorNotes: "Shoot this entirely in noir black and white style. Heavy shadows, venetian blind lighting, rain on windows. Very dramatic lighting and atmosphere. Classic detective movie aesthetic.",
    expectedKeywords: ["noir", "black and white", "shadows", "venetian blind", "rain", "dramatic lighting"]
  }
]

// Analysis Functions
function analyzeStoryStructure(story) {
  console.log('\n🔍 STORY STRUCTURE ANALYSIS:')
  console.log(`Story length: ${story.length} characters`)
  
  // Extract key elements
  const characters = extractCharacters(story)
  const locations = extractLocations(story) 
  const keyEvents = extractKeyEvents(story)
  
  console.log(`Key Characters: ${characters.join(', ')}`)
  console.log(`Locations: ${locations.join(', ')}`)
  console.log(`Major Events: ${keyEvents.join(', ')}`)
  
  return { characters, locations, keyEvents }
}

function extractCharacters(story) {
  const characters = []
  const text = story.toLowerCase()
  
  if (text.includes('clean')) characters.push('Clean')
  if (text.includes('sister') || text.includes('twin')) characters.push('Sister')
  if (text.includes('boyfriend') || text.includes('wayne')) characters.push('Boyfriend/Wayne')
  if (text.includes('brother')) characters.push('Brother')
  if (text.includes('father')) characters.push('Father')
  if (text.includes('neighbor')) characters.push('Neighbor')
  
  return characters
}

function extractLocations(story) {
  const locations = []
  const text = story.toLowerCase()
  
  if (text.includes('projects')) locations.push('Housing Projects')
  if (text.includes('parking lot')) locations.push('Parking Lot')
  if (text.includes('car')) locations.push('Car')
  if (text.includes('phone')) locations.push('Phone/Communication')
  if (text.includes('house') || text.includes('door')) locations.push('House/Door')
  
  return locations
}

function extractKeyEvents(story) {
  const events = []
  const text = story.toLowerCase()
  
  if (text.includes('phone call')) events.push('Phone Call')
  if (text.includes('slap') || text.includes('hit')) events.push('Physical Confrontation')
  if (text.includes('glasses')) events.push('Glasses Incident')
  if (text.includes('kicked') && text.includes('door')) events.push('Door Kicking')
  if (text.includes('film') || text.includes('record')) events.push('Recording/Filming')
  
  return events
}

// Test Requirements Analysis
function analyzeTestRequirements() {
  console.log('\n📋 TEST REQUIREMENTS ANALYSIS:')
  console.log('=' .repeat(50))
  
  const requirements = [
    {
      requirement: "Story Input Fidelity",
      description: "Generated output must contain elements from actual input story",
      critical: true,
      testMethod: "Check if Clean, sister, projects, confrontation appear in output"
    },
    {
      requirement: "Director Notes Integration", 
      description: "Director modifications must be applied to story content",
      critical: true,
      testMethod: "Verify underwater/noir/additional scenes appear when requested"
    },
    {
      requirement: "Entity Extraction",
      description: "System must identify characters, locations, props for director review",
      critical: true,
      testMethod: "Extract and verify Clean, sister, projects, glasses, phone identified"
    },
    {
      requirement: "Complex Story Handling",
      description: "Must handle multi-chapter, complex narratives with dialogue",
      critical: true, 
      testMethod: "Process full Clean story maintaining narrative structure"
    },
    {
      requirement: "Visual Shot Generation",
      description: "Generate specific, filmable shots based on story + director style",
      critical: true,
      testMethod: "Verify shots like 'Close-up on glasses flying off' generated"
    }
  ]
  
  requirements.forEach((req, index) => {
    console.log(`${index + 1}. ${req.requirement} ${req.critical ? '🚨 CRITICAL' : ''}`)
    console.log(`   ${req.description}`)
    console.log(`   Test: ${req.testMethod}`)
    console.log()
  })
  
  return requirements
}

// Expected vs Actual Analysis
function generateExpectedOutputs() {
  console.log('\n🎯 EXPECTED OUTPUT ANALYSIS:')
  console.log('=' .repeat(50))
  
  console.log('For Clean Story + Nolan Director:')
  console.log('EXPECTED SHOTS SHOULD INCLUDE:')
  console.log('- Wide shot of Clean approaching housing projects at dawn')
  console.log('- Close-up on Clean\'s face as phone rings, showing determination') 
  console.log('- Over-shoulder shot of Clean kicking apartment door')
  console.log('- Medium shot of father on crutches answering door')
  console.log('- Close-up sequence of slaps landing on boyfriend\'s face')
  console.log('- Slow-motion shot of glasses flying off boyfriend\'s face')
  console.log('- Wide shot showing neighbors watching from windows')
  console.log('- Close-up on brother filming with phone camera')
  
  console.log('\nFor Clean Story + Underwater Director Notes:')
  console.log('EXPECTED MODIFICATIONS:')
  console.log('- All characters wearing underwater breathing apparatus')
  console.log('- Projects transformed to underwater housing units')
  console.log('- Confrontation in floating water with debris')
  console.log('- Phone calls through underwater communication devices')
  console.log('- Glasses floating away in water instead of flying through air')
  
  console.log('\nCHARACTERS THAT MUST BE IDENTIFIED:')
  console.log('- Clean (protagonist)')
  console.log('- Sister/Twin (victim)')
  console.log('- Boyfriend/Wayne (antagonist)')
  console.log('- Brother (ally/cameraman)')
  console.log('- Father (minor character)')
  console.log('- Neighbors (background)')
  
  console.log('\nLOCATIONS THAT MUST BE IDENTIFIED:')
  console.log('- Housing Projects (main setting)')
  console.log('- Parking Lot (phone incident location)')
  console.log('- Car Interior (relationship conflict)')
  console.log('- Apartment Door (confrontation point)')
  console.log('- Street/Outside (public confrontation)')
}

// Test Execution Plan
function generateTestPlan() {
  console.log('\n🚀 MANUAL TEST EXECUTION PLAN:')
  console.log('=' .repeat(50))
  
  console.log('STEP 1: Baseline Test')
  console.log('- Input: Full Clean story')
  console.log('- Director: Christopher Nolan')  
  console.log('- Director Notes: (empty)')
  console.log('- Expected: Should generate shots based on actual Clean story, NOT random detective content')
  console.log('')
  
  console.log('STEP 2: Underwater Transformation Test')
  console.log('- Input: Full Clean story')
  console.log('- Director Notes: "Transform entire story to underwater setting..."') 
  console.log('- Expected: Same story events but in underwater environment')
  console.log('')
  
  console.log('STEP 3: Character Addition Test')
  console.log('- Input: Full Clean story')
  console.log('- Director Notes: "Add witness character named Elena..."')
  console.log('- Expected: Elena appears in generated shots and dialogue')
  console.log('')
  
  console.log('STEP 4: Scene Addition Test') 
  console.log('- Input: Full Clean story')
  console.log('- Director Notes: "Add hospital scene with Clean and sister..."')
  console.log('- Expected: New hospital scene appears with emotional dialogue')
  console.log('')
  
  console.log('STEP 5: Visual Style Test')
  console.log('- Input: Full Clean story')  
  console.log('- Director Notes: "Noir black and white style..."')
  console.log('- Expected: Shot descriptions include noir visual elements')
}

// Failure Modes Analysis
function analyzeFailureModes() {
  console.log('\n⚠️  POTENTIAL FAILURE MODES TO WATCH FOR:')
  console.log('=' .repeat(50))
  
  const failureModes = [
    {
      issue: "Story Content Ignored",
      symptoms: "Output contains random detective/Marcus/balloon content instead of Clean story",
      severity: "CRITICAL",
      cause: "AI using wrong prompts or cached templates"
    },
    {
      issue: "Director Notes Not Applied", 
      symptoms: "Underwater/noir modifications don't appear in output",
      severity: "CRITICAL",
      cause: "Director notes not being passed to AI prompts correctly"
    },
    {
      issue: "Entity Extraction Missing",
      symptoms: "No character/location identification system visible",
      severity: "CRITICAL", 
      cause: "Entity extraction feature not implemented"
    },
    {
      issue: "Insufficient Shot Detail",
      symptoms: "Vague shots like 'person talks' instead of 'Close-up on Clean's determined face'",
      severity: "HIGH",
      cause: "Prompts not requesting specific visual details"
    },
    {
      issue: "Narrative Structure Lost",
      symptoms: "Generated shots don't follow story chronology or key events",
      severity: "HIGH", 
      cause: "AI not understanding story structure and pacing"
    }
  ]
  
  failureModes.forEach((failure, index) => {
    console.log(`${index + 1}. ${failure.issue} - ${failure.severity}`)
    console.log(`   Symptoms: ${failure.symptoms}`)
    console.log(`   Likely Cause: ${failure.cause}`)
    console.log()
  })
}

// Main Analysis
function runAnalysis() {
  console.log('🎬 COMPREHENSIVE STORY TESTING ANALYSIS')
  console.log('Date: ' + new Date().toISOString())
  console.log('=' .repeat(60))
  
  // Analyze the story structure
  analyzeStoryStructure(CLEAN_STORY)
  
  // Define requirements
  analyzeTestRequirements()
  
  // Generate expected outputs
  generateExpectedOutputs()
  
  // Create test plan
  generateTestPlan()
  
  // Analyze failure modes
  analyzeFailureModes()
  
  console.log('\n📋 NEXT STEPS:')
  console.log('1. Execute manual tests at http://localhost:8080')
  console.log('2. Document actual vs expected results')
  console.log('3. Fix prompt issues based on findings')
  console.log('4. Implement entity extraction system')
  console.log('5. Re-test with complex stories')
  
  console.log('\n⚡ RUN THIS: node story-test-runner.js > test-analysis.txt')
  console.log('Then execute manual tests and compare results!')
}

// Execute analysis
runAnalysis()