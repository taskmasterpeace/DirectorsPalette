# Developer Reference - Director's Palette

## 🏗️ Architecture Overview

Director's Palette is a Next.js 15 application with React 19, TypeScript, and Tailwind CSS. It uses a modern stack optimized for AI content generation workflows.

### **Tech Stack**
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **UI**: React 19 + Tailwind CSS 4 + shadcn/ui
- **State Management**: Zustand with persistence
- **Database**: IndexedDB (browser-based)
- **AI**: OpenAI GPT-4 via AI SDK
- **Image Generation**: Replicate API

---

## 📁 **Directory Structure**

```
director-palette/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Main entry point
│   ├── actions/                 # Server actions (AI generation)
│   │   ├── story/              # Story-related actions
│   │   ├── music-video/        # Music video actions
│   │   └── artists/            # Artist management
│   ├── post-production/        # Image generation module
│   │   ├── page.tsx           # Post-production interface
│   │   ├── api/               # Replicate API endpoints
│   │   └── components/        # Post-production UI
│   └── studio/                # Future: Artist Bank, DNA Library
│
├── components/                  # React components
│   ├── ui/                     # shadcn/ui base components
│   ├── shared/                 # Reusable components
│   ├── story/                  # Story mode components
│   ├── music-video/           # Music video components
│   ├── artist/                # Artist-related components
│   └── containers/            # Container components
│
├── lib/                        # Core business logic
│   ├── *-db.ts               # IndexedDB operations
│   ├── *-types.ts            # TypeScript definitions
│   ├── export-processor.ts   # Bulk export logic
│   └── post-production/      # Post-production utilities
│
├── stores/                     # Zustand state stores
│   ├── app-store.ts          # Global app state
│   ├── music-video-store.ts  # Music video state
│   ├── templates-store.ts    # Template management
│   └── export-templates-store.ts # Export templates
│
├── hooks/                      # Custom React hooks
└── __tests__/                 # Test suites
    ├── unit/                  # Unit tests
    ├── integration/           # Integration tests
    └── components/            # Component tests
```

---

## 🔄 **State Management**

### **Zustand Stores Architecture**

#### **1. App Store** (`stores/app-store.ts`)
**Global application state:**
```typescript
interface AppState {
  mode: "story" | "music-video"
  isLoading: boolean
  showProjectManager: boolean
  currentProjectId: string | null
  customDirectorName: string
  customDirectorDescription: string
  isGeneratingDirectorStyle: boolean
}
```

#### **2. Music Video Store** (`stores/music-video-store.ts`)
**Music video specific state:**
```typescript
interface MusicVideoState {
  // Song Details
  lyrics: string
  songTitle: string
  artist: string
  genre: string
  
  // Creative Direction
  mvConcept: string
  mvDirectorNotes: string
  
  // Artist Integration
  selectedArtistId: string | null
  selectedArtistProfile: ArtistProfile | undefined
  artistVisualDescription: string
  showDescriptions: boolean
  
  // Results
  musicVideoBreakdown: any | null
  additionalMusicVideoShots: { [key: string]: string[] }
}
```

#### **3. Templates Store** (`stores/templates-store.ts`)
**Template management for story and music video presets:**
```typescript
interface Template {
  id: string
  name: string
  type: 'story' | 'music-video'
  category: 'sample' | 'user' | 'test-data'
  content: StoryContent | MusicVideoContent
  createdAt: Date
}
```

#### **4. Export Templates Store** (`stores/export-templates-store.ts`)
**Prefix/suffix template management:**
```typescript
interface ExportTemplate {
  id: string
  name: string
  category: 'camera' | 'lighting' | 'technical' | 'genre' | 'custom'
  prefix: string
  suffix: string
  description?: string
}
```

### **State Persistence Strategy**
- **Zustand persist middleware** for automatic localStorage persistence
- **Selective persistence** - only persist important user data
- **Migration support** for schema changes
- **IndexedDB** for large data (images, complex profiles)

---

## 🤖 **AI Integration**

