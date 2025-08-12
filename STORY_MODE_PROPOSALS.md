# Story Mode Reference System - Proposals for User Approval

## Current Issues Identified

❌ **Story shots show ugly format**: "internal Location apartment night" instead of clean references
❌ **No reference configuration step**: Missing the UI you loved in Music Video mode  
❌ **Additional shots don't specify character/location**: Can't choose who and where
❌ **No title card generation**: Missing prompts for title cards with chapter names in quotes
❌ **Shot format inconsistent**: Should use clean `@character1 @location1` references

## Proposal 1: Story Mode Reference Configuration UI

### Step-by-Step Workflow
```
Story Input → [NEW] Reference Configuration → Story Generation → Additional Shots
```

### Reference Configuration Panel (Similar to Music Video)
**Three tabs exactly like Music Video, but adapted for stories:**

#### 📝 Characters Tab
```
@protagonist - Sarah Martinez (lead detective)
  - Role: Main character driving the investigation
  - Description: 30s, determined, sharp-eyed detective with years of experience
  - Appears in: 🏠 Chapter 1, 🔍 Chapter 2, 💥 Chapter 3

@villain - Marcus Chen (corrupt businessman) 
  - Role: Antagonist hiding criminal activities
  - Description: 50s, well-dressed, calculating with dangerous connections
  - Appears in: 🔍 Chapter 2, 💥 Chapter 3

@witness - Elena Rodriguez (key informant)
  - Role: Supporting character with crucial information  
  - Description: 20s, nervous but brave, holds evidence that breaks the case
  - Appears in: 🏠 Chapter 1, 🔍 Chapter 2
```

#### 🏢 Locations Tab  
```
@police_station - Downtown Precinct Building
  - Type: Interior workspace with desks, evidence boards, interrogation rooms
  - Atmosphere: Bustling, fluorescent-lit, official but worn
  - Used in: 🏠 Chapter 1 (case briefing), 🔍 Chapter 2 (evidence review)

@warehouse - Abandoned Industrial Complex
  - Type: Exterior/Interior large empty space with shadows and hiding spots
  - Atmosphere: Dark, echoing, dangerous with multiple exits
  - Used in: 💥 Chapter 3 (final confrontation)

@apartment - Sarah's Home Office
  - Type: Interior personal space with case files and investigation materials
  - Atmosphere: Intimate, cluttered with work, shows character's dedication
  - Used in: 🏠 Chapter 1 (late night research), 🔍 Chapter 2 (breakthrough moment)
```

#### 🎯 Props Tab
```
@evidence_folder - Manila Case File with Photos
  - Significance: Contains the key evidence that connects all the crimes
  - Description: Thick folder marked "CONFIDENTIAL" with crime scene photos
  - Used in: 🏠 Chapter 1 (discovery), 🔍 Chapter 2 (review), 💥 Chapter 3 (confrontation)

@gun - Detective's Service Weapon  
  - Significance: Tool of justice and protection in dangerous situations
  - Description: Standard police-issued Glock, well-maintained and reliable
  - Used in: 💥 Chapter 3 (climax and resolution)

@laptop - Investigation Computer
  - Significance: Digital gateway to uncovering the truth
  - Description: Police-issued laptop with case management software
  - Used in: 🏠 Chapter 1 (database searches), 🔍 Chapter 2 (connecting dots)
```

### What I Think You'll LOVE ❤️
- **Same UI as Music Video**: Tabs, edit/add/remove, section assignments
- **Clean references**: `@protagonist @police_station @evidence_folder` 
- **Chapter assignments**: 🏠 🔍 💥 emojis showing where each element appears
- **Editable names and descriptions**: Full control over your story elements
- **Auto-suggestions**: Generated from story analysis, then customizable

### What I Think You DON'T Want ❌
- Complex "internal/external" labels cluttering the display
- Multiple wardrobes for characters (unless they age/transform)
- Rigid categories that don't adapt to different story types (documentary, drama, etc.)
- References that aren't immediately clear what they represent

## Proposal 2: Enhanced Additional Shot Generator for Stories

### Current Problem
"Generate more shots" doesn't tell you who or where you're generating for.

### Proposed Solution  
**Dropdowns for each chapter with relevant characters/locations:**

