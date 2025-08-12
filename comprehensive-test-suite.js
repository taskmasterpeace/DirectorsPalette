#!/usr/bin/env node

/**
 * COMPREHENSIVE STORY GENERATION TEST SUITE
 * Testing real stories with complex director modifications
 */

import { generateBreakdown } from './app/actions-story.js'

// Test Stories - Complex, Real-World Content
const TEST_STORIES = {
  CLEAN_STORY: `# The Story of Clean: When Family Calls, You Answer

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

"My sister got to walk around with a swollen face," Clean said. "So how you think you going to have to walk around now? You got to walk around like a b****, knowing that I smacked the glasses off your face, knowing that every day you go on Facebook, you viral now."`,

  DETECTIVE_STORY: `Detective Martinez had seen enough crime scenes to last three lifetimes, but nothing prepared her for what waited in apartment 4B. The call came in at 2:47 AM - neighbors reporting screaming, then sudden silence.

She climbed four flights of stairs in the decrepit downtown building, each step creaking under the weight of dread. The hallway reeked of mildew and broken dreams. Her partner, Detective Kumar, was already there, his usually steady hands shaking as he held the door open.

Inside, the scene defied logic. The victim, identified as Marcus Chen, a 34-year-old accountant, sat perfectly upright at his kitchen table. His eyes were wide open, staring at a red balloon tied to the chair across from him. No wounds. No signs of struggle. Just Marcus and that balloon.

"Heart attack?" Kumar suggested, but Martinez shook her head.

"Look at his hands," she whispered.

Marcus's fingers were wrapped around a pen, and on the table before him, written in his own neat handwriting, was a single sentence repeated dozens of times: "The balloon knows what I did. The balloon knows what I did. The balloon knows what I did..."`,

  FAMILY_DRAMA: `Sarah stood in the doorway of her childhood bedroom, now converted into her mother's craft room. Forty-three years old, and she still felt like a child when she crossed this threshold.

Her mother, Ellen, sat hunched over a half-finished quilt, the same position Sarah had found her in countless times growing up. But now Ellen's hands trembled slightly, and her once-perfect stitches showed signs of uncertainty.

"Mom, we need to talk about the house."

Ellen's needle stopped mid-stitch. She didn't look up. "I know what you're going to say, Sarah. Your brother already called."

The house had been in their family for sixty years. Ellen had raised three children here, buried a husband, celebrated grandchildren's birthdays in the backyard. But the mortgage payments had become impossible on her fixed income, and the medical bills from her father's final months had devastated their savings.

"Tommy thinks we should sell to that developer. Get the cash offer."

"Tommy thinks a lot of things," Ellen said, finally meeting her daughter's eyes. "Doesn't mean they're right."

Sarah noticed how small her mother looked in the oversized recliner, how the house seemed to dwarf her now. The wallpaper was peeling in the corners, and the hardwood floors creaked with every step. But Ellen's eyes still held the fierce determination that had carried their family through every crisis.

"What do you think, Mom? Really?"

Ellen set down her quilting and walked to the window that overlooked the garden her husband had planted thirty years ago. The roses were overgrown now, wild and beautiful in their neglect.

"I think," she said quietly, "that some things are worth fighting for. Even when everyone tells you to let go."`
}