### **Server Actions Pattern**

#### **File Organization**
```
app/actions/
├── story/
│   ├── breakdown.ts        # Main story generation
│   ├── references.ts       # Reference extraction
│   └── additional-shots.ts # Additional shot generation
├── music-video/
│   ├── breakdown.ts        # Music video structure
│   ├── references.ts       # Artist/location references
│   └── additional-shots.ts # Section-specific shots
└── artists/
    ├── index.ts           # Artist profile management
    └── enhanced.ts        # Advanced artist operations
```

#### **Server Action Structure**
```typescript
export async function generateStoryBreakdown(
  story: string,
  director: string,
  directorNotes: string,
  titleCardOptions?: any,
  promptOptions?: any,
  chapterMethod: string = "ai-suggested",
  userChapterCount: number = 4
) {
  // Validation
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY")
  }

  // AI Generation with structured output
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: StoryBreakdownSchema,
    prompt: constructPrompt(story, director, directorNotes),
    system: `You are a professional script supervisor...`
  })

  return { success: true, data: object }
}
```

### **AI Prompt Engineering**

#### **Story Generation Prompts**
Located in server actions, structured for:
- **Director-specific styling** (Nolan vs Tarantino vs Scorsese)
- **Technical specifications** (camera angles, lighting)
- **Character consistency** using extracted references
- **Chapter structure** (user-defined vs AI-suggested)

#### **Music Video Prompts**
- **Artist integration** with visual descriptions
- **Song structure analysis** (verse, chorus, bridge)
- **Director hallmarks** (Hype Williams vs Michel Gondry)
- **Performance vs narrative** balance

---

## 🗄️ **Database Layer**

### **IndexedDB Schema**

#### **Film Directors**
```typescript
interface FilmDirector {
  id: string
  name: string
  description: string
  visualLanguage: string
  cameraStyle: string
  colorPalette: string
  iconography: string
  notableWorks: string[]
}
```

#### **Artist Profiles**
```typescript
interface ArtistProfile {
  artist_id: string
  artist_name: string
  real_name?: string
  artist_identity: {
    gender?: string
    race_ethnicity?: string
    age_range?: string
    neighborhood?: string
    city?: string
    state?: string
  }
  visual_look: {
    skin_tone?: string
    hair_style?: string
    fashion_style?: string
    jewelry?: string
    visual_description?: string
  }
  genres: string[]
  // ... extensive schema in lib/artist-types.ts
}
```

#### **Reference Library**
```typescript
interface LibraryImageReference {
  id: string
  imageData: string // Base64 encoded
  tags: string[]
  category: 'people' | 'places' | 'props' | 'unorganized'
  source: 'generated' | 'uploaded'
  prompt?: string
  referenceTag?: string
  createdAt: Date
}
```

### **Database Operations**
```typescript
// Artist Bank operations
await artistDB.saveArtist(artistProfile)
const artists = await artistDB.getAllArtists()
await artistDB.deleteArtist(artistId)

// Reference Library operations  
await referenceLibraryDB.saveReference(imageRef)
const refs = await referenceLibraryDB.getAllReferences()
await referenceLibraryDB.deleteReference(refId)

// Director operations
await filmDirectorDB.saveDirector(director)
const directors = await filmDirectorDB.getAllDirectors()
```

---

## 🔄 **Variable Processing System**

### **Variable Registry**
The application uses a comprehensive variable system for content templating:

#### **Core Variables**
| Variable | Source | Processing Rule | Example |
|----------|--------|-----------------|---------|
| `@artist` | Artist Bank name | Replace with name or description | "Jay-Z" |
| `@artist-tag` | Generated from name | Lowercase, spaces→underscores | "jay-z" |
| `@artist-desc` | Visual description | Full description replacement | "A confident Black male rapper..." |
| `@director` | Selected director | Director name | "Christopher Nolan" |
| `@chapter` | Story structure | Chapter title | "Chapter 1: The Beginning" |
| `@section` | Music video structure | Section name | "Verse 1" |

