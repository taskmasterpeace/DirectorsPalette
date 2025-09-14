"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject, generateText } from "ai"
import { z } from "zod"
import type { MusicVideoConfig } from "@/lib/indexeddb"

// Schemas
const ChapterSchema = z.object({
  id: z.string().describe("A unique identifier for the chapter (e.g., 'chapter1')."),
  title: z.string().describe("A concise, descriptive title for the chapter."),
  content: z.string().describe("The full text content of this chapter."),
  startPosition: z.number().describe("The starting character index of the chapter in the full story."),
  endPosition: z.number().describe("The ending character index of the chapter in the full story."),
  estimatedDuration: z.string().describe("An estimated screen time for this chapter (e.g., '2 minutes 30 seconds')."),
  keyCharacters: z.array(z.string()).describe("A list of key characters present in this chapter."),
  primaryLocation: z.string().describe("The main setting or location for this chapter."),
  narrativeBeat: z.enum(["setup", "rising-action", "climax", "resolution"]).describe("The narrative function of this chapter within the story arc."),
})

const StoryStructureSchema = z.object({
  chapters: z.array(ChapterSchema),
  detectionMethod: z.enum(["existing", "ai-generated", "hybrid"]).describe("How the chapters were identified: 'existing' for predefined markers, 'ai-generated' for purely AI-driven splits, 'hybrid' for a mix."),
  totalChapters: z.number(),
  fullStory: z.string(),
})

const TitleCardSchema = z.object({
  id: z.string().describe("Unique ID for the title card, e.g., 'title-card-1'"),
  styleLabel: z.string().describe("A short, evocative label for the title card's style (e.g., 'Minimalist', 'Grunge Text', 'Kinetic Typography')."),
  description: z.string().describe("A detailed visual description of the title card, including font, animation, and on-screen placement."),
})

const ChapterBreakdownSchema = z.object({
  chapterId: z.string(),
  characterReferences: z.array(z.string()).describe("List of key characters with brief descriptions of their role in this chapter."),
  locationReferences: z.array(z.string()).describe("List of key locations with brief descriptions of their relevance."),
  propReferences: z.array(z.string()).describe("List of key props with brief descriptions of their significance."),
  shots: z.array(z.string()).describe("A detailed shot list for the chapter."),
  coverageAnalysis: z.string().describe("An analysis of the shot coverage, identifying strengths and potential gaps."),
  additionalOpportunities: z.array(z.string()).describe("Suggestions for other visual or narrative opportunities in this chapter."),
  titleCards: z.optional(z.array(TitleCardSchema)).describe("Optional title card designs for this chapter."),
})

const MusicVideoSectionSchema = z.object({
  id: z.string().describe("A unique identifier for the section (e.g., 'verse1', 'chorus1')."),
  title: z.string().describe("The title of the section (e.g., 'Verse 1', 'Chorus')."),
  type: z.enum(["intro", "verse", "pre-chorus", "chorus", "post-chorus", "bridge", "instrumental", "solo", "refrain", "outro", "hook", "interlude"]).describe("The type of song section."),
  startTime: z.string().optional().describe("The start time of the section in MM:SS format, if available."),
  endTime: z.string().optional().describe("The end time of the section in MM:SS format, if available."),
  lyrics: z.string().describe("The lyrics for this section."),
  isHook: z.boolean().optional().describe("True if this section is a recurring hook."),
  repetitionNumber: z.number().optional().describe("The repetition number for this section type (e.g., Chorus 1, Chorus 2)."),
})

const MusicVideoStructureSchema = z.object({
  songTitle: z.string().describe("The title of the song."),
  artist: z.string().describe("The artist of the song."),
  genre: z.string().describe("The genre of the song."),
  totalSections: z.number().describe("The total number of sections identified."),
  sections: z.array(MusicVideoSectionSchema),
  detectionMethod: z.enum(["timestamp-based", "ai-generated", "hybrid"]).describe("How the sections were identified."),
})

const TreatmentSchema = z.object({
  id: z.string().describe("Unique ID for the treatment (e.g., 'treatment-1')."),
  name: z.string().describe("A short, catchy name for the treatment (e.g., 'Neon Noir', 'Daydream', 'Urban Grit')."),
  concept: z.string().describe("A one-paragraph summary of the core concept and narrative approach."),
  visualTheme: z.string().describe("A detailed description of the visual style, including color palette, lighting, camera work, and overall aesthetic."),
  performanceRatio: z.number().describe("The estimated percentage of the video dedicated to performance shots vs. narrative shots (e.g., 60 for 60% performance)."),
  hookStrategy: z.string().describe("A description of how repeated sections like the chorus/hook will be handled visually to build energy and avoid repetition."),
})

