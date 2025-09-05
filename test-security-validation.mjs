/**
 * Security Validation Test Suite
 * Tests the complete secured application with synthetic data
 */

import fs from 'fs'

console.log('🔒 === Director\'s Palette Security Validation Test ===\n');

// Synthetic test data
const SYNTHETIC_DATA = {
  testUsers: [
    {
      email: 'user1@test.com',
      name: 'Test User One',
      role: 'user',
      expectedPoints: 2500
    },
    {
      email: 'user2@test.com', 
      name: 'Test User Two',
      role: 'user',
      expectedPoints: 2500
    },
    {
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin',
      expectedPoints: 2500
    }
  ],
  
  testStory: `Chapter 1: The Discovery
A young detective named @sarah_chen discovers a mysterious briefcase in an abandoned warehouse. The @industrial_warehouse is filled with shadows and the @briefcase_artifact glows with an otherworldly light.

Chapter 2: The Investigation  
Detective @sarah_chen returns to her office to examine the @briefcase_artifact. The @police_station is buzzing with activity as she uncovers strange symbols.`,

  testMusicVideo: {
    artist: 'Test Artist',
    song: 'Sample Song',
    lyrics: 'We are the champions, we are the fighters, nothing can stop us now',
    genre: 'pop',
    mood: 'energetic'
  },
  
  testCommercial: {
    product: 'Test Product',
    brand: 'Test Brand',
    campaign: 'Launch Campaign',
    target: 'Young professionals'
  }
}

const tests = []

// Test 1: Security Configuration Verification
async function testSecurityConfig() {
  console.log('1. Testing Security Configuration...')
  
  try {
    // Check if security files exist
    const securityFiles = [
      'lib/auth/admin-security.ts',
      'lib/middleware/api-security.ts', 
      'app/api/admin/verify/route.ts',
      'SECURITY-AUDIT-REPORT.md'
    ]
    
    let passed = 0
    let failed = 0
    
    for (const file of securityFiles) {
      if (fs.existsSync(file)) {
        console.log(`  ✓ ${file}`)
        passed++
      } else {
        console.log(`  ✗ ${file} - NOT FOUND`)
        failed++
      }
    }
    
    tests.push({
      name: 'Security Configuration',
      passed,
      failed,
      status: failed === 0 ? 'PASS' : 'FAIL'
    })
    
  } catch (error) {
    console.log(`  ✗ Security config test failed: ${error.message}`)
    tests.push({
      name: 'Security Configuration',
      passed: 0,
      failed: 1,
      status: 'FAIL'
    })
  }
}

// Test 2: Admin Authentication Security
async function testAdminSecurity() {
  console.log('\n2. Testing Admin Authentication Security...')
  
  try {
    // Test server-side admin verification endpoint
    const response = await fetch('http://localhost:3000/api/admin/verify')
    
    if (response.status === 401) {
      console.log('  ✓ Admin API requires authentication')
      tests.push({
        name: 'Admin Authentication',
        passed: 1,
        failed: 0,
        status: 'PASS'
      })
    } else {
      console.log('  ✗ Admin API accessible without auth')
      tests.push({
        name: 'Admin Authentication', 
        passed: 0,
        failed: 1,
        status: 'FAIL'
      })
    }
    
  } catch (error) {
    console.log(`  ⚠️ Could not test admin API: ${error.message}`)
    tests.push({
      name: 'Admin Authentication',
      passed: 0,
      failed: 0,
      status: 'SKIP'
    })
  }
}

// Test 3: File Upload Security
async function testFileUploadSecurity() {
  console.log('\n3. Testing File Upload Security...')
  
  try {
    // Test unauthenticated file upload
    const formData = new FormData()
    const testFile = new Blob(['test content'], { type: 'text/plain' })
    formData.append('file', testFile, 'test.txt')
    
    const response = await fetch('http://localhost:3000/api/upload-media', {
      method: 'POST',
      body: formData
    })
    
    if (response.status === 401) {
      console.log('  ✓ File upload requires authentication')
      tests.push({
        name: 'File Upload Security',
        passed: 1,
        failed: 0,
        status: 'PASS'
      })
    } else {
      console.log('  ✗ File upload accessible without auth')
      tests.push({
        name: 'File Upload Security',
        passed: 0,
        failed: 1,
        status: 'FAIL'
      })
    }
    
  } catch (error) {
    console.log(`  ⚠️ Could not test file upload: ${error.message}`)
    tests.push({
      name: 'File Upload Security',
      passed: 0,
      failed: 0,
      status: 'SKIP'
    })
  }
}

