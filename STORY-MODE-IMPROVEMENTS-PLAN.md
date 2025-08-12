# Story Mode Improvements Plan

## Current Issues Identified
1. ❌ **Chapter Count**: Hard-coded instead of intelligent/user-controlled
2. ❌ **Generate More Shots**: Buttons not working (validation errors)
3. ❌ **Visual Status**: No clear progress indicators for 3-stage generation
4. ❌ **User Control**: No flexibility in chapter generation approach

---

## IMPROVEMENT 1: Smart Chapter Detection + User Control

### Chapter Detection Options (Dropdown)
```
┌─────────────────────────────────────┐
│ Chapter Generation Method:          │
│ ┌─────────────────────────────────┐ │
│ │ ▼ Auto-detect from headings    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Options:                            │
│ • Auto-detect from headings         │
│ • User-specified count (3-8)        │
│ • AI-suggested (3-5 chapters)       │
│ • Single chapter (no breakdown)     │
└─────────────────────────────────────┘
```

### Implementation Plan
**A. Add to StoryMode UI**
- New dropdown above "Generate Shot Breakdown" button
- State: `chapterMethod` and `chapterCount`

**B. Smart Detection Logic**
```typescript
// 1. Auto-detect from headings
const detectHeadings = (story: string) => {
  // Look for: "# Chapter", "## ", "Chapter 1", etc.
  const headingPatterns = [
    /^#+\s+.+$/gm,           // Markdown headers
    /^Chapter\s+\d+/gim,     // "Chapter 1", "Chapter 2"
    /^\d+\.\s+.+$/gm,        // "1. Title", "2. Title" 
    /^[A-Z][^.!?]*:$/gm      // "TITLE:" format
  ]
  return foundHeadings.length
}

// 2. User-specified
const userSpecifiedCount = (count: number) => count

// 3. AI-suggested (current improved logic)
const aiSuggested = () => "3-5 chapters maximum based on story length"
```

**C. Updated Structure Detection Prompt**
```
Based on the selected method:

METHOD: Auto-detect from headings
PROMPT: "The user has provided a story with existing chapter headings. Split exactly at these heading boundaries: [DETECTED_HEADINGS]. Do not create additional chapters."

METHOD: User-specified (4 chapters)
PROMPT: "Split this story into exactly 4 chapters. Focus on major story beats and ensure even distribution of content."

METHOD: AI-suggested  
PROMPT: "Analyze and split into 3-5 logical chapters based on natural story progression and narrative beats."

METHOD: Single chapter
PROMPT: "Treat the entire story as one chapter for shot breakdown generation."
```

---

## IMPROVEMENT 2: Visual Progress Tracking

### 3-Stage Progress Indicator
```
┌─────────────────────────────────────────────────────────────┐
│ Story Generation Progress                                   │
│                                                             │
│ ● Stage 1: Story Analysis        [✓ Complete - 3 chapters] │
│ ● Stage 2: Shot Breakdowns       [⟳ 2/3 chapters done...] │
│ ○ Stage 3: Additional Shots      [⏸ Waiting...]           │
│                                                             │
│ ████████████░░░░░░░░░░░░░░ 60% Complete (45 seconds)      │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Plan
**A. Add Progress State**
```typescript
const [generationStage, setGenerationStage] = useState<'idle' | 'structure' | 'breakdowns' | 'complete'>('idle')
const [stageProgress, setStageProgress] = useState({ current: 0, total: 0 })
const [stageDetails, setStageDetails] = useState('')
```

**B. Update Progress During Generation**
```typescript
// Stage 1
setGenerationStage('structure')
setStageDetails('Analyzing story structure...')

// Stage 2  
setGenerationStage('breakdowns')
setStageProgress({ current: 0, total: chapters.length })
setStageDetails(`Generating shots for ${chapters.length} chapters...`)

// Update as each chapter completes
setStageProgress({ current: completed + 1, total: chapters.length })
```

**C. Enhanced Progress Bar Component**
```tsx
<ProgressStages 
  stage={generationStage}
  progress={stageProgress}
  details={stageDetails}
  duration={elapsedTime}
/>
```

---

## IMPROVEMENT 3: Fix "Generate More Shots"

### Current Issue
```
Additional shots generation failed: 
chapterId: Required; categories: Required
```

### Root Cause Analysis
The additional shots function expects different parameters than what's being passed.

### Fix Implementation
**A. Check Parameter Mapping**
```typescript
// In StoryMode component - fix the onClick handler
<Button onClick={() => 
  onGenerateAdditionalShots(
    chapter.id,           // ✓ chapterId 
    ["Close-ups", "Wide shots"], // ✓ categories
    customRequest         // ✓ customRequest
  )
}>
```

**B. Verify Server Action**
```typescript
// In actions-story.ts - ensure proper parameter handling
export async function generateAdditionalChapterShots(args: {
  chapterId: string,      // Must match UI
  categories: string[],   // Must match UI  
  customRequest: string,  // Must match UI
  // ... other required fields
})
```

**C. Update UI Categories**
```tsx
// Make category selection interactive
const [selectedCategories, setSelectedCategories] = useState<string[]>([])

{["Close-ups", "Wide shots", "Action", "Emotional", "Atmospheric"].map(category => (
  <Badge 
    key={category}
    variant={selectedCategories.includes(category) ? "default" : "outline"}
    className="cursor-pointer"
    onClick={() => toggleCategory(category)}
  >
    {category}
  </Badge>
))}
```

---

## IMPROVEMENT 4: Better User Experience

### A. Chapter Method Selection
```tsx
<div className="mb-4">
  <label className="text-sm font-medium text-white mb-2 block">
    Chapter Generation Method
  </label>
  <Select value={chapterMethod} onValueChange={setChapterMethod}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="auto-detect">Auto-detect from headings</SelectItem>
      <SelectItem value="user-specified">Specify chapter count</SelectItem>  
      <SelectItem value="ai-suggested">AI-suggested (3-5 chapters)</SelectItem>
      <SelectItem value="single">Single chapter</SelectItem>
    </SelectContent>
  </Select>
  
  {chapterMethod === 'user-specified' && (
    <div className="mt-2">
      <input 
        type="range" 
        min="2" 
        max="8" 
        value={userChapterCount}
        onChange={(e) => setUserChapterCount(Number(e.target.value))}
      />
      <span className="text-white ml-2">{userChapterCount} chapters</span>
    </div>
  )}
</div>
```

### B. Stage-Specific Loading States
```tsx
{generationStage === 'structure' && (
  <Card className="bg-blue-900/20 border-blue-700/30">
    <CardContent className="pt-4">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        <div>
          <p className="text-blue-300 font-medium">Analyzing Story Structure</p>
          <p className="text-blue-300/70 text-sm">Breaking story into logical chapters...</p>
        </div>
      </div>
    </CardContent>
  </Card>
)}

{generationStage === 'breakdowns' && (
  <Card className="bg-amber-900/20 border-amber-700/30">
    <CardContent className="pt-4">
      <div className="flex items-center gap-3">
        <Wand2 className="h-5 w-5 animate-spin text-amber-400" />
        <div>
          <p className="text-amber-300 font-medium">Generating Shot Breakdowns</p>
          <p className="text-amber-300/70 text-sm">
            {stageProgress.current} of {stageProgress.total} chapters complete
          </p>
        </div>
      </div>
      <ProgressBar 
        value={(stageProgress.current / stageProgress.total) * 100} 
        className="mt-2"
      />
    </CardContent>
  </Card>
)}
```

---

## IMPLEMENTATION PRIORITY

### Phase 1 (Immediate)
1. ✅ **Fix "Generate More Shots" buttons** (parameter validation)
2. ✅ **Add chapter method dropdown** to StoryMode
3. ✅ **Implement smart heading detection**

### Phase 2 (Next)
4. ✅ **Add visual progress stages**
5. ✅ **Enhanced loading states**
6. ✅ **Better user feedback**

### Phase 3 (Polish)
7. ✅ **Chapter count slider for user-specified**
8. ✅ **Save chapter preferences**
9. ✅ **Better error handling**

---

## FILES TO MODIFY

### UI Changes
- `components/story/StoryMode.tsx` - Add chapter controls and progress
- `app/page.tsx` - Update handlers for new chapter options

### Backend Changes  
- `app/actions-story.ts` - Fix additional shots parameters
- `app/actions-story.ts` - Smart chapter detection logic

### New Components
- `components/ui/progress-stages.tsx` - Multi-stage progress indicator
- `components/story/ChapterMethodSelector.tsx` - Chapter options control

Would you like me to start implementing these improvements? I'll focus on fixing the "Generate More Shots" issue first, then add the chapter method selection.