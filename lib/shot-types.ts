/**
 * Shot type definitions and templates for enhanced shot generation
 */

export interface ShotTemplate {
  type: string
  description: string
  template: string
  variants: string[]
}

export const SHOT_TYPES = {
  OTS: {
    type: "Over-the-shoulder",
    description: "View from behind one character looking at another",
    template: "Over-the-shoulder view from behind {character1} ({character1_appearance}), looking at {character2} ({character2_appearance}) at {location}, {character1}'s shoulder prominently in frame, {character2_action}, {atmosphere}",
    variants: [
      "close OTS - tighter framing on foreground shoulder",
      "wide OTS - more environment visible",
      "dirty OTS - foreground character slightly out of focus",
      "clean OTS - foreground character sharp"
    ]
  },
  REVERSE_OTS: {
    type: "Reverse over-the-shoulder",
    description: "Matching OTS from opposite angle",
    template: "Reverse over-the-shoulder from behind {character2} ({character2_appearance}), looking back at {character1} ({character1_appearance}), matching eyeline, {character1_reaction}, maintaining 180-degree rule",
    variants: []
  },
  TWO_SHOT: {
    type: "Two-shot",
    description: "Both characters in frame",
    template: "Two-shot of {character1} and {character2} at {location}, {spatial_relationship}, {emotional_dynamic}, {framing_style}",
    variants: [
      "profile two-shot - both in profile",
      "50/50 two-shot - equal framing",
      "foreground/background two-shot - depth separation"
    ]
  },
  CLOSE_UP: {
    type: "Close-up",
    description: "Tight shot on face/detail",
    template: "Close-up on {subject}, {emotion/detail}, {lighting_style}, filling frame, {specific_focus}",
    variants: [
      "extreme close-up - eyes only",
      "medium close-up - head and shoulders",
      "insert close-up - specific detail/object"
    ]
  },
  ESTABLISHING: {
    type: "Establishing shot",
    description: "Wide shot setting location/context",
    template: "Wide establishing shot of {location}, {time_of_day}, {atmosphere}, showing {spatial_context}, {mood_setting}",
    variants: [
      "aerial establishing",
      "ground-level establishing",
      "time-lapse establishing"
    ]
  },
  POV: {
    type: "Point of view",
    description: "Character's perspective",
    template: "POV shot from {character}'s perspective, looking at {subject}, {movement_style}, {subjective_elements}, {emotional_filter}",
    variants: [
      "handheld POV - shaky, realistic",
      "smooth POV - stabilized movement",
      "distorted POV - emotional/physical state"
    ]
  },
  REACTION: {
    type: "Reaction shot",
    description: "Character's response to action",
    template: "Reaction shot of {character}, {emotion}, responding to {event}, {framing}, {timing}",
    variants: []
  },
  INSERT: {
    type: "Insert shot",
    description: "Detail shot for emphasis",
    template: "Insert shot of {object/detail}, {significance}, {framing}, drawing attention to {narrative_purpose}",
    variants: []
  },
  MASTER: {
    type: "Master shot",
    description: "Wide shot covering entire scene",
    template: "Master shot of {location}, all characters visible, {blocking}, establishing geography and spatial relationships, {camera_position}",
    variants: []
  }
}

export interface DialogueSequence {
  shots: string[]
  pattern: "standard" | "intense" | "group" | "walk-and-talk"
}

