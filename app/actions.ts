"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface Chapter {
  id: string
  title: string
  content: string
  startPosition: number
  endPosition: number
  estimatedDuration: string
  keyCharacters: string[]
  primaryLocation: string
  narrativeBeat: 'setup' | 'rising-action' | 'climax' | 'resolution'
}

interface StoryStructure {
  chapters: Chapter[]
  detectionMethod: 'existing' | 'ai-generated' | 'hybrid'
  totalChapters: number
  fullStory: string
}

interface TitleCard {
  id: string
  chapterId: string
  style: 'character-focus' | 'location-focus' | 'abstract-thematic'
  description: string
  styleLabel: string
}

interface TitleCardOptions {
  enabled: boolean
  format: 'full' | 'name-only' | 'roman-numerals'
}

interface ChapterBreakdown {
  chapterId: string
  characterReferences: string[]
  locationReferences: string[]
  propReferences: string[]
  shots: string[]
  coverageAnalysis: string
  additionalOpportunities: string[]
  titleCards?: TitleCard[]
}

interface FullBreakdownResult {
  storyStructure: StoryStructure
  globalReferences: {
    characters: string[]
    locations: string[]
    props: string[]
  }
  chapterBreakdowns: ChapterBreakdown[]
  overallAnalysis: string
}

interface AdditionalShotsResult {
  newShots: string[]
  coverageAnalysis: string
}

interface AdditionalShotsRequest {
  story: string
  director: string
  storyStructure: StoryStructure
  chapterId: string
  existingBreakdown: ChapterBreakdown
  existingAdditionalShots: string[]
  categories: string[]
  customRequest: string
}

interface PromptOptions {
  includeCameraStyle: boolean
  includeColorPalette: boolean
}

const STRUCTURE_DETECTION_PROMPT = `You are a professional story structure analyst. Your job is to detect existing chapter/scene structure in a story and enhance it with AI analysis for optimal visual breakdown.

DETECTION PRIORITIES:
1. EXISTING MARKERS: Look for "Chapter", "Scene", "ACT", "FADE IN:", "INT./EXT.", time markers
2. NARRATIVE BEATS: Identify natural story divisions, character arcs, location changes
3. STORY FLOW: Ensure logical progression and balanced chapter lengths

CHAPTER ANALYSIS REQUIREMENTS:
- Extract key characters per chapter
- Identify primary locations
- Classify narrative beat (setup, rising-action, climax, resolution)
- Estimate relative duration/importance
- Create compelling chapter titles if none exist

HYBRID APPROACH:
- Respect existing structure markers when present
- Enhance with AI analysis for missing elements
- Create logical divisions if no structure exists
- Ensure each chapter has sufficient content for visual breakdown

Return your analysis in this exact JSON format:
{
  "detectionMethod": "existing" | "ai-generated" | "hybrid",
  "chapters": [
    {
      "id": "chapter-1",
      "title": "Chapter title or generated title",
      "content": "Full text content for this chapter",
      "startPosition": 0,
      "endPosition": 500,
      "estimatedDuration": "Short/Medium/Long",
      "keyCharacters": ["@character1", "@character2"],
      "primaryLocation": "@location1",
      "narrativeBeat": "setup"
    }
  ],
  "totalChapters": 3,
  "analysisNotes": "Brief explanation of structure detection approach used"
}`