// Director Modification Tests
const DIRECTOR_TESTS = [
  {
    name: "UNDERWATER_TRANSFORMATION",
    story: TEST_STORIES.CLEAN_STORY,
    directorNotes: "Transform this entire story to take place underwater in a submerged city. All characters have underwater breathing apparatus. The projects become underwater housing units. The confrontation happens in floating water with debris. Make it visually stunning with underwater cinematography.",
    expectedElements: ["underwater", "submerged", "floating", "breathing apparatus", "debris"]
  },
  {
    name: "ADD_NEW_CHARACTER",
    story: TEST_STORIES.DETECTIVE_STORY,
    directorNotes: "Add a mysterious witness character named Elena who was hiding in the apartment and saw everything. She becomes crucial to solving the case. Include her in multiple scenes and give her significant dialogue.",
    expectedElements: ["Elena", "witness", "hiding", "saw everything"]
  },
  {
    name: "GENRE_TRANSFORMATION",
    story: TEST_STORIES.FAMILY_DRAMA,
    directorNotes: "Transform this into a horror story. The house is haunted by the father's spirit who doesn't want them to sell. Add supernatural elements, creaking sounds, cold spots, and ghostly apparitions. The quilt should move on its own.",
    expectedElements: ["haunted", "supernatural", "ghostly", "apparitions", "spirit"]
  },
  {
    name: "ADD_ENTIRE_SCENE",
    story: TEST_STORIES.CLEAN_STORY,
    directorNotes: "Add a completely new scene where Clean visits his sister in the hospital after the incident. Include dialogue between them about family, protection, and consequences. Make it emotionally powerful.",
    expectedElements: ["hospital", "sister", "dialogue", "family", "protection"]
  },
  {
    name: "VISUAL_STYLE_OVERRIDE",
    story: TEST_STORIES.DETECTIVE_STORY,
    directorNotes: "Shoot this entirely in noir black and white style. Heavy shadows, venetian blind lighting, rain on windows. The red balloon should be the ONLY color element in the entire film. Very dramatic lighting.",
    expectedElements: ["noir", "black and white", "shadows", "venetian blind", "rain", "red balloon", "only color"]
  }
]

// Mock directors for testing
const MOCK_DIRECTORS = [
  {
    id: "nolan",
    name: "Christopher Nolan",
    description: "Known for complex narratives and practical effects",
    visualLanguage: "Complex time structures, IMAX cinematography, practical effects",
    cameraStyle: "Steady cam, wide shots, close-ups for emotional moments",
    colorPalette: "Desaturated colors with selective highlights"
  },
  {
    id: "tarantino", 
    name: "Quentin Tarantino",
    description: "Master of dialogue and non-linear storytelling",
    visualLanguage: "Sharp dialogue, pop culture references, stylized violence",
    cameraStyle: "Dynamic angles, long takes, crash zooms",
    colorPalette: "Saturated colors, high contrast"
  }
]

// Test Results Tracking
let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  detailed: []
}

// Utility Functions
function containsAnyElement(text, elements) {
  return elements.some(element => 
    text.toLowerCase().includes(element.toLowerCase())
  )
}

function extractCharacters(breakdown) {
  const characters = new Set()
  if (breakdown?.storyStructure?.chapters) {
    breakdown.storyStructure.chapters.forEach(chapter => {
      if (chapter.keyCharacters) {
        chapter.keyCharacters.forEach(char => characters.add(char))
      }
    })
  }
  return Array.from(characters)
}

function extractLocations(breakdown) {
  const locations = new Set()
  if (breakdown?.storyStructure?.chapters) {
    breakdown.storyStructure.chapters.forEach(chapter => {
      if (chapter.primaryLocation) {
        locations.add(chapter.primaryLocation)
      }
    })
  }
  return Array.from(locations)
}

// Main Test Runner
async function runComprehensiveTests() {
  console.log('🎬 COMPREHENSIVE STORY GENERATION TEST SUITE')
  console.log('=' .repeat(60))
  
  for (let i = 0; i < DIRECTOR_TESTS.length; i++) {
    const test = DIRECTOR_TESTS[i]
    console.log(`\n🎯 Running Test ${i + 1}/${DIRECTOR_TESTS.length}: ${test.name}`)
    console.log('-'.repeat(50))
    
    try {
      // Run the actual story generation
      const result = await generateBreakdown(
        test.story,
        "nolan", // Use Nolan as default director
        { enabled: false, format: "full", approaches: [] },
        MOCK_DIRECTORS,
        { includeCameraStyle: true, includeColorPalette: true },
        test.directorNotes
      )
      
      // Analyze results
      const analysis = analyzeResults(test, result)
      testResults.detailed.push(analysis)
      
      if (analysis.passed) {
        testResults.passed++
        console.log('✅ PASSED')
      } else {
        testResults.failed++
        console.log('❌ FAILED')
        console.log('Reasons:', analysis.failures.join(', '))
      }
      
      console.log(`Characters found: ${analysis.characters.join(', ')}`)
      console.log(`Locations found: ${analysis.locations.join(', ')}`)
      console.log(`Expected elements found: ${analysis.foundElements.join(', ')}`)
      console.log(`Shot count: ${analysis.shotCount}`)
      
    } catch (error) {
      testResults.failed++
      testResults.errors.push({ test: test.name, error: error.message })
      console.log('❌ ERROR:', error.message)
    }
  }
  
  // Generate comprehensive report
  generateTestReport()
}

