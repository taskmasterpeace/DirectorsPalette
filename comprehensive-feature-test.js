/**
 * COMPREHENSIVE FEATURE TESTING SUITE
 * Tests all aspects of the application to ensure everything works
 */

const TEST_STORIES = [
  {
    title: "Noir Detective Story",
    text: `The rain hammered the city like bullets from heaven. Detective Jack Morrison stood in the doorway of the abandoned warehouse, cigarette smoke curling around his weathered face. 
    
    Chapter 1: The Case
    The phone call came at 3 AM. Another body, another mystery. Morrison grabbed his coat and headed into the storm.
    
    Chapter 2: The Investigation  
    The crime scene was a mess of blood and broken glass. But something didn't add up. The victim's watch was still ticking, frozen at midnight.
    
    Chapter 3: The Truth
    In the shadows of the docks, Morrison finally cornered the killer. The truth was darker than he imagined.`,
    
    directorNotes: "Film noir style, high contrast black and white, dramatic shadows, rain-soaked streets",
    expectedElements: ["noir lighting", "shadow", "contrast", "rain", "cigarette smoke"]
  },
  
  {
    title: "Sci-Fi Space Opera",
    text: `Captain Elena Voss stood on the bridge of the Starweaver, watching the alien armada approach. Humanity's last hope rested in her hands.
    
    The Battle Begins
    "All weapons online," her tactical officer reported. The first wave of enemy fighters screamed toward them through the void.
    
    The Secret Weapon
    Deep in the ship's core, Dr. Chen activated the experimental quantum drive. Reality itself began to ripple.
    
    Victory's Price
    As the last enemy ship exploded in a cascade of light, Elena knew the cost. Half her crew was gone, but Earth was saved.`,
    
    directorNotes: "Epic space battles, lens flares, sweeping camera movements through space debris",
    expectedElements: ["space", "stars", "spaceship", "laser", "explosion", "void"]
  },
  
  {
    title: "Romantic Drama",
    text: `Sarah met him at the coffee shop on a Tuesday. Their eyes met across the crowded room, and time seemed to stop.
    
    Their first conversation lasted until the shop closed. They talked about books, dreams, and the fear of being alone in a city of millions.
    
    Six months later, at the same table, he proposed with her grandmother's ring. The whole café erupted in applause.
    
    But life had other plans. The diagnosis came in spring, just as the cherry blossoms bloomed.`,
    
    directorNotes: "Warm, intimate lighting, handheld camera for emotional moments, soft focus for romantic scenes",
    expectedElements: ["warm light", "close-up", "soft focus", "intimate", "emotional"]
  }
];

const TEST_LYRICS = [
  {
    title: "Neon Dreams",
    artist: "Synthwave Collective",
    genre: "Electronic/Synthwave",
    lyrics: `[Verse 1]
City lights blur past my window
Racing through these neon streets
Digital love in the shadows
Where the future and the past meet

[Chorus]
We're living in neon dreams
Nothing is quite what it seems
Electric hearts beat as one
Dancing till the night is done

[Verse 2]
Synthetic waves crash over me
Lost in this electric maze
Your hologram is all I see
Through the purple smoky haze

[Bridge]
Download my soul tonight
Upload your love to me
In this digital paradise
We can finally be free`,
    
    concept: "Retro-futuristic love story in a cyberpunk city",
    expectedElements: ["neon", "city", "digital", "hologram", "purple", "smoke"]
  },
  
  {
    title: "Broken Crown",
    artist: "Metal Warriors",
    genre: "Heavy Metal",
    lyrics: `[Verse 1]
Thunder rolls across the battlefield
Warriors stand with shields held high
The king has fallen, fate is sealed
Under blood-red morning sky

[Chorus]
Broken crown upon the ground
Empire's falling, hear the sound
Rise up from the ashes now
We will never bow

[Verse 2]
Steel clashes in the burning night
Rebellion surges through our veins
Freedom's calling, join the fight
Break these tyranny chains`,
    
    concept: "Epic medieval rebellion, Game of Thrones style visuals",
    expectedElements: ["battle", "sword", "fire", "crown", "warrior", "blood"]
  }
];

const DIRECTORS_TO_TEST = [
  "nolan", // Christopher Nolan
  "kubrick", // Stanley Kubrick
  "wong-kar-wai", // Wong Kar-wai
  "terrence-malick", // Terrence Malick
  "fincher" // David Fincher
];

// Test configurations for camera movement checkbox
const CAMERA_MOVEMENT_TESTS = [
  {
    includeCameraMovement: true,
    expectedInPrompt: ["camera:", "movement:", "tracking", "pan", "dolly", "crane"],
    description: "With camera movement enabled"
  },
  {
    includeCameraMovement: false,
    expectedNotInPrompt: ["camera:", "movement:", "tracking", "pan", "dolly", "crane"],
    description: "With camera movement disabled"
  }
];

// Test cases for additional shots
const ADDITIONAL_SHOT_TESTS = [
  {
    categories: ["action", "closeup"],
    customRequest: "Add a dramatic reveal shot",
    expectedElements: ["reveal", "dramatic"]
  },
  {
    categories: ["establishing"],
    customRequest: "Wide shot showing the entire location",
    expectedElements: ["wide", "establishing", "location"]
  }
];

// Reference system tests for music videos
const MV_REFERENCE_TESTS = [
  {
    locations: ["@warehouse", "@rooftop", "@neon_street"],
    wardrobe: ["@streetwear", "@formal", "@punk"],
    props: ["@motorcycle", "@neon_sign"],
    expectedInOutput: ["warehouse", "rooftop", "neon", "streetwear", "motorcycle"]
  }
];

// Reference system tests for stories
const STORY_REFERENCE_TESTS = [
  {
    characters: ["@detective", "@victim", "@witness"],
    locations: ["@crime_scene", "@police_station"],
    props: ["@gun", "@evidence"],
    expectedInOutput: ["detective", "crime scene", "gun", "evidence"]
  }
];

console.log("🎬 COMPREHENSIVE FEATURE TEST SUITE");
console.log("=" .repeat(50));
console.log("\n📝 TEST DATA PREPARED:");
console.log(`- ${TEST_STORIES.length} test stories`);
console.log(`- ${TEST_LYRICS.length} test lyrics`);
console.log(`- ${DIRECTORS_TO_TEST.length} directors to test`);
console.log(`- ${CAMERA_MOVEMENT_TESTS.length} camera movement configurations`);
console.log(`- ${ADDITIONAL_SHOT_TESTS.length} additional shot scenarios`);
console.log(`- ${MV_REFERENCE_TESTS.length} music video reference tests`);
console.log(`- ${STORY_REFERENCE_TESTS.length} story reference tests`);

console.log("\n🔍 TESTS TO RUN:");
console.log("1. Camera movement checkbox functionality");
console.log("2. Director style variations in output");
console.log("3. Reference system in music videos");
console.log("4. Reference system in stories");
console.log("5. Additional shots generation");
console.log("6. Prompt quality and consistency");

console.log("\n📊 EXPECTED VALIDATIONS:");
console.log("- Camera movement appears/disappears based on checkbox");
console.log("- Each director produces unique visual style");
console.log("- References (@location, @wardrobe, etc.) work correctly");
console.log("- Additional shots integrate properly");
console.log("- Prompts generate consistent, high-quality output");

// Export for use in actual test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEST_STORIES,
    TEST_LYRICS,
    DIRECTORS_TO_TEST,
    CAMERA_MOVEMENT_TESTS,
    ADDITIONAL_SHOT_TESTS,
    MV_REFERENCE_TESTS,
    STORY_REFERENCE_TESTS
  };
}