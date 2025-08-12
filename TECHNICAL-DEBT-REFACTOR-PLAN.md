# 🔧 TECHNICAL DEBT REFACTORING PLAN
**Priority**: CRITICAL - Must fix before adding new features  
**Main Issue**: `app/page.tsx` is 792 lines with 9+ useState hooks and 12+ handler functions

## 📊 CURRENT PROBLEMS ANALYSIS

### app/page.tsx Issues (792 lines)
- **9 useState hooks** managing disparate concerns
- **12+ async handler functions** doing complex operations
- **Mixed responsibilities**: UI, business logic, API calls, state management
- **No separation of concerns**: Everything in one component
- **Session management**: Complex localStorage logic inline
- **Event handling**: Custom events mixed with component logic
- **No error boundaries**: Errors crash the entire app

## 🎯 PHASE 1: BREAK UP app/page.tsx (PRIORITY 1)

### Step 1: Extract Custom Hooks
Create these custom hooks to manage specific domains:

#### `/hooks/useSessionManagement.ts`
```typescript
// Handles all localStorage and session persistence
export function useSessionManagement() {
  - saveSessionState()
  - loadSessionState()
  - clearSession()
  - Auto-save on changes
}
```

#### `/hooks/useStoryGeneration.ts`
```typescript
// All story-related state and handlers
export function useStoryGeneration() {
  - story state
  - breakdown state
  - handleGenerateBreakdown()
  - handleGenerateAdditionalShots()
  - handleClearStory()
}
```

#### `/hooks/useMusicVideoGeneration.ts`
```typescript
// All music video state and handlers
export function useMusicVideoGeneration() {
  - musicVideo state
  - references state
  - handleGenerateMusicVideoReferences()
  - handleGenerateMusicVideoBreakdown()
  - handleGenerateAdditionalMusicVideoShots()
  - handleClearMusicVideo()
}
```

#### `/hooks/useDirectorManagement.ts`
```typescript
// Director selection and creation
export function useDirectorManagement() {
  - selectedDirector state
  - customDirector state
  - handleCreateCustomDirector()
  - director questions logic
}
```

#### `/hooks/useGenerationProgress.ts`
```typescript
// Progress tracking and timing
export function useGenerationProgress() {
  - generationStage
  - stageProgress
  - elapsedTime
  - generationHistory
  - estimatedDuration calculation
}
```

### Step 2: Create Container Components
Break the main page into logical containers:

#### `/components/containers/AppContainer.tsx`
```typescript
// Main app wrapper with providers
- Error boundary wrapper
- State providers
- Theme/UI providers
```

#### `/components/containers/ModeSelector.tsx`
```typescript
// Mode switching logic
- Current mode state
- Mode change handler
- Mode toggle UI
```

#### `/components/containers/StoryContainer.tsx`
```typescript
// Story mode wrapper
- Uses useStoryGeneration hook
- Renders StoryMode component
- Handles story-specific logic
```

#### `/components/containers/MusicVideoContainer.tsx`
```typescript
// Music video mode wrapper
- Uses useMusicVideoGeneration hook
- Renders MusicVideoMode component
- Handles MV-specific logic
```

### Step 3: New File Structure
```
app/
├── page.tsx (50-100 lines max - just layout)
├── layout.tsx
└── providers.tsx (new - all providers)

hooks/
├── useSessionManagement.ts
├── useStoryGeneration.ts
├── useMusicVideoGeneration.ts
├── useDirectorManagement.ts
├── useGenerationProgress.ts
└── index.ts

components/
├── containers/
│   ├── AppContainer.tsx
│   ├── ModeSelector.tsx
│   ├── StoryContainer.tsx
│   └── MusicVideoContainer.tsx
└── [existing components]
```

## 🎯 PHASE 2: STATE MANAGEMENT (PRIORITY 2)

### Zustand Store Implementation
Create centralized stores for different domains:

#### `/stores/sessionStore.ts`
```typescript
interface SessionStore {
  // Session state
  sessionId: string
  lastSaved: Date
  
  // Actions
  saveSession: () => void
  loadSession: () => void
  clearSession: () => void
}
```

#### `/stores/storyStore.ts`
```typescript
interface StoryStore {
  // Story state
  story: string
  storyTitle: string
  breakdown: StoryBreakdown | null
  entities: ExtractedEntities | null
  
  // Actions
  setStory: (story: string) => void
  setBreakdown: (breakdown: StoryBreakdown) => void
  generateBreakdown: (params) => Promise<void>
  clearStory: () => void
}
```

#### `/stores/musicVideoStore.ts`
```typescript
interface MusicVideoStore {
  // MV state
  songDetails: SongDetails
  breakdown: MusicVideoBreakdown | null
  references: MusicVideoReferences | null
  
  // Actions
  setSongDetails: (details: SongDetails) => void
  generateReferences: () => Promise<void>
  generateBreakdown: () => Promise<void>
  clearMusicVideo: () => void
}
```