function analyzeResults(test, result) {
  const analysis = {
    testName: test.name,
    passed: true,
    failures: [],
    characters: extractCharacters(result),
    locations: extractLocations(result),
    shotCount: 0,
    foundElements: [],
    fullOutput: JSON.stringify(result, null, 2)
  }
  
  // Count total shots
  if (result?.chapterBreakdowns) {
    analysis.shotCount = result.chapterBreakdowns.reduce((total, chapter) => {
      return total + (chapter.shots ? chapter.shots.length : 0)
    }, 0)
  }
  
  // Check if story content appears in output (not random detective stuff)
  const outputText = JSON.stringify(result).toLowerCase()
  
  // For Clean story, check for key elements
  if (test.story.includes("Clean")) {
    const cleanElements = ["clean", "sister", "projects", "glasses", "slap"]
    const foundCleanElements = cleanElements.filter(el => outputText.includes(el))
    if (foundCleanElements.length === 0) {
      analysis.passed = false
      analysis.failures.push("Story not using actual Clean story content")
    }
  }
  
  // Check for random detective content that shouldn't be there
  const randomElements = ["marcus", "detective", "martinez", "balloon"]
  const foundRandomElements = randomElements.filter(el => outputText.includes(el))
  if (foundRandomElements.length > 0 && !test.story.toLowerCase().includes("detective")) {
    analysis.passed = false
    analysis.failures.push(`Found random elements that shouldn't be there: ${foundRandomElements.join(', ')}`)
  }
  
  // Check if director notes modifications were applied
  test.expectedElements.forEach(element => {
    if (outputText.includes(element.toLowerCase())) {
      analysis.foundElements.push(element)
    }
  })
  
  if (analysis.foundElements.length < test.expectedElements.length / 2) {
    analysis.passed = false
    analysis.failures.push("Director modifications not properly applied")
  }
  
  // Check minimum shot count
  if (analysis.shotCount < 5) {
    analysis.passed = false
    analysis.failures.push("Insufficient shot count generated")
  }
  
  return analysis
}

function generateTestReport() {
  console.log('\n📊 COMPREHENSIVE TEST REPORT')
  console.log('=' .repeat(60))
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`)
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`🚨 Errors: ${testResults.errors.length}`)
  
  if (testResults.failed > 0 || testResults.errors.length > 0) {
    console.log('\n🔍 FAILURE ANALYSIS:')
    testResults.detailed.forEach(test => {
      if (!test.passed) {
        console.log(`\n❌ ${test.testName}:`)
        test.failures.forEach(failure => console.log(`  - ${failure}`))
      }
    })
  }
  
  console.log('\n📋 RECOMMENDATIONS:')
  
  if (testResults.failed > 0) {
    console.log('1. 🚨 CRITICAL: Story generation may be ignoring actual story input')
    console.log('2. 🚨 CRITICAL: Director notes modifications not being applied')
    console.log('3. 🚨 CRITICAL: Entity extraction system may be broken')
  }
  
  console.log('4. ✅ Add comprehensive logging to trace story input → prompt → output')
  console.log('5. ✅ Implement entity extraction and review system') 
  console.log('6. ✅ Strengthen director notes prompt integration')
  console.log('7. ✅ Add validation to ensure story content appears in output')
}

// Run the tests
console.log('🚀 Starting comprehensive story generation tests...')
runComprehensiveTests().catch(console.error)