# ACTUAL PROMPTS BREAKDOWN - Story Generation System

## Overview
You're right - we need to see the EXACT prompts with variables filled in. Here are the 3 actual prompts being sent to OpenAI:

---

## STAGE 1: Structure Detection Prompt
**Purpose**: Break story into chapters (ISSUE: Creating too many chapters - 11 for Clean story!)

### Prompt Template:
```
Analyze the following text and split it into logical chapters. Identify the narrative beat for each chapter (setup, rising-action, climax, resolution). Provide a unique ID, a concise title, the full content, start/end character positions, estimated screen time, key characters, and primary location for each chapter. Ensure the entire text is covered. Return ONLY JSON.
```

### System Message:
```
You are a professional script supervisor and editor. STORY: """[YOUR CLEAN STORY CONTENT]"""
```

### Variables Used:
- `story` = Your full Clean story input
- **NO director variables used here** - This is pure story structure analysis

### PROBLEM IDENTIFIED:
- **Too Aggressive**: Creating 11 chapters for Clean story when it should be 3-5 max
- **Solution**: Need to modify prompt to create fewer, longer chapters

---

## STAGE 2: Chapter Breakdown Prompt (Runs 11 times in parallel)
**Purpose**: Generate shots for each chapter with director style

### Prompt Template:
```
You are a world-class cinematographer creating a visual breakdown for a story chapter.

BALANCE REQUIREMENTS:
- Director Notes: PRIMARY creative guidance (highest priority) 
- Director Style: Core aesthetic framework (enhanced by director notes)

DIRECTOR NOTES (HIGHEST PRIORITY - GUIDES DIRECTOR STYLE):
{directorNotes}

DIRECTOR STYLE PROFILE:
{directorStyle}

CRITICAL SHOT REQUIREMENTS:
- For DIALOGUE scenes: MUST include over-the-shoulder (OTS) shots using this exact format:
  "Over-the-shoulder view from behind [Character A] ([appearance description]), looking at [Character B] ([appearance description]) at [location], [Character A]'s shoulder prominently in frame, [Character B's action/expression], [atmosphere/lighting]"
  
- For CONVERSATIONS: Provide full coverage:
  1. Establishing two-shot
  2. OTS from Character A to B
  3. Reverse OTS from B to A  
  4. Close-ups for emotional beats
  5. Return to two-shot for resolution

- For ACTION: Mix wide shots (geography) with close-ups (impact)
- For EMOTIONAL moments: Hold on close-ups, include reaction shots

Generate a shot list that authentically reflects this director's style. Each shot should be a complete, detailed image prompt.

REFERENCE FORMATTING:
- Use clean @reference handles: @protagonist, @sarah_young, @apartment, @gun
- Format: "[Shot description] featuring @character_name at @location_name with @prop_name"
- Keep references consistent and descriptive

CRITICAL JSON FORMAT REQUIREMENTS:
- chapterId: string (required)
- characterReferences: array of strings (required)
- locationReferences: array of strings (required) 
- propReferences: array of strings (required)
- shots: array of STRINGS (not objects, just plain text descriptions)
- coverageAnalysis: string (required)
- additionalOpportunities: array of strings (required)

Return ONLY JSON matching this exact schema.
```

### System Message:
```
Create a visual breakdown. CHAPTER CONTENT: """[INDIVIDUAL CHAPTER CONTENT FROM STAGE 1]"""
```

### Variables Filled In:

#### For Tarantino Director:
**{directorNotes}** = Your director notes input (empty in your test)

**{directorStyle}** = Built from director profile:
```
DIRECTOR: Quentin Tarantino
DESCRIPTION: Master of nonlinear storytelling with stylized violence and memorable dialogue
VISUAL LANGUAGE: Bold, saturated colors with dynamic camera movements. Prefers wide shots for dialogue scenes and extreme close-ups for tension. Uses unconventional angles and pop culture references.
COLOR PALETTE: Rich, saturated colors with high contrast lighting
NARRATIVE FOCUS: Character-driven dialogue with nonlinear structure
CATEGORY: Independent
DISCIPLINES: Film
STYLE TAGS: Nonlinear, Stylized, Pop Culture, Violence
```