#### **Variable Processing Pipeline**
```typescript
// 1. Extract variables from content
const variables = extractVariables(shotDescription)

// 2. Resolve variable values
const resolvedVariables = resolveVariables(variables, context)

// 3. Replace in content
const processedShot = replaceVariables(shotDescription, resolvedVariables)

// 4. Apply formatting (prefix/suffix)
const finalShot = applyPrefixSuffix(processedShot, prefix, suffix)
```

### **Artist Tag Generation Logic**
```typescript
function createArtistTag(artistName: string): string {
  return artistName
    .toLowerCase()                    // "Jay-Z" → "jay-z"
    .replace(/[^a-z0-9\s]/g, '')     // Remove special chars
    .replace(/\s+/g, '_')            // Spaces → underscores
    .replace(/_+/g, '_')             // Remove duplicate underscores
    .replace(/^_|_$/g, '')           // Trim underscores
}

// Examples:
// "Jay-Z" → "jay-z"
// "Lil Wayne" → "lil_wayne"
// "21 Savage" → "21_savage"
// "A$AP Rocky" → "asap_rocky"
```

---

## 📤 **Export System Architecture**

### **Export Processing Pipeline**

#### **1. Data Collection**
```typescript
// Story Mode
const allShots = breakdown.chapterBreakdowns.flatMap((chapter, index) => 
  chapter.shots.map(shot => ({
    id: `chapter-${index}-shot-${shotIndex}`,
    description: shot,
    chapter: chapter.title,
    shotNumber: shotCounter++,
    metadata: { directorStyle, sourceType: 'story' }
  }))
)

// Music Video Mode  
const allShots = musicVideoBreakdown.sectionBreakdowns.flatMap((section, index) =>
  section.shots.map(shot => ({
    id: `section-${index}-shot-${shotIndex}`,
    description: shot,
    section: section.title,
    shotNumber: shotCounter++,
    metadata: { directorStyle, sourceType: 'music-video' }
  }))
)
```

#### **2. Variable Processing**
```typescript
const processedShots = shots.map(shot => ({
  ...shot,
  description: replaceVariables(shot.description, {
    artistName: useDescriptions ? undefined : artistName,
    artistDescription: useDescriptions ? artistDescription : undefined,
    director,
    chapter: shot.chapter,
    section: shot.section
  })
}))
```

#### **3. Format Application**
```typescript
const finalShots = processedShots.map(shot => ({
  ...shot,
  description: applyPrefixSuffix(shot.description, prefix, suffix)
}))
```

#### **4. Output Generation**
```typescript
switch (format) {
  case 'text':
    return finalShots.map(s => s.description).join(separator)
  case 'numbered':
    return finalShots.map((s, i) => `${i + 1}. ${s.description}`).join(separator)
  case 'json':
    return JSON.stringify({ shots: finalShots, metadata: exportInfo })
  case 'csv':
    return generateCSV(finalShots)
}
```

### **Template System Architecture**

#### **Template Categories**
- **Camera** - Camera angles and positioning
- **Lighting** - Lighting setup and mood
- **Technical** - Quality and resolution specs
- **Genre** - Style-specific formatting
- **Custom** - User-created combinations

#### **Template Application Flow**
```typescript
// 1. User selects template
const template = getTemplate(templateId)

// 2. Apply to current configuration
setExportConfig({
  prefix: template.prefix,
  suffix: template.suffix
})

// 3. Preview with current shots
const preview = processShotsForExport(shots, newConfig, variables)

// 4. User exports with template applied
```

---

## 🧪 **Testing Strategy**

### **Test Structure**
```
__tests__/
├── unit/                    # Unit tests for individual functions
│   ├── export-processor.test.ts    # Export logic testing
│   ├── template-system.test.ts     # Template management
│   └── variable-processor.test.ts  # Variable replacement
├── integration/             # Integration tests for workflows
│   ├── bulk-export-flow.test.ts    # End-to-end export testing
│   ├── story-generation.test.ts    # Story workflow testing
│   └── music-video-generation.test.ts # Music video workflow
└── components/             # Component testing
    ├── BulkExportDialog.test.ts     # Export dialog functionality
    └── TemplateManager.test.ts      # Template management UI
```

