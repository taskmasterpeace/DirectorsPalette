import { describe, it, expect } from 'vitest'
import {
  nanoBananaTemplates,
  replacePromptVariables,
  getNanoBananaChainWorkflow,
  getQuickAccessTemplates
} from '@/lib/nano-banana-templates'

describe('Nano-Banana Templates @ Reference Integration', () => {
  describe('Character Token References', () => {
    it('should include @ prefix for character tokens in all templates', () => {
      const templatesWithCharacterTokens = nanoBananaTemplates.filter(t =>
        t.variables?.includes('CHARACTER_TOKEN') ||
        t.variables?.includes('AUTO_TOKEN')
      )

      templatesWithCharacterTokens.forEach(template => {
        // Check that prompts contain @[CHARACTER_TOKEN] or @[AUTO_TOKEN]
        const hasAtReference = template.prompt.includes('@[CHARACTER_TOKEN]') ||
                              template.prompt.includes('@[AUTO_TOKEN]')

        expect(hasAtReference, `Template ${template.id} should have @ prefix for tokens`).toBe(true)
      })
    })

    it('should properly replace variables with @ prefix', () => {
      const prompt = 'Character token: @[CHARACTER_TOKEN], Environment: [NEW_ENVIRONMENT]'
      const variables = {
        CHARACTER_TOKEN: 'maya-blue-jacket',
        NEW_ENVIRONMENT: 'sunset beach'
      }

      const result = replacePromptVariables(prompt, variables)

      expect(result).toBe('Character token: @maya-blue-jacket, Environment: sunset beach')
      expect(result).toContain('@maya-blue-jacket')
      expect(result).not.toContain('[CHARACTER_TOKEN]')
      expect(result).not.toContain('[NEW_ENVIRONMENT]')
    })

    it('should maintain @ reference pattern for initialization template', () => {
      const initTemplate = nanoBananaTemplates.find(t => t.id === 'nb-character-token-init')
      expect(initTemplate).toBeDefined()
      expect(initTemplate!.prompt).toContain('@[CHARACTER_NAME]-[UNIQUE_ID]')
    })
  })

  describe('Chain Workflow Integration', () => {
    it('should have consistent @ references across chain steps', () => {
      const chainWorkflow = getNanoBananaChainWorkflow()

      expect(chainWorkflow.length).toBeGreaterThan(0)

      chainWorkflow.forEach(step => {
        if (step.variables?.includes('AUTO_TOKEN')) {
          expect(step.prompt).toContain('@[AUTO_TOKEN]')
        }
      })
    })

    it('should maintain proper order in chain workflow', () => {
      const chainWorkflow = getNanoBananaChainWorkflow()
      const steps = chainWorkflow.map(t => t.chainStep).filter(s => s !== undefined)

      // Check that steps are in order
      for (let i = 1; i < steps.length; i++) {
        expect(steps[i]).toBeGreaterThanOrEqual(steps[i - 1]!)
      }
    })
  })

  describe('Quick Access Templates', () => {
    it('should not require @ references for quick templates without tokens', () => {
      const quickTemplates = getQuickAccessTemplates()

      quickTemplates.forEach(template => {
        // Quick templates without variables should work without @ references
        if (!template.variables || template.variables.length === 0) {
          expect(template.prompt).not.toContain('@[')
        }
      })
    })
  })

  describe('Template Categories', () => {
    it('should have proper categories for all templates', () => {
      const validCategories = ['characters', 'environments', 'technical', 'workflow', 'advanced', 'quick']

      nanoBananaTemplates.forEach(template => {
        expect(validCategories).toContain(template.category)
      })
    })
  })

  describe('Reference System Compatibility', () => {
    it('should generate references compatible with @ detection system', () => {
      const testCases = [
        { token: 'john-hero', expected: '@john-hero' },
        { token: 'sarah_protagonist_001', expected: '@sarah_protagonist_001' },
        { token: 'character-A-blue', expected: '@character-A-blue' }
      ]

      testCases.forEach(({ token, expected }) => {
        const prompt = 'Character token: @[CHARACTER_TOKEN]'
        const result = replacePromptVariables(prompt, { CHARACTER_TOKEN: token })
        expect(result).toContain(expected)
      })
    })
  })

  describe('Template Validation', () => {
    it('should have all required fields for each template', () => {
      nanoBananaTemplates.forEach(template => {
        expect(template.id).toBeDefined()
        expect(template.title).toBeDefined()
        expect(template.category).toBeDefined()
        expect(template.prompt).toBeDefined()
        expect(template.description).toBeDefined()
        expect(template.tags).toBeDefined()
        expect(Array.isArray(template.tags)).toBe(true)
      })
    })

    it('should have unique IDs for all templates', () => {
      const ids = nanoBananaTemplates.map(t => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })
})