const MusicVideoSectionBreakdownSchema = z.object({
  sectionId: z.string(),
  shots: z.array(z.string()).describe("A detailed shot list for the section, incorporating the chosen treatment and configuration."),
  performanceNotes: z.array(z.string()).describe("Specific notes on the artist's performance for this section."),
  syncPoints: z.array(z.string()).describe("Key moments in the lyrics or music to sync visuals with."),
  performanceRatio: z.number().describe("The percentage of performance vs. narrative shots in this specific section."),
})

const LocationConfigSchema = z.object({
  id: z.string(),
  reference: z.string(),
  name: z.string(),
  description: z.string(),
  purpose: z.string(),
  assignedSections: z.array(z.string()),
});

const WardrobeConfigSchema = z.object({
  id: z.string(),
  reference: z.string(),
  name: z.string(),
  description: z.string(),
  purpose: z.string(),
  assignedSections: z.array(z.string()),
});

const PropConfigSchema = z.object({
  id: z.string(),
  reference: z.string(),
  name: z.string(),
  description: z.string(),
  purpose: z.string(),
  assignedSections: z.array(z.string()),
});

const SuggestionsSchema = z.object({
  locations: z.array(LocationConfigSchema),
  wardrobe: z.array(WardrobeConfigSchema),
  props: z.array(PropConfigSchema),
});

const DirectorProfileSchema = z.object({
  visualHallmarks: z.string().describe("A comma-separated list of recurring visual tactics—lenses, color, edits, staging, visual effects, camera moves, lighting moods, framing, etc."),
  narrativeStyle: z.string().describe("The director's typical approach to musical storytelling—linear, abstract, cinematic, docu-style, performance-driven, thematic, ambiguous, etc."),
  pacingAndEnergy: z.string().describe("The typical pacing and energy of their work—fast, chill, explosive, dreamlike, mysterious, high-tension, celebratory, etc."),
  genres: z.string().describe("A comma-separated list of music genres the director is most associated with."),
});

// Helper function to construct comprehensive director style text for Film
function buildFilmDirectorStyle(d?: {
  name?: string
  description?: string
  visualLanguage?: string
  visualStyle?: string
  cameraStyle?: string
  colorPalette?: string
  narrativeFocus?: string
  disciplines?: string[]
  tags?: string[]
  category?: string
}) {
  if (!d) return "Standard, balanced coverage focusing on clarity and storytelling."
  
  const visual = d.visualLanguage || [d.visualStyle, d.cameraStyle].filter(Boolean).join("; ")
  
  const styleComponents = [
    `DIRECTOR: ${d.name || "Unknown"}`,
    d.description ? `DESCRIPTION: ${d.description}` : null,
    visual ? `VISUAL LANGUAGE: ${visual}` : null,
    d.colorPalette ? `COLOR PALETTE: ${d.colorPalette}` : null,
    d.narrativeFocus ? `NARRATIVE FOCUS: ${d.narrativeFocus}` : null,
    d.category ? `CATEGORY: ${d.category}` : null,
    d.disciplines && d.disciplines.length ? `DISCIPLINES: ${d.disciplines.join(", ")}` : null,
    d.tags && d.tags.length ? `STYLE TAGS: ${d.tags.join(", ")}` : null,
  ].filter(Boolean)
  
  return styleComponents.join("\n")
}

// Helper function to construct comprehensive style text for Music Video
function buildMusicDirectorStyle(d?: {
  name?: string
  description?: string
  visualHallmarks?: string
  narrativeStyle?: string
  pacingAndEnergy?: string
  genres?: string[]
  disciplines?: string[]
  tags?: string[]
  category?: string
}) {
  if (!d) return "Standard, balanced, and modern music video style."
  
  const styleComponents = [
    `DIRECTOR: ${d.name || "Unknown"}`,
    d.description ? `DESCRIPTION: ${d.description}` : null,
    d.visualHallmarks ? `VISUAL HALLMARKS: ${d.visualHallmarks}` : null,
    d.narrativeStyle ? `NARRATIVE STYLE: ${d.narrativeStyle}` : null,
    d.pacingAndEnergy ? `PACING & ENERGY: ${d.pacingAndEnergy}` : null,
    d.genres && d.genres.length ? `GENRES: ${d.genres.join(", ")}` : null,
    d.category ? `CATEGORY: ${d.category}` : null,
    d.disciplines && d.disciplines.length ? `DISCIPLINES: ${d.disciplines.join(", ")}` : null,
    d.tags && d.tags.length ? `STYLE TAGS: ${d.tags.join(", ")}` : null,
  ].filter(Boolean)
  
  return styleComponents.join("\n")
}

