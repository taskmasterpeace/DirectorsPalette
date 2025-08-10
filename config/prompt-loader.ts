/**
 * Prompt loader for managing external prompt configurations
 */
import path from 'path'
import fs from 'fs/promises'

export interface PromptTemplate {
  template: string
  variables: string[]
}

export interface PromptConfig {
  [key: string]: string | PromptConfig
}

class PromptLoader {
  private static instance: PromptLoader
  private prompts: Map<string, PromptConfig> = new Map()
  private loaded = false

  private constructor() {}

  static getInstance(): PromptLoader {
    if (!PromptLoader.instance) {
      PromptLoader.instance = new PromptLoader()
    }
    return PromptLoader.instance
  }

  /**
   * Load all prompt configurations
   */
  async load(): Promise<void> {
    if (this.loaded) return

    try {
      const promptsDir = path.join(process.cwd(), 'config', 'prompts')
      const files = await fs.readdir(promptsDir)
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const category = file.replace('.json', '')
          const content = await fs.readFile(path.join(promptsDir, file), 'utf-8')
          const config = JSON.parse(content) as PromptConfig
          this.prompts.set(category, config)
        }
      }
      
      this.loaded = true
    } catch (error) {
      console.warn('Failed to load prompt configurations:', error)
      this.loaded = true
    }
  }

  /**
   * Get a prompt by category and key
   */
  getPrompt(category: string, key: string): string | undefined {
    const categoryPrompts = this.prompts.get(category)
    if (!categoryPrompts) return undefined
    
    return this.getNestedValue(categoryPrompts, key)
  }

  /**
   * Get all prompts for a category
   */
  getCategory(category: string): PromptConfig | undefined {
    return this.prompts.get(category)
  }

  /**
   * Parse template variables from a prompt
   */
  parseTemplate(prompt: string): PromptTemplate {
    const variables: string[] = []
    const regex = /\{([^}]+)\}/g
    let match

    while ((match = regex.exec(prompt)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    return {
      template: prompt,
      variables,
    }
  }

  /**
   * Replace variables in a prompt template
   */
  fillTemplate(template: string, variables: Record<string, string>): string {
    let result = template
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
    }
    
    return result
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): string | undefined {
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }
    
    return typeof current === 'string' ? current : undefined
  }

  /**
   * Get all loaded categories
   */
  getCategories(): string[] {
    return Array.from(this.prompts.keys())
  }

  /**
   * Check if prompts are loaded
   */
  isLoaded(): boolean {
    return this.loaded
  }
}

// ===== Exports =====
export const promptLoader = PromptLoader.getInstance()
export default promptLoader