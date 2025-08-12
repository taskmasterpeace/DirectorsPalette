# CRITICAL REFACTOR PLAN - DO NOT DEVIATE

## RULES TO PREVENT BREAKING THINGS
1. **TEST AFTER EVERY SINGLE CHANGE** - Run the app, click buttons, verify it works
2. **ONE CHANGE AT A TIME** - Never batch multiple refactors
3. **PRESERVE ALL FUNCTIONALITY** - If something works now, it must work after
4. **BACKUP BEFORE CHANGES** - Keep original code commented if risky
5. **NO NEW FEATURES** - Only restructure, don't add capabilities

## CURRENT WORKING STATE (DO NOT BREAK)
- ✅ Story mode extraction → configuration → generation works
- ✅ Music video mode with entity extraction works  
- ✅ Director selection and notes work
- ✅ Additional shot generation works
- ✅ Session persistence works
- ✅ Project saving/loading works

## PHASE 1: SERVER ACTIONS CONSOLIDATION
**Goal**: Organize 5 scattered files into 3 domain-focused modules

### Current Mess:
```
app/actions-story.ts (500+ lines)
app/actions-mv.ts (400+ lines)
app/actions-artist.ts (100 lines)
app/actions-shared.ts (200 lines)
app/actions.ts (mixed stuff)
app/actions/story-references.ts (new, keep)
```

### Target Structure:
```
app/actions/
  story/
    index.ts (main exports)
    breakdown.ts (generateBreakdown)
    references.ts (extractReferences, generateWithRefs)
    additional-shots.ts (generateAdditionalShots)
  music-video/
    index.ts (main exports)
    breakdown.ts (generateMVBreakdown)
    entities.ts (extractEntities)
    additional-shots.ts (generateAdditionalMVShots)
  directors/
    index.ts (all director operations)
```

### Migration Order (DO NOT SKIP TESTING):
1. Create new structure with index files
2. Copy (don't move) functions to new files
3. Update imports ONE component at a time
4. Test that component thoroughly
5. Only delete old file when ALL imports updated

## PHASE 2: CONTAINER DECOMPOSITION

### StoryContainer Current Problems:
- 190 lines doing 10+ different things
- Manages references, questions, generation, entities
- Too many state variables

### StoryContainer Target Components:
```typescript
StoryContainer (30 lines max)
  ├── StoryInput (story text, director, notes)
  ├── StoryWorkflow (coordinates the flow)
  │   ├── ReferenceExtractor 
  │   ├── ReferenceConfigurator
  │   └── BreakdownGenerator
  └── StoryResults (display breakdown)
```

### MusicVideoContainer Target Components:
```typescript  
MusicVideoContainer (30 lines max)
  ├── MusicVideoInput (song, artist, director)
  ├── MusicVideoWorkflow
  │   ├── EntityExtractor
  │   ├── EntityConfigurator  
  │   └── BreakdownGenerator
  └── MusicVideoResults
```

### Decomposition Steps:
1. Extract input section to separate component
2. Move workflow coordination to custom hook
3. Extract results display
4. Leave container as thin coordinator

## PHASE 3: STATE MANAGEMENT UNIFICATION

### Current Chaos:
- `useAppStore` - app-level state
- `useStoryStore` - story mode state  
- `useMusicVideoStore` - MV mode state
- `useStoryEntitiesStore` - entities
- `useMusicVideoEntitiesStore` - MV entities
- localStorage - session persistence
- IndexedDB - directors, artists

### Target: Single Store Pattern
```typescript
// stores/index.ts
export const useStore = create()(
  persist(
    (set, get) => ({
      // App state
      mode: 'story',
      isLoading: false,
      
      // Story state (null when not in story mode)
      story: null,
      
      // Music video state (null when not in MV mode)  
      musicVideo: null,
      
      // Shared
      currentProject: null,
      
      // Actions organized by domain
      actions: {
        story: { /* all story actions */ },
        musicVideo: { /* all MV actions */ },
        app: { /* app-level actions */ }
      }
    })
  )
)
```

### Migration Steps:
1. Create new unified store
2. Add migration function for old data
3. Update components to use new store
4. Remove old stores one by one

## PHASE 4: ERROR RECOVERY

### Add to Every Server Action:
```typescript
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
    }
  }
}
```

### Add Progress Saving:
```typescript
// Before each generation step
saveProgress({
  step: 'references-extracted',
  data: references,
  timestamp: Date.now()
})

// On page load
const progress = loadProgress()
if (progress && progress.timestamp > Date.now() - 3600000) {
  // Resume from last step
}
```

## PHASE 5: TESTING CHECKLIST

After EACH change, test ALL of these:

### Story Mode:
- [ ] Can type story text
- [ ] Can select director
- [ ] Can add director notes  
- [ ] Extract references works
- [ ] Configure references works
- [ ] Generate breakdown works
- [ ] Additional shots work
- [ ] Copy to clipboard works

### Music Video Mode:
- [ ] Can enter song/artist
- [ ] Can select director
- [ ] Extract entities works
- [ ] Configure entities works
- [ ] Generate breakdown works
- [ ] Additional shots work

### General:
- [ ] Mode switching works
- [ ] Session persists on refresh
- [ ] Projects save/load
- [ ] No console errors
- [ ] Loading states show

## ORDER OF EXECUTION

1. **First**: Server actions consolidation (least risky)
2. **Second**: Add error recovery (improves without breaking)
3. **Third**: Container decomposition (risky but needed)
4. **Fourth**: State unification (most risky, do last)

## WHAT NOT TO DO
- ❌ Don't create new features
- ❌ Don't change UI appearance  
- ❌ Don't modify working algorithms
- ❌ Don't batch multiple changes
- ❌ Don't skip testing
- ❌ Don't delete before confirming new code works

## ROLLBACK PLAN
If anything breaks:
1. Git stash changes
2. Checkout last working commit
3. Apply changes one at a time
4. Find the breaking change
5. Fix or skip that change

## PROGRESS TRACKING
- [ ] Phase 1: Server Actions - NOT STARTED
- [ ] Phase 2: Containers - NOT STARTED  
- [ ] Phase 3: State - NOT STARTED
- [ ] Phase 4: Error Recovery - NOT STARTED
- [ ] Phase 5: Final Testing - NOT STARTED

REMEMBER: The app works now. Don't break it. Test everything.