const CHAPTER_BREAKDOWN_PROMPT = `You are a world-class visual storytelling AI generating comprehensive shot coverage for a SPECIFIC CHAPTER within a larger story. You have full story context but are focusing on this particular chapter's visual needs.

CHAPTER-AWARE GENERATION RULES:
1. NARRATIVE CONTEXT: Understand where this chapter fits in the overall story arc
2. CHARACTER DEVELOPMENT: Consider character growth/changes within this chapter
3. PACING AWARENESS: Adjust shot density based on chapter's narrative importance
4. LOCATION CONSISTENCY: Focus on this chapter's primary locations while maintaining story continuity
5. DIRECTOR STYLE: Apply selected director's approach with chapter-specific emphasis

DIRECTOR STYLE SYSTEM:
**SPIKE LEE STYLE:**
- Dynamic camera movements, bold colors, social consciousness focus
- Higher shot density for dialogue-heavy chapters
- Intimate character work during emotional chapters

**CHRISTOPHER NOLAN STYLE:**
- IMAX-scale establishing shots, technical precision
- Complex narrative support for plot-heavy chapters
- Environmental storytelling emphasis

**WES ANDERSON STYLE:**
- Symmetrical framing, whimsical details, vintage aesthetics
- Higher shot count for character-driven chapters
- Precise composition for intimate moments

**DENIS VILLENEUVE STYLE:**
- Atmospheric wide shots, environmental mood
- Contemplative pacing for introspective chapters
- Epic scale with human vulnerability

RUNWAY ML GEN 4 OPTIMIZATION:
- Professional film terminology (85mm lens, medium shot, shallow depth of field)
- Direct visual descriptions optimized for Gen 4
- Consistent @reference system for character/location continuity
- NO shot numbers or numeric prefixes in descriptions

CHAPTER-SPECIFIC FOCUS:
- Generate 8-15 shots depending on chapter length and importance
- Emphasize this chapter's key narrative moments
- Ensure smooth transitions from previous chapter context
- Set up visual continuity for following chapters

Return your response in this exact JSON format:
{
  "characterReferences": ["@character1 - description", "@character2 - description"],
  "locationReferences": ["@location1 - description", "@location2 - description"],
  "propReferences": ["@prop1 - description", "@prop2 - description"],
  "shots": ["Shot description without numbers", "Another shot description"],
  "coverageAnalysis": "Analysis of this chapter's coverage and its role in the overall story",
  "additionalOpportunities": ["Chapter-specific additional shot opportunities"]
}`

const ADDITIONAL_CHAPTER_SHOTS_PROMPT = `You are generating ADDITIONAL TARGETED SHOTS for a specific chapter within a larger story. Focus on this chapter's needs while maintaining story continuity.

CONTEXT-AWARE CHAPTER GENERATION:
1. DO NOT duplicate existing shots within this chapter
2. Maintain character/location reference consistency across the full story
3. Focus on the specific chapter's narrative needs and gaps
4. Consider this chapter's role in the overall story arc
5. Generate 3-6 additional shots based on requests

SHOT CATEGORY DEFINITIONS (Chapter-Focused):
- character-reactions: Character development moments specific to this chapter
- dialogue-coverage: Conversation coverage for this chapter's key scenes
- environmental-details: Location atmosphere relevant to this chapter
- transition-shots: Bridges within this chapter or to adjacent chapters
- action-coverage: Physical moments and movement within this chapter
- technical-shots: Specialized coverage for this chapter's unique needs

Return response in this exact JSON format:
{
  "newShots": ["New shot description without numbers", "Another new shot"],
  "coverageAnalysis": "Updated analysis of this chapter's coverage including new shots"
}`

const TITLE_CARD_PROMPT = `You are a professional title card designer specializing in cinematic chapter titles optimized for Runway ML Gen 4 generation. Your job is to create distinct visual approaches for chapter title cards that match the story's tone and selected director style.

TITLE CARD GENERATION RULES:
1. ALWAYS put the title text in quotes for Runway ML Gen 4 compatibility
2. Create visual approaches based on the requested categories
3. Match the selected director's visual style and aesthetic preferences
4. Use existing character and location references for consistency
5. Consider the chapter's narrative beat and emotional tone
6. Ensure text is readable and cinematically composed

VISUAL APPROACH DEFINITIONS:

**Character Focus:**
- Feature key characters from the chapter in cinematic poses
- Use dramatic lighting and composition to convey chapter mood
- Integrate title text naturally into the character composition
- Consider character emotional state and development

**Location/Object Focus:**
- Highlight primary locations or significant objects from the chapter
- Use environmental storytelling and atmospheric details
- Create mood through lighting, weather, and setting
- Incorporate symbolic or thematic visual elements

**Abstract/Thematic:**
- Create conceptual compositions representing chapter themes
- Use color, texture, and abstract visual elements
- Focus on emotional tone and narrative significance
- Employ artistic and stylized visual approaches

RUNWAY ML GEN 4 OPTIMIZATION:
- Use professional cinematographic terminology
- Specify lighting conditions, camera angles, and composition details
- Include color palette and mood descriptors
- Ensure text placement and typography are clearly described
- Keep descriptions focused and visually specific

Generate only the requested visual approaches. Return your response in this exact JSON format:
{
  "titleCards": [
    {
      "id": "approach-id",
      "style": "approach-style",
      "styleLabel": "Approach Label",
      "description": "Detailed visual description with title text in quotes"
    }
  ]
}`

