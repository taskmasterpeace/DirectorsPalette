# Page.tsx Migration Map

## Goal
Reduce `app/page.tsx` from 1220 lines to <200 lines by extracting components and logic.

## Migration Plan

### Phase 1: Component Extraction (Current PR)

#### 1. Extract Story Mode UI → `components/story/StoryMode.tsx`
**Lines to move:** 595-889 (Story mode JSX)
**Props to pass:**
- All story-related state (story, storyDirectorNotes, etc.)
- Director selection state
- Options (titleCardOptions, promptOptions)
- Breakdown results
- Handlers (handleGenerateBreakdown, handleGenerateAdditionalShots)

#### 2. Extract Music Video Mode UI → `components/music-video/MusicVideoMode.tsx`
**Lines to move:** 892-1205 (Music video mode JSX)
**Props to pass:**
- All music video state (lyrics, songTitle, artist, genre, etc.)
- Artist selection state
- Director selection state
- Music video config
- Breakdown results
- Handlers (handleGenerateMusicVideoBreakdown, handleGenerateAdditionalMusicVideoShots)

#### 3. Extract Director Selection → `components/shared/DirectorSelector.tsx`
**Lines to move:** Director selection UI (reused in both modes)
**Props to pass:**
- selectedDirector
- onDirectorChange
- allDirectors
- domain ("film" or "music-video")

#### 4. Extract Project Header → `components/shared/ProjectHeader.tsx`
**Lines to move:** 579-592 (Mode indicator)
**Props to pass:**
- mode
- currentProjectId
- onProjectSelect

### Phase 2: Logic Extraction (Next PR)

#### 5. Extract Custom Hooks
Create `hooks/useStoryWorkflow.ts`:
- Move lines 336-364 (handleGenerateBreakdown)
- Move lines 410-444 (handleGenerateAdditionalShots)
- Move all story-related state management

Create `hooks/useMusicVideoWorkflow.ts`:
- Move lines 366-407 (handleGenerateMusicVideoBreakdown)
- Move lines 446-479 (handleGenerateAdditionalMusicVideoShots)
- Move all music video state management

#### 6. Extract Session Management
Create `hooks/useSessionPersistence.ts`:
- Move lines 190-333 (Session persistence logic)
- Move localStorage sync logic
- Move mode change event listeners

#### 7. Extract Director Management
Create `hooks/useDirectorManagement.ts`:
- Move lines 133-181 (Director loading from IndexedDB)
- Move lines 482-559 (Custom director creation)
- Move director state management

### Phase 3: Final Cleanup

#### 8. Simplified page.tsx structure
```tsx
export default function Home() {
  const { mode, setMode } = useAppMode()
  const session = useSessionPersistence()
  const directors = useDirectorManagement()
  const storyWorkflow = useStoryWorkflow()
  const musicVideoWorkflow = useMusicVideoWorkflow()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-6">
        <ProjectHeader mode={mode} />
        
        {mode === "story" ? (
          <StoryMode {...storyWorkflow} {...directors.story} />
        ) : (
          <MusicVideoMode {...musicVideoWorkflow} {...directors.musicVideo} />
        )}
        
        {session.showProjectManager && (
          <ProjectManager {...session.projectManager} />
        )}
      </main>
    </div>
  )
}
```

## State to Extract

### Story Mode State (20+ useState calls)
- story, setStory
- storyDirectorNotes, setStoryDirectorNotes
- selectedDirector, setSelectedDirector
- breakdown, setBreakdown
- additionalShots, setAdditionalShots
- expandedChapters, setExpandedChapters
- titleCardOptions, setTitleCardOptions
- promptOptions, setPromptOptions

### Music Video Mode State (15+ useState calls)
- lyrics, setLyrics
- songTitle, setSongTitle
- artist, setArtist
- genre, setGenre
- mvConcept, setMvConcept
- mvDirectorNotes, setMvDirectorNotes
- selectedMusicVideoDirector, setSelectedMusicVideoDirector
- musicVideoBreakdown, setMusicVideoBreakdown
- additionalMusicVideoShots, setAdditionalMusicVideoShots
- expandedSections, setExpandedSections
- musicVideoConfig, setMusicVideoConfig
- showMusicVideoConfig, setShowMusicVideoConfig

### Shared State
- mode, setMode
- isLoading, setIsLoading
- customDirectors, setCustomDirectors
- customMusicVideoDirectors, setCustomMusicVideoDirectors
- showProjectManager, setShowProjectManager
- currentProjectId, setCurrentProjectId

## Acceptance Criteria

1. ✅ page.tsx reduced to <200 lines
2. ✅ No regression in functionality
3. ✅ All features work as before
4. ✅ TypeScript compilation passes
5. ✅ No runtime errors
6. ✅ Session persistence continues to work

## Testing Checklist

- [ ] Story mode generates breakdown
- [ ] Music video mode generates breakdown
- [ ] Director selection works
- [ ] Custom director creation works
- [ ] Additional shots generation works
- [ ] Session persistence/restore works
- [ ] Mode switching works
- [ ] Project manager integration works