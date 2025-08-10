/**
 * Enhanced shot composition with detailed artist actions and smart entity references
 */

export interface EntityDescription {
  id: string
  name: string
  type: 'location' | 'prop' | 'artist_version'
  description: string
  details: {
    [key: string]: any
  }
  referenceTag: string
}

export interface DetailedShot {
  id: string
  timestamp: string
  lyricLine: string
  composition: {
    shotType: string
    cameraMovement: string
    artistAction: string
    artistPosition: string
    entityReferences: string[]
    lighting: string
    visualEffects?: string
  }
  shotDescription: string
  performanceType: 'performance' | 'narrative' | 'hybrid'
}

/**
 * Generate detailed artist actions based on song context and entity setup
 */
export function generateDetailedArtistAction(
  lyricLine: string,
  artistVersion: EntityDescription,
  location: EntityDescription,
  shotType: string,
  performanceRatio: number
): string {
  const isPerformance = performanceRatio > 60
  const lyricMood = analyzeLyricMood(lyricLine)
  
  // Base actions by shot type
  const actionTemplates = {
    'wide-shot': {
      performance: [
        'standing center stage, full body visible, commanding presence',
        'walking across the performance area, engaging with space',
        'positioned at microphone stand, owning the entire frame'
      ],
      narrative: [
        'standing in doorway, contemplating the scene ahead',
        'walking through the space, taking in surroundings',
        'positioned against wall, observing environment'
      ]
    },
    'medium-shot': {
      performance: [
        'gripping microphone, upper body swaying with rhythm',
        'gesturing expressively while delivering lyrics',
        'moving hands in sync with beat, focused on delivery'
      ],
      narrative: [
        'sitting on edge of chair, leaning forward pensively',
        'standing with arms crossed, processing emotions',
        'leaning against surface, lost in thought'
      ]
    },
    'close-up': {
      performance: [
        'lips moving in perfect sync, eyes closed in concentration',
        'intense eye contact with camera, delivering key line',
        'head tilted back slightly, passionate vocal delivery'
      ],
      narrative: [
        'eyes reflecting internal struggle, subtle emotion',
        'slight smile crossing face, remembering moment',
        'furrowed brow, working through complex feelings'
      ]
    },
    'over-the-shoulder': {
      performance: [
        'shoulder in foreground, looking toward audience/camera',
        'back to camera, performing for crowd ahead',
        'profile visible over shoulder, engaged with scene'
      ],
      narrative: [
        'shoulder in frame, looking at significant object/person',
        'back partially turned, observing situation unfold',
        'side profile over shoulder, contemplating decision'
      ]
    }
  }

  // Mood-based modifications
  const moodAdjustments = {
    'emotional': {
      performance: ' with heightened emotion',
      narrative: ', vulnerability showing in posture'
    },
    'energetic': {
      performance: ' with dynamic energy',
      narrative: ', restless movement and intensity'
    },
    'contemplative': {
      performance: ' with thoughtful restraint',
      narrative: ', stillness conveying deep thought'
    },
    'aggressive': {
      performance: ' with fierce intensity',
      narrative: ', tension visible in body language'
    }
  }

  const baseActions = actionTemplates[shotType as keyof typeof actionTemplates] || actionTemplates['medium-shot']
  const actionList = isPerformance ? baseActions.performance : baseActions.narrative
  const selectedAction = actionList[Math.floor(Math.random() * actionList.length)]
  const moodModifier = moodAdjustments[lyricMood]?.[isPerformance ? 'performance' : 'narrative'] || ''

  return selectedAction + moodModifier
}

/**
 * Create smart entity references that use described details appropriately
 */
export function createSmartEntityReference(
  entity: EntityDescription,
  context: 'establishing' | 'reference' | 'detail'
): string {
  switch (context) {
    case 'establishing':
      // First mention - include key details
      return `${entity.referenceTag} (${entity.description})`
    
    case 'reference':
      // Subsequent mentions - just the tag since details are established
      return entity.referenceTag
    
    case 'detail':
      // When focusing on specific aspect
      const detailKeys = Object.keys(entity.details)
      if (detailKeys.length > 0) {
        const randomDetail = entity.details[detailKeys[0]]
        return `${entity.referenceTag} - ${randomDetail}`
      }
      return entity.referenceTag
  }
}

/**
 * Analyze lyric line for mood and energy
 */
