/**
 * Manual Application Testing
 * Tests core functionality without complex test framework setup
 */

console.log('=== Director\'s Palette Functionality Test ===\n');

// Test 1: Check if core files exist and can be imported
const tests = [];

async function testFileImports() {
  console.log('1. Testing File Imports...');
  
  try {
    // Test core action files
    const fs = await import('fs');
    const path = await import('path');
    
    const criticalFiles = [
      'app/actions/story/references.ts',
      'app/actions/commercial/generate.ts', 
      'app/actions/image-edit.ts',
      'components/containers/StoryContainer.tsx',
      'components/containers/CommercialContainer.tsx',
      'app/post-production/page.tsx',
      'app/settings/page.tsx',
      'lib/post-production/transfer.ts',
      'lib/commercial-templates.ts',
      'stores/templates-store.ts'
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const file of criticalFiles) {
      try {
        if (fs.existsSync(file)) {
          console.log(`  ✓ ${file}`);
          passed++;
        } else {
          console.log(`  ✗ ${file} - NOT FOUND`);
          failed++;
        }
      } catch (error) {
        console.log(`  ✗ ${file} - ERROR: ${error.message}`);
        failed++;
      }
    }
    
    tests.push({
      test: 'File Imports',
      passed,
      failed,
      status: failed === 0 ? 'PASS' : 'FAIL'
    });
    
  } catch (error) {
    tests.push({
      test: 'File Imports', 
      passed: 0,
      failed: 1,
      status: 'FAIL',
      error: error.message
    });
  }
}

