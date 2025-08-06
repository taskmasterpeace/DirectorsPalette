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

const TITLE_CARD_PROMPT = `You are a professional title card designer specializing in cinematic chapter titles optimized for Runway ML Gen 4 generation. Your job is to create three distinct visual approaches for chapter title cards that match the story's tone and selected director style.

TITLE CARD GENERATION RULES:
1. ALWAYS put the title text in quotes for Runway ML Gen 4 compatibility
2. Create three distinct visual approaches: Character Focus, Location/Object Focus, Abstract/Thematic
3. Match the selected director's visual style and aesthetic preferences
4. Use existing character and location references for consistency
5. Consider the chapter's narrative beat and emotional tone
6. Ensure text is readable and cinematically composed

DIRECTOR STYLE ADAPTATIONS:

**SPIKE LEE STYLE:**
- Bold, saturated color schemes with high contrast
- Dynamic camera angles and energetic compositions
- Street art-inspired or bold typography styles
- Character-focused shots with social consciousness elements
- Vibrant, urban aesthetic with cultural authenticity

**CHRISTOPHER NOLAN STYLE:**
- Dark, high-contrast compositions with technical precision
- Architectural and mechanical elements as design features
- Bold, industrial typography with clean lines
- IMAX-scale wide shots or extreme close-ups of technical details
- Sophisticated, methodical visual approach

**WES ANDERSON STYLE:**
- Perfectly centered, symmetrical compositions
- Vintage color palettes (pastels, earth tones, muted colors)
- Whimsical, handcrafted typography with quirky character
- Detailed prop focus and dollhouse-like aesthetic
- Flat, tableau-style compositions with meticulous framing

**DENIS VILLENEUVE STYLE:**
- Atmospheric, environmental compositions with epic scale
- Muted, cinematic color grading with natural tones
- Clean, minimal typography with elegant simplicity
- Vast landscapes or intimate environmental details
- Contemplative, mood-driven visual approach

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

Return your response in this exact JSON format:
{
  "titleCards": [
    {
      "id": "character-focus",
      "style": "character-focus",
      "styleLabel": "Character Focus",
      "description": "Detailed visual description with title text in quotes"
    },
    {
      "id": "location-focus", 
      "style": "location-focus",
      "styleLabel": "Location Focus",
      "description": "Detailed visual description with title text in quotes"
    },
    {
      "id": "abstract-thematic",
      "style": "abstract-thematic", 
      "styleLabel": "Abstract/Thematic",
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
  customDirectors?: Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>
): Promise<TitleCard[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.")
  }

  const directorContext = getDirectorContext(director, customDirectors)
  
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

Generate three distinct title card approaches for this chapter. Each description must include the formatted title "${formattedTitle}" in quotes. Return only valid JSON.`

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
  }>
): Promise<ChapterBreakdown> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.")
  }

  const chapter = storyStructure.chapters.find(c => c.id === chapterId)
  if (!chapter) {
    throw new Error(`Chapter ${chapterId} not found`)
  }

  const directorContext = getDirectorContext(director, customDirectors)
  
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
          customDirectors
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
  }>
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
      customDirectors
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

export async function generateAdditionalChapterShots(request: AdditionalShotsRequest,
  customDirectors?: Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>): Promise<AdditionalShotsResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.")
  }

  const chapter = request.storyStructure.chapters.find(c => c.id === request.chapterId)
  if (!chapter) {
    throw new Error(`Chapter ${request.chapterId} not found`)
  }

  const directorContext = getDirectorContext(request.director, customDirectors)
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