function analyzeLyricMood(lyricLine: string): 'emotional' | 'energetic' | 'contemplative' | 'aggressive' | 'neutral' {
  const line = lyricLine.toLowerCase()
  
  if (line.includes('love') || line.includes('heart') || line.includes('feel')) {
    return 'emotional'
  }
  if (line.includes('party') || line.includes('dance') || line.includes('go')) {
    return 'energetic'  
  }
  if (line.includes('remember') || line.includes('think') || line.includes('wonder')) {
    return 'contemplative'
  }
  if (line.includes('fight') || line.includes('angry') || line.includes('hate')) {
    return 'aggressive'
  }
  
  return 'neutral'
}

/**
 * Generate comprehensive shot with all details
 */
export function generateDetailedShot(
  lyricLine: string,
  timestamp: string,
  entities: {
    artistVersions: EntityDescription[]
    locations: EntityDescription[]
    props: EntityDescription[]
  },
  performanceRatio: number,
  visualEffects?: {
    lighting: string
    atmosphere: string
    effects?: string[]
  }
): DetailedShot {
  const shotId = `shot_${Math.random().toString(36).slice(2, 8)}`
  const isPerformance = Math.random() * 100 < performanceRatio
  
  // Select appropriate entities
  const artistVersion = entities.artistVersions[0] // For now, use first version
  const location = entities.locations[0] // For now, use first location
  const relevantProps = entities.props.slice(0, 2) // Use up to 2 props
  
  // Determine shot type based on performance ratio and lyric mood
  const shotTypes = isPerformance 
    ? ['wide-shot', 'medium-shot', 'close-up', 'performance-angle']
    : ['medium-shot', 'close-up', 'over-the-shoulder', 'detail-shot']
  const shotType = shotTypes[Math.floor(Math.random() * shotTypes.length)]
  
  // Generate detailed artist action
  const artistAction = generateDetailedArtistAction(
    lyricLine, 
    artistVersion, 
    location, 
    shotType, 
    performanceRatio
  )
  
  // Create entity references (smart about which context to use)
  const locationRef = createSmartEntityReference(location, 'reference')
  const artistRef = createSmartEntityReference(artistVersion, 'reference')
  const propRefs = relevantProps.map(prop => createSmartEntityReference(prop, 'reference'))
  
  // Build comprehensive shot description
  const shotDescription = [
    shotType.replace('-', ' '),
    'of',
    artistRef,
    artistAction,
    'at',
    locationRef,
    propRefs.length > 0 ? `with ${propRefs.join(' and ')} visible` : '',
    visualEffects?.lighting ? `, ${visualEffects.lighting} lighting` : '',
    visualEffects?.atmosphere ? `, ${visualEffects.atmosphere} atmosphere` : '',
    visualEffects?.effects?.length ? `, ${visualEffects.effects.join(' and ')} effects` : ''
  ].filter(Boolean).join(' ')
  
  return {
    id: shotId,
    timestamp,
    lyricLine,
    composition: {
      shotType,
      cameraMovement: generateCameraMovement(shotType, isPerformance),
      artistAction,
      artistPosition: generateArtistPosition(location, artistAction),
      entityReferences: [artistRef, locationRef, ...propRefs],
      lighting: visualEffects?.lighting || 'natural lighting',
      visualEffects: visualEffects?.effects?.join(', ')
    },
    shotDescription,
    performanceType: isPerformance ? 'performance' : 'narrative'
  }
}

function generateCameraMovement(shotType: string, isPerformance: boolean): string {
  const performanceMovements = [
    'smooth tracking following artist',
    'steady handheld with subtle movement', 
    'locked off on tripod',
    'slow push in during key moment',
    'gentle sway matching rhythm'
  ]
  
  const narrativeMovements = [
    'static composition',
    'slow dolly in for intimacy',
    'handheld for realism',
    'smooth gimbal movement',
    'locked off for stability'
  ]
  
  const movements = isPerformance ? performanceMovements : narrativeMovements
  return movements[Math.floor(Math.random() * movements.length)]
}

function generateArtistPosition(location: EntityDescription, action: string): string {
  // Extract position from action or generate based on location
  if (action.includes('center')) return 'center frame'
  if (action.includes('doorway')) return 'threshold position'
  if (action.includes('sitting')) return 'seated position'
  if (action.includes('standing')) return 'standing position'
  if (action.includes('leaning')) return 'leaning against surface'
  
  return 'positioned naturally in space'
}