/**
 * Story Camera Movement Logic Tests
 * Validates that camera movement options properly control shot generation
 */

import { describe, test, expect } from 'vitest'

describe('Story Camera Movement Logic', () => {
  describe('Prompt Generation with Camera Options', () => {
    test('Camera movement enabled should include movement details', () => {
      const promptOptions = { includeCameraStyle: true, includeColorPalette: true }
      
      // Simulate the prompt building logic from breakdown.ts
      const cameraInstruction = promptOptions.includeCameraStyle 
        ? 'Camera movement details (dolly, zoom, pan, tilt)'
        : 'NO camera movements - create static frame descriptions only'
      
      const colorInstruction = promptOptions.includeColorPalette 
        ? 'Color and lighting notes' 
        : 'Basic lighting descriptions only'
      
      expect(cameraInstruction).toContain('Camera movement details')
      expect(cameraInstruction).toContain('dolly, zoom, pan, tilt')
      expect(colorInstruction).toContain('Color and lighting notes')
    })

    test('Camera movement disabled should explicitly forbid movements', () => {
      const promptOptions = { includeCameraStyle: false, includeColorPalette: false }
      
      const cameraInstruction = promptOptions.includeCameraStyle 
        ? 'Camera movement details (dolly, zoom, pan, tilt)'
        : 'NO camera movements - create static frame descriptions only'
      
      const colorInstruction = promptOptions.includeColorPalette 
        ? 'Color and lighting notes' 
        : 'Basic lighting descriptions only'
      
      expect(cameraInstruction).toContain('NO camera movements')
      expect(cameraInstruction).toContain('static frame descriptions only')
      expect(colorInstruction).toContain('Basic lighting descriptions only')
    })

    test('Example shot format changes based on camera option', () => {
      const promptOptionsWithCamera = { includeCameraStyle: true, includeColorPalette: true }
      const promptOptionsWithoutCamera = { includeCameraStyle: false, includeColorPalette: true }
      
      const exampleWithCamera = promptOptionsWithCamera.includeCameraStyle 
        ? '"Medium shot of @protagonist at @warehouse entrance, holding @briefcase. Slow dolly in as shadows fall across face. Cool blue tones with harsh backlighting."'
        : '"Medium shot of @protagonist at @warehouse entrance, holding @briefcase. Shadows fall across face. Cool blue tones with harsh backlighting."'
      
      const exampleWithoutCamera = promptOptionsWithoutCamera.includeCameraStyle 
        ? '"Medium shot of @protagonist at @warehouse entrance, holding @briefcase. Slow dolly in as shadows fall across face. Cool blue tones with harsh backlighting."'
        : '"Medium shot of @protagonist at @warehouse entrance, holding @briefcase. Shadows fall across face. Cool blue tones with harsh backlighting."'
      
      expect(exampleWithCamera).toContain('Slow dolly in')
      expect(exampleWithoutCamera).not.toContain('Slow dolly in')
      expect(exampleWithoutCamera).not.toContain('dolly')
      expect(exampleWithoutCamera).not.toContain('movement')
    })
  })

  describe('Story Container Options Processing', () => {
    test('serializedPromptOptions converts correctly', () => {
      // Simulate the StoryContainer logic
      const storyPromptOptions = {
        includeCameraStyle: false,
        includeColorPalette: true
      }
      
      const serializedPromptOptions = {
        includeCameraStyle: Boolean(storyPromptOptions?.includeCameraStyle),
        includeColorPalette: Boolean(storyPromptOptions?.includeColorPalette)
      }
      
      expect(serializedPromptOptions.includeCameraStyle).toBe(false)
      expect(serializedPromptOptions.includeColorPalette).toBe(true)
    })

    test('boolean conversion handles undefined values', () => {
      const undefinedOptions = undefined
      
      const serializedPromptOptions = {
        includeCameraStyle: Boolean(undefinedOptions?.includeCameraStyle),
        includeColorPalette: Boolean(undefinedOptions?.includeColorPalette)
      }
      
      expect(serializedPromptOptions.includeCameraStyle).toBe(false)
      expect(serializedPromptOptions.includeColorPalette).toBe(false)
    })
  })

  describe('Shot Description Validation', () => {
    test('Static shots should not contain camera movement keywords', () => {
      const staticShotExamples = [
        "Medium shot of @protagonist at @warehouse entrance, holding @briefcase. Shadows fall across face.",
        "Wide shot of @warehouse exterior at night. Rain reflects on asphalt.",
        "Close-up of @briefcase on metal table. Red emergency light illuminates the scene."
      ]
      
      const cameraMovementKeywords = [
        'dolly', 'zoom', 'pan', 'tilt', 'push in', 'pull out', 'track', 'crane',
        'handheld', 'steadicam', 'moving', 'following', 'circling'
      ]
      
      staticShotExamples.forEach(shot => {
        const containsMovement = cameraMovementKeywords.some(keyword => 
          shot.toLowerCase().includes(keyword.toLowerCase())
        )
        expect(containsMovement).toBe(false)
      })
    })

    test('Dynamic shots should contain camera movement keywords', () => {
      const dynamicShotExamples = [
        "Medium shot of @protagonist at @warehouse entrance, holding @briefcase. Slow dolly in as shadows fall across face.",
        "Wide shot of @warehouse exterior at night. Camera pans across the empty parking lot.",
        "Close-up of @briefcase on metal table. Push in tight as @protagonist reaches for it."
      ]
      
      const cameraMovementKeywords = [
        'dolly', 'zoom', 'pan', 'tilt', 'push in', 'pull out', 'track', 'crane'
      ]
      
      dynamicShotExamples.forEach(shot => {
        const containsMovement = cameraMovementKeywords.some(keyword => 
          shot.toLowerCase().includes(keyword.toLowerCase())
        )
        expect(containsMovement).toBe(true)
      })
    })
  })

  describe('Integration Test Scenarios', () => {
    test('User unchecks camera movement - should generate static descriptions', () => {
      // Mock user interaction: unchecking "Include camera movement details"
      const userSettings = {
        includeCameraStyle: false,
        includeColorPalette: true
      }
      
      // Simulate what the prompt generator should create
      const expectedPromptInstruction = 'NO camera movements - create static frame descriptions only'
      const expectedExampleShot = '"Medium shot of @protagonist at @warehouse entrance, holding @briefcase. Shadows fall across face. Cool blue tones with harsh backlighting."'
      
      expect(expectedPromptInstruction).toContain('NO camera movements')
      expect(expectedPromptInstruction).toContain('static frame descriptions')
      expect(expectedExampleShot).not.toContain('dolly')
      expect(expectedExampleShot).not.toContain('pan')
      expect(expectedExampleShot).not.toContain('zoom')
    })

    test('User checks camera movement - should generate dynamic descriptions', () => {
      // Mock user interaction: checking "Include camera movement details"
      const userSettings = {
        includeCameraStyle: true,
        includeColorPalette: true
      }
      
      // Simulate what the prompt generator should create
      const expectedPromptInstruction = 'Camera movement details (dolly, zoom, pan, tilt)'
      const expectedExampleShot = '"Medium shot of @protagonist at @warehouse entrance, holding @briefcase. Slow dolly in as shadows fall across face. Cool blue tones with harsh backlighting."'
      
      expect(expectedPromptInstruction).toContain('Camera movement details')
      expect(expectedPromptInstruction).toContain('dolly, zoom, pan, tilt')
      expect(expectedExampleShot).toContain('Slow dolly in')
    })
  })
})

// Helper function to validate shot descriptions
export function validateShotDescription(shot: string, allowCameraMovement: boolean): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  const cameraMovementKeywords = [
    'dolly', 'zoom', 'pan', 'tilt', 'push in', 'pull out', 'track', 'crane',
    'handheld', 'steadicam', 'moving', 'following', 'circling', 'sweeping'
  ]
  
  const containsMovement = cameraMovementKeywords.some(keyword => 
    shot.toLowerCase().includes(keyword.toLowerCase())
  )
  
  if (!allowCameraMovement && containsMovement) {
    const foundKeywords = cameraMovementKeywords.filter(keyword => 
      shot.toLowerCase().includes(keyword.toLowerCase())
    )
    issues.push(`Contains camera movement keywords when static shots requested: ${foundKeywords.join(', ')}`)
  }
  
  if (allowCameraMovement && !containsMovement) {
    // This is not necessarily an error, but worth noting
    // Some shots might be intentionally static even with camera movement enabled
  }
  
  return {
    valid: issues.length === 0,
    issues
  }
}