// Default Prompts
const defaultPrompts = {
  structureDetection: `Analyze the following text and split it into logical chapters. Identify the narrative beat for each chapter (setup, rising-action, climax, resolution). Provide a unique ID, a concise title, the full content, start/end character positions, estimated screen time, key characters, and primary location for each chapter. Ensure the entire text is covered. Return ONLY the valid JSON object.`,
  
  chapterBreakdown: `You are a world-class cinematographer creating a visual breakdown for a story chapter. Generate a detailed shot list that reflects the director's unique style and approach.

DIRECTOR STYLE PROFILE:
{directorStyle}

Based on this director's specific visual language, color palette, narrative focus, and disciplines, create shots that authentically reflect their style. Consider their typical camera movements, framing preferences, lighting approaches, and storytelling methods.

Also identify key character, location, and prop references. Analyze the shot coverage and suggest additional opportunities. Return ONLY the valid JSON object.`,

  additionalShots: `You are expanding a shot list for a story chapter in the style of a specific director. Generate {shotCount} new, distinct shots that focus on these categories: {categories}.

DIRECTOR STYLE PROFILE:
{directorStyle}

CUSTOM REQUEST: {customRequest}

The new shots should authentically reflect this director's visual language, camera techniques, and narrative approach. Ensure they complement the existing coverage while adding the director's signature style elements.

Update the coverage analysis based on the new shots. Return ONLY the valid JSON object with 'newShots' and 'coverageAnalysis' keys.`,

  titleCard: `Design {count} unique title card concepts for the chapter titled "{chapterTitle}". For each concept, provide a 'styleLabel' and a detailed 'description' of the visual execution based on these approaches: {approaches}. Return ONLY the valid JSON object.`,
  
  musicVideoStructure: `Analyze the provided song lyrics for "{songTitle}" by "{artist}" ({genre}). Break the song down into its structural components. Use only the following section types: "intro", "verse", "pre-chorus", "chorus", "post-chorus", "bridge", "instrumental", "solo", "refrain", "outro", "hook", "interlude". If timestamps [MM:SS] are present, use them for timing. If not, generate a logical structure. Identify recurring hooks. Return ONLY the valid JSON object.`,
  
  musicVideoTreatments: `You are creating music video treatments for "{songTitle}" by "{artist}" in the style of a specific director. Generate three distinct and creative treatments that authentically reflect this director's approach.

DIRECTOR STYLE PROFILE:
{directorStyle}

Each treatment should incorporate the director's visual hallmarks, narrative style, pacing preferences, and genre expertise. Consider their typical use of performance vs. narrative, their signature visual techniques, and their approach to music video storytelling.

For each treatment, provide a unique ID, a catchy name, a core concept, a detailed visual theme, an estimated performance-to-narrative ratio, and a strategy for handling the hook/chorus. Return ONLY the valid JSON object.`,
  
  musicVideoBreakdown: `You are creating a detailed shot list for the "{sectionTitle}" section of a music video in a specific director's style.

DIRECTOR STYLE PROFILE:
{directorStyle}

TREATMENT: "{treatmentName}" - {treatmentConcept}
VISUAL STYLE: {treatmentVisuals}

PRODUCTION CONFIGURATION:
LOCATIONS: {locations}
WARDROBE: {wardrobe}
PROPS: {props}

Generate shots that authentically reflect this director's visual hallmarks, narrative approach, and pacing style. Ensure shots reference the configured items using their reference IDs (e.g., @location1, @outfit2, @prop3). The shots should feel like they could only come from this specific director.

Also provide performance notes and key sync points. Return ONLY the valid JSON object.`,
  
  musicVideoSuggestions: `Based on the song "{songTitle}" by {artist}, its lyrics, and the selected treatment "{treatmentName}" ({treatmentConcept}), generate 2-3 creative suggestions each for locations, wardrobe, and props. For each item, provide a unique id (e.g., 'location1'), a reference (e.g., '@location1'), a name, a description, a purpose, and assign it to relevant song sections from this list: {sectionIds}. Return ONLY the valid JSON object.`,
  
  additionalMusicVideoShots: `You are generating additional shots for the "{sectionTitle}" section of a music video in a specific director's style.

DIRECTOR STYLE PROFILE:
{directorStyle}

CUSTOM REQUEST: "{customRequest}"
EXISTING SHOTS: {existingShots}
TREATMENT: {treatmentConcept}

PRODUCTION CONFIGURATION:
LOCATIONS: {locations}
WARDROBE: {wardrobe}
PROPS: {props}

Generate new shots that authentically reflect this director's visual hallmarks and approach while addressing the custom request. The shots should feel distinctly like this director's work and complement the existing coverage.

Ensure new shots reference the configuration items and fit the established visual style. Return ONLY the valid JSON object with a 'newShots' key.`,
  
  directorStyleGeneration: `A user wants to create a custom music video director profile. Their starting point is a director named "{name}" with the following idea: "{description}". Based on this, expand it into a full profile. Define their visual hallmarks, narrative style, pacing & energy, and associated genres. Be creative and specific. Return ONLY the valid JSON object.`,
}

