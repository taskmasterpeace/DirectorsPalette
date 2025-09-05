import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface PromptTemplate {
  id: string
  name: string
  template: string // Template with [tag] placeholders
  description: string
  category: 'character' | 'location' | 'action' | 'style' | 'custom'
  tags: string[] // List of available tags like ['character-tag', 'action-tag']
  createdAt: Date
  updatedAt: Date
}

interface PromptTemplatesState {
  templates: PromptTemplate[]
  isLoading: boolean
}

interface PromptTemplatesActions {
  // Template management
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => void
  deleteTemplate: (id: string) => void
  getTemplatesByCategory: (category: PromptTemplate['category']) => PromptTemplate[]
  
  // Template processing
  processTemplate: (templateId: string, tagValues: { [key: string]: string }) => string
  
  // Load defaults
  loadDefaultTemplates: () => void
  
  // Reset
  resetTemplates: () => void
}

const defaultPromptTemplates: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Character Templates
  {
    name: "Split Screen Character",
    category: "character",
    template: "Create a split screen composition of [character-tag]. On the left side, show a close-up portrait of [character-tag]'s face with clear facial features and expression. On the right side, show a full body shot of [character-tag] standing in [pose-style] pose. Both images should have [lighting-style] lighting and [photo-style] photography style.",
    description: "Split screen showing character face and full body",
    tags: ["character-tag", "pose-style", "lighting-style", "photo-style"]
  },
  {
    name: "Character Face Portrait", 
    category: "character",
    template: "Create a detailed portrait photograph of [character-tag]'s face, showing clear facial features, expression, and personality. Use [lighting-style] lighting with [photo-style] photography style. Focus on capturing the character's essence and mood.",
    description: "Detailed character face portrait for reference",
    tags: ["character-tag", "lighting-style", "photo-style"]
  },
  {
    name: "Character in Action",
    category: "character", 
    template: "Photograph [character-tag] [action-description] in [location-setting]. Show [character-tag] with [expression-mood] expression, captured with [camera-angle] angle and [lighting-style] lighting. [photo-style] photography style.",
    description: "Character performing specific action in context",
    tags: ["character-tag", "action-description", "location-setting", "expression-mood", "camera-angle", "lighting-style", "photo-style"]
  },
  {
    name: "Character Style Reference",
    category: "character",
    template: "Create a fashion reference shot of [character-tag] wearing [outfit-description]. Show [character-tag]'s complete outfit including [accessories-description]. Use [lighting-style] lighting to highlight the clothing and style details. [photo-style] photography.",
    description: "Fashion and style reference for character",
    tags: ["character-tag", "outfit-description", "accessories-description", "lighting-style", "photo-style"]
  },

  // Location Templates  
  {
    name: "Location Establishing Shot",
    category: "location",
    template: "Wide establishing shot of [location-name] during [time-of-day]. Show the [architectural-style] architecture and [atmosphere-description] atmosphere. Use [camera-angle] angle with [lighting-style] lighting. [photo-style] photography style.",
    description: "Wide establishing shot of any location",
    tags: ["location-name", "time-of-day", "architectural-style", "atmosphere-description", "camera-angle", "lighting-style", "photo-style"]
  },
  {
    name: "Location Interior Detail",
    category: "location",
    template: "Interior shot of [location-name] focusing on [interior-details]. Show the [mood-description] mood and [lighting-style] lighting. Capture [specific-elements] with [camera-angle] angle. [photo-style] photography.",
    description: "Detailed interior location shots",
    tags: ["location-name", "interior-details", "mood-description", "lighting-style", "specific-elements", "camera-angle", "photo-style"]
  },

  // Action Templates
  {
    name: "Performance Shot",
    category: "action", 
    template: "[character-tag] performing [performance-type] with [energy-level] energy. Show [character-tag] [performance-action] with [expression-description] expression. Use [camera-movement] camera movement and [lighting-style] lighting. [photo-style] style.",
    description: "Performance and concert shots",
    tags: ["character-tag", "performance-type", "energy-level", "performance-action", "expression-description", "camera-movement", "lighting-style", "photo-style"]
  },
  {
    name: "Interaction Scene",
    category: "action",
    template: "[character-tag] [interaction-type] with [other-character]. Show [character-tag] with [emotion-description] emotion while [action-description]. Use [camera-angle] to capture [focus-element]. [lighting-style] lighting, [photo-style] photography.",
    description: "Character interactions and dialogue",
    tags: ["character-tag", "interaction-type", "other-character", "emotion-description", "action-description", "camera-angle", "focus-element", "lighting-style", "photo-style"]
  },

  // Style Templates
  {
    name: "Cinematic Portrait",
    category: "style",
    template: "Cinematic portrait of [subject-tag] with dramatic [lighting-type] lighting. Show [subject-tag] with [expression-mood] expression against [background-description] background. Use [camera-lens] lens with shallow depth of field. Professional cinema photography.",
    description: "Cinematic style portrait photography",
    tags: ["subject-tag", "lighting-type", "expression-mood", "background-description", "camera-lens"]
  },
  {
    name: "Commercial Photography",
    category: "style",
    template: "Commercial photography of [subject-tag] for [commercial-purpose]. Show [subject-tag] with [brand-mood] mood and [styling-description] styling. Use [lighting-setup] lighting with [photo-quality] quality. Clean, professional, polished aesthetic.",
    description: "Commercial and advertising style photography",
    tags: ["subject-tag", "commercial-purpose", "brand-mood", "styling-description", "lighting-setup", "photo-quality"]
  }
]