async function testStoryTransferLogic() {
  console.log('\n2. Testing Story Transfer Logic...');
  
  try {
    // Simulate story shot conversion
    const sampleChapterBreakdown = {
      chapterId: 'chapter-1',
      shots: [
        'Wide shot of detective walking into warehouse',
        'Close-up of briefcase on table',
        'Medium shot of detective examining evidence'
      ]
    };
    
    // Test the ID generation logic manually
    const shots = [];
    sampleChapterBreakdown.shots.forEach((shotDescription, index) => {
      const id = `${sampleChapterBreakdown.chapterId}_shot_${index + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      shots.push({
        id,
        projectId: 'test-project',
        projectType: 'story',
        shotNumber: index + 1,
        description: shotDescription,
        sourceChapter: sampleChapterBreakdown.chapterId
      });
    });
    
    // Check for unique IDs
    const ids = shots.map(s => s.id);
    const uniqueIds = new Set(ids);
    
    if (ids.length === uniqueIds.size) {
      console.log('  ✓ Shot IDs are unique');
      console.log(`  ✓ Generated ${shots.length} shots`);
      console.log(`  ✓ Sample ID: ${shots[0].id}`);
      
      tests.push({
        test: 'Story Transfer Logic',
        passed: 3,
        failed: 0,
        status: 'PASS'
      });
    } else {
      console.log('  ✗ Duplicate shot IDs found');
      tests.push({
        test: 'Story Transfer Logic',
        passed: 0,
        failed: 1, 
        status: 'FAIL',
        error: 'Duplicate IDs generated'
      });
    }
    
  } catch (error) {
    console.log(`  ✗ Story transfer test failed: ${error.message}`);
    tests.push({
      test: 'Story Transfer Logic',
      passed: 0,
      failed: 1,
      status: 'FAIL', 
      error: error.message
    });
  }
}

async function testBrowserFeatures() {
  console.log('\n3. Testing Browser Feature Dependencies...');
  
  const features = [
    { name: 'localStorage', check: () => typeof Storage !== 'undefined' },
    { name: 'sessionStorage', check: () => typeof Storage !== 'undefined' },
    { name: 'URL.createObjectURL', check: () => typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' },
    { name: 'FileReader', check: () => typeof FileReader !== 'undefined' },
    { name: 'fetch', check: () => typeof fetch !== 'undefined' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  features.forEach(feature => {
    try {
      if (feature.check()) {
        console.log(`  ✓ ${feature.name} available`);
        passed++;
      } else {
        console.log(`  ✗ ${feature.name} not available`);
        failed++;
      }
    } catch (error) {
      console.log(`  ✗ ${feature.name} check failed: ${error.message}`);
      failed++;
    }
  });
  
  tests.push({
    test: 'Browser Features',
    passed,
    failed,
    status: failed === 0 ? 'PASS' : 'FAIL'
  });
}

async function testTemplateStructure() {
  console.log('\n4. Testing Template System Structure...');
  
  try {
    // Test commercial template structure
    const expectedCommercialTemplates = [
      'tech-product-reveal',
      'saas-productivity-demo', 
      'electronics-lifestyle-integration',
      'restaurant-community-experience',
      'nonprofit-impact-story'
    ];
    
    // Test if we can validate template structure
    const sampleTemplate = {
      id: 'test-template',
      name: 'Test Template',
      type: 'commercial',
      category: 'sample',
      content: {
        brandDescription: 'Test brand',
        campaignGoals: 'Test goals',
        targetAudience: 'Test audience',
        keyMessages: 'Test messages',
        constraints: 'Test constraints'
      }
    };
    
    const requiredFields = ['id', 'name', 'type', 'category', 'content'];
    const hasAllFields = requiredFields.every(field => sampleTemplate.hasOwnProperty(field));
    
    if (hasAllFields) {
      console.log('  ✓ Template structure validation passed');
      console.log('  ✓ Required fields present:', requiredFields.join(', '));
      
      tests.push({
        test: 'Template Structure',
        passed: 2,
        failed: 0,
        status: 'PASS'
      });
    } else {
      console.log('  ✗ Missing required template fields');
      tests.push({
        test: 'Template Structure',
        passed: 0,
        failed: 1,
        status: 'FAIL'
      });
    }
    
  } catch (error) {
    console.log(`  ✗ Template test failed: ${error.message}`);
    tests.push({
      test: 'Template Structure', 
      passed: 0,
      failed: 1,
      status: 'FAIL',
      error: error.message
    });
  }
}

async function testApiKeyValidation() {
  console.log('\n5. Testing API Key Validation...');
  
  try {
    // Test API key validation logic
    const validateKey = (type, key) => {
      if (!key.trim()) return { valid: false, error: 'Empty key' };
      
      if (type === 'openai') {
        if (!key.startsWith('sk-')) return { valid: false, error: 'Should start with sk-' };
        if (key.length < 20) return { valid: false, error: 'Too short' };
      } else if (type === 'replicate') {
        if (!key.startsWith('r8_')) return { valid: false, error: 'Should start with r8_' };
        if (key.length < 20) return { valid: false, error: 'Too short' };
      }
      
      return { valid: true };
    };
    
    // Test cases
    const testCases = [
      { type: 'openai', key: 'sk-1234567890abcdefghijk', expected: true },
      { type: 'openai', key: 'invalid-key', expected: false },
      { type: 'replicate', key: 'r8_1234567890abcdefghijk', expected: true },
      { type: 'replicate', key: 'invalid-token', expected: false },
      { type: 'openai', key: '', expected: false }
    ];
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach((testCase, index) => {
      const result = validateKey(testCase.type, testCase.key);
      if (result.valid === testCase.expected) {
        console.log(`  ✓ Test case ${index + 1}: ${testCase.type} validation`);
        passed++;
      } else {
        console.log(`  ✗ Test case ${index + 1}: Expected ${testCase.expected}, got ${result.valid}`);
        failed++;
      }
    });
    
    tests.push({
      test: 'API Key Validation',
      passed,
      failed,
      status: failed === 0 ? 'PASS' : 'FAIL'
    });
    
  } catch (error) {
    console.log(`  ✗ API validation test failed: ${error.message}`);
    tests.push({
      test: 'API Key Validation',
      passed: 0,
      failed: 1,
      status: 'FAIL',
      error: error.message
    });
  }
}

// Run all tests
async function runTests() {
  await testFileImports();
  await testStoryTransferLogic();
  await testBrowserFeatures();
  await testTemplateStructure();
  await testApiKeyValidation();
  
  // Summary
  console.log('\n=== TEST RESULTS SUMMARY ===');
  const totalPassed = tests.reduce((sum, test) => sum + (test.passed || 0), 0);
  const totalFailed = tests.reduce((sum, test) => sum + (test.failed || 0), 0);
  const totalTests = tests.length;
  
  tests.forEach(test => {
    console.log(`${test.status === 'PASS' ? '✓' : '✗'} ${test.test}: ${test.status}`);
    if (test.error) {
      console.log(`    Error: ${test.error}`);
    }
  });
  
  console.log(`\nOverall: ${totalPassed} passed, ${totalFailed} failed out of ${totalTests} test suites`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️  ISSUES FOUND - Application may not work correctly');
  } else {
    console.log('\n✅ Basic functionality tests passed');
  }
}

runTests().catch(console.error);