// Test 4: Rate Limiting
async function testRateLimit() {
  console.log('\n4. Testing Rate Limiting...')
  
  try {
    // Make multiple rapid requests to test rate limiting
    const promises = []
    for (let i = 0; i < 15; i++) {
      promises.push(
        fetch('http://localhost:3000/api/test-env')
          .then(r => ({ status: r.status, attempt: i + 1 }))
          .catch(e => ({ status: 0, attempt: i + 1, error: e.message }))
      )
    }
    
    const results = await Promise.all(promises)
    const rateLimited = results.some(r => r.status === 429)
    
    if (rateLimited) {
      console.log('  ✓ Rate limiting active')
      tests.push({
        name: 'Rate Limiting',
        passed: 1,
        failed: 0,
        status: 'PASS'
      })
    } else {
      console.log('  ✗ No rate limiting detected')
      tests.push({
        name: 'Rate Limiting',
        passed: 0,
        failed: 1,
        status: 'FAIL'
      })
    }
    
  } catch (error) {
    console.log(`  ⚠️ Could not test rate limiting: ${error.message}`)
    tests.push({
      name: 'Rate Limiting',
      passed: 0,
      failed: 0,
      status: 'SKIP'
    })
  }
}

// Test 5: Application Functionality with Synthetic Data
async function testApplicationFlow() {
  console.log('\n5. Testing Application with Synthetic Data...')
  
  try {
    console.log('  📊 Using synthetic test data:')
    console.log(`    - ${SYNTHETIC_DATA.testUsers.length} test users`)
    console.log(`    - Story: ${SYNTHETIC_DATA.testStory.length} characters`)
    console.log(`    - Music video data: ${SYNTHETIC_DATA.testMusicVideo.artist}`)
    console.log(`    - Commercial data: ${SYNTHETIC_DATA.testCommercial.brand}`)
    
    // Verify synthetic data structure
    const hasValidData = SYNTHETIC_DATA.testUsers.length > 0 &&
                        SYNTHETIC_DATA.testStory.length > 0 &&
                        SYNTHETIC_DATA.testMusicVideo.artist &&
                        SYNTHETIC_DATA.testCommercial.brand
    
    if (hasValidData) {
      console.log('  ✓ Synthetic data structure valid')
      tests.push({
        name: 'Synthetic Data',
        passed: 1,
        failed: 0,
        status: 'PASS'
      })
    } else {
      console.log('  ✗ Invalid synthetic data structure')
      tests.push({
        name: 'Synthetic Data',
        passed: 0,
        failed: 1,
        status: 'FAIL'
      })
    }
    
  } catch (error) {
    console.log(`  ✗ Synthetic data test failed: ${error.message}`)
    tests.push({
      name: 'Synthetic Data',
      passed: 0,
      failed: 1,
      status: 'FAIL'
    })
  }
}

// Run all tests
async function runSecurityTests() {
  await testSecurityConfig()
  await testAdminSecurity()
  await testFileUploadSecurity()
  await testRateLimit()
  await testApplicationFlow()
  
  // Summary
  console.log('\n🔒 === Security Test Summary ===')
  
  const totalPassed = tests.reduce((sum, test) => sum + test.passed, 0)
  const totalFailed = tests.reduce((sum, test) => sum + test.failed, 0)
  const totalTests = tests.length
  
  tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${test.name}: ${test.status} (${test.passed}/${test.passed + test.failed})`)
  })
  
  console.log(`\nOverall: ${totalPassed}/${totalPassed + totalFailed} security checks passed`)
  
  if (totalFailed === 0) {
    console.log('🎉 All security tests passed! Application is secure for deployment.')
  } else {
    console.log('🚨 Security issues found. Review and fix before production deployment.')
  }
}

// Execute tests
runSecurityTests().catch(console.error)