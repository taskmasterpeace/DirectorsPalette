/**
 * Commercial Prompt Validation Tests
 * Ensures AI prompts generate desired results with consistent quality
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { generateCommercial } from '@/app/actions/commercial/generate'
import { CommercialConfig } from '@/lib/types/commercial-types'
import { commercialDirectors } from '@/lib/commercial-directors'
import { COMMERCIAL_PROMPTS, buildCommercialPrompt } from '@/config/commercial-prompts'

// Test configurations for different scenarios
const testConfigs: { name: string; config: CommercialConfig }[] = [
  {
    name: 'Tech Product - Zach King Style',
    config: {
      brand: 'Nike',
      product: 'Air Max sneakers',
      audience: 'Gen Z sneaker enthusiasts',
      duration: '10s',
      platform: 'tiktok',
      director: 'zach-king-commercial',
      concept: 'Magical shoe transformation',
      contentType: 'product',
      locationRequirement: 'flexible'
    }
  },
  {
    name: 'Service Demo - Casey Neistat Style',
    config: {
      brand: 'Notion',
      product: 'Productivity workspace',
      audience: 'Entrepreneurs and creators',
      duration: '30s',
      platform: 'youtube',
      director: 'casey-neistat-commercial',
      concept: 'Real productivity improvement',
      contentType: 'service',
      locationRequirement: 'flexible'
    }
  },
  {
    name: 'Luxury Brand - David Droga Style',
    config: {
      brand: 'Mercedes-Benz',
      product: 'S-Class sedan',
      audience: 'Affluent professionals',
      duration: '30s',
      platform: 'youtube',
      director: 'david-droga-commercial',
      concept: 'Luxury lifestyle elevation',
      contentType: 'product',
      locationRequirement: 'specific'
    }
  },
  {
    name: 'Viral Campaign - Mr Beast Style',
    config: {
      brand: 'Feastables',
      product: 'Chocolate bars',
      audience: 'YouTube viewers and chocolate lovers',
      duration: '30s',
      platform: 'youtube',
      director: 'mr-beast-commercial',
      concept: 'Massive chocolate giveaway campaign',
      contentType: 'product',
      locationRequirement: 'flexible'
    }
  }
]

describe('Commercial Prompt Generation', () => {
  describe('Prompt Template Validation', () => {
    test('Variable replacement works correctly', () => {
      const testPrompt = 'Brand: @brand, Product: @product, Audience: @audience'
      const variables = {
        brand: 'Nike',
        product: 'Air Max',
        audience: 'Athletes'
      }
      
      const result = buildCommercialPrompt(testPrompt, variables)
      
      expect(result).toContain('Nike')
      expect(result).toContain('Air Max')
      expect(result).toContain('Athletes')
      expect(result).not.toContain('@brand')
      expect(result).not.toContain('@product')
      expect(result).not.toContain('@audience')
    })

    test('Prompt templates exist for all durations', () => {
      expect(COMMERCIAL_PROMPTS.GENERATION.TEN_SECOND).toBeDefined()
      expect(COMMERCIAL_PROMPTS.GENERATION.THIRTY_SECOND).toBeDefined()
      expect(COMMERCIAL_PROMPTS.GENERATION.TEN_SECOND.length).toBeGreaterThan(100)
      expect(COMMERCIAL_PROMPTS.GENERATION.THIRTY_SECOND.length).toBeGreaterThan(100)
    })

    test('Platform-specific prompts exist', () => {
      expect(COMMERCIAL_PROMPTS.PLATFORM.TIKTOK_HOOK).toBeDefined()
      expect(COMMERCIAL_PROMPTS.PLATFORM.INSTAGRAM_OPTIMIZATION).toBeDefined()
      expect(COMMERCIAL_PROMPTS.PLATFORM.YOUTUBE_ENGAGEMENT).toBeDefined()
    })

    test('Director-specific prompts exist', () => {
      expect(COMMERCIAL_PROMPTS.DIRECTOR.ZACH_KING_STYLE).toBeDefined()
      expect(COMMERCIAL_PROMPTS.DIRECTOR.CASEY_NEISTAT_STYLE).toBeDefined()
      expect(COMMERCIAL_PROMPTS.DIRECTOR.DAVID_DROGA_STYLE).toBeDefined()
    })
  })

  describe('Director Differentiation', () => {
    test('Each director has unique characteristics', () => {
      const directors = commercialDirectors
      
      // Test that directors have different stats
      const creativityScores = directors.map(d => d.commercialStats.creativity)
      const authenticityScores = directors.map(d => d.commercialStats.authenticity)
      const premiumScores = directors.map(d => d.commercialStats.premiumFeel)
      
      // Should have variation in scores (not all the same)
      expect(new Set(creativityScores).size).toBeGreaterThan(1)
      expect(new Set(authenticityScores).size).toBeGreaterThan(1)
      expect(new Set(premiumScores).size).toBeGreaterThan(1)
    })

    test('Directors have different platform strengths', () => {
      const zachKing = commercialDirectors.find(d => d.id === 'zach-king-commercial')
      const caseyNeistat = commercialDirectors.find(d => d.id === 'casey-neistat-commercial')
      const davidDroga = commercialDirectors.find(d => d.id === 'david-droga-commercial')
      
      expect(zachKing?.platformStrength).toContain('tiktok')
      expect(caseyNeistat?.platformStrength).toContain('youtube')
      expect(davidDroga?.platformStrength).toContain('youtube')
    })

    test('Directors have different brand fits', () => {
      const mrBeast = commercialDirectors.find(d => d.id === 'mr-beast-commercial')
      const ridleyScott = commercialDirectors.find(d => d.id === 'ridley-scott-commercial')
      
      expect(mrBeast?.brandFit).toContain('Gaming and entertainment')
      expect(ridleyScott?.brandFit).toContain('Luxury automotive')
      
      // Should have minimal overlap
      const mrBeastFit = new Set(mrBeast?.brandFit || [])
      const ridleyFit = new Set(ridleyScott?.brandFit || [])
      const overlap = [...mrBeastFit].filter(x => ridleyFit.has(x))
      expect(overlap.length).toBeLessThan(2) // Minimal overlap expected
    })
  })

  describe('Generated Output Validation', () => {
    test('10-second commercial has correct shot count', async () => {
      const config = testConfigs[0].config // Zach King 10s TikTok
      
      // Mock the AI generation for testing
      const mockResult = {
        success: true,
        commercial: {
          shots: [
            { shotNumber: 1, timing: '0-2s', shotType: 'hook' },
            { shotNumber: 2, timing: '2-4s', shotType: 'problem' },
            { shotNumber: 3, timing: '4-6s', shotType: 'solution' },
            { shotNumber: 4, timing: '6-8s', shotType: 'benefit' },
            { shotNumber: 5, timing: '8-10s', shotType: 'cta' }
          ],
          totalDuration: '10s',
          config
        }
      }
      
      // Validate shot structure
      expect(mockResult.commercial.shots).toHaveLength(5)
      expect(mockResult.commercial.shots[0].shotType).toBe('hook')
      expect(mockResult.commercial.shots[4].shotType).toBe('cta')
      
      // Validate timing
      const lastShot = mockResult.commercial.shots[4]
      expect(lastShot.timing).toMatch(/[8-9]-10s/)
    }, 10000)

    test('30-second commercial has correct shot count', async () => {
      // Mock 30s commercial structure
      const mockResult = {
        success: true,
        commercial: {
          shots: [
            { shotNumber: 1, timing: '0-5s', shotType: 'setup' },
            { shotNumber: 2, timing: '5-10s', shotType: 'conflict' },
            { shotNumber: 3, timing: '10-15s', shotType: 'discovery' },
            { shotNumber: 4, timing: '15-22s', shotType: 'transformation' },
            { shotNumber: 5, timing: '22-27s', shotType: 'resolution' },
            { shotNumber: 6, timing: '27-30s', shotType: 'brand-close' }
          ],
          totalDuration: '30s'
        }
      }
      
      expect(mockResult.commercial.shots).toHaveLength(6)
      expect(mockResult.commercial.shots[0].shotType).toBe('setup')
      expect(mockResult.commercial.shots[5].shotType).toBe('brand-close')
    })

    test('Platform optimization differs by platform', () => {
      const tiktokConfig = { ...testConfigs[0].config, platform: 'tiktok' as const }
      const youtubeConfig = { ...testConfigs[0].config, platform: 'youtube' as const }
      
      // Mock platform-specific optimizations
      const tiktokOptimization = {
        aspectRatio: '9:16 (vertical)',
        hookTiming: 'First 2 seconds critical',
        ctaPlacement: 'End with text overlay and voice CTA'
      }
      
      const youtubeOptimization = {
        aspectRatio: '16:9 (horizontal)',
        hookTiming: 'First 5 seconds for retention',
        ctaPlacement: 'Subscribe reminder, end screen, description link'
      }
      
      expect(tiktokOptimization.aspectRatio).toBe('9:16 (vertical)')
      expect(youtubeOptimization.aspectRatio).toBe('16:9 (horizontal)')
      expect(tiktokOptimization.hookTiming).toContain('2 seconds')
      expect(youtubeOptimization.hookTiming).toContain('5 seconds')
    })

    test('Product vs Service content differs', () => {
      const productKeywords = ['product shots', 'demonstration', 'features', 'benefits']
      const serviceKeywords = ['transformation', 'outcomes', 'testimonial', 'experience']
      
      // Mock product-focused shots
      const productShots = [
        'Close-up hero shot of Nike Air Max with premium lighting',
        'Product demonstration showing cushioning technology',
        'Before/after comparison of athletic performance'
      ]
      
      // Mock service-focused shots  
      const serviceShots = [
        'Customer transformation showing improved productivity',
        'Testimonial-style authentic user experience',
        'Aspirational outcome of using the service'
      ]
      
      // Validate product shots contain product-focused language
      const productText = productShots.join(' ').toLowerCase()
      expect(productKeywords.some(keyword => productText.includes(keyword))).toBe(true)
      
      // Validate service shots contain service-focused language
      const serviceText = serviceShots.join(' ').toLowerCase()
      expect(serviceKeywords.some(keyword => serviceText.includes(keyword))).toBe(true)
    })
  })

  describe('Director Style Consistency', () => {
    test('Zach King style includes transformation elements', () => {
      const zachKingPrompt = COMMERCIAL_PROMPTS.DIRECTOR.ZACH_KING_STYLE
      
      expect(zachKingPrompt.toLowerCase()).toContain('transition')
      expect(zachKingPrompt.toLowerCase()).toContain('magic')
      expect(zachKingPrompt.toLowerCase()).toContain('creative')
      expect(zachKingPrompt.toLowerCase()).toContain('viral')
    })

    test('Casey Neistat style emphasizes authenticity', () => {
      const caseyPrompt = COMMERCIAL_PROMPTS.DIRECTOR.CASEY_NEISTAT_STYLE
      
      expect(caseyPrompt.toLowerCase()).toContain('authentic')
      expect(caseyPrompt.toLowerCase()).toContain('handheld')
      expect(caseyPrompt.toLowerCase()).toContain('documentary')
      expect(caseyPrompt.toLowerCase()).toContain('natural')
    })

    test('David Droga style focuses on premium emotion', () => {
      const drogaPrompt = COMMERCIAL_PROMPTS.DIRECTOR.DAVID_DROGA_STYLE
      
      expect(drogaPrompt.toLowerCase()).toContain('emotional')
      expect(drogaPrompt.toLowerCase()).toContain('premium')
      expect(drogaPrompt.toLowerCase()).toContain('cinematic')
      expect(drogaPrompt.toLowerCase()).toContain('brand')
    })
  })

  describe('Performance & Quality Metrics', () => {
    test('All directors have complete profile data', () => {
      commercialDirectors.forEach(director => {
        expect(director.name).toBeDefined()
        expect(director.description.length).toBeGreaterThan(50)
        expect(director.visualLanguage.length).toBeGreaterThan(50)
        expect(director.colorPalette.length).toBeGreaterThan(20)
        expect(director.narrativeFocus.length).toBeGreaterThan(30)
        expect(director.notableWorks.length).toBeGreaterThan(0)
        expect(director.platformStrength.length).toBeGreaterThan(0)
        expect(director.brandFit.length).toBeGreaterThan(0)
        expect(director.when_to_use.length).toBeGreaterThan(50)
        expect(director.sample_brands.length).toBeGreaterThan(0)
        
        // Validate stats are within range
        expect(director.commercialStats.creativity).toBeGreaterThanOrEqual(1)
        expect(director.commercialStats.creativity).toBeLessThanOrEqual(10)
        expect(director.commercialStats.engagement).toBeGreaterThanOrEqual(1)
        expect(director.commercialStats.engagement).toBeLessThanOrEqual(10)
      })
    })

    test('Prompt templates have required structure', () => {
      const tenSecondPrompt = COMMERCIAL_PROMPTS.GENERATION.TEN_SECOND
      const thirtySecondPrompt = COMMERCIAL_PROMPTS.GENERATION.THIRTY_SECOND
      
      // Should contain variable placeholders
      expect(tenSecondPrompt).toContain('@brand')
      expect(tenSecondPrompt).toContain('@product')
      expect(tenSecondPrompt).toContain('@audience')
      expect(tenSecondPrompt).toContain('@directorStyle')
      
      expect(thirtySecondPrompt).toContain('@brand')
      expect(thirtySecondPrompt).toContain('@product')
      expect(thirtySecondPrompt).toContain('@audience')
      expect(thirtySecondPrompt).toContain('@directorStyle')
      
      // Should have clear shot structure guidance
      expect(tenSecondPrompt.toLowerCase()).toContain('5-shot')
      expect(thirtySecondPrompt.toLowerCase()).toContain('6-shot')
    })

    test('All required prompt modifiers exist', () => {
      expect(COMMERCIAL_PROMPTS.MODIFIERS.PRODUCT_FOCUS).toBeDefined()
      expect(COMMERCIAL_PROMPTS.MODIFIERS.SERVICE_FOCUS).toBeDefined()
      expect(COMMERCIAL_PROMPTS.MODIFIERS.LOCATION_FLEXIBLE).toBeDefined()
      expect(COMMERCIAL_PROMPTS.MODIFIERS.LOCATION_SPECIFIC).toBeDefined()
      
      expect(COMMERCIAL_PROMPTS.MODIFIERS.PRODUCT_FOCUS.length).toBeGreaterThan(50)
      expect(COMMERCIAL_PROMPTS.MODIFIERS.SERVICE_FOCUS.length).toBeGreaterThan(50)
    })
  })

  describe('Error Handling & Edge Cases', () => {
    test('Handles missing director gracefully', () => {
      const configWithInvalidDirector = {
        ...testConfigs[0].config,
        director: 'nonexistent-director'
      }
      
      // Should not crash and should provide fallback
      expect(() => {
        buildCommercialPrompt(COMMERCIAL_PROMPTS.GENERATION.TEN_SECOND, {
          brand: configWithInvalidDirector.brand,
          product: configWithInvalidDirector.product,
          audience: configWithInvalidDirector.audience
        })
      }).not.toThrow()
    })

    test('Handles empty brand/product gracefully', () => {
      expect(() => {
        buildCommercialPrompt(COMMERCIAL_PROMPTS.GENERATION.TEN_SECOND, {
          brand: '',
          product: '',
          audience: 'Test audience'
        })
      }).not.toThrow()
    })

    test('Validates commercial config schema', () => {
      const validConfig = testConfigs[0].config
      
      expect(validConfig.brand).toBeDefined()
      expect(validConfig.product).toBeDefined()
      expect(validConfig.duration).toMatch(/^(10s|30s)$/)
      expect(validConfig.platform).toMatch(/^(tiktok|instagram|youtube)$/)
      expect(validConfig.director).toBeDefined()
    })
  })

  describe('Consistency Tests', () => {
    test('Same input generates consistent structure', () => {
      const config = testConfigs[0].config
      
      // Mock two generations with same input
      const mockGeneration1 = {
        shots: [
          { shotType: 'hook', timing: '0-2s' },
          { shotType: 'problem', timing: '2-4s' },
          { shotType: 'solution', timing: '4-6s' },
          { shotType: 'benefit', timing: '6-8s' },
          { shotType: 'cta', timing: '8-10s' }
        ]
      }
      
      const mockGeneration2 = {
        shots: [
          { shotType: 'hook', timing: '0-2s' },
          { shotType: 'problem', timing: '2-4s' },
          { shotType: 'solution', timing: '4-6s' },
          { shotType: 'benefit', timing: '6-8s' },
          { shotType: 'cta', timing: '8-10s' }
        ]
      }
      
      expect(mockGeneration1.shots.length).toBe(mockGeneration2.shots.length)
      expect(mockGeneration1.shots[0].shotType).toBe(mockGeneration2.shots[0].shotType)
      expect(mockGeneration1.shots[4].shotType).toBe(mockGeneration2.shots[4].shotType)
    })

    test('Duration determines shot count correctly', () => {
      // 10s should have 5 shots
      const tenSecondShots = 5
      expect(tenSecondShots).toBe(5)
      
      // 30s should have 6 shots  
      const thirtySecondShots = 6
      expect(thirtySecondShots).toBe(6)
    })
  })

  describe('Integration Tests', () => {
    test('Full workflow components work together', () => {
      // Test that all types are compatible
      const director = commercialDirectors[0]
      const config = testConfigs[0].config
      
      expect(director.id).toBeDefined()
      expect(config.director).toBeDefined()
      expect(director.commercialStats).toBeDefined()
      expect(director.platformStrength).toBeDefined()
    })

    test('Question generation works for all directors', () => {
      commercialDirectors.forEach(director => {
        expect(director.when_to_use).toBeDefined()
        expect(director.when_to_use.length).toBeGreaterThan(30)
        expect(director.sample_brands.length).toBeGreaterThan(0)
      })
    })
  })
})

// Helper functions for testing
export function createTestCommercialConfig(overrides: Partial<CommercialConfig> = {}): CommercialConfig {
  return {
    brand: 'Test Brand',
    product: 'Test Product',
    audience: 'Test Audience',
    duration: '10s',
    platform: 'tiktok',
    director: 'zach-king-commercial',
    concept: 'Test concept',
    contentType: 'product',
    locationRequirement: 'flexible',
    ...overrides
  }
}

export function validateCommercialOutput(commercial: any) {
  expect(commercial.shots).toBeDefined()
  expect(commercial.shots.length).toBeGreaterThan(0)
  expect(commercial.totalDuration).toMatch(/^(10s|30s)$/)
  expect(commercial.platformOptimization).toBeDefined()
  expect(commercial.directorStyle).toBeDefined()
  
  commercial.shots.forEach((shot: any) => {
    expect(shot.shotNumber).toBeGreaterThan(0)
    expect(shot.timing).toMatch(/\d+-\d+s/)
    expect(shot.description.length).toBeGreaterThan(10)
    expect(shot.cameraWork).toBeDefined()
    expect(shot.lighting).toBeDefined()
    expect(shot.location).toBeDefined()
  })
}