#### Advanced Options Modifications:
- If "Include Camera Style" unchecked: Adds `"IMPORTANT: Minimize detailed camera movement descriptions."`
- If "Include Color Palette" unchecked: Adds `"IMPORTANT: Minimize detailed color palette and lighting descriptions."`

---

## STAGE 3: Title Cards (Optional - Not Used in Your Test)

---

## PROMPT OPTIMIZATION SUGGESTIONS

### 1. Fix Chapter Over-Segmentation
**Current Issue**: 11 chapters for Clean story is too many

**Improved Structure Detection Prompt**:
```
Analyze the following text and split it into 3-5 logical chapters maximum. Focus on major story beats and natural narrative breaks. Each chapter should be substantial (at least 2-3 paragraphs). Identify the narrative beat for each chapter (setup, rising-action, climax, resolution). Provide a unique ID, a concise title, the full content, start/end character positions, estimated screen time, key characters, and primary location for each chapter. Ensure the entire text is covered. Return ONLY JSON.
```

### 2. Enhanced Director Variable Usage
**Current**: Director only used in Stage 2
**Suggestion**: Include director hints in Structure Detection

**Enhanced Structure Prompt**:
```
You are analyzing this story for [DIRECTOR NAME] who is known for [DIRECTOR STYLE]. Analyze the following text and split it into 3-5 logical chapters that would work well for this director's style. Focus on major story beats and natural narrative breaks...
```

### 3. Director Notes Integration Improvements
**Current**: Basic text replacement
**Suggestion**: More intelligent integration

**Enhanced Director Notes Section**:
```
DIRECTOR NOTES ANALYSIS:
Primary Guidance: {directorNotes}
Style Compatibility: How these notes enhance {directorName}'s natural style
Creative Interpretation: Apply these notes as the PRIMARY creative direction
```

### 4. Performance Tracking Variables
Add these debug outputs to track what's happening:

```javascript
console.log('🎬 STORY LENGTH:', story.length, 'characters')
console.log('🎭 DIRECTOR SELECTED:', director)
console.log('📝 DIRECTOR NOTES:', directorNotes || 'None')
console.log('⚙️ ADVANCED OPTIONS:', { 
  includeCameraStyle: promptOptions?.includeCameraStyle, 
  includeColorPalette: promptOptions?.includeColorPalette 
})
console.log('📊 CHAPTERS CREATED:', storyStructure.chapters?.length)
console.log('⏱️ STAGE 1 COMPLETE - Moving to breakdowns...')
```

---

## KEY FINDINGS

### Why 11 Chapters for Clean Story?
The Structure Detection prompt is too aggressive - it's finding micro-beats instead of major story sections. Your Clean story should be:
1. **Setup**: The call and going to confront
2. **Rising Action**: The confrontation escalates  
3. **Climax**: The slapping and glasses moment
4. **Resolution**: Aftermath and lesson

### Director Variables Usage
- **Stage 1**: NO director influence (pure structure)
- **Stage 2**: FULL director influence (style, notes, preferences)
- **Advanced Options**: Only affect Stage 2 prompts

### Performance Impact
- **11 chapters** = 11 parallel API calls in Stage 2
- **Should be 4 chapters** = 4 parallel API calls
- **Time savings**: ~60% reduction with proper chapter count

---

## RECOMMENDED FIXES

1. **Modify structureDetection prompt** to limit chapters to 3-5 maximum
2. **Add director context** to structure detection for better narrative decisions  
3. **Enhanced debug logging** to track variables at each stage
4. **Smarter chapter boundaries** based on story length and content

This explains why your Clean story became 11 chapters and took so long - the system is over-segmenting the narrative!