#### `/stores/uiStore.ts`
```typescript
interface UIStore {
  // UI state
  currentMode: 'story' | 'music-video'
  isGenerating: boolean
  generationProgress: GenerationProgress
  
  // Actions
  setMode: (mode: 'story' | 'music-video') => void
  setGenerating: (isGenerating: boolean) => void
  updateProgress: (progress: GenerationProgress) => void
}
```

## 🎯 PHASE 3: ERROR BOUNDARIES (PRIORITY 3)

### Create Error Boundary Components

#### `/components/error-boundaries/AppErrorBoundary.tsx`
```typescript
// Top-level error boundary
- Catches all unhandled errors
- Shows user-friendly error message
- Provides recovery action
- Logs errors to console/service
```

#### `/components/error-boundaries/GenerationErrorBoundary.tsx`
```typescript
// Wraps generation workflows
- Handles API failures
- Retry mechanism
- Fallback UI
```

#### `/components/error-boundaries/RouteErrorBoundary.tsx`
```typescript
// Page-level error handling
- Route-specific error recovery
- Navigation fallback
```

## 🎯 PHASE 4: CONSOLIDATE SERVER ACTIONS (PRIORITY 4)

### Organize Server Actions by Domain

#### `/app/actions/story.ts`
```typescript
// All story-related server actions
export async function generateStoryBreakdown() {}
export async function generateAdditionalStoryShots() {}
export async function extractStoryEntities() {}
```

#### `/app/actions/music-video.ts`
```typescript
// All MV-related server actions
export async function generateMVReferences() {}
export async function generateMVBreakdown() {}
export async function generateAdditionalMVShots() {}
```

#### `/app/actions/director.ts`
```typescript
// Director-related server actions
export async function generateDirectorStyle() {}
export async function generateDirectorQuestions() {}
```

## 🎯 PHASE 5: CONFIGURATION SYSTEM (PRIORITY 5)

### Extract All Magic Values

#### `/config/prompts.ts`
```typescript
// All AI prompt templates
export const STORY_PROMPTS = {}
export const MV_PROMPTS = {}
export const DIRECTOR_PROMPTS = {}
```

#### `/config/constants.ts`
```typescript
// App-wide constants
export const GENERATION_LIMITS = {}
export const TIMEOUTS = {}
export const DEFAULT_VALUES = {}
```

#### `/config/features.ts`
```typescript
// Feature flags and toggles
export const FEATURES = {
  enableDirectorQuestions: true,
  enableEntityExtraction: true,
  maxChapters: 10,
}
```

## 🎯 PHASE 6: TEST INTEGRATION (PRIORITY 6)

### Set Up Testing Framework

#### Configure Jest/Vitest
```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest watch",
    "test:coverage": "vitest --coverage"
  }
}
```

#### Test Structure
```
__tests__/
├── unit/
│   ├── hooks/
│   ├── stores/
│   └── utils/
├── integration/
│   ├── story-generation.test.ts
│   └── mv-generation.test.ts
└── e2e/
    └── full-workflow.test.ts
```

## 📋 IMPLEMENTATION ORDER

### Week 1: Core Refactoring
1. **Day 1-2**: Extract custom hooks from app/page.tsx
2. **Day 3-4**: Create container components
3. **Day 5**: Update app/page.tsx to use new structure

### Week 2: State Management
1. **Day 1-2**: Implement Zustand stores
2. **Day 3-4**: Migrate component state to stores
3. **Day 5**: Test state synchronization

### Week 3: Error Handling & Polish
1. **Day 1-2**: Add error boundaries
2. **Day 3**: Consolidate server actions
3. **Day 4**: Extract configuration
4. **Day 5**: Integrate test suite

## 📊 SUCCESS METRICS

### Before Refactoring
- `app/page.tsx`: 792 lines
- useState hooks: 9+
- No error boundaries
- No tests
- Mixed concerns

### After Refactoring
- `app/page.tsx`: <100 lines
- Centralized state management
- Full error boundary coverage
- Test coverage >70%
- Clear separation of concerns

## 🚀 BENEFITS

1. **Maintainability**: Easier to find and fix bugs
2. **Testability**: Can test each piece in isolation
3. **Performance**: Better React rendering optimization
4. **Developer Experience**: Clear code organization
5. **Reliability**: Error boundaries prevent crashes
6. **Scalability**: Easy to add new features

## ⚠️ RISKS & MITIGATION

### Risk 1: Breaking Existing Functionality
**Mitigation**: Create feature branch, test each step thoroughly

### Risk 2: State Synchronization Issues
**Mitigation**: Implement incrementally, one domain at a time

### Risk 3: Performance Regression
**Mitigation**: Profile before/after, use React DevTools

## 📝 FUTURE UX FEATURES (After Tech Debt)

### Preserved for Later Implementation
1. **Visual Progress Tracking** - 3-stage progress bars
2. **Copy/Export Functions** - Shot list export
3. **Adaptive Timer** - Based on generation history
4. **Reference Configuration UI** - Visual entity management
5. **Director Question Cards** - Interactive Q&A

These features will be MUCH easier to implement once the technical debt is resolved!