export async function analyzeStoryStructure(story: string): Promise<StoryStructure> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.")
  }

  const prompt = `${STRUCTURE_DETECTION_PROMPT}

STORY TO ANALYZE:
${story}

Analyze this story's structure and return the chapter breakdown in the specified JSON format.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.3, // Lower temperature for more consistent structure analysis
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in structure analysis response")
    }

    const result = JSON.parse(jsonMatch[0])

    return {
      chapters: result.chapters || [],
      detectionMethod: result.detectionMethod || 'ai-generated',
      totalChapters: result.totalChapters || result.chapters?.length || 0,
      fullStory: story
    }
  } catch (error) {
    console.error("Error analyzing story structure:", error)
    throw new Error("Failed to analyze story structure. Please try again.")
  }
}

export async function generateTitleCards(
  chapter: Chapter,
  director: string,
  titleFormat: string,
  characterReferences: string[],
  locationReferences: string[],
  selectedApproaches: string[] = ['character-focus', 'location-focus', 'abstract-thematic'],
  customDirectors?: Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>,
  promptOptions?: PromptOptions
): Promise<TitleCard[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.")
  }

  const directorContext = getDirectorContext(director, customDirectors, promptOptions)
  
  // Format the title based on user preference
  let formattedTitle = ""
  const chapterIndex = parseInt(chapter.id.split('-')[1]) || 1
  
  switch (titleFormat) {
    case 'full':
      formattedTitle = `Chapter ${chapterIndex}: ${chapter.title}`
      break
    case 'roman-numerals':
      const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
      const romanNumeral = romanNumerals[chapterIndex - 1] || `${chapterIndex}`
      formattedTitle = `Chapter ${romanNumeral}: ${chapter.title}`
      break
    case 'name-only':
    default:
      formattedTitle = chapter.title
      break
  }

  const prompt = `${TITLE_CARD_PROMPT}

DIRECTOR SELECTION: ${directorContext}

REQUESTED APPROACHES: ${selectedApproaches.map(approach => {
  switch(approach) {
    case 'character-focus': return 'Character Focus'
    case 'location-focus': return 'Location/Object Focus' 
    case 'abstract-thematic': return 'Abstract/Thematic'
    default: return approach
  }
}).join(', ')}

CHAPTER DETAILS:
Title: ${chapter.title}
Formatted Title for Display: "${formattedTitle}"
Content: ${chapter.content}
Narrative Beat: ${chapter.narrativeBeat}
Key Characters: ${chapter.keyCharacters.join(', ')}
Primary Location: ${chapter.primaryLocation}
Estimated Duration: ${chapter.estimatedDuration}

AVAILABLE CHARACTER REFERENCES:
${characterReferences.join('\n')}

AVAILABLE LOCATION REFERENCES:
${locationReferences.join('\n')}

Generate title card approaches for the requested categories. Each description must include the formatted title "${formattedTitle}" in quotes. Return only valid JSON.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.8, // Higher creativity for visual design
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in title card response")
    }

    const result = JSON.parse(jsonMatch[0])

    return result.titleCards.map((card: any) => ({
      ...card,
      chapterId: chapter.id
    })) || []
  } catch (error) {
    console.error("Error generating title cards:", error)
    throw new Error(`Failed to generate title cards for ${chapter.title}. Please try again.`)
  }
}

