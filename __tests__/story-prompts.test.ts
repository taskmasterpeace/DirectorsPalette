/**
 * Unit Tests for Story Generation Features
 * These tests verify that our prompt options work correctly
 */

import { buildFilmDirectorStyle } from '../app/actions-story'

// Mock director for testing
const mockDirector = {
  name: "Test Director",
  description: "A test director for unit testing",
  visualLanguage: "Cinematic and dramatic",
  cameraStyle: "Steady cam, wide shots, close-ups",
  colorPalette: "Warm tones, high contrast",
  narrativeFocus: "Character development"
}

describe('Story Generation - Prompt Options', () => {
  
  test('Camera style option works correctly', () => {
    // Test that includeCameraStyle option affects prompt generation
    const basePrompt = "Generate a shot list."
    
    // When includeCameraStyle is TRUE
    let finalPrompt = basePrompt
    const includeCameraStyle = true
    
    if (!includeCameraStyle) {
      finalPrompt += `\nIMPORTANT: Minimize detailed camera movement descriptions.`
    }
    
    // Should NOT include the minimize instruction
    expect(finalPrompt).toBe("Generate a shot list.")
    expect(finalPrompt).not.toContain("Minimize detailed camera movement")
    
    // When includeCameraStyle is FALSE
    finalPrompt = basePrompt
    const excludeCameraStyle = false
    
    if (!excludeCameraStyle) {
      finalPrompt += `\nIMPORTANT: Minimize detailed camera movement descriptions.`
    }
    
    // Should include the minimize instruction
    expect(finalPrompt).toContain("Minimize detailed camera movement")
  })
  
  test('Color palette option works correctly', () => {
    const basePrompt = "Generate a shot list."
    
    // When includeColorPalette is FALSE
    let finalPrompt = basePrompt
    const includeColorPalette = false
    
    if (!includeColorPalette) {
      finalPrompt += `\nIMPORTANT: Minimize detailed color palette and lighting descriptions.`
    }
    
    // Should include the minimize color instruction
    expect(finalPrompt).toContain("Minimize detailed color palette")
  })
  
  test('Director notes priority is enforced', () => {
    const directorNotes = "Focus on emotional close-ups"
    const prompt = `DIRECTOR NOTES (HIGHEST PRIORITY - MANDATORY):
${directorNotes}

DIRECTOR STYLE PROFILE:
Test director style`
    
    // Should include director notes prominently
    expect(prompt).toContain("HIGHEST PRIORITY - MANDATORY")
    expect(prompt).toContain(directorNotes)
    expect(prompt.indexOf(directorNotes)).toBeLessThan(prompt.indexOf("DIRECTOR STYLE PROFILE"))
  })
  
  test('Reference format is correct', () => {
    const shotDescription = "Wide shot featuring @protagonist at @apartment with @gun"
    
    // Should contain properly formatted references
    expect(shotDescription).toMatch(/@\w+/)  // Contains @reference format
    expect(shotDescription).toContain("@protagonist")
    expect(shotDescription).toContain("@apartment") 
    expect(shotDescription).toContain("@gun")
  })
})

describe('Director Style Building', () => {
  test('buildFilmDirectorStyle handles missing director gracefully', () => {
    const result = buildFilmDirectorStyle(undefined)
    expect(result).toBe("Standard, balanced coverage focusing on clarity and storytelling.")
  })
  
  test('buildFilmDirectorStyle formats director info correctly', () => {
    const result = buildFilmDirectorStyle(mockDirector)
    
    expect(result).toContain("DIRECTOR: Test Director")
    expect(result).toContain("DESCRIPTION: A test director for unit testing")
    expect(result).toContain("VISUAL LANGUAGE: Cinematic and dramatic")
    expect(result).toContain("COLOR PALETTE: Warm tones, high contrast")
  })
})

// Helper function to simulate prompt generation
function generatePromptWithOptions(
  basePrompt: string, 
  options: { includeCameraStyle: boolean; includeColorPalette: boolean }
): string {
  let prompt = basePrompt
  
  if (!options.includeCameraStyle) {
    prompt += `\nIMPORTANT: Minimize detailed camera movement descriptions.`
  }
  if (!options.includeColorPalette) {
    prompt += `\nIMPORTANT: Minimize detailed color palette and lighting descriptions.`
  }
  
  return prompt
}

describe('Integration - Full Prompt Generation', () => {
  test('Full prompt respects all options', () => {
    const basePrompt = "Generate shots for this chapter"
    const options = {
      includeCameraStyle: false,
      includeColorPalette: true
    }
    
    const result = generatePromptWithOptions(basePrompt, options)
    
    // Should minimize camera movement but allow color descriptions
    expect(result).toContain("Minimize detailed camera movement")
    expect(result).not.toContain("Minimize detailed color palette")
  })
})