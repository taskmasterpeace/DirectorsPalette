# Architecture Documentation

## System Overview

Director's Palette is built with a modern Next.js architecture using server actions for AI operations and client-side state management with Zustand.

## Core Architecture Principles

### 1. Separation of Concerns
- **Server Actions**: All AI operations (`/app/actions/`)
- **Client Components**: UI and interaction (`/components/`)
- **State Management**: Zustand stores (`/stores/`)
- **Business Logic**: Service layer (`/services/`)

### 2. Unified Action Exports
All server actions are exported through a single point of entry:
```typescript
// app/actions/index.ts
export {
  // Story actions
  extractStoryReferences,
  generateStoryBreakdownWithReferences,
  // Music video actions
  extractMusicVideoReferences,
  generateMusicVideoBreakdownWithReferences,
  // ... etc
} from './respective-modules'
```

### 3. Mode-Specific Architecture

#### Story Mode
```
StoryContainer
  ├── StoryInput (input collection)
  ├── StoryWorkflow (reference extraction & config)
  └── StoryMode (results display)
```

#### Music Video Mode
```
MusicVideoContainer
  ├── MusicVideoInput (input collection)
  ├── MusicVideoWorkflow (reference extraction & config)
  └── MusicVideoMode (results display)
```

## State Management

### Store Structure
- `app-store.ts` - Global app state (loading, errors)
- `story-store.ts` - Story mode specific state
- `music-video-store.ts` - Music video specific state
- `story-workflow-store.ts` - Story workflow state
- `music-video-workflow-store.ts` - Music video workflow state
- `workflow-coordinator.ts` - Coordinates shared workflow states

### State Flow
1. User input → Component state
2. Generation trigger → Workflow store
3. Server action → AI service
4. Response → Mode store
5. UI update → Component render

## AI Generation Pipeline

### 1. Reference Extraction
```typescript
extractReferences(content) → {
  locations: [],
  characters/wardrobe: [],
  props: [],
  themes: []
}
```

### 2. Configuration
- Inline configuration UI
- User edits references
- Adds visual themes

### 3. Breakdown Generation
```typescript
generateBreakdown(configuredRefs) → {
  sections/chapters: [],
  shots: [],
  treatments: []
}
```

## Critical Configurations

### MusicVideoConfig Requirements
```typescript
{
  isConfigured: true,  // MUST be true for shot generation
  locations: [],
  wardrobe: [],
  props: [],
  visualThemes: []     // Optional but recommended
}
```

## Error Handling

### Service Layer
- Retry logic with exponential backoff
- Fallback to text parsing on schema failures
- Comprehensive error messages

### UI Layer
- Error boundaries for component failures
- Toast notifications for user feedback
- Loading states during operations

## Performance Optimizations

### Client-Side
- Component code splitting
- Lazy loading for heavy components
- Session persistence with localStorage

### Server-Side
- Parallel API calls where possible
- Caching of director profiles
- Optimized prompt templates

## Database Architecture

### IndexedDB Schema
```typescript
interface SavedProject {
  id: string
  name: string
  updatedAt: Date
  isMusicVideoMode: boolean
  // Mode-specific data...
}
```

## Security Considerations

- Server-side API key validation
- Input sanitization
- Rate limiting on AI calls
- No client-side secrets

## Known Limitations

1. **Build Configuration**: ESLint errors ignored in production
2. **No Test Coverage**: Test suite not fully implemented
3. **Type Safety**: Some components use `any` types
4. **Performance**: No code splitting for initial bundle