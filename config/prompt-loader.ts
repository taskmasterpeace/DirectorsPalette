/**
 * Prompt loader for managing external prompt configurations
 */
import path from 'path'

export interface PromptTemplate {
  template: string
  variables: string[]
}

export interface PromptConfig {
  [key: string]: string | PromptConfig
}

// Server-side file reading function
async function readPromptFile(category: string): Promise<PromptConfig | null> {
  if (typeof window !== 'undefined') {
    // Client-side: return null, will use fallbacks
    return null
  }
  
  try {
    // Dynamic import to avoid bundling fs in client
    const fs = await import('fs/promises')
    const filePath = path.join(process.cwd(), 'config', 'prompts', `${category}.json`)
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content) as PromptConfig
  } catch (error) {
    console.warn(`Failed to load prompt file for category ${category}:`, error)
    return null
  }
}

class PromptLoader {
  private static instance: PromptLoader
  private prompts: Map<string, PromptConfig> = new Map()
  private loaded = false
  private fallbackPrompts: Map<string, PromptConfig> = new Map()

  constructor() {
    this.initializeFallbacks()
  }

  static getInstance(): PromptLoader {
    if (!PromptLoader.instance) {
      PromptLoader.instance = new PromptLoader()
    }
    return PromptLoader.instance
  }

  /**
   * Initialize fallback prompts for when file loading fails
   */
  private initializeFallbacks() {
    // Story prompts fallbacks
    this.fallbackPrompts.set('story-prompts', {
      storyStructureDetection: 'Analyze the following story and break it into logical chapters...',
      chapterBreakdown: 'Generate a detailed shot breakdown for this chapter...',
      additionalShots: 'Generate additional shots for this chapter...',
      titleCard: 'Generate title cards for this chapter...',
      systemPrompts: {
        structureAnalysis: 'You are a professional story analyst...',
        chapterBreakdown: 'You are a cinematographer breaking down chapters...',
        additionalShots: 'You are generating additional shots...',
        titleDesigner: 'You are a title designer...'
      }
    })

    // Director prompts fallbacks
    this.fallbackPrompts.set('director-prompts', {
      styleGeneration: 'Generate director style details...',
      systemPrompts: {
        styleGeneration: 'You are a film critic analyzing director styles...'
      }
    })
  }

  /**
   * Load all prompt configurations
   */
  async loadPrompts(): Promise<void> {
    if (this.loaded) return

    try {
      // Try to load each category
      const categories = ['story-prompts', 'director-prompts']
      
      for (const category of categories) {
        const config = await readPromptFile(category)
        if (config) {
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
    // Try loaded prompts first
    let categoryPrompts = this.prompts.get(category)
    
    // Fall back to fallback prompts
    if (!categoryPrompts) {
      categoryPrompts = this.fallbackPrompts.get(category)
    }
    
    if (!categoryPrompts) return undefined
    
    return this.getNestedValue(categoryPrompts, key)
  }

  /**
   * Get all prompts for a category
   */
  getCategory(category: string): PromptConfig | undefined {
    return this.prompts.get(category) || this.fallbackPrompts.get(category)
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: PromptConfig, key: string): string | undefined {
    const keys = key.split('.')
    let current: any = obj
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        return undefined
      }
    }
    
    return typeof current === 'string' ? current : undefined
  }

  /**
   * Fill template with variables
   */
  fillTemplate(template: string, variables: Record<string, string>): string {
    let filled = template
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`
      filled = filled.replace(new RegExp(placeholder, 'g'), value)
    }
    
    return filled
  }

  /**
   * Get filled prompt template
   */
  getFilledPrompt(category: string, key: string, variables: Record<string, string>): string {
    const template = this.getPrompt(category, key)
    if (!template) return ''
    
    return this.fillTemplate(template, variables)
  }

  /**
   * Check if prompts are loaded
   */
  isLoaded(): boolean {
    return this.loaded
  }

  /**
   * Reset loader state (useful for testing)
   */
  reset(): void {
    this.prompts.clear()
    this.loaded = false
  }
}

// Export singleton instance
export const promptLoader = PromptLoader.getInstance()