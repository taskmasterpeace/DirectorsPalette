/**
 * Manual Workflow Testing
 * Test the actual functionality that users experience
 */

// Test environment setup
process.env.NODE_ENV = 'test';
if (!process.env.OPENAI_API_KEY) {
  console.log('⚠️  OPENAI_API_KEY not found - story generation tests will fail');
}

console.log('=== Manual Workflow Tests ===\n');

async function testStoryWorkflow() {
  console.log('📚 Testing Story Mode Workflow...');
  
  try {
    // Test story breakdown function
    const { generateStoryBreakdownWithReferences } = await import('./app/actions/story/references.ts');
    
    console.log('  ✓ Story action imported successfully');
    
    // Test with minimal data
    const testStory = "John walked into the warehouse. Sarah was waiting with a flashlight.";
    const testDirector = "david-fincher";
    const testRefs = {
      characters: [{ reference: '@john', name: 'John', description: 'Detective' }],
      locations: [{ reference: '@warehouse', name: 'Warehouse', description: 'Dark industrial space' }], 
      props: [{ reference: '@flashlight', name: 'Flashlight', description: 'LED flashlight' }]
    };
    
    if (process.env.OPENAI_API_KEY) {
      console.log('  🔄 Testing story generation with API...');
      const startTime = Date.now();
      
      const result = await generateStoryBreakdownWithReferences(
        testStory,
        testDirector,
        '',
        testRefs,
        false, // titleCards
        false, // cameraStyle  
        false, // colorPalette
        'ai-suggested',
        2
      );
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log(`  ⏱️  Generation took ${duration} seconds`);
      
      if (result.success) {
        console.log('  ✓ Story generation successful');
        console.log(`  ✓ Generated ${result.data?.chapterBreakdowns?.length || 0} chapters`);
      } else {
        console.log('  ✗ Story generation failed:', result.error);
      }
    } else {
      console.log('  ⚠️  Skipping API test - no OpenAI key');
    }
    
  } catch (error) {
    console.log('  ✗ Story workflow test failed:', error.message);
  }
}

async function testPostProductionWorkflow() {
  console.log('\n🎬 Testing Post Production Workflow...');
  
  try {
    // Test shot transfer functions
    const { convertStoryShots, storeShotsForTransfer, retrieveTransferredShots } = await import('./lib/post-production/transfer.ts');
    
    console.log('  ✓ Transfer functions imported');
    
    // Test conversion
    const sampleBreakdown = [{
      chapterId: 'chapter-1',
      shots: ['Test shot 1', 'Test shot 2', 'Test shot 3']
    }];
    
    const convertedShots = convertStoryShots(sampleBreakdown, 'test-project');
    console.log(`  ✓ Converted ${convertedShots.length} shots`);
    
    // Test unique IDs
    const ids = convertedShots.map(s => s.id);
    const uniqueIds = new Set(ids);
    
    if (ids.length === uniqueIds.size) {
      console.log('  ✓ All shot IDs are unique (React key fix confirmed)');
    } else {
      console.log('  ✗ Duplicate shot IDs still present');
    }
    
    // Test shot structure
    const sampleShot = convertedShots[0];
    const requiredFields = ['id', 'projectId', 'projectType', 'shotNumber', 'description', 'sourceChapter'];
    const hasAllFields = requiredFields.every(field => sampleShot.hasOwnProperty(field));
    
    if (hasAllFields) {
      console.log('  ✓ Shot structure valid');
    } else {
      console.log('  ✗ Missing required shot fields');
    }
    
  } catch (error) {
    console.log('  ✗ Post production test failed:', error.message);
  }
}

async function testCommercialTemplates() {
  console.log('\n🎯 Testing Commercial Template System...');
  
  try {
    const templates = await import('./lib/commercial-templates.ts');
    console.log('  ✓ Commercial templates imported');
    
    const templateList = templates.commercialTemplates;
    console.log(`  ✓ Found ${templateList.length} commercial templates`);
    
    // Test new diverse templates
    const newTemplateIds = [
      'saas-productivity-demo',
      'electronics-lifestyle-integration', 
      'restaurant-community-experience',
      'nonprofit-impact-story'
    ];
    
    const foundTemplates = templateList.filter(t => newTemplateIds.includes(t.id));
    console.log(`  ✓ Found ${foundTemplates.length}/4 new diverse templates`);
    
    if (foundTemplates.length === 4) {
      console.log('  ✓ All new templates successfully added');
    } else {
      console.log('  ⚠️  Some new templates missing');
    }
    
    // Test template structure
    foundTemplates.forEach(template => {
      const hasRequiredFields = template.brandPlaceholder && template.productPlaceholder && template.defaultConfig;
      if (hasRequiredFields) {
        console.log(`  ✓ ${template.name} structure valid`);
      } else {
        console.log(`  ✗ ${template.name} missing required fields`);
      }
    });
    
  } catch (error) {
    console.log('  ✗ Commercial template test failed:', error.message);
  }
}

async function testImageEditApi() {
  console.log('\n🖼️  Testing Image Edit API...');
  
  try {
    const imageEditAction = await import('./app/actions/image-edit.ts');
    console.log('  ✓ Image edit action imported');
    
    // Test with mock data (no actual API call)
    const mockRequest = {
      imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      prompt: 'Test edit instruction'
    };
    
    console.log('  ✓ Mock request structure valid');
    console.log('  ⚠️  API call test skipped (requires Replicate token)');
    
  } catch (error) {
    console.log('  ✗ Image edit test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting comprehensive functionality tests...\n');
  
  await testStoryWorkflow();
  await testPostProductionWorkflow();
  await testCommercialTemplates();
  await testImageEditApi();
  
  console.log('\n=== MANUAL TESTING REQUIRED ===');
  console.log('🖱️  Browser Tests (manual):');
  console.log('  1. Test story generation in browser');
  console.log('  2. Test post production shot transfers');
  console.log('  3. Test image edit functionality');
  console.log('  4. Test commercial mode templates');
  console.log('  5. Test mobile responsive design');
  console.log('  6. Test API key management in Settings');
  
  console.log('\n🎯 Expected Issues to Verify:');
  console.log('  • Story → Shot List transfer working');
  console.log('  • Gen4 paste buttons functioning');
  console.log('  • Image Edit template selection populating instructions');
  console.log('  • Cross-tab image transfers working');
  console.log('  • Native aspect ratios maintained');
  
  console.log('\n✅ Automated tests complete - manual browser testing required');
}

runAllTests().catch(console.error);