export async function generateChapterBreakdown(
  storyStructure: StoryStructure,
  chapterId: string,
  director: string,
  globalReferences?: { characters: string[], locations: string[], props: string[] },
  titleCardOptions?: TitleCardOptions,
  customDirectors?: Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>,
  promptOptions?: PromptOptions
): Promise<ChapterBreakdown> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.")
  }

  const chapter = storyStructure.chapters.find(c => c.id === chapterId)
  if (!chapter) {
    throw new Error(`Chapter ${chapterId} not found`)
  }

  const directorContext = getDirectorContext(director, customDirectors, promptOptions)
  
  const globalReferencesText = globalReferences ? `
EXISTING GLOBAL REFERENCES (maintain consistency):
Characters: ${globalReferences.characters.join(', ')}
Locations: ${globalReferences.locations.join(', ')}
Props: ${globalReferences.props.join(', ')}
` : ''

  const prompt = `${CHAPTER_BREAKDOWN_PROMPT}

DIRECTOR SELECTION: ${directorContext}

FULL STORY CONTEXT:
${storyStructure.fullStory}

CURRENT CHAPTER FOCUS:
Chapter: ${chapter.title}
Content: ${chapter.content}
Narrative Beat: ${chapter.narrativeBeat}
Key Characters: ${chapter.keyCharacters.join(', ')}
Primary Location: ${chapter.primaryLocation}
Story Position: Chapter ${storyStructure.chapters.indexOf(chapter) + 1} of ${storyStructure.totalChapters}

${globalReferencesText}

Generate comprehensive visual breakdown for this specific chapter while maintaining story continuity. Return only valid JSON.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in chapter breakdown response")
    }

    const result = JSON.parse(jsonMatch[0])

    let titleCards: TitleCard[] = []
    
    // Generate title cards if enabled
    if (titleCardOptions?.enabled) {
      try {
        titleCards = await generateTitleCards(
          chapter,
          director,
          titleCardOptions.format,
          globalReferences?.characters || [],
          globalReferences?.locations || [],
          undefined,
          customDirectors,
          promptOptions
        )
      } catch (error) {
        console.error("Error generating title cards:", error)
        // Continue without title cards if generation fails
      }
    }

    return {
      chapterId,
      characterReferences: result.characterReferences || [],
      locationReferences: result.locationReferences || [],
      propReferences: result.propReferences || [],
      shots: result.shots || [],
      coverageAnalysis: result.coverageAnalysis || "",
      additionalOpportunities: result.additionalOpportunities || [],
      titleCards,
    }
  } catch (error) {
    console.error("Error generating chapter breakdown:", error)
    throw new Error(`Failed to generate breakdown for ${chapter.title}. Please try again.`)
  }
}

export async function generateFullStoryBreakdown(
  story: string, 
  director: string, 
  titleCardOptions?: TitleCardOptions,
  customDirectors?: Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>,
  promptOptions?: PromptOptions
): Promise<FullBreakdownResult> {
  // Step 1: Analyze story structure
  const storyStructure = await analyzeStoryStructure(story)
  
  // Step 2: Generate breakdowns for each chapter sequentially
  const chapterBreakdowns: ChapterBreakdown[] = []
  let globalReferences = { characters: [], locations: [], props: [] }

  for (const chapter of storyStructure.chapters) {
    const chapterBreakdown = await generateChapterBreakdown(
      storyStructure, 
      chapter.id, 
      director, 
      globalReferences,
      titleCardOptions,
      customDirectors,
      promptOptions
    )
    
    chapterBreakdowns.push(chapterBreakdown)
    
    // Update global references for consistency
    globalReferences = {
      characters: [...new Set([...globalReferences.characters, ...chapterBreakdown.characterReferences])],
      locations: [...new Set([...globalReferences.locations, ...chapterBreakdown.locationReferences])],
      props: [...new Set([...globalReferences.props, ...chapterBreakdown.propReferences])]
    }
  }

  // Step 3: Generate overall analysis
  const totalShots = chapterBreakdowns.reduce((sum, chapter) => sum + chapter.shots.length, 0)
  const totalTitleCards = titleCardOptions?.enabled ? chapterBreakdowns.reduce((sum, chapter) => sum + (chapter.titleCards?.length || 0), 0) : 0
  const overallAnalysis = `Complete story breakdown generated with ${storyStructure.totalChapters} chapters, ${totalShots} total shots${totalTitleCards > 0 ? `, and ${totalTitleCards} title card options` : ''}. Structure detection method: ${storyStructure.detectionMethod}. Each chapter maintains narrative continuity while providing comprehensive visual coverage optimized for Runway ML Gen 4.`

  return {
    storyStructure,
    globalReferences,
    chapterBreakdowns,
    overallAnalysis
  }
}

export async function generateAdditionalChapterShots(
  request: AdditionalShotsRequest,
  customDirectors?: Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>,
  promptOptions?: PromptOptions
): Promise<AdditionalShotsResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.")
  }

  const chapter = request.storyStructure.chapters.find(c => c.id === request.chapterId)
  if (!chapter) {
    throw new Error(`Chapter ${request.chapterId} not found`)
  }

  const directorContext = getDirectorContext(request.director, customDirectors, promptOptions)
  const allExistingShots = [...request.existingBreakdown.shots, ...request.existingAdditionalShots]

  const categoriesText = request.categories.length > 0 
    ? `REQUESTED CATEGORIES: ${request.categories.join(", ")}`
    : ""

  const customRequestText = request.customRequest 
    ? `CUSTOM REQUEST: ${request.customRequest}`
    : ""

  const prompt = `${ADDITIONAL_CHAPTER_SHOTS_PROMPT}

