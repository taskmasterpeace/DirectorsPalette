// Centralized prompt templates
// These are placeholder structures - the actual prompts are in lib/prompts-mv.ts
// This file is for organization and future consolidation

export const STORY_PROMPTS = {
  STRUCTURE_ANALYSIS: 'story_structure_analysis',
  CHAPTER_BREAKDOWN: 'chapter_breakdown',
  SHOT_GENERATION: 'shot_generation',
  ADDITIONAL_SHOTS: 'additional_shots',
  ENTITY_EXTRACTION: 'entity_extraction',
  DIRECTOR_QUESTIONS: 'director_questions'
}

export const MUSIC_VIDEO_PROMPTS = {
  TREATMENT_GENERATION: 'treatment_generation',
  REFERENCE_EXTRACTION: 'reference_extraction',
  BREAKDOWN_GENERATION: 'breakdown_generation',
  ADDITIONAL_SHOTS: 'additional_shots',
  WARDROBE_GENERATION: 'wardrobe_generation',
  LOCATION_GENERATION: 'location_generation'
}

export const DIRECTOR_PROMPTS = {
  STYLE_GENERATION: 'style_generation',
  QUESTION_GENERATION: 'question_generation',
  STYLE_APPLICATION: 'style_application'
}

export const ARTIST_PROMPTS = {
  PROFILE_GENERATION: 'profile_generation',
  VISUAL_STYLE_GENERATION: 'visual_style_generation'
}

// Prompt configuration
export const PROMPT_CONFIG = {
  includeDirectorStyle: true,
  includeReferences: true,
  includeEntities: true,
  includeExamples: false,
  verbosity: 'normal' // 'minimal' | 'normal' | 'detailed'
}