export function generateDialogueSequence(
  character1: { name: string, appearance: string, tag: string },
  character2: { name: string, appearance: string, tag: string },
  location: string,
  mood: string = "neutral",
  pattern: "standard" | "intense" | "group" | "walk-and-talk" = "standard"
): DialogueSequence {
  const shots: string[] = []
  
  switch (pattern) {
    case "standard":
      // Classic dialogue coverage
      shots.push(
        `Medium two-shot establishing ${character1.tag} and ${character2.tag} at ${location}, ${mood} atmosphere`,
        `Over-the-shoulder view from behind ${character1.name} (${character1.appearance}), looking at ${character2.name} (${character2.appearance}), ${character1.name}'s shoulder in soft focus foreground, ${character2.name} speaking with engaged expression`,
        `Reverse over-the-shoulder from behind ${character2.name}, looking back at ${character1.name}, matching eyeline, ${character1.name} listening intently`,
        `Close-up on ${character1.name}, reaction to dialogue, subtle emotion visible`,
        `Close-up on ${character2.name}, delivering key line, emphasis on expression`,
        `Return to medium two-shot for resolution of exchange`
      )
      break
      
    case "intense":
      // Tighter, more dramatic coverage
      shots.push(
        `Tight two-shot, ${character1.tag} and ${character2.tag} in confrontation at ${location}`,
        `Extreme close-up on ${character1.name}'s eyes, tension building`,
        `Extreme close-up on ${character2.name}'s eyes, matching intensity`,
        `Tight OTS from ${character1.name}, ${character2.name} slightly out of focus, heated exchange`,
        `Tight reverse OTS from ${character2.name}, ${character1.name} blurred but present`,
        `Pull back to medium shot revealing body language and spatial tension`
      )
      break
      
    case "walk-and-talk":
      // Moving dialogue sequence
      shots.push(
        `Tracking shot following ${character1.tag} and ${character2.tag} walking through ${location}`,
        `Steadicam alongside the pair, maintaining two-shot as they move`,
        `Front-facing tracking shot, both characters walking toward camera in conversation`,
        `Side angle traveling with them, environment passing in background`,
        `Brief OTS while walking, ${character1.name} making a point`,
        `Reverse OTS while walking, ${character2.name} responding`,
        `Wide shot as they continue, showing full environment context`
      )
      break
      
    case "group":
      // Multiple character dialogue
      shots.push(
        `Wide master shot establishing all characters at ${location}`,
        `Over ${character1.name}'s shoulder toward ${character2.name} and others`,
        `Reverse angle favoring ${character2.name}'s perspective of the group`,
        `Roving close-ups as different characters speak`,
        `Two-shot isolating ${character1.tag} and ${character2.tag} for key exchange`,
        `Return to wide for group dynamics`
      )
      break
  }
  
  return { shots, pattern }
}

export function enhanceShotDescription(
  basicShot: string,
  entities: { characters: any[], locations: any[], props: any[] }
): string {
  let enhanced = basicShot
  
  // Detect if it's a dialogue scene
  if (basicShot.toLowerCase().includes("talking") || 
      basicShot.toLowerCase().includes("conversation") ||
      basicShot.toLowerCase().includes("discussing")) {
    
    // Extract character references
    const characterRefs = entities.characters
      .filter(c => basicShot.includes(c.referenceTag) || basicShot.includes(c.name))
      .slice(0, 2) // Get first two characters for dialogue
    
    if (characterRefs.length >= 2) {
      const location = entities.locations[0]?.name || "the location"
      
      // Add OTS shot suggestions
      const otsNote = `\n[Coverage note: For dialogue, consider OTS sequence - ` +
        `1) OTS from ${characterRefs[0].referenceTag} to ${characterRefs[1].referenceTag}, ` +
        `2) Reverse OTS from ${characterRefs[1].referenceTag} to ${characterRefs[0].referenceTag}, ` +
        `3) Close-ups for emotional beats]`
      
      enhanced += otsNote
    }
  }
  
  // Detect action sequences
  if (basicShot.toLowerCase().includes("fight") || 
      basicShot.toLowerCase().includes("chase") ||
      basicShot.toLowerCase().includes("action")) {
    enhanced += "\n[Coverage note: For action, mix wide shots for geography with close-ups for impact]"
  }
  
  // Detect emotional moments
  if (basicShot.toLowerCase().includes("cry") || 
      basicShot.toLowerCase().includes("emotional") ||
      basicShot.toLowerCase().includes("reveal")) {
    enhanced += "\n[Coverage note: For emotional moments, hold on close-ups longer, consider reaction shots]"
  }
  
  return enhanced
}

export function generateShotVariations(
  baseShot: string,
  shotType: keyof typeof SHOT_TYPES
): string[] {
  const template = SHOT_TYPES[shotType]
  if (!template) return [baseShot]
  
  const variations: string[] = [baseShot]
  
  // Generate variations based on the template
  template.variants.forEach(variant => {
    variations.push(`${baseShot} [Variant: ${variant}]`)
  })
  
  return variations
}