// Make it async to comply with server actions requirement
export async function getDefaultPrompts() {
  return defaultPrompts
}

// Main Actions
export async function generateBreakdown(
  story: string,
  director: string,
  titleCardOptions: { enabled: boolean; format: 'full' | 'name-only' | 'roman-numerals', approaches: string[] },
  customDirectors: any[],
  promptOptions: { includeCameraStyle: boolean, includeColorPalette: boolean }
) {
  // 1. Generate Story Structure
  const { object: storyStructure } = await generateObject({
    model: openai("gpt-4o"),
    schema: StoryStructureSchema,
    prompt: defaultPrompts.structureDetection,
    system: `You are a professional script supervisor and editor. Your task is to analyze a story and break it down into a structured format. The story is: """${story}"""`,
  })

  // 2. Generate Breakdowns for each chapter
  const chapterBreakdowns = await Promise.all(
    storyStructure.chapters.map(async (chapter) => {
      const selectedDirectorInfo = [...customDirectors].find(d => d.id === director)
      const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)

      let prompt = defaultPrompts.chapterBreakdown.replace("{directorStyle}", directorStyle)

      if (!promptOptions.includeCameraStyle) {
        prompt += "\n\nIMPORTANT: Minimize detailed camera movement descriptions in the shots."
      }
      if (!promptOptions.includeColorPalette) {
        prompt += "\n\nIMPORTANT: Minimize detailed color palette and lighting descriptions in the shots."
      }

      const { object: breakdown } = await generateObject({
        model: openai("gpt-4o"),
        schema: ChapterBreakdownSchema,
        prompt: prompt,
        system: `You are a world-class cinematographer and director. Your task is to create a visual breakdown for a chapter of a story. The chapter content is: """${chapter.content}"""`,
      })

      // Generate title cards if enabled
      if (titleCardOptions.enabled) {
        const { object: titleCards } = await generateObject({
          model: openai("gpt-4o"),
          schema: z.object({ titleCards: z.array(TitleCardSchema) }),
          prompt: defaultPrompts.titleCard
            .replace("{count}", "3")
            .replace("{chapterTitle}", chapter.title)
            .replace("{approaches}", titleCardOptions.approaches.join(", ")),
          system: "You are a creative title sequence designer."
        })
        breakdown.titleCards = titleCards.titleCards
      }

      return breakdown
    })
  )

  return {
    storyStructure,
    chapterBreakdowns,
    overallAnalysis: "Initial breakdown complete.",
  }
}

