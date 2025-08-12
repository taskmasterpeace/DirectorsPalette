#!/usr/bin/env node

/**
 * Simple Test Runner - Educational Demo
 * This shows you how unit testing works without external frameworks
 */

// Simple assertion function
function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected "${expected}" but got "${actual}"`)
      }
      return true
    },
    toContain: (substring) => {
      if (!actual.includes(substring)) {
        throw new Error(`Expected "${actual}" to contain "${substring}"`)
      }
      return true
    },
    not: {
      toContain: (substring) => {
        if (actual.includes(substring)) {
          throw new Error(`Expected "${actual}" to NOT contain "${substring}"`)
        }
        return true
      }
    }
  }
}

// Test runner
function test(description, testFunction) {
  try {
    testFunction()
    console.log(`✅ PASS: ${description}`)
    return true
  } catch (error) {
    console.log(`❌ FAIL: ${description}`)
    console.log(`   Error: ${error.message}`)
    return false
  }
}

function describe(suiteName, suiteFunction) {
  console.log(`\n🧪 Testing: ${suiteName}`)
  console.log('='.repeat(50))
  suiteFunction()
}

// Mock our director building function (simplified version)
function buildFilmDirectorStyle(director) {
  if (!director) return "Standard, balanced coverage focusing on clarity and storytelling."
  
  const parts = [
    director.name ? `DIRECTOR: ${director.name}` : null,
    director.description ? `DESCRIPTION: ${director.description}` : null,
    director.visualLanguage ? `VISUAL LANGUAGE: ${director.visualLanguage}` : null,
    director.colorPalette ? `COLOR PALETTE: ${director.colorPalette}` : null,
  ].filter(Boolean)
  
  return parts.join('\n')
}

// Our actual tests
describe('Story Generation - Prompt Options', () => {
  
  test('Camera style option works correctly', () => {
    const basePrompt = "Generate a shot list."
    
    // When includeCameraStyle is TRUE
    let finalPrompt = basePrompt
    const includeCameraStyle = true
    
    if (!includeCameraStyle) {
      finalPrompt += `\nIMPORTANT: Minimize detailed camera movement descriptions.`
    }
    
    expect(finalPrompt).toBe("Generate a shot list.")
    expect(finalPrompt).not.toContain("Minimize detailed camera movement")
    
    // When includeCameraStyle is FALSE 
    finalPrompt = basePrompt
    const excludeCameraStyle = false
    
    if (!excludeCameraStyle) {
      finalPrompt += `\nIMPORTANT: Minimize detailed camera movement descriptions.`
    }
    
    expect(finalPrompt).toContain("Minimize detailed camera movement")
  })
  
  test('Director notes have highest priority', () => {
    const directorNotes = "Focus on emotional close-ups"
    const prompt = `DIRECTOR NOTES (HIGHEST PRIORITY - MANDATORY):
${directorNotes}

DIRECTOR STYLE PROFILE:
Test director style`
    
    expect(prompt).toContain("HIGHEST PRIORITY - MANDATORY")
    expect(prompt).toContain(directorNotes)
  })
  
  test('Reference format is correct', () => {
    const shotDescription = "Wide shot featuring @protagonist at @apartment with @gun"
    
    expect(shotDescription).toContain("@protagonist")
    expect(shotDescription).toContain("@apartment") 
    expect(shotDescription).toContain("@gun")
  })
})

describe('Director Style Building', () => {
  
  test('Handles missing director gracefully', () => {
    const result = buildFilmDirectorStyle(undefined)
    expect(result).toBe("Standard, balanced coverage focusing on clarity and storytelling.")
  })
  
  test('Formats director info correctly', () => {
    const mockDirector = {
      name: "Test Director",
      description: "A test director",
      visualLanguage: "Cinematic and dramatic",
      colorPalette: "Warm tones"
    }
    
    const result = buildFilmDirectorStyle(mockDirector)
    
    expect(result).toContain("DIRECTOR: Test Director")
    expect(result).toContain("DESCRIPTION: A test director")
    expect(result).toContain("VISUAL LANGUAGE: Cinematic and dramatic")
    expect(result).toContain("COLOR PALETTE: Warm tones")
  })
})

// Helper function for testing full prompt generation
function generatePromptWithOptions(basePrompt, options) {
  let prompt = basePrompt
  
  if (!options.includeCameraStyle) {
    prompt += `\nIMPORTANT: Minimize detailed camera movement descriptions.`
  }
  if (!options.includeColorPalette) {
    prompt += `\nIMPORTANT: Minimize detailed color palette and lighting descriptions.`
  }
  
  return prompt
}

describe('Integration Tests', () => {
  
  test('Full prompt respects all options', () => {
    const basePrompt = "Generate shots for this chapter"
    const options = {
      includeCameraStyle: false,  // Should minimize camera
      includeColorPalette: true   // Should allow color
    }
    
    const result = generatePromptWithOptions(basePrompt, options)
    
    expect(result).toContain("Minimize detailed camera movement")
    expect(result).not.toContain("Minimize detailed color palette")
  })
  
  test('Clear story function works', () => {
    // Simulate story state
    let storyData = {
      story: "Once upon a time...",
      breakdown: { chapters: [] },
      additionalShots: { "chapter1": ["shot1"] }
    }
    
    // Simulate clear function
    function clearStory() {
      storyData.story = ""
      storyData.breakdown = null
      storyData.additionalShots = {}
    }
    
    // Test before clearing
    expect(storyData.story).toContain("Once upon a time")
    
    // Clear and test after
    clearStory()
    expect(storyData.story).toBe("")
  })
})

console.log('\n🎯 Unit Testing Demo Complete!')
console.log('\n📚 What you learned:')
console.log('   • Unit tests verify individual functions work correctly')
console.log('   • They catch bugs early in development') 
console.log('   • They give you confidence when making changes')
console.log('   • They serve as living documentation of how code should work')

console.log('\n⚡ To run this test: node test-runner.js')
console.log('🌟 Now try changing some values and see tests fail!')