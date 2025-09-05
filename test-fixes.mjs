/**
 * Test script to verify both story and music video fixes
 */

import { extractStoryReferences, generateStoryBreakdownWithReferences } from './app/actions/story/index.js';
import { extractMusicVideoReferences, generateMusicVideoBreakdownWithReferences } from './app/actions/music-video/index.js';

console.log('🧪 Testing fixes...\n');

// Test Story Mode Export Fix
console.log('1. Testing Story Mode Export Fix...');
try {
  if (typeof extractStoryReferences === 'function') {
    console.log('✅ extractStoryReferences is exported correctly');
  } else {
    throw new Error('extractStoryReferences is not a function');
  }
  
  if (typeof generateStoryBreakdownWithReferences === 'function') {
    console.log('✅ generateStoryBreakdownWithReferences is exported correctly');
  } else {
    throw new Error('generateStoryBreakdownWithReferences is not a function');
  }
} catch (error) {
  console.log('❌ Story mode export test failed:', error.message);
}

// Test Music Video Mode Export Fix
console.log('\n2. Testing Music Video Mode Export Fix...');
try {
  if (typeof extractMusicVideoReferences === 'function') {
    console.log('✅ extractMusicVideoReferences is exported correctly');
  } else {
    throw new Error('extractMusicVideoReferences is not a function');
  }
  
  if (typeof generateMusicVideoBreakdownWithReferences === 'function') {
    console.log('✅ generateMusicVideoBreakdownWithReferences is exported correctly');
  } else {
    throw new Error('generateMusicVideoBreakdownWithReferences is not a function');
  }
} catch (error) {
  console.log('❌ Music video mode export test failed:', error.message);
}

// Test with OPENAI_API_KEY if available
if (process.env.OPENAI_API_KEY) {
  console.log('\n3. Testing Story Reference Extraction (with API)...');
  try {
    const testStory = "John walked into the dark warehouse. Sarah was waiting for him with a flashlight.";
    const result = await extractStoryReferences(testStory, "nolan", "Make it suspenseful");
    
    if (result.success) {
      console.log('✅ Story reference extraction works');
      console.log(`   Found ${result.data.characters.length} characters, ${result.data.locations.length} locations, ${result.data.props.length} props`);
    } else {
      console.log('❌ Story reference extraction failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Story reference extraction error:', error.message);
  }

  console.log('\n4. Testing Music Video Reference Extraction (with API)...');
  try {
    const result = await extractMusicVideoReferences(
      "Test Song",
      "Test Artist", 
      "Walking down the street, feeling the beat, dancing in the night",
      "spike-jonze",
      "Make it surreal and creative"
    );
    
    if (result.success) {
      console.log('✅ Music video reference extraction works');
      console.log(`   Found ${result.data.locations?.length || 0} locations, ${result.data.wardrobe?.length || 0} wardrobe items, ${result.data.props?.length || 0} props`);
    } else {
      console.log('❌ Music video reference extraction failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Music video reference extraction error:', error.message);
  }
} else {
  console.log('\n⚠️  OPENAI_API_KEY not found - skipping API tests');
}

console.log('\n🎉 Fix verification complete!');