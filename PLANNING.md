# Director's Palette - Feature Planning Document

## Overview
This document outlines the complete feature set and workflow improvements for both Music Video Mode and Story Mode based on user requirements.

## Music Video Mode - Complete Workflow

### Step 1: Basic Input (CURRENT - WORKS)
- Song details (title, artist, genre)
- Lyrics input
- Director selection
- Video concept/notes
- Artist profile selection

### Step 2: Treatment Generation (CURRENT - WORKS) 
- Generate 3 different treatment concepts
- User selects preferred treatment

### Step 3: Reference Configuration (MISSING - HIGH PRIORITY)
**This is the missing piece the user is asking for**

After treatment selection, show configuration interface with:

#### Locations Panel
- 2-3 auto-generated location suggestions based on treatment
- Each location shows:
  - Name and description
  - Reference tag (@location1, @location2)
  - Why it works for this treatment
  - Which sections it's best for (🎵 intro, 🎤 verse, 🚀 chorus, 🌉 bridge)
- Allow user to:
  - Edit location details
  - Add custom locations
  - Remove suggestions

#### Wardrobe Panel  
- 1-4 auto-generated wardrobe combinations
- Each wardrobe shows:
  - Combined reference (@d_streetwear, @d_formal, @d_casual)
  - Detailed breakdown:
    - Top: specific shirt/jacket with colors
    - Bottom: pants/shorts with style and fit
    - Footwear: shoes/boots
    - Accessories: jewelry, makeup, hair
  - Which sections this outfit works for
- Allow user to:
  - Edit wardrobe details
  - Create custom combinations
  - Remove suggestions

#### Props Panel
- 1-3 auto-generated prop suggestions
- Each prop shows:
  - Name and reference (@prop1, @prop2)
  - How it enhances the story
  - Which sections it appears in
- Allow user to:
  - Edit prop details
  - Add custom props
  - Remove suggestions

#### Reference Legend (MISSING)
- Shows all active references and what they mean:
  - Artist: @d_streetwear, @d_formal, etc.
  - Locations: @location1, @location2, etc.
  - Props: @prop1, @prop2, etc.

### Step 4: Final Breakdown Generation (CURRENT - WORKS)
- Uses approved references to generate shots
- Shows final breakdown with sections

### Step 5: Additional Shots (NEEDS IMPROVEMENT)
Currently just has text input. Should have:
- Dropdown to select character reference (@d_streetwear, @d_formal)
- Dropdown to select location (@location1, @location2)
- Dropdown to select props (optional)
- Custom request text (optional)
- Generate button that creates shots using selected references

## Story Mode - Improvements Needed

### Reference System (MISSING)
**All characters, locations, props in one centralized view**

#### Characters Panel
- Show all story characters with:
  - Name and reference tag (@protagonist, @villain)
  - Description and appearance
  - Role in story
- Allow editing and adding characters

#### Locations Panel
- Show all story locations with:
  - Name and reference tag (@mansion, @forest)
  - Description and atmosphere
  - Type (interior/exterior)
- Allow editing and adding locations

#### Props Panel
- Show all story props with:
  - Name and reference tag (@sword, @diary)
  - Description and significance
  - Type (weapon, symbolic, etc.)
- Allow editing and adding props

### Title Cards (NEEDS COMPLETE OVERHAUL)
Three types of title cards as requested:

#### Character-Based Title Card
- Shows chapter name in quotes: "Chapter 1: The Awakening"
- Features the main character for that chapter
- Describes what we see of the character

#### Location-Based Title Card  
- Shows chapter name in quotes
- Features the primary location
- Describes the setting and atmosphere

#### Prop-Based Title Card
- Shows chapter name in quotes  
- Features a significant prop from the story
- Shows how the prop appears in the chapter

### Generate Additional Shots (NEEDS IMPROVEMENT)
Current system needs:
- Character dropdown (select from extracted characters)
- Location dropdown (select from extracted locations)
- Props dropdown (optional, multi-select)
- Custom request (optional)
- Generate shots using selected references

## UI Component Architecture

### New Components Needed

1. **ReferenceConfigPanel.tsx** 
   - Tabbed interface (Locations, Wardrobe, Props)
   - Edit/add/remove functionality
   - Preview of references

2. **ReferenceLegend.tsx** (EXISTS BUT NEEDS ENHANCEMENT)
   - Shows all active references
   - Grouped by type (Artist, Locations, Props)
   - Click to highlight usage

3. **LocationSelector.tsx**
   - Grid layout of location cards
   - Edit in-place functionality
   - Add custom location

4. **WardrobeSelector.tsx**
   - Grid layout of wardrobe combinations  
   - Detailed breakdown display
   - Edit wardrobe components

5. **PropSelector.tsx**
   - Grid layout of prop cards
   - Edit/add/remove functionality

6. **TitleCardConfigurator.tsx**
   - Three card types selection
   - Preview of each type
   - Chapter name input

7. **EnhancedShotGenerator.tsx**
   - Reference dropdowns
   - Custom request input
   - Shot generation

8. **ReferenceManager.tsx** 
   - Centralized reference display
   - Used in both Story and MV modes
   - Edit all references in one place

## Implementation Priority

### Phase 1: Music Video Reference System (HIGH PRIORITY)
1. Create ReferenceConfigPanel with tabs
2. Build LocationSelector, WardrobeSelector, PropSelector
3. Update MusicVideoConfig to show reference configuration
4. Enhance ReferenceLegend
5. Update additional shots generator with reference dropdowns

### Phase 2: Story Mode References
1. Create centralized ReferenceManager
2. Update StoryMode to show all references in one place
3. Enhance additional shots generator for stories

### Phase 3: Title Cards Overhaul
1. Build TitleCardConfigurator
2. Implement three title card types
3. Update story generation to use new title cards

## Key User Requirements Met

✅ **Reference selection before final generation**
✅ **Combined artist-wardrobe format (@d_streetwear)**
✅ **Section assignments with emojis**
✅ **Detailed wardrobe breakdowns**
✅ **Treatment-specific suggestions**
✅ **Character/location selection for additional shots**
✅ **Centralized reference management**
✅ **Enhanced title cards with three types**

## File Structure Changes

```
components/
├── music-video/
│   ├── ReferenceConfigPanel.tsx (NEW)
│   ├── LocationSelector.tsx (NEW)
│   ├── WardrobeSelector.tsx (NEW)
│   ├── PropSelector.tsx (NEW)
│   └── EnhancedMusicVideoMode.tsx (UPDATE)
├── story/
│   ├── ReferenceManager.tsx (NEW)
│   ├── TitleCardConfigurator.tsx (NEW)
│   └── EnhancedStoryMode.tsx (UPDATE)
└── shared/
    ├── ReferenceLegend.tsx (ENHANCE)
    └── EnhancedShotGenerator.tsx (NEW)
```

This planning document ensures we build exactly what you need: a proper reference system, treatment-specific suggestions, and the UI to interact with all of it.