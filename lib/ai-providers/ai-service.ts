'use client'

import { openai } from '@ai-sdk/openai'
import { generateObject, generateText } from 'ai'
import { getModelForFunction, type AdminModelSelection } from './openrouter-config'

// AI Service that abstracts model selection
export class AIService {
  private adminConfig: AdminModelSelection

  constructor() {
    // Load admin configuration
    this.adminConfig = this.loadAdminConfig()
  }

  private loadAdminConfig(): AdminModelSelection {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-model-config')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (error) {
          console.error('Failed to load admin config:', error)
        }
      }
    }
    return {}
  }

  // Get the appropriate model for a function
  private getModel(functionName: string) {
    const modelConfig = getModelForFunction(functionName, this.adminConfig)
    
    // For now, fall back to OpenAI until OpenRouter package is installed
    // TODO: Replace with OpenRouter provider when package is working
    if (modelConfig.id.startsWith('openai/')) {
      return openai(modelConfig.id.replace('openai/', ''))
    }
    
    // Fallback to default OpenAI models
    return openai('gpt-4o')
  }

  // Story generation
  async generateStoryBreakdown(prompt: string, systemPrompt: string) {
    const model = this.getModel('story-breakdown')
    
    console.log(`🤖 Using model for story breakdown: ${this.getModelForFunction('story-breakdown', this.adminConfig).name}`)
    
    return generateText({
      model,
      prompt,
      system: systemPrompt,
      temperature: 0.7,
      maxTokens: 4000
    })
  }

  // Music video analysis  
  async generateMusicVideoBreakdown(prompt: string, systemPrompt: string) {
    const model = this.getModel('music-analysis')
    
    console.log(`🤖 Using model for music analysis: ${this.getModelForFunction('music-analysis', this.adminConfig).name}`)
    
    return generateText({
      model,
      prompt,
      system: systemPrompt,
      temperature: 0.6,
      maxTokens: 3000
    })
  }

  // Director creation
  async generateDirectorStyle(prompt: string, systemPrompt: string) {
    const model = this.getModel('director-creation')
    
    console.log(`🤖 Using model for director creation: ${this.getModelForFunction('director-creation', this.adminConfig).name}`)
    
    return generateText({
      model,
      prompt,
      system: systemPrompt,
      temperature: 0.8,
      maxTokens: 2000
    })
  }

  // Entity extraction
  async extractEntities(prompt: string, schema: any) {
    const model = this.getModel('entity-extraction')
    
    console.log(`🤖 Using model for entity extraction: ${this.getModelForFunction('entity-extraction', this.adminConfig).name}`)
    
    return generateObject({
      model,
      prompt,
      schema,
      temperature: 0.3
    })
  }

  // Commercial generation
  async generateCommercialConcept(prompt: string, systemPrompt: string) {
    const model = this.getModel('commercial-generation')
    
    console.log(`🤖 Using model for commercial generation: ${this.getModelForFunction('commercial-generation', this.adminConfig).name}`)
    
    return generateText({
      model,
      prompt,
      system: systemPrompt,
      temperature: 0.7,
      maxTokens: 3000
    })
  }

  // Get current model info for display
  getCurrentModels() {
    return {
      story: this.getModelForFunction('story-breakdown', this.adminConfig),
      music: this.getModelForFunction('music-analysis', this.adminConfig),
      director: this.getModelForFunction('director-creation', this.adminConfig),
      entity: this.getModelForFunction('entity-extraction', this.adminConfig),
      commercial: this.getModelForFunction('commercial-generation', this.adminConfig)
    }
  }

  // Refresh admin config
  refreshConfig() {
    this.adminConfig = this.loadAdminConfig()
  }
}

// Export singleton instance
export const aiService = new AIService()