import { assertAIEnv, getAIConfig, ServiceError } from './base'
import { generateObject } from 'ai'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import type { Character, Location, Prop, ExtractedEntities } from '@/components/story/story-entities-config'

interface EntityExtractionRequest {
  story: string
}

// Zod schemas for validation
const EntityExtractionResponseSchema = z.object({
  characters: z.array(z.object({
    name: z.string(),
    description: z.string(),
    appearance: z.string().optional(),
    role: z.enum(['protagonist', 'antagonist', 'supporting', 'background'])
  })),
  locations: z.array(z.object({
    name: z.string(),
    description: z.string(),
    atmosphere: z.string().optional(),
    type: z.enum(['interior', 'exterior', 'mixed'])
  })),
  props: z.array(z.object({
    name: z.string(),
    description: z.string(),
    significance: z.string().optional(),
    type: z.enum(['object', 'vehicle', 'weapon', 'tool', 'symbolic'])
  })),
  entityReferences: z.object({
    characters: z.array(z.string()),
    locations: z.array(z.string()),
    props: z.array(z.string())
  })
})

export class StoryEntityService {
  /**
   * Extract characters, locations, and props from a story
   */
  static async extractEntities(request: EntityExtractionRequest): Promise<ExtractedEntities> {
    assertAIEnv()
    const config = getAIConfig()
    
    const extractionPrompt = `Analyze the following story and extract all characters, locations, and significant props/objects.

For each entity provide:
- Characters: name, description, physical appearance if mentioned, role in story
- Locations: name, description, atmosphere/mood, whether interior/exterior/mixed
- Props: name, description, story significance, object type

Story to analyze:
${request.story}`

    try {
      const result = await generateObject({
        model: config.model,
        system: 'You are an expert story analyst. Extract all characters, locations, and props from stories. Be thorough but concise.',
        prompt: extractionPrompt,
        schema: EntityExtractionResponseSchema,
        temperature: 0.3
      })
      
      return {
        suggestedCharacters: result.object.characters.map(char => ({
          name: char.name,
          description: char.description,
          appearance: char.appearance,
          role: char.role
        })),
        suggestedLocations: result.object.locations.map(loc => ({
          name: loc.name,
          description: loc.description,
          atmosphere: loc.atmosphere,
          type: loc.type
        })),
        suggestedProps: result.object.props.map(prop => ({
          name: prop.name,
          description: prop.description,
          significance: prop.significance,
          type: prop.type
        })),
        entityReferences: result.object.entityReferences
      }

    } catch (error: any) {
      throw new ServiceError(`Entity extraction failed: ${error.message}`)
    }
  }

  /**
   * Generate story breakdown with entity context
   */
  static async generateBreakdownWithEntities(
    story: string,
    entities: {
      characters: Character[]
      locations: Location[]
      props: Prop[]
    },
    selectedDirector: string,
    allDirectors: any[],
    titleCardOptions: any,
    promptOptions: any,
    storyDirectorNotes: string
  ) {

    // Build entity context
    const entityContext = `
STORY ENTITIES CONTEXT:

CHARACTERS:
${entities.characters.map(char => 
  `- ${char.name} (${char.referenceTag}): ${char.description}${char.appearance ? ` | Appearance: ${char.appearance}` : ''} | Role: ${char.role}`
).join('\n')}

LOCATIONS:
${entities.locations.map(loc => 
  `- ${loc.name} (${loc.referenceTag}): ${loc.description}${loc.atmosphere ? ` | Atmosphere: ${loc.atmosphere}` : ''} | Type: ${loc.type}`
).join('\n')}

PROPS:
${entities.props.map(prop => 
  `- ${prop.name} (${prop.referenceTag}): ${prop.description}${prop.significance ? ` | Significance: ${prop.significance}` : ''} | Type: ${prop.type}`
).join('\n')}

REFERENCE TAGS:
When generating shots, you can reference these entities using their tags:
Characters: ${entities.characters.map(c => c.referenceTag).join(', ')}
Locations: ${entities.locations.map(l => l.referenceTag).join(', ')}  
Props: ${entities.props.map(p => p.referenceTag).join(', ')}

Use these reference tags in shot descriptions for consistency and to enable character/location/prop selection in additional shot generation.
`

    // Use the existing story service but with enhanced context
    const { StoryService } = await import('./story-service')
    
    // Get the director info
    const directorInfo = allDirectors.find(d => d.id === selectedDirector)
    
    // Call the existing breakdown generation with enhanced prompt
    const enhancedPrompt = `${entityContext}\n\nORIGINAL STORY:\n${story}`
    
    return await StoryService.generateBreakdown(
      enhancedPrompt,
      directorInfo,
      titleCardOptions,
      promptOptions,
      storyDirectorNotes
    )
  }
}