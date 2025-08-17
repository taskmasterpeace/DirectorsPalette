import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface StoryTemplate {
  id: string
  name: string
  type: 'story'
  category: 'sample' | 'user' | 'test-data'
  content: {
    story: string
    storyDirectorNotes?: string
    selectedDirector?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface MusicVideoTemplate {
  id: string
  name: string
  type: 'music-video'
  category: 'sample' | 'user' | 'test-data'
  content: {
    lyrics: string
    songTitle?: string
    artist?: string
    genre?: string
    mvConcept?: string
    mvDirectorNotes?: string
    selectedMusicVideoDirector?: string
  }
  createdAt: Date
  updatedAt: Date
}

export type Template = StoryTemplate | MusicVideoTemplate

interface TemplatesState {
  templates: Template[]
  isLoading: boolean
}

interface TemplatesActions {
  // Template management
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTemplate: (id: string, updates: Partial<Template>) => void
  deleteTemplate: (id: string) => void
  getTemplatesByType: (type: 'story' | 'music-video') => Template[]
  getTemplatesByCategory: (category: 'sample' | 'user' | 'test-data') => Template[]
  
  // Load sample templates
  loadSampleTemplates: () => void
  
  // Reset
  resetTemplates: () => void
}

const sampleStoryTemplates: Omit<StoryTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Action Car Chase",
    type: "story",
    category: "sample",
    content: {
      story: `Detective Sarah Martinez races through the narrow streets of downtown, her police cruiser weaving between traffic as she pursues the black sedan ahead. The suspect takes a sharp right into an alley, tires screaming against the asphalt.

Sarah floors the accelerator, her car jumping the curb as she cuts through the construction site to intercept. Sparks fly as metal scrapes concrete. The chase leads them onto the highway where speeds reach dangerous levels.

The suspect's car suddenly swerves, clipping a truck and spinning out of control. Sarah brakes hard, her car sliding sideways as she watches the sedan flip and crash into the barrier. Steam rises from the wreckage as she calls for backup and medical assistance.`,
      storyDirectorNotes: "High-energy action sequence with practical car stunts, dynamic camera angles, and intense pacing. Think Fast & Furious meets Heat.",
      selectedDirector: "christopher-nolan"
    }
  },
  {
    name: "Psychological Thriller",
    type: "story", 
    category: "sample",
    content: {
      story: `Dr. Emma Reeves sits alone in her dimly lit office, reviewing patient files late into the night. A soft knock at the door interrupts her concentration. When she opens it, the hallway is empty, but a red envelope lies on the floor.

Inside the envelope is a photograph of her own house, taken from across the street. Written on the back in red ink: "I'm watching you." Emma's hands shake as she realizes someone has been observing her every move.

The next morning, Emma finds her car windows covered in condensation, but someone has written "HELP ME" from the inside. Her breath catches in her throat as she realizes the implications. Someone was trapped inside her car overnight.`,
      storyDirectorNotes: "Build psychological tension through subtle environmental details, shadows, and intimate close-ups. Hitchcock-inspired suspense with modern thriller elements.",
      selectedDirector: "david-fincher"
    }
  },
  {
    name: "Character Drama",
    type: "story",
    category: "sample", 
    content: {
      story: `Maria sits across from her estranged daughter Claire at a small café. Twenty years of silence hang between them like a wall. Claire's hands wrap around her coffee cup as she finally speaks: "I got your letter."

The conversation unfolds slowly, painfully. Maria explains the choices she made, the sacrifices, the regrets that have eaten away at her for decades. Claire listens, her expression unreadable, tears forming in her eyes.

As the afternoon sun streams through the window, both women realize that forgiveness isn't about forgetting the past – it's about choosing to move forward together. Claire reaches across the table and takes her mother's hand for the first time in twenty years.`,
      storyDirectorNotes: "Intimate character study focusing on emotional beats, subtle performances, and meaningful dialogue. Natural lighting and close emotional framing.",
      selectedDirector: "greta-gerwig"
    }
  }
]