export async function generateAdditionalChapterShots(
  { story, director, storyStructure, chapterId, existingBreakdown, existingAdditionalShots, categories, customRequest }: any,
  customDirectors: any[],
  promptOptions: { includeCameraStyle: boolean, includeColorPalette: boolean }
) {
  const chapter = storyStructure.chapters.find((c: any) => c.id === chapterId)
  if (!chapter) throw new Error("Chapter not found")

  const selectedDirectorInfo = [...customDirectors].find(d => d.id === director)
  const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)

  let prompt = defaultPrompts.additionalShots
    .replace("{shotCount}", "5")
    .replace("{categories}", categories.join(", "))
    .replace("{customRequest}", customRequest)
    .replace("{directorStyle}", directorStyle)

  if (!promptOptions.includeCameraStyle) {
    prompt += "\n\nIMPORTANT: Minimize detailed camera movement descriptions in the shots."
  }
  if (!promptOptions.includeColorPalette) {
    prompt += "\n\nIMPORTANT: Minimize detailed color palette and lighting descriptions in the shots."
  }

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: z.object({
      newShots: z.array(z.string()),
      coverageAnalysis: z.string(),
    }),
    prompt: prompt,
    system: `You are a creative cinematographer tasked with expanding a shot list for a specific chapter. The chapter content is: """${chapter.content}""". The existing shots are: """${[...existingBreakdown.shots, ...existingAdditionalShots].join("\n")}"""`,
  })

  return object
}

export async function generateFullMusicVideoBreakdown(
  lyrics: string,
  songTitle: string = "Untitled Song",
  artist: string = "Unknown Artist",
  genre: string = "Pop",
  config?: MusicVideoConfig,
  selectedMusicVideoDirectorInfo?: any
) {
  // Build comprehensive music video director style string
  const directorStyle = buildMusicDirectorStyle(selectedMusicVideoDirectorInfo)
  const directorName = selectedMusicVideoDirectorInfo?.name || "the selected style"

  // Always generate structure and treatments to have them available in both steps.
  const [structureResult, treatmentsResult] = await Promise.all([
    generateObject({
      model: openai("gpt-4o"),
      schema: MusicVideoStructureSchema,
      prompt: defaultPrompts.musicVideoStructure.replace("{songTitle}", songTitle).replace("{artist}", artist).replace("{genre}", genre),
      system: `You are an expert music producer and analyst. Your task is to analyze song lyrics and determine the song's structure. The lyrics are: """${lyrics}"""`,
    }),
    generateObject({
      model: openai("gpt-4o"),
      schema: z.object({ treatments: z.array(TreatmentSchema) }),
      prompt: defaultPrompts.musicVideoTreatments
        .replace("{songTitle}", songTitle)
        .replace("{artist}", artist)
        .replace("{directorStyle}", directorStyle),
      system: `You are a visionary music video director. The song lyrics are: """${lyrics}"""`,
    })
  ]);

  const musicVideoStructure = structureResult.object;
  const treatments = treatmentsResult.object.treatments;

  // If it's the first run (no config), return early for the config screen.
  if (!config || !config.isConfigured) {
    return {
      musicVideoStructure,
      treatments,
      selectedTreatment: treatments[0],
      isConfigured: false,
    };
  }

  // If it's the second run (config is provided), proceed with the breakdown.
  let selectedTreatment = config.customTreatment || treatments.find(t => t.id === config.selectedTreatmentId);
  if (!selectedTreatment) {
    console.warn("Selected treatment ID from config not found, falling back to the first generated treatment.");
    selectedTreatment = treatments[0];
  }
  if (!selectedTreatment) {
    throw new Error("No treatments available");
  }

  const locationString = config.locations.map((l: any) => `${l.reference}: ${l.name} - ${l.description}`).join("\n");
  const wardrobeString = config.wardrobe.map((w: any) => `${w.reference}: ${w.name} - ${w.description}`).join("\n");
  const propString = config.props.map((p: any) => `${p.reference}: ${p.name} - ${p.description}`).join("\n");

  const sectionBreakdowns = await Promise.all(
    musicVideoStructure.sections.map(async (section) => {
      const { object: breakdown } = await generateObject({
        model: openai("gpt-4o"),
        schema: MusicVideoSectionBreakdownSchema,
        prompt: defaultPrompts.musicVideoBreakdown
          .replace("{sectionTitle}", section.title)
          .replace("{songTitle}", songTitle)
          .replace("{treatmentName}", selectedTreatment.name)
          .replace("{treatmentConcept}", selectedTreatment.concept)
          .replace("{treatmentVisuals}", selectedTreatment.visualTheme)
          .replace("{directorStyle}", directorStyle)
          .replace("{locations}", locationString || "None")
          .replace("{wardrobe}", wardrobeString || "None")
          .replace("{props}", propString || "None"),
        system: `You are a world-class music video director creating a shot list for a song section. The lyrics for this section are: """${section.lyrics}"""`,
      });
      return breakdown;
    })
  );

  return {
    musicVideoStructure,
    treatments,
    selectedTreatment,
    sectionBreakdowns,
    overallAnalysis: "Full music video breakdown complete.",
    isConfigured: true,
  };
}