const initialState: PromptTemplatesState = {
  templates: [],
  isLoading: false
}

export const usePromptTemplatesStore = create<PromptTemplatesState & PromptTemplatesActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        addTemplate: (template) => {
          const newTemplate: PromptTemplate = {
            ...template,
            id: `prompt_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          set((state) => ({
            templates: [...state.templates, newTemplate]
          }))
        },
        
        updateTemplate: (id, updates) => {
          set((state) => ({
            templates: state.templates.map(template =>
              template.id === id
                ? { ...template, ...updates, updatedAt: new Date() }
                : template
            )
          }))
        },
        
        deleteTemplate: (id) => {
          set((state) => ({
            templates: state.templates.filter(template => template.id !== id)
          }))
        },
        
        getTemplatesByCategory: (category) => {
          return get().templates.filter(template => template.category === category)
        },
        
        processTemplate: (templateId, tagValues) => {
          const template = get().templates.find(t => t.id === templateId)
          if (!template) return ''
          
          let processed = template.template
          
          // Replace all tags with provided values
          Object.entries(tagValues).forEach(([tag, value]) => {
            const regex = new RegExp(`\\[${tag}\\]`, 'g')
            processed = processed.replace(regex, value)
          })
          
          return processed
        },
        
        loadDefaultTemplates: () => {
          const { templates } = get()
          
          // Only load defaults if they don't exist
          const hasDefaults = templates.some(t => 
            defaultPromptTemplates.some(dt => dt.name === t.name)
          )
          if (hasDefaults) return
          
          const now = new Date()
          const templatesWithIds: PromptTemplate[] = defaultPromptTemplates.map((template, index) => ({
            ...template,
            id: `default_prompt_${index}`,
            createdAt: now,
            updatedAt: now
          }))
          
          set((state) => ({
            templates: [...state.templates, ...templatesWithIds]
          }))
        },
        
        resetTemplates: () => set(initialState)
      }),
      {
        name: 'prompt-templates-store',
        // Persist user templates, defaults are loaded on demand
        partialize: (state) => ({
          templates: state.templates.filter(t => !t.id.startsWith('default_'))
        })
      }
    ),
    { name: 'prompt-templates-store' }
  )
)

/**
 * Helper function to extract tags from template string
 */
export function extractTagsFromTemplate(template: string): string[] {
  const tagMatches = template.match(/\[([^\]]+)\]/g)
  if (!tagMatches) return []
  
  return tagMatches.map(match => match.slice(1, -1)) // Remove [ and ]
}

/**
 * Helper function to validate template
 */
export function validateTemplate(template: PromptTemplate): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!template.name.trim()) {
    errors.push('Template name is required')
  }
  
  if (!template.template.trim()) {
    errors.push('Template content is required')
  }
  
  if (!template.category) {
    errors.push('Template category is required')
  }
  
  // Check if all declared tags exist in template
  const templateTags = extractTagsFromTemplate(template.template)
  const missingTags = template.tags.filter(tag => !templateTags.includes(tag))
  const extraTags = templateTags.filter(tag => !template.tags.includes(tag))
  
  if (missingTags.length > 0) {
    errors.push(`Tags declared but not used in template: ${missingTags.join(', ')}`)
  }
  
  if (extraTags.length > 0) {
    errors.push(`Tags used in template but not declared: ${extraTags.join(', ')}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}