### **Testing Patterns**

#### **Unit Test Pattern**
```typescript
describe('Function Name', () => {
  it('should handle normal case', () => {
    const result = functionToTest(normalInput)
    expect(result).toBe(expectedOutput)
  })

  it('should handle edge cases', () => {
    expect(() => functionToTest(edgeCase)).not.toThrow()
  })

  it('should validate input', () => {
    expect(functionToTest('')).toBe(fallbackValue)
  })
})
```

#### **Integration Test Pattern**
```typescript
describe('Workflow Name', () => {
  it('should complete full workflow', async () => {
    // Setup
    const input = createTestData()
    
    // Execute
    const result = await workflowFunction(input)
    
    // Verify
    expect(result.success).toBe(true)
    expect(result.data).toMatchObject(expectedStructure)
  })
})
```

### **Test Data Management**
```typescript
// Test fixtures for consistent testing
export const TEST_STORY = "Detective investigates mysterious case..."
export const TEST_ARTIST = { name: "Test Artist", description: "..." }
export const TEST_SHOTS = [{ id: "1", description: "..." }]
```

---

## 🔌 **API Integration**

### **OpenAI Integration**
```typescript
// Server action pattern
export async function generateContent(input: string) {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: ContentSchema,
    prompt: constructPrompt(input),
    system: "You are a professional..."
  })
  
  return { success: true, data: object }
}
```

### **Replicate Integration**
```typescript
// Image generation
const response = await fetch('/post-production/api/gen4', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: processedPrompt,
    aspect_ratio: settings.aspectRatio,
    reference_images: referenceUrls
  })
})
```

---

## 🎨 **UI Component Patterns**

### **Container Component Pattern**
```typescript
// Containers manage state and logic
export function StoryContainer() {
  const storyStore = useStoryStore()
  const workflowStore = useStoryWorkflowStore()
  
  const handleGeneration = async () => {
    // Business logic
  }
  
  return (
    <StoryMode
      {...storyStore}
      onGenerate={handleGeneration}
    />
  )
}

// Components focus on UI and user interaction
export function StoryMode({ story, onGenerate, ...props }) {
  return (
    <div>
      <Textarea value={story} onChange={setStory} />
      <Button onClick={onGenerate}>Generate</Button>
    </div>
  )
}
```

### **Dialog Component Pattern**
```typescript
export function FeatureDialog({ isOpen, onOpenChange, data }) {
  const [localState, setLocalState] = useState()
  
  const handleAction = async () => {
    // Process data
    // Update parent via callback
    onOpenChange(false)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  )
}
```

---

## 🚀 **Performance Optimizations**

### **Code Splitting**
```typescript
// Dynamic imports for heavy components
const ProjectManager = dynamic(
  () => import("@/components/project-manager"),
  { ssr: false }
)
```

### **State Optimization**
```typescript
// Zustand selective subscription
const { specificField } = useStore(state => ({ 
  specificField: state.specificField 
}))

// Avoid full store rerenders
const updateSpecificField = useStore(state => state.updateSpecificField)
```

### **Database Optimization**
```typescript
// IndexedDB performance patterns
const db = await openDB('director-palette', 1, {
  upgrade(db) {
    // Create indexes for common queries
    const artistStore = db.createObjectStore('artists', { keyPath: 'artist_id' })
    artistStore.createIndex('by-name', 'artist_name')
    artistStore.createIndex('by-genre', 'genres', { multiEntry: true })
  }
})
```

---

## 🔧 **Development Workflow**

### **Adding New Features**

#### **1. Plan State Management**
```typescript
// 1. Define types
interface NewFeatureState {
  data: FeatureData[]
  isLoading: boolean
}

// 2. Create store if needed
export const useNewFeatureStore = create<NewFeatureState & Actions>()

// 3. Add to existing store if related
```