const sampleMusicVideoTemplates: Omit<MusicVideoTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Hip-Hop Urban Vibe",
    type: "music-video",
    category: "sample",
    content: {
      lyrics: `[Verse 1]
Started from the bottom now we here
City lights reflecting all my fears
Grinding every day, no time for tears
Building up my empire year by year

[Chorus]
Rising up, never gonna fall
Standing tall against it all
From the streets to the penthouse hall
I remember when I had it all

[Verse 2]
Hustle in my veins, fire in my soul
Breaking every chain, reaching every goal
Stories of the struggle, that's how legends roll
Young king on the throne, taking full control`,
      songTitle: "City Lights",
      artist: "DJ Respect",
      genre: "Hip-Hop",
      mvConcept: "Urban success story showing the journey from street level to success, featuring city skylines, luxury cars, and contrast between struggle and triumph.",
      mvDirectorNotes: "High-energy visuals with drone shots of the city, luxury lifestyle imagery, and performance shots in urban locations. Mix of day and night scenes.",
      selectedMusicVideoDirector: "hype-williams"
    }
  },
  {
    name: "Pop Ballad Emotional",
    type: "music-video",
    category: "sample",
    content: {
      lyrics: `[Verse 1]
Sitting by the window watching rain
Thinking 'bout the love we used to share
Every memory brings me back again
To a time when you were always there

[Chorus]
If I could turn back time
Would you still be mine
All these tears I cry
Cannot say goodbye

[Verse 2]
Pictures on the wall tell our story
Moments that we'll never have again
In my heart you'll always have the glory
Of a love that knows no end`,
      songTitle: "Turn Back Time", 
      artist: "Luna Sky",
      genre: "Pop Ballad",
      mvConcept: "Emotional journey through memories and loss, featuring intimate indoor settings, rain imagery, and nostalgic flashback sequences.",
      mvDirectorNotes: "Soft, cinematic lighting with emotional close-ups. Natural settings like apartments, cafes. Focus on storytelling and emotional performance.",
      selectedMusicVideoDirector: "spike-jonze"
    }
  },
  {
    name: "Rock Performance Energy",
    type: "music-video",
    category: "sample", 
    content: {
      lyrics: `[Verse 1]
Turn it up, feel the power
This is our finest hour
Breaking down every wall
Standing proud, standing tall

[Chorus]
We are the ones who never break
We are the storm, make no mistake
Rock and roll pumping through our veins
Nothing left but pure adrenaline

[Verse 2]
Stage lights burning bright tonight
Crowd is screaming with delight
Music flowing through our souls
Rock and roll will never get old`,
      songTitle: "Never Break",
      artist: "Electric Storm",
      genre: "Rock",
      mvConcept: "High-energy concert performance mixed with behind-the-scenes footage and crowd interaction. Raw, authentic rock energy.",
      mvDirectorNotes: "Fast-paced editing, dramatic stage lighting, multiple camera angles. Capture the raw energy and connection between band and audience.",
      selectedMusicVideoDirector: "michel-gondry"
    }
  }
]

const initialState: TemplatesState = {
  templates: [],
  isLoading: false
}

export const useTemplatesStore = create<TemplatesState & TemplatesActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        addTemplate: (template) => {
          const newTemplate: Template = {
            ...template,
            id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date()
          } as Template
          
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
        
        getTemplatesByType: (type) => {
          return get().templates.filter(template => template.type === type)
        },
        
        getTemplatesByCategory: (category) => {
          return get().templates.filter(template => template.category === category)
        },
        
        loadSampleTemplates: () => {
          const { templates } = get()
          
          // Only load samples if they don't exist
          const hasSamples = templates.some(t => t.category === 'sample')
          if (hasSamples) return
          
          const now = new Date()
          const sampleTemplates: Template[] = [
            ...sampleStoryTemplates.map((template, index) => ({
              ...template,
              id: `sample_story_${index}`,
              createdAt: now,
              updatedAt: now
            } as StoryTemplate)),
            ...sampleMusicVideoTemplates.map((template, index) => ({
              ...template,
              id: `sample_mv_${index}`,
              createdAt: now,
              updatedAt: now
            } as MusicVideoTemplate))
          ]
          
          set((state) => ({
            templates: [...state.templates, ...sampleTemplates]
          }))
        },
        
        resetTemplates: () => set(initialState)
      }),
      {
        name: 'templates-store',
        // Only persist user templates, not samples
        partialize: (state) => ({
          templates: state.templates.filter(t => t.category === 'user')
        })
      }
    ),
    { name: 'templates-store' }
  )
)