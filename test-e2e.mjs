// End-to-end test for the application
import { extractStoryReferences, generateStoryBreakdownWithReferences } from './app/actions/story/index.js';

const testStory = `The Three Little Pigs

Once upon a time, there were three little pigs who decided to build their own houses. 
The first pig built his house from straw, the second from sticks, and the third from bricks.
Along came a big bad wolf who wanted to eat the pigs. He blew down the straw house, 
then the stick house, but couldn't blow down the brick house.`;

async function testStoryFlow() {
  console.log('🧪 Testing Story Flow...\n');
  
  try {
    // Step 1: Extract references
    console.log('1️⃣ Extracting references from story...');
    const extractResult = await extractStoryReferences(
      testStory,
      'nolan',
      'Dark and suspenseful tone'
    );
    
    if (!extractResult.success) {
      throw new Error(`Reference extraction failed: ${extractResult.error}`);
    }
    
    console.log('✅ References extracted:');
    console.log(`   - Characters: ${extractResult.data.characters.length}`);
    console.log(`   - Locations: ${extractResult.data.locations.length}`);
    console.log(`   - Props: ${extractResult.data.props.length}\n`);
    
    // Step 2: Generate breakdown with references
    console.log('2️⃣ Generating breakdown with references...');
    const breakdownResult = await generateStoryBreakdownWithReferences(
      testStory,
      'nolan',
      'Dark and suspenseful tone',
      extractResult.data,
      { enabled: false },
      { includeCameraStyle: true, includeColorPalette: true },
      'ai-suggested',
      4
    );
    
    if (!breakdownResult.success) {
      throw new Error(`Breakdown generation failed: ${breakdownResult.error}`);
    }
    
    console.log('✅ Breakdown generated:');
    console.log(`   - Chapters: ${breakdownResult.data.chapters?.length || 0}`);
    console.log(`   - Chapter breakdowns: ${breakdownResult.data.chapterBreakdowns?.length || 0}\n`);
    
    // Verify chapter details
    if (breakdownResult.data.chapterBreakdowns && breakdownResult.data.chapterBreakdowns.length > 0) {
      const firstChapter = breakdownResult.data.chapterBreakdowns[0];
      console.log('📊 First chapter details:');
      console.log(`   - Shots: ${firstChapter.shots?.length || 0}`);
      console.log(`   - Character refs: ${firstChapter.characterReferences?.length || 0}`);
      console.log(`   - Location refs: ${firstChapter.locationReferences?.length || 0}`);
      console.log(`   - Prop refs: ${firstChapter.propReferences?.length || 0}`);
    }
    
    console.log('\n✅ Story flow test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Story flow test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run the test
console.log('🚀 Starting end-to-end tests...\n');
console.log('================================\n');

testStoryFlow().then(success => {
  if (success) {
    console.log('\n================================');
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n================================');
    console.log('❌ Tests failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});