#### **2. Create Components**
```typescript
// 1. Create feature component
components/feature/NewFeature.tsx

// 2. Create shared components if reusable
components/shared/NewSharedComponent.tsx

// 3. Add to container
components/containers/FeatureContainer.tsx
```

#### **3. Add Server Actions (if AI involved)**
```typescript
// 1. Create action file
app/actions/feature/action.ts

// 2. Define schema
const FeatureSchema = z.object({...})

// 3. Implement generation logic
```

#### **4. Write Tests**
```typescript
// 1. Unit tests for pure functions
__tests__/unit/feature.test.ts

// 2. Integration tests for workflows
__tests__/integration/feature-flow.test.ts

// 3. Component tests for UI
__tests__/components/feature.test.ts
```

### **Code Standards**

#### **TypeScript Usage**
- **Strict mode enabled** - No implicit any
- **Proper typing** for all props and state
- **Zod schemas** for API data validation
- **Type exports** for component interfaces

#### **Component Patterns**
- **Functional components** with hooks
- **Props interface** for each component
- **Error boundaries** for graceful failures
- **Loading states** for async operations

#### **State Management**
- **Single responsibility** per store
- **Immutable updates** via Zustand
- **Selective subscriptions** to prevent rerenders
- **Persistent state** for user data

---

## 🐛 **Debugging Guide**

### **Common Issues**

#### **Variable Replacement Not Working**
```typescript
// Debug steps:
console.log('Original shot:', shotDescription)
console.log('Variables:', variables)
console.log('Processed shot:', processedShot)

// Check:
// 1. Variable exists in shot description
// 2. Variable value is provided
// 3. Variable name matches exactly (case-insensitive)
```

#### **Export Dialog Not Opening**
```typescript
// Check:
// 1. Shots array is not empty
// 2. Dialog state is properly managed
// 3. Component is imported correctly
console.log('Shots for export:', prepareAllShotsForExport())
```

#### **Templates Not Loading**
```typescript
// Debug template store:
console.log('Templates:', useTemplatesStore.getState().templates)
console.log('Sample templates loaded:', templates.some(t => t.category === 'sample'))

// Force reload:
loadSampleTemplates()
```

### **Development Tools**
- **Zustand DevTools** - Inspect state changes
- **React DevTools** - Component tree and props
- **Network Tab** - API calls and responses
- **Console Logs** - Added throughout for debugging

---

## 🚀 **Deployment & Production**

### **Build Configuration**
```javascript
// next.config.mjs
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // TODO: Remove when types are clean
  },
  eslint: {
    ignoreDuringBuilds: true, // TODO: Fix lint errors
  }
}
```

### **Environment Variables**
```env
# Required for AI generation
OPENAI_API_KEY=sk-...

# Required for image generation
REPLICATE_API_TOKEN=r8_...

# Optional
NEXT_PUBLIC_APP_NAME=Director's Palette
```

### **Performance Monitoring**
- **Bundle size analysis** with Next.js analyzer
- **Lighthouse scores** for performance metrics
- **Error tracking** via console monitoring
- **User feedback** collection system

---

## 📚 **Additional Resources**

### **Key Files to Understand**
1. **`app/page.tsx`** - Main application entry point
2. **`stores/app-store.ts`** - Global state management
3. **`lib/export-processor.ts`** - Core export functionality
4. **`components/shared/BulkExportDialog.tsx`** - Export interface
5. **`app/actions/story/breakdown.ts`** - AI story generation

### **External Dependencies**
- **AI SDK** - OpenAI integration
- **Zustand** - State management
- **Zod** - Schema validation
- **shadcn/ui** - UI components
- **Lucide** - Icons
- **Tailwind CSS** - Styling

### **Browser Compatibility**
- **Modern browsers** with ES2020+ support
- **IndexedDB** support required
- **Clipboard API** with fallback support
- **File API** for downloads

---

*This reference covers the current architecture. See DIRECTOR-PALETTE-GUIDE.md for user-facing documentation.*