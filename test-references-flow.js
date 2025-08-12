// Automated test for story reference extraction and generation
const TEST_STORY = `
John walked into the abandoned warehouse. The place was dark and dusty. 
He heard footsteps behind him. It was Sarah, his partner.
"We need to find the evidence before they come back," she whispered.
They searched through old boxes until they found a briefcase.
Inside was exactly what they were looking for - the stolen documents.
Suddenly, the door slammed shut. They were trapped.
`;

async function testReferenceFlow() {
  console.log('Testing Story Reference Extraction Flow');
  console.log('=======================================\n');
  
  try {
    // Test 1: Reference Extraction
    console.log('📝 Test Story:');
    console.log(TEST_STORY);
    console.log('\n✅ Expected References:');
    console.log('- Characters: John, Sarah');
    console.log('- Locations: warehouse');
    console.log('- Props: briefcase, documents, door, boxes');
    
    const response = await fetch('http://localhost:3333/api/test-references', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ story: TEST_STORY })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n🎯 Extraction Results:');
      console.log(`- Characters: ${result.characters?.length || 0} found`);
      console.log(`- Locations: ${result.locations?.length || 0} found`);
      console.log(`- Props: ${result.props?.length || 0} found`);
      
      // Verify no invented characters
      const hasOnlyRealCharacters = result.characters?.every(c => 
        ['john', 'sarah'].includes(c.name.toLowerCase())
      );
      
      if (hasOnlyRealCharacters) {
        console.log('\n✅ SUCCESS: Only real characters extracted');
      } else {
        console.log('\n❌ FAIL: Invented characters found');
      }
    } else {
      console.log('\n❌ API call failed:', response.status);
    }
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    console.log('\nMake sure the dev server is running on port 3333');
  }
}

// Create test API endpoint
const testEndpoint = `
// Add this to app/api/test-references/route.ts
import { extractStoryReferences } from '@/app/actions/story-references';

export async function POST(request: Request) {
  const { story } = await request.json();
  const result = await extractStoryReferences(story, 'tarantino', '');
  return Response.json(result);
}
`;

console.log('\n📌 To run this test, first create the test endpoint:');
console.log('File: app/api/test-references/route.ts');
console.log(testEndpoint);
console.log('\nThen run: node test-references-flow.js');

// Uncomment to run test
// testReferenceFlow();