function getDirectorContext(director: string, customDirectors?: Array<{
  id: string
  name: string
  description: string
  visualStyle: string
  cameraStyle: string
  colorPalette: string
  narrativeFocus: string
}>): string {
  // Check for custom directors first
  if (customDirectors) {
    const customDirector = customDirectors.find(d => d.id === director)
    if (customDirector) {
      return `Apply ${customDirector.name} style: ${customDirector.description}. 
Visual Style: ${customDirector.visualStyle}
Camera Style: ${customDirector.cameraStyle}
Color Palette: ${customDirector.colorPalette}
Narrative Focus: ${customDirector.narrativeFocus}`
    }
  }

  switch (director) {
    case "spike-lee":
      return "Apply Spike Lee style with dynamic camera movements, bold saturated colors, and social consciousness focus. Use Dutch angles, dolly shots, and vibrant urban aesthetics. Emphasize character reactions and cultural authenticity."
    case "christopher-nolan":
      return "Apply Christopher Nolan style with IMAX-scale establishing shots, technical precision, and complex narrative support. Use practical effects emphasis, architectural framing, and methodical pacing. Focus on environmental storytelling and temporal complexity."
    case "wes-anderson":
      return "Apply Wes Anderson style with perfectly symmetrical framing, whimsical details, and vintage aesthetics. Use centered compositions, pastel color palettes, and dollhouse-like precision. Emphasize quirky character moments and meticulous production design."
    case "denis-villeneuve":
      return "Apply Denis Villeneuve style with atmospheric wide shots, environmental mood, and contemplative pacing. Use natural lighting, epic scale with human vulnerability, and immersive soundscapes. Focus on emotional resonance through visual poetry."
    case "quentin-tarantino":
      return "Apply Quentin Tarantino style with pop culture dialogue focus, extreme close-ups, and stylized violence. Use retro aesthetics, bold color choices, and dynamic camera movements. Emphasize character interactions and cultural references."
    case "david-fincher":
      return "Apply David Fincher style with dark precision, psychological tension, and meticulous technical detail. Use controlled camera movements, desaturated color palettes, and clinical framing. Focus on creating unease and methodical revelation."
    case "ridley-scott":
      return "Apply Ridley Scott style with epic atmospheric scale, detailed world-building, and cinematic grandeur. Use dramatic lighting, sweeping camera movements, and rich environmental textures. Emphasize immersive production design and heroic framing."
    case "martin-scorsese":
      return "Apply Martin Scorsese style with kinetic energy, urban grit, and character-driven intensity. Use tracking shots, handheld camera work, and warm color tones. Focus on human drama and cultural authenticity with dynamic pacing."
    case "terrence-malick":
      return "Apply Terrence Malick style with poetic naturalism, golden hour lighting, and philosophical depth. Use flowing camera movements, natural environments, and contemplative pacing. Emphasize spiritual themes and connection to nature."
    case "jordan-peele":
      return "Apply Jordan Peele style with social horror elements, suspenseful build-up, and symbolic imagery. Use precise framing, unsettling compositions, and meaningful visual metaphors. Focus on psychological tension and cultural commentary."
    case "coen-brothers":
      return "Apply Coen Brothers style with dark comedy, americana aesthetics, and quirky character details. Use symmetrical compositions, deadpan framing, and regional authenticity. Emphasize absurdist moments and character eccentricities."
    case "ari-aster":
      return "Apply Ari Aster style with symmetrical horror compositions, unsettling beauty, and slow-building dread. Use precise geometric framing, disturbing pastoral imagery, and meticulous production design. Focus on psychological unease and visual symbolism."
    default:
      return "No specific director style - use standard comprehensive coverage with professional cinematographic techniques"
  }
}

// Legacy function for backward compatibility
export async function generateBreakdown(
  story: string, 
  director: string, 
  titleCardOptions?: TitleCardOptions
): Promise<any> {
  const fullResult = await generateFullStoryBreakdown(story, director, titleCardOptions)
  
  // Flatten for backward compatibility
  const allShots = fullResult.chapterBreakdowns.flatMap(chapter => chapter.shots)
  const allAnalysis = fullResult.chapterBreakdowns.map(chapter => 
    `${fullResult.storyStructure.chapters.find(c => c.id === chapter.chapterId)?.title}: ${chapter.coverageAnalysis}`
  ).join('\n\n')
  
  return {
    characterReferences: fullResult.globalReferences.characters,
    locationReferences: fullResult.globalReferences.locations,
    propReferences: fullResult.globalReferences.props,
    shots: allShots,
    coverageAnalysis: allAnalysis,
    additionalOpportunities: fullResult.chapterBreakdowns.flatMap(chapter => chapter.additionalOpportunities),
    // New chapter-aware data
    storyStructure: fullResult.storyStructure,
    chapterBreakdowns: fullResult.chapterBreakdowns,
    overallAnalysis: fullResult.overallAnalysis
  }
}

export async function generateAdditionalShots(request: any, customDirectors?: Array<{
  id: string
  name: string
  description: string
  visualStyle: string
  cameraStyle: string
  colorPalette: string
  narrativeFocus: string
}>): Promise<AdditionalShotsResult> {
  // For backward compatibility, if no chapterId provided, use first chapter
  if (!request.chapterId && request.existingBreakdown.storyStructure) {
    request.chapterId = request.existingBreakdown.storyStructure.chapters[0]?.id
  }
  
  return generateAdditionalChapterShots({...request, director: request.director, storyStructure: request.existingBreakdown.storyStructure, chapterId: request.chapterId, existingBreakdown: request.existingBreakdown, existingAdditionalShots: request.existingBreakdown.additionalOpportunities, categories: [], customRequest: ""}, customDirectors)
}
