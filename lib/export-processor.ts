/**
 * Export Processing System
 * Handles bulk shot export with prefix/suffix and variable replacement
 */

export interface ExportConfig {
  prefix: string
  suffix: string
  useArtistDescriptions: boolean
  format: 'text' | 'numbered' | 'json' | 'csv'
  separator: '\n' | '\n\n' | ', '
  includeMetadata: boolean
}

export interface ShotData {
  id: string
  description: string
  chapter?: string
  section?: string
  shotNumber?: number
  metadata?: {
    directorStyle?: string
    timestamp?: string
    sourceType?: 'story' | 'music-video'
  }
}

export interface ExportResult {
  formattedText: string
  totalShots: number
  processingTime: number
  config: ExportConfig
}

/**
 * Process artist name to create a valid tag
 * "Jay-Z" → "jay-z"
 * "Lil Wayne" → "lil_wayne"
 * "21 Savage" → "21_savage"
 */
export function createArtistTag(artistName: string): string {
  if (!artistName) return 'artist'
  
  return artistName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Remove duplicate underscores
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
}

/**
 * Replace variables in shot description
 */
export function replaceVariables(
  description: string,
  variables: {
    artistName?: string
    artistDescription?: string
    artistTag?: string
    director?: string
    chapter?: string
    section?: string
    location?: string
  }
): string {
  let processed = description

  // Replace @artist-desc with full description first (more specific)
  if (variables.artistDescription && processed.includes('@artist-desc')) {
    processed = processed.replace(/@artist-desc/g, variables.artistDescription)
  }

  // Replace @artist with name (after @artist-desc to avoid conflicts)
  if (variables.artistName && processed.includes('@artist')) {
    processed = processed.replace(/@artist/g, variables.artistName)
  }

  // Replace @artist-tag with tag version
  if (variables.artistTag && processed.includes('@artist-tag')) {
    processed = processed.replace(/@artist-tag/g, variables.artistTag)
  }

  // Replace other variables
  if (variables.director && processed.includes('@director')) {
    processed = processed.replace(/@director/g, variables.director)
  }

  if (variables.chapter && processed.includes('@chapter')) {
    processed = processed.replace(/@chapter/g, variables.chapter)
  }

  if (variables.section && processed.includes('@section')) {
    processed = processed.replace(/@section/g, variables.section)
  }

  if (variables.location && processed.includes('@location')) {
    processed = processed.replace(/@location/g, variables.location)
  }

  return processed
}

/**
 * Apply prefix and suffix to a shot description
 */
export function applyPrefixSuffix(
  description: string,
  prefix: string,
  suffix: string
): string {
  const trimmedPrefix = prefix.trim()
  const trimmedSuffix = suffix.trim()
  
  let result = description
  
  if (trimmedPrefix) {
    result = `${trimmedPrefix}${trimmedPrefix.endsWith(' ') ? '' : ' '}${result}`
  }
  
  if (trimmedSuffix) {
    result = `${result}${trimmedSuffix.startsWith(' ') ? '' : ' '}${trimmedSuffix}`
  }
  
  return result
}

/**
 * Format shots according to export configuration
 */
export function formatShots(
  shots: ShotData[],
  config: ExportConfig,
  variables: {
    artistName?: string
    artistDescription?: string
    artistTag?: string
    director?: string
  }
): string {
  const processedShots = shots.map((shot, index) => {
    // Replace variables in description
    const processedDescription = replaceVariables(shot.description, {
      ...variables,
      chapter: shot.chapter,
      section: shot.section
    })

    // Apply prefix/suffix
    const finalDescription = applyPrefixSuffix(
      processedDescription,
      config.prefix,
      config.suffix
    )

    // Format according to chosen format
    switch (config.format) {
      case 'numbered':
        return `${index + 1}. ${finalDescription}`
      
      case 'json':
        return {
          id: shot.id,
          shotNumber: index + 1,
          description: finalDescription,
          chapter: shot.chapter,
          section: shot.section,
          metadata: config.includeMetadata ? shot.metadata : undefined
        }
      
      case 'csv':
        return [
          index + 1,
          finalDescription.replace(/"/g, '""'), // Escape quotes for CSV
          shot.chapter || '',
          shot.section || '',
          shot.metadata?.directorStyle || ''
        ].join('","')
      
      case 'text':
      default:
        return finalDescription
    }
  })

  // Join shots according to format
  switch (config.format) {
    case 'json':
      return JSON.stringify({
        shots: processedShots,
        totalShots: shots.length,
        exportConfig: config,
        exportedAt: new Date().toISOString()
      }, null, 2)
    
    case 'csv':
      const headers = '"Shot Number","Description","Chapter","Section","Director Style"'
      const csvRows = processedShots.map(row => `"${row}"`).join('\n')
      return `${headers}\n${csvRows}`
    
    case 'text':
    case 'numbered':
    default:
      return processedShots.join(config.separator)
  }
}

/**
 * Main export processing function
 */
export function processShotsForExport(
  shots: ShotData[],
  config: ExportConfig,
  variables: {
    artistName?: string
    artistDescription?: string
    director?: string
  }
): ExportResult {
  const startTime = Date.now()
  
  // Create artist tag if artist name is provided
  const artistTag = variables.artistName ? createArtistTag(variables.artistName) : undefined
  
  // Process the shots
  const formattedText = formatShots(shots, config, {
    ...variables,
    artistTag
  })
  
  const endTime = Date.now()
  
  return {
    formattedText,
    totalShots: shots.length,
    processingTime: endTime - startTime,
    config
  }
}

/**
 * Copy text to clipboard with fallback support
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      return true
    } finally {
      document.body.removeChild(textArea)
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Download text as file
 */
export function downloadAsFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the URL object
  URL.revokeObjectURL(url)
}

/**
 * Get suggested filename based on export config and date
 */
export function getSuggestedFilename(
  config: ExportConfig,
  projectType: 'story' | 'music-video',
  artistName?: string
): string {
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
  
  const baseName = artistName 
    ? `${projectType}-${createArtistTag(artistName)}-shots`
    : `${projectType}-shots`
  
  const extension = config.format === 'json' ? 'json' : 
                   config.format === 'csv' ? 'csv' : 'txt'
  
  return `${baseName}-${date}-${time}.${extension}`
}