DIRECTOR SELECTION: ${directorContext}

FULL STORY CONTEXT:
${request.storyStructure.fullStory}

CURRENT CHAPTER:
${chapter.title}: ${chapter.content}

EXISTING CHAPTER REFERENCES:
Characters: ${request.existingBreakdown.characterReferences.join("\n")}
Locations: ${request.existingBreakdown.locationReferences.join("\n")}

EXISTING CHAPTER SHOTS (DO NOT DUPLICATE):
${allExistingShots.join("\n")}

CURRENT CHAPTER COVERAGE ANALYSIS:
${request.existingBreakdown.coverageAnalysis}

${categoriesText}

${customRequestText}

Generate additional shots for this specific chapter based on the requests above. Return only valid JSON.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response")
    }

    const result = JSON.parse(jsonMatch[0])

    return {
      newShots: result.newShots || [],
      coverageAnalysis: result.coverageAnalysis || "",
    }
  } catch (error) {
    console.error("Error generating additional chapter shots:", error)
    throw new Error("Failed to generate additional shots for this chapter. Please try again.")
  }
}

function getDirectorContext(
  director: string, 
  customDirectors?: Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>,
  promptOptions?: PromptOptions
): string {
  // Check for custom directors first
  if (customDirectors) {
    const customDirector = customDirectors.find(d => d.id === director)
    if (customDirector) {
      let context = `Apply ${customDirector.name} style: ${customDirector.description}.`
      
      if (customDirector.visualStyle) {
        context += `\nVisual Style: ${customDirector.visualStyle}`
      }
      
      if (promptOptions?.includeCameraStyle && customDirector.cameraStyle) {
        context += `\nCamera Style: ${customDirector.cameraStyle}`
      }
      
      if (promptOptions?.includeColorPalette && customDirector.colorPalette) {
        context += `\nColor Palette: ${customDirector.colorPalette}`
      }
      
      if (customDirector.narrativeFocus) {
        context += `\nNarrative Focus: ${customDirector.narrativeFocus}`
      }
      
      return context
    }
  }

  // Base director context without optional elements
  let baseContext = ""
  let cameraContext = ""
  let colorContext = ""

  switch (director) {
    case "taskmasterpeace":
      baseContext = "Apply Taskmasterpeace style with emotionally-driven visual storytelling. Focus on authentic human moments following traditional storytelling rules, multiple establishing shots to ground the audience, intimate emotional captures with atmospheric lighting that reveals the complete emotional journey."
      cameraContext = "Use handheld intimate movements, dynamic motion that matches scene energy, over-the-shoulder dialogue coverage, essential establishing shots."
      colorContext = "Apply cool blues and teals for aspirational stories, desaturated tones for distancing/realism, strategic color temperature shifts."
      break
    case "roger-deakins":
      baseContext = "Apply Roger Deakins style with cinematic silhouettes and natural drama. Focus on environmental storytelling, mood over dialogue, visual metaphors."
      cameraContext = "Use steady controlled movements, low angles, wide establishing shots, dramatic backlighting, silhouette work, atmospheric haze, natural light sources."
      colorContext = "Apply high contrast, deep blues, golden hour warmth, stark blacks with dramatic lighting contrasts."
      break
    case "emmanuel-lubezki":
      baseContext = "Apply Emmanuel Lubezki style with flowing natural light poetry. Focus on human connection with nature, spiritual journeys, raw emotion."
      cameraContext = "Use fluid steadicam, 360-degree movements, following action naturally, golden hour magic, long continuous takes, immersive environments."
      colorContext = "Apply warm golden tones, natural earth colors, soft highlights with natural lighting."
      break
    case "rian-johnson":
      baseContext = "Apply Rian Johnson style with genre-blending creative storytelling. Focus on genre deconstruction, mystery elements, character subversion."
      cameraContext = "Use inventive movements, POV shots, playful framing, creative angles, color coding, genre visual language mixing."
      colorContext = "Apply bold primary colors, genre-specific palettes, symbolic color use."
      break
    case "spike-lee":
      baseContext = "Apply Spike Lee style with social consciousness focus and cultural authenticity. Emphasize character reactions and dynamic storytelling."
      cameraContext = "Use dynamic camera movements, Dutch angles, and dolly shots with vibrant urban aesthetics."
      colorContext = "Apply bold saturated colors with high contrast and vibrant urban color schemes."
      break
    case "christopher-nolan":
      baseContext = "Apply Christopher Nolan style with IMAX-scale mind-bending epics. Focus on time manipulation, complex narratives, intellectual puzzles."
      cameraContext = "Use handheld action, sweeping aerials, rotating perspectives, large format cinematography, practical effects, architectural framing."
      colorContext = "Apply cool blues, steel grays, minimal saturation, stark contrasts."
      break
    case "wes-anderson":
      baseContext = "Apply Wes Anderson style with whimsical symmetrical storytelling. Focus on character quirks, nostalgic themes, ensemble storytelling."
      cameraContext = "Use static shots, precise dollies, symmetrical framing, perfectly centered compositions, dollhouse-like sets, meticulous production design."
      colorContext = "Apply pastel pinks, mint greens, warm yellows, cream whites with vintage aesthetics."
      break
    case "denis-villeneuve":
      baseContext = "Apply Denis Villeneuve style with epic atmospheric sci-fi realism. Focus on philosophical themes, isolation, humanity vs technology."
      cameraContext = "Use sweeping crane shots, slow push-ins, static wide shots, massive scale compositions."
      colorContext = "Apply muted earth tones, orange/teal contrast, desaturated colors with environmental storytelling."
      break
    case "quentin-tarantino":
      baseContext = "Apply Quentin Tarantino style with pop culture saturated genre mashup. Focus on character dialogue, revenge stories, pop culture references."
      cameraContext = "Use Dutch angles, crash zooms, trunk shots, unconventional framing, retro aesthetic, bold graphic compositions."
      colorContext = "Apply saturated primary colors, vintage film stocks, high contrast."
      break
    case "david-fincher":
      baseContext = "Apply David Fincher style with precise psychological darkness. Focus on psychological tension, obsession, dark human nature."
      cameraContext = "Use slow methodical push-ins, locked-off precision shots, controlled artificial lighting, sharp focus, clinical cleanliness meets urban grit."
      colorContext = "Apply green/yellow sickly tones, deep blacks, minimal warm colors."
      break
    case "ridley-scott":
      baseContext = "Apply Ridley Scott style with epic cinematic world-building. Focus on historical epics, survival stories, moral complexity."
      cameraContext = "Use sweeping movements, multiple cameras, dynamic angles, atmospheric smoke and haze, epic scale, detailed production design."
      colorContext = "Apply warm amber tones, deep shadows, rich earth colors."
      break
    case "martin-scorsese":
      baseContext = "Apply Martin Scorsese style with kinetic energy and character-driven intensity. Focus on human drama and cultural authenticity with dynamic pacing."
      cameraContext = "Use tracking shots, handheld camera work, and urban grit cinematography."
      colorContext = "Apply warm color tones with rich, saturated palettes and authentic lighting."
      break
    case "terrence-malick":
      baseContext = "Apply Terrence Malick style with poetic naturalism and philosophical depth. Emphasize spiritual themes and connection to nature."
      cameraContext = "Use flowing camera movements, natural environments, and contemplative pacing."
      colorContext = "Apply golden hour lighting with natural color palettes and organic tones."
      break
    case "jordan-peele":
      baseContext = "Apply Jordan Peele style with social horror through unconventional framing. Focus on social commentary through horror, racial themes, family dynamics."
      cameraContext = "Use static uncomfortable framing, slow reveals, POV perspectives, uncomfortable compositions, suburban uncanny valley."
      colorContext = "Apply suburban pastels hiding darkness, high contrast day/night with hidden symbols."
      break
    case "coen-brothers":
      baseContext = "Apply Coen Brothers style with dark comedy and americana aesthetics. Emphasize absurdist moments and character eccentricities."
      cameraContext = "Use symmetrical compositions, deadpan framing, and regional authenticity."
      colorContext = "Apply quirky character details with authentic regional color palettes."
      break
    case "ari-aster":
      baseContext = "Apply Ari Aster style with symmetrical horror compositions and slow-building dread. Focus on psychological unease and visual symbolism."
      cameraContext = "Use precise geometric framing, disturbing pastoral imagery, and meticulous composition."
      colorContext = "Apply unsettling beauty with carefully controlled color palettes and symbolic lighting."
      break
    default:
      return "No specific director style - use standard comprehensive coverage with professional cinematographic techniques"
  }

  // Handle minimal mode (both options disabled)
  if (promptOptions && !promptOptions.includeCameraStyle && !promptOptions.includeColorPalette) {
    return baseContext + " Focus on basic composition, subject matter, and essential visual elements without technical camera specifications or detailed color descriptions."
  }

  // Build the final context based on prompt options
  let finalContext = baseContext

  if (promptOptions?.includeCameraStyle && cameraContext) {
    finalContext += ` ${cameraContext}`
  }

  if (promptOptions?.includeColorPalette && colorContext) {
    finalContext += ` ${colorContext}`
  }

  return finalContext
}

