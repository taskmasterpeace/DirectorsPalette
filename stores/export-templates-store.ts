import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface ExportTemplate {
  id: string
  name: string
  category: 'camera' | 'lighting' | 'technical' | 'genre' | 'custom'
  prefix: string
  suffix: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

interface ExportTemplatesState {
  templates: ExportTemplate[]
  isLoading: boolean
}

interface ExportTemplatesActions {
  // Template management
  addTemplate: (template: Omit<ExportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTemplate: (id: string, updates: Partial<ExportTemplate>) => void
  deleteTemplate: (id: string) => void
  getTemplatesByCategory: (category: ExportTemplate['category']) => ExportTemplate[]
  
  // Load default templates
  loadDefaultTemplates: () => void
  
  // Reset
  resetTemplates: () => void
}

const defaultTemplates: Omit<ExportTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Camera Templates
  {
    name: "Wide Shot Setup",
    category: "camera",
    prefix: "Camera: Wide shot, ",
    suffix: "",
    description: "Standard wide shot camera angle prefix"
  },
  {
    name: "Close-up Shot Setup", 
    category: "camera",
    prefix: "Camera: Close-up, ",
    suffix: "",
    description: "Intimate close-up camera angle"
  },
  {
    name: "Drone/Aerial Setup",
    category: "camera", 
    prefix: "Camera: Drone shot, aerial view, ",
    suffix: "",
    description: "Aerial photography setup"
  },
  {
    name: "Medium Shot Setup",
    category: "camera",
    prefix: "Camera: Medium shot, ",
    suffix: "",
    description: "Standard medium shot framing"
  },

  // Lighting Templates
  {
    name: "Golden Hour",
    category: "lighting",
    prefix: "",
    suffix: ", golden hour lighting, warm tones",
    description: "Warm, natural golden hour lighting"
  },
  {
    name: "Dramatic Noir",
    category: "lighting",
    prefix: "",
    suffix: ", dramatic noir lighting, high contrast shadows",
    description: "Film noir style dramatic lighting"
  },
  {
    name: "Soft Natural",
    category: "lighting", 
    prefix: "",
    suffix: ", soft natural lighting, diffused",
    description: "Gentle, natural lighting setup"
  },
  {
    name: "Neon/Urban Night",
    category: "lighting",
    prefix: "",
    suffix: ", neon lighting, urban night atmosphere",
    description: "Modern urban nighttime lighting"
  },

  // Technical Templates
  {
    name: "4K Professional",
    category: "technical",
    prefix: "",
    suffix: ", 4K resolution, professional photography, detailed",
    description: "High-quality technical specifications"
  },
  {
    name: "Cinematic Quality",
    category: "technical",
    prefix: "",
    suffix: ", cinematic quality, film grain, professional grade",
    description: "Film-quality technical settings"
  },
  {
    name: "Commercial Style",
    category: "technical",
    prefix: "",
    suffix: ", commercial photography style, polished, high-end",
    description: "Commercial advertising quality"
  },

  // Genre-Specific Templates
  {
    name: "Hip-Hop Music Video",
    category: "genre",
    prefix: "Music video shot: ",
    suffix: ", hip-hop style, urban aesthetic, high energy",
    description: "Hip-hop music video styling"
  },
  {
    name: "Pop Music Video",
    category: "genre", 
    prefix: "Music video shot: ",
    suffix: ", pop music video style, colorful, dynamic",
    description: "Pop music video aesthetic"
  },
  {
    name: "Thriller Movie",
    category: "genre",
    prefix: "Thriller scene: ",
    suffix: ", suspenseful atmosphere, tension building",
    description: "Thriller/suspense movie styling"
  },
  {
    name: "Action Sequence",
    category: "genre",
    prefix: "Action shot: ",
    suffix: ", dynamic movement, high energy, intense",
    description: "Action movie sequence styling"
  },
  {
    name: "Drama Scene",
    category: "genre",
    prefix: "Drama scene: ",
    suffix: ", emotional depth, intimate framing",
    description: "Character drama styling"
  },

  // Combination Templates
  {
    name: "Complete Hip-Hop Setup",
    category: "custom",
    prefix: "Music video shot: Wide angle, ",
    suffix: ", golden hour lighting, hip-hop style, 4K resolution",
    description: "Complete hip-hop music video setup with lighting and technical specs"
  },
  {
    name: "Complete Thriller Setup",
    category: "custom",
    prefix: "Thriller scene: Close-up, ",
    suffix: ", dramatic noir lighting, high contrast, cinematic quality",
    description: "Complete thriller movie setup with dramatic lighting"
  },
  {
    name: "Complete Commercial Setup",
    category: "custom",
    prefix: "Commercial shot: Medium shot, ",
    suffix: ", soft natural lighting, commercial photography style, 4K detailed",
    description: "Complete commercial/advertising setup"
  }
]

const initialState: ExportTemplatesState = {
  templates: [],
  isLoading: false
}

export const useExportTemplatesStore = create<ExportTemplatesState & ExportTemplatesActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        addTemplate: (template) => {
          const newTemplate: ExportTemplate = {
            ...template,
            id: `export_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        
        loadDefaultTemplates: () => {
          const { templates } = get()
          
          // Only load defaults if they don't exist
          const hasDefaults = templates.some(t => 
            defaultTemplates.some(dt => dt.name === t.name)
          )
          if (hasDefaults) return
          
          const now = new Date()
          const templatesWithIds: ExportTemplate[] = defaultTemplates.map((template, index) => ({
            ...template,
            id: `default_export_${index}`,
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
        name: 'export-templates-store',
        // Persist user templates, defaults are loaded on demand
        partialize: (state) => ({
          templates: state.templates.filter(t => !t.id.startsWith('default_'))
        })
      }
    ),
    { name: 'export-templates-store' }
  )
)