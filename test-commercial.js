/**
 * Test Commercial Generation
 * Quick test to verify the commercial generation workflow
 */

const { generateCommercial } = require('./app/actions/commercial/generate.ts')

async function testCommercialGeneration() {
  console.log('🎬 Testing Commercial Generation...\n')
  
  const testConfig = {
    brand: 'Nike',
    product: 'Air Max sneakers',
    audience: 'Gen Z sneaker enthusiasts',
    duration: '10s',
    platform: 'tiktok',
    director: 'zach-king',
    concept: 'Magical transformation of old shoes to new Air Max',
    contentType: 'product',
    locationRequirement: 'flexible'
  }
  
  console.log('Test Configuration:')
  console.log('- Brand:', testConfig.brand)
  console.log('- Product:', testConfig.product)
  console.log('- Platform:', testConfig.platform)
  console.log('- Director:', testConfig.director)
  console.log('- Duration:', testConfig.duration)
  console.log('\nGenerating commercial...\n')
  
  try {
    const result = await generateCommercial(testConfig)
    
    if (result.success && result.commercial) {
      console.log('✅ Commercial Generated Successfully!')
      console.log('📊 Stats:')
      console.log(`- Shots: ${result.commercial.shots.length}`)
      console.log(`- Duration: ${result.commercial.totalDuration}`)
      console.log(`- Platform: ${result.commercial.config.platform}`)
      console.log(`- Director: ${result.commercial.directorStyle.directorName}`)
      
      console.log('\n🎯 Generated Shots:')
      result.commercial.shots.forEach((shot, index) => {
        console.log(`\n${index + 1}. ${shot.shotType.toUpperCase()} (${shot.timing})`)
        console.log(`   ${shot.description}`)
        console.log(`   Camera: ${shot.cameraWork}`)
        console.log(`   Location: ${shot.location}`)
      })
      
      console.log('\n📱 Platform Optimization:')
      console.log(`- Aspect Ratio: ${result.commercial.platformOptimization.aspectRatio}`)
      console.log(`- Hook Timing: ${result.commercial.platformOptimization.hookTiming}`)
      console.log(`- CTA: ${result.commercial.platformOptimization.ctaPlacement}`)
      
      if (result.tokens_used) {
        console.log('\n💰 Token Usage:')
        console.log(`- Total Tokens: ${result.tokens_used.total}`)
      }
      
    } else {
      console.log('❌ Generation Failed:')
      console.log('Error:', result.error)
    }
    
  } catch (error) {
    console.log('❌ Test Failed:')
    console.log('Error:', error.message)
  }
}

// Only run if executed directly
if (require.main === module) {
  testCommercialGeneration()
    .then(() => {
      console.log('\n🧪 Test Complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Test Error:', error)
      process.exit(1)
    })
}

module.exports = { testCommercialGeneration }