export async function generateAdditionalMusicVideoShots(
  { lyrics, musicVideoStructure, sectionId, existingBreakdown, existingAdditionalShots, customRequest, config, selectedMusicVideoDirectorInfo }: any
) {
  const section = musicVideoStructure.sections.find((s: any) => s.id === sectionId);
  if (!section) throw new Error("Section not found");

  const directorStyle = buildMusicDirectorStyle(selectedMusicVideoDirectorInfo)

  const { object: treatmentsData } = await generateObject({
    model: openai("gpt-4o"),
    schema: z.object({ treatments: z.array(TreatmentSchema) }),
    prompt: defaultPrompts.musicVideoTreatments
      .replace("{songTitle}", musicVideoStructure.songTitle)
      .replace("{artist}", musicVideoStructure.artist)
      .replace("{directorStyle}", directorStyle),
    system: `You are a visionary music video director. The song lyrics are: """${lyrics}"""`,
  });

  const selectedTreatment = config.customTreatment || treatmentsData.treatments.find(t => t.id === config.selectedTreatmentId);
  if (!selectedTreatment) throw new Error("Selected treatment not found.");

  const locationString = config.locations.map((l: any) => `${l.reference}: ${l.name} - ${l.description}`).join("\n");
  const wardrobeString = config.wardrobe.map((w: any) => `${w.reference}: ${w.name} - ${w.description}`).join("\n");
  const propString = config.props.map((p: any) => `${p.reference}: ${p.name} - ${p.description}`).join("\n");

  const allExistingShots = [...existingBreakdown.shots, ...existingAdditionalShots];

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: z.object({
      newShots: z.array(z.string()),
    }),
    prompt: defaultPrompts.additionalMusicVideoShots
      .replace("{sectionTitle}", section.title)
      .replace("{songTitle}", musicVideoStructure.songTitle)
      .replace("{customRequest}", customRequest)
      .replace("{existingShots}", allExistingShots.join("\n"))
      .replace("{treatmentConcept}", selectedTreatment.concept)
      .replace("{directorStyle}", directorStyle)
      .replace("{locations}", locationString || "None")
      .replace("{wardrobe}", wardrobeString || "None")
      .replace("{props}", propString || "None"),
    system: `You are a creative music video director brainstorming additional shots for a specific section. The lyrics for this section are: """${section.lyrics}"""`,
  });

  return object;
}

export async function generateMusicVideoSuggestions({
  lyrics,
  songTitle,
  artist,
  genre,
  treatment,
  sections,
}: {
  lyrics: string;
  songTitle: string;
  artist: string;
  genre: string;
  treatment: { id: string; name: string; concept: string };
  sections: Array<{ id: string; title: string }>;
}) {
  const sectionInfo = sections.map(s => `${s.id} (${s.title})`).join(", ");

  // Reuse the SuggestionsSchema already declared earlier in this file
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: SuggestionsSchema,
    prompt: defaultPrompts.musicVideoSuggestions
      .replace("{songTitle}", songTitle || "the song")
      .replace("{artist}", artist || "the artist")
      .replace("{treatmentName}", treatment.name)
      .replace("{treatmentConcept}", treatment.concept)
      .replace("{sectionIds}", sectionInfo),
    system: `You are a creative director brainstorming for a music video. The lyrics are: """${lyrics}""". The genre is ${genre}.`,
  });

  // Ensure assignedSections are valid IDs
  const validSectionIds = sections.map(s => s.id);
  object.locations.forEach(item => {
    item.assignedSections = item.assignedSections.filter(id => validSectionIds.includes(id));
  });
  object.wardrobe.forEach(item => {
    item.assignedSections = item.assignedSections.filter(id => validSectionIds.includes(id));
  });
  object.props.forEach(item => {
    item.assignedSections = item.assignedSections.filter(id => validSectionIds.includes(id));
  });

  return object;
}

export async function generateDirectorStyleDetails(name: string, description: string) {
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: DirectorProfileSchema,
    prompt: defaultPrompts.directorStyleGeneration
      .replace("{name}", name)
      .replace("{description}", description),
    system: "You are a knowledgeable film and music video historian with a knack for distilling a director's style into its key components."
  });
  return object;
}