// Legacy function for backward compatibility
export async function generateBreakdown(
  story: string, 
  director: string, 
  titleCardOptions?: TitleCardOptions,
  customDirectors?: Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>,
  promptOptions?: PromptOptions
): Promise<any> {
  const fullResult = await generateFullStoryBreakdown(story, director, titleCardOptions, customDirectors, promptOptions)
  
  // Flatten for backward compatibility
  const allShots = fullResult.chapterBreakdowns.flatMap(chapter => chapter.shots)
  const allAnalysis = fullResult.chapterBreakdowns.map(chapter => 
    `${fullResult.storyStructure.chapters.find(c => c.id === chapter.chapterId)?.title}: ${chapter.coverageAnalysis}`
  ).join('\n\n')
  
  return {
    characterReferences: fullResult.globalReferences.characters,
    locationReferences: fullResult.globalReferences.locations,
    propReferences: fullResult.globalReferences.locations,
    shots: allShots,
    coverageAnalysis: allAnalysis,
    additionalOpportunities: fullResult.chapterBreakdowns.flatMap(chapter => chapter.additionalOpportunities),
    // New chapter-aware data
    storyStructure: fullResult.storyStructure,
    chapterBreakdowns: fullResult.chapterBreakdowns,
    overallAnalysis: fullResult.overallAnalysis
  }
}