```
Generate Additional Shots for Chapter 2: "The Investigation Deepens"

Character: [Dropdown]
├── @protagonist - Sarah Martinez
├── @villain - Marcus Chen  
├── @witness - Elena Rodriguez
└── Multiple characters

Location: [Dropdown] 
├── @police_station - Downtown Precinct
├── @warehouse - Industrial Complex
├── @apartment - Sarah's Home
└── Multiple locations

Props (optional): [Multi-select buttons]
[✓ @evidence_folder] [✓ @laptop] [ @gun]

Custom Request: "Focus on the moment Sarah realizes the connection"
                                    
[Generate Additional Shots]
```

### Generated Request Example
"Use these references: Character: @protagonist (Sarah Martinez), Location: @police_station (Downtown Precinct), Props: @evidence_folder (Manila Case File), @laptop (Investigation Computer). Focus on the moment Sarah realizes the connection."

## Proposal 3: Title Card Generation System

### Three Title Card Types (as you mentioned)

#### Character-Based Title Card
```
"Chapter 1: The Case Begins"
Shows @protagonist in their defining moment - Sarah Martinez reviewing case files late at night, the weight of responsibility visible in her focused expression and surrounded by investigation materials.
```

#### Location-Based Title Card  
```
"Chapter 2: The Investigation Deepens"  
Shows @police_station bustling with activity - the Downtown Precinct's main floor with detectives at work, evidence boards visible, capturing the intensity of an active investigation.
```

#### Prop-Based Title Card
```
"Chapter 3: The Truth Revealed"
Shows @evidence_folder prominently displayed - the manila case file open with key photos visible, representing the breakthrough evidence that will solve the case.
```

### Implementation Approach
- **Chapter name extraction**: Auto-detect or allow manual input with quotes
- **Title card configurator**: Choose which type for each chapter  
- **Reference integration**: Uses the same `@character` `@location` `@prop` system
- **Generate prompts**: Create description for what should be shown in each title card

## Proposal 4: Story Shot Format Fix

### Current Bad Format
```
"internal Location apartment night - Sarah reviews case files while drinking coffee"
```

### Proposed Clean Format  
```
"@protagonist at @apartment reviewing @evidence_folder, late-night dedication visible in focused expression"
```

### Reference System
- **Characters**: `@protagonist`, `@villain`, `@witness`
- **Locations**: `@police_station`, `@warehouse`, `@apartment`  
- **Props**: `@evidence_folder`, `@laptop`, `@gun`
- **Clean and consistent**: No ugly "internal/external" labels

## Proposal 5: Documentary Story Support

### Different Story Types
- **Drama Stories**: Characters, locations, props as above
- **Documentary Stories**: Locations become "interview locations", "b-roll locations"
- **Character documentaries**: Focus on real people in real locations
- **Historical documentaries**: Period locations and historical props

### Adaptive References
```
Documentary Example:
@interview_subject - Dr. James Wilson (climate scientist)
@laboratory - University Research Facility  
@data_charts - Climate Change Visualization Graphics
```

## Questions for You to Answer

1. **Character Variations**: Do you want multiple versions of the same character (young/old, different outfits) or keep it simple with one reference per character?

2. **Location Types**: Should we remove "internal/external" entirely, or just hide it from display while keeping it for generation?

3. **Chapter Icons**: Do you like 🏠🔍💥 emojis, or would you prefer different ones for chapters?

4. **Auto-suggestions**: Should the system auto-generate character/location/prop suggestions from story analysis, then let you edit them?

5. **Title Cards**: Do you want all three types available for each chapter, or force one type per chapter?

## Implementation Priority

### Phase 1: Core Reference System ⭐⭐⭐
- Story Reference Configuration Panel with tabs
- Character/Location/Prop selectors
- Chapter assignment with emojis
- Clean shot format with `@references`

### Phase 2: Enhanced Additional Shots ⭐⭐
- Character/Location dropdowns for each chapter
- Reference-aware shot generation
- Chapter-specific context

### Phase 3: Title Card System ⭐
- Three title card types with configurator
- Chapter name extraction and quotes
- Reference-based descriptions

**Please review these proposals and tell me:**
- ✅ What you LOVE and want implemented
- ❌ What you DON'T want or needs changes  
- 🤔 Any questions or modifications
- 📋 Priority order for implementation

Then I'll update the planning document and start building exactly what you approve!