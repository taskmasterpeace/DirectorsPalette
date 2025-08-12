// Full end-to-end test for story and music video generation
const { generateBreakdown } = require('./app/actions-story.ts');
const { generateFullMusicVideoBreakdown } = require('./app/actions-mv.ts');

// Test data
const testStory = `
John walked into the abandoned warehouse. The place was dark and dusty. 
He heard footsteps behind him. It was Sarah, his partner.
"We need to find the evidence before they come back," she whispered.
They searched through old boxes until they found a briefcase.
Inside was exactly what they were looking for - the stolen documents.
Suddenly, the door slammed shut. They were trapped.
`;

const testLyrics = `
[Verse 1]
Walking through the city lights
Everything feels so right
Got my dreams in sight
Ready for the fight

[Chorus]
We rise, we fall, we stand tall
Through it all, through it all
Never gonna stop, gonna give it all
We rise, we fall, we stand tall

[Verse 2]
Every step I take
Every move I make
Building something great
It's never too late
`;

async function testStoryGeneration() {
  console.log('\n=== TESTING STORY GENERATION ===\n');
  
  try {
    console.log('Input story:', testStory);
    console.log('\nGenerating breakdown...\n');
    
    const result = await generateBreakdown(
      testStory,
      'tarantino', // director
      'Make it intense and stylized', // director notes
      { enabled: false, format: 'full', approaches: [] }, // title card options
      { includeCameraStyle: true, includeColorPalette: true }, // prompt options
      'ai-suggested', // chapter method
      3 // user chapter count
    );
    
    if (result.success) {
      console.log('✅ Story generation successful!');
      console.log('\nGenerated structure:');
      console.log('- Chapters:', result.data.chapters?.length || 0);
      
      result.data.chapters?.forEach((chapter, i) => {
        console.log(`\nChapter ${i + 1}: ${chapter.title}`);
        console.log('  Characters:', chapter.keyCharacters);
        console.log('  Location:', chapter.primaryLocation);
        console.log('  Narrative beat:', chapter.narrativeBeat);
      });
      
      console.log('\nBreakdowns generated:', result.data.chapterBreakdowns?.length || 0);
      
      result.data.chapterBreakdowns?.forEach((breakdown, i) => {
        console.log(`\nChapter ${i + 1} Breakdown:`);
        console.log('  Character refs:', breakdown.characterReferences);
        console.log('  Location refs:', breakdown.locationReferences);
        console.log('  Prop refs:', breakdown.propReferences);
        console.log('  Shots:', breakdown.shots?.length || 0);
      });
      
      // Check for issues
      console.log('\n=== CHECKING FOR ISSUES ===');
      
      // Check if generated characters match story
      const storyCharacters = ['John', 'Sarah'];
      const generatedCharacters = new Set();
      
      result.data.chapterBreakdowns?.forEach(breakdown => {
        breakdown.characterReferences?.forEach(char => {
          generatedCharacters.add(char.replace('@', ''));
        });
      });
      
      console.log('\nExpected characters:', storyCharacters);
      console.log('Generated characters:', Array.from(generatedCharacters));
      
      const extraCharacters = Array.from(generatedCharacters).filter(
        char => !storyCharacters.some(sc => char.toLowerCase().includes(sc.toLowerCase()))
      );
      
      if (extraCharacters.length > 0) {
        console.log('⚠️ WARNING: Generated extra characters not in story:', extraCharacters);
      } else {
        console.log('✅ All generated characters match the story');
      }
      
    } else {
      console.log('❌ Story generation failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testMusicVideoGeneration() {
  console.log('\n=== TESTING MUSIC VIDEO GENERATION ===\n');
  
  try {
    console.log('Input lyrics:', testLyrics);
    console.log('\nGenerating music video breakdown...\n');
    
    // Step 1: Generate initial references
    const result = await generateFullMusicVideoBreakdown({
      lyrics: testLyrics,
      songTitle: 'Rise and Stand',
      artist: 'Test Artist',
      genre: 'Pop',
      concept: 'Urban journey of determination',
      directorNotes: 'High energy, urban aesthetic',
      selectedDirector: null,
      artistProfile: undefined
    });
    
    if (result.success) {
      console.log('✅ Music video generation successful!');
      console.log('\nGenerated structure:');
      console.log('- Sections:', result.data.breakdown.sections?.length || 0);
      console.log('- Treatments:', result.data.breakdown.treatments?.length || 0);
      console.log('- Is configured:', result.data.breakdown.isConfigured);
      
      result.data.breakdown.sections?.forEach((section, i) => {
        console.log(`\nSection ${i + 1}: ${section.title} (${section.type})`);
      });
      
      console.log('\n✅ First stage complete - references generated');
      console.log('This is where user would configure locations, wardrobe, props');
      
      // Step 2: Simulate configured generation
      console.log('\nSimulating final breakdown with configuration...');
      
      const configuredResult = await generateFullMusicVideoBreakdown({
        lyrics: testLyrics,
        songTitle: 'Rise and Stand',
        artist: 'Test Artist',
        genre: 'Pop',
        concept: 'Urban journey of determination',
        directorNotes: 'High energy, urban aesthetic',
        selectedDirector: null,
        artistProfile: undefined,
        config: {
          isConfigured: true,
          selectedTreatmentId: result.data.breakdown.treatments[0]?.id,
          locations: [
            { reference: '@rooftop', name: 'City Rooftop', description: 'Urban rooftop at sunset' },
            { reference: '@street', name: 'City Street', description: 'Busy downtown street' }
          ],
          wardrobe: [
            { reference: '@streetwear', name: 'Urban Streetwear', description: 'Modern street fashion' }
          ],
          props: [
            { reference: '@mic', name: 'Microphone', description: 'Wireless performance mic' }
          ]
        }
      });
      
      if (configuredResult.success && configuredResult.data.breakdown.isConfigured) {
        console.log('✅ Final breakdown generated with configuration');
        console.log('- Section breakdowns:', configuredResult.data.breakdown.sectionBreakdowns?.length || 0);
      }
      
    } else {
      console.log('❌ Music video generation failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function runAllTests() {
  console.log('Starting comprehensive workflow tests...\n');
  
  // Set up environment
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key';
  
  await testStoryGeneration();
  await testMusicVideoGeneration();
  
  console.log('\n=== TEST SUMMARY ===');
  console.log('Story mode needs: Reference configuration stage like music video');
  console.log('Issue found: Generating characters not in the original story');
  console.log('Music video has good two-stage flow: references -> configuration -> final');
}

// Run tests
runAllTests().catch(console.error);