export async function generateAdditionalShots(
  request: any, 
  customDirectors?: Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>,
  promptOptions?: PromptOptions
): Promise<AdditionalShotsResult> {
  // For backward compatibility, if no chapterId provided, use first chapter
  if (!request.chapterId && request.existingBreakdown.storyStructure) {
    request.chapterId = request.existingBreakdown.storyStructure.chapters[0]?.id
  }
  
  return generateAdditionalChapterShots({
    ...request, 
    director: request.director, 
    storyStructure: request.existingBreakdown.storyStructure, 
    chapterId: request.chapterId, 
    existingBreakdown: request.existingBreakdown, 
    existingAdditionalShots: request.existingBreakdown.additionalOpportunities, 
    categories: [], 
    customRequest: ""
  }, customDirectors, promptOptions)
}

export function getDefaultPrompts() {
  return {
    structureDetection: STRUCTURE_DETECTION_PROMPT,
    chapterBreakdown: CHAPTER_BREAKDOWN_PROMPT,
    additionalShots: ADDITIONAL_CHAPTER_SHOTS_PROMPT,
    titleCard: TITLE_CARD_PROMPT
  }
}

export async function generateStandaloneTitleCards(
  chapterTitle: string,
  director: string,
  titleFormat: string,
  selectedApproaches: string[] = ['character-focus', 'location-focus', 'abstract-thematic'],
  customDirectors?: Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>,
  promptOptions?: PromptOptions,
  customPrompt?: string
): Promise<TitleCard[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.")
  }

  const directorContext = getDirectorContext(director, customDirectors, promptOptions)
  
  // Create a mock chapter for standalone generation
  const mockChapter: Chapter = {
    id: "standalone-1",
    title: chapterTitle,
    content: `This is a standalone title card generation for "${chapterTitle}".`,
    startPosition: 0,
    endPosition: 100,
    estimatedDuration: "Medium",
    keyCharacters: [],
    primaryLocation: "",
    narrativeBeat: "setup"
  }
  
  // Format the title based on user preference
  let formattedTitle = ""
  
  switch (titleFormat) {
    case 'full':
      formattedTitle = `Chapter 1: ${chapterTitle}`
      break
    case 'roman-numerals':
      formattedTitle = `Chapter I: ${chapterTitle}`
      break
    case 'name-only':
    default:
      formattedTitle = chapterTitle
      break
  }

  const prompt = customPrompt || `${TITLE_CARD_PROMPT}

DIRECTOR SELECTION: ${directorContext}

CHAPTER DETAILS:
Title: ${chapterTitle}
Formatted Title for Display: "${formattedTitle}"
Content: Standalone title card generation
Narrative Beat: setup
Key Characters: N/A
Primary Location: N/A
Estimated Duration: N/A

AVAILABLE CHARACTER REFERENCES:
N/A - Standalone generation

AVAILABLE LOCATION REFERENCES:
N/A - Standalone generation

Generate three distinct title card approaches for this standalone title. Each description must include the formatted title "${formattedTitle}" in quotes. Return only valid JSON.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.8,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in title card response")
    }

    const result = JSON.parse(jsonMatch[0])

    return result.titleCards.map((card: any) => ({
      ...card,
      chapterId: "standalone-1"
    })) || []
  } catch (error) {
    console.error("Error generating standalone title cards:", error)
    throw new Error(`Failed to generate title cards for "${chapterTitle}". Please try again.`)
  }
}
