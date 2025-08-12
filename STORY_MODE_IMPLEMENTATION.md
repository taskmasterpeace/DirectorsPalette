# Story Mode Implementation Plan - Based on User Requirements

## ✅ APPROVED FEATURES

### 1. Reference Format System
**STATUS: APPROVED - Implement exactly as proposed**
```
Characters: @protagonist, @villain, @witness, @protagonist_young, @protagonist_old
Locations: @police_station, @apartment, @warehouse
Props: @evidence_folder, @gun, @laptop
```

### 2. Character Age/Time Variations
**REQUIREMENT: Support young/old versions when time passes**
```
Example for age-jump story:
@sarah_young - Sarah at age 25 in flashbacks
@sarah_old - Sarah at age 60 in present day
@marcus_child - Marcus as a child
@marcus_adult - Marcus grown up
```

### 3. Location Display
**REQUIREMENT: Hide internal/external from display but keep for generation**
```
What user sees: "@apartment - Sarah's Home"
What AI uses: "internal location apartment - Sarah's Home"
```

**FUTURE: Location Library**
- Save frequently used locations
- Load saved locations into new projects
- (To implement when image generation is connected)

### 4. Reference Configuration UI - How It Works

#### Step 1: Story Input
User writes their story/screenplay

#### Step 2: Auto-Extract & Edit References
System analyzes story and suggests:
- Characters found in the story
- Locations mentioned or implied
- Props that are significant

User can:
- ✏️ Edit any suggestion
- ➕ Add new characters/locations/props
- 🗑️ Remove irrelevant ones

#### Step 3: Generate Breakdown
System generates shots using the configured references

### 5. Enhanced Additional Shot Generator

**NOT dropdowns - Visual selector UI:**

```
┌─────────────────────────────────────────────────────┐
│ Generate Additional Shots for Chapter 2             │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [👤 People] [📍 Locations] [📦 Props]               │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 👤 People (click to select multiple)            │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐        │ │
│ │ │@protagonist│ │ @villain │ │ @witness │        │ │
│ │ │   Sarah   │ │  Marcus  │ │  Elena   │        │ │
│ │ │    [✓]    │ │    [ ]   │ │    [✓]   │        │ │
│ │ └──────────┘ └──────────┘ └──────────┘        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ Custom instructions (optional):                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Focus on the tension between Sarah and Elena... │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ Selected: @protagonist, @witness                    │
│                                                      │
│ [Generate Shots That Fit This Chapter's Context]    │
└─────────────────────────────────────────────────────┘
```

**How it works:**
1. Click category tabs (People/Locations/Props)
2. Visual cards appear showing available references
3. Click cards to select (multiple selection allowed)
4. Add optional custom instructions
5. Generate shots that:
   - Use selected references
   - Fit within the chapter's context
   - Match the story's narrative

### 6. Title Card System (4 Types)

**Type 1: Character-Based**
```
Prompt: "Title card showing @protagonist in defining moment. 
Chapter title: 'The Investigation Begins' appears in quotes."
```

**Type 2: Location-Based**
```
Prompt: "Title card showing @police_station establishing shot.
Chapter title: 'The Investigation Begins' appears in quotes."
```

**Type 3: Prop-Based**
```
Prompt: "Title card featuring @evidence_folder prominently.
Chapter title: 'The Investigation Begins' appears in quotes."
```

**Type 4: Story Elements (Atmospheric)**
```
Prompt: "Title card capturing the mood and themes of the chapter - 
dark investigation, mounting tension, hidden truths.
Chapter title: 'The Investigation Begins' appears in quotes."
```

**Implementation:**
- Separate "Generate Title Cards" button
- Opens modal with 4 options
- Each has its own prompt template
- We'll work together on perfecting the prompts

### 7. Shot Format Fix
**STATUS: APPROVED**
```
OLD: "internal Location apartment night - Sarah reviews files"
NEW: "@protagonist at @apartment reviewing @evidence_folder"
```

### 8. Documentary Support
**B-Roll and Inserts Focus:**
```
@broll_location1 - Aerial shots of the city
@insert_document1 - Close-up of historical document
@narrator_location - Where narrator speaks to camera
```

## 🚀 IMPLEMENTATION PRIORITY (My Developer Decision)

### Phase 1: Core Foundation (Build First)
1. **Reference Configuration Panel** - The heart of everything
   - Character/Location/Props extraction
   - Edit/Add/Remove UI
   - Age/time variations support

### Phase 2: Shot Generation (Build Second)  
2. **Fix Shot Format** - Clean references in all shots
3. **Enhanced Additional Shot Generator** - Visual selector UI

### Phase 3: Polish (Build Third)
4. **Title Card System** - 4 types with separate generator
5. **Documentary Support** - B-roll adaptations

## 🎯 KEY UNDERSTANDING POINTS

**What I understand you want:**
- References that are clean and readable (@protagonist not "internal location")
- Ability to add references that then get worked into shot lists
- Visual selector (not dropdowns) for choosing references
- Shots that fit the story context when using selected references
- Title cards as a separate system with 4 distinct types
- Developer (me) to decide technical priorities

**What needs clarification:**
- Title card prompt details (we'll work together on this)
- Exact visual design of the selector UI

## 📝 NEXT IMMEDIATE STEPS

1. Build Reference Configuration Panel for Story Mode
2. Implement character age/time variations
3. Fix shot format to use clean references
4. Create visual selector for additional shots
5. Implement title card system with your input on prompts

Is this understanding correct? Should I proceed with Phase 1?