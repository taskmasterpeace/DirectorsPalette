/**
 * Advanced Multi-Syllable Rhyme Detection
 * Analyzes the last 2-3 syllables of lines for complex rhyme patterns
 */

/**
 * Extract the last N syllables from a line as a phonetic pattern
 */
export function extractEndingSyllables(line: string, syllableCount: number = 3): {
  syllables: string[]
  phonetic: string
  raw: string
} {
  // Clean the line and get words
  const cleaned = line.toLowerCase().replace(/[^\w\s'-]/g, '')
  const words = cleaned.split(/\s+/).filter(w => w.length > 0)
  
  if (words.length === 0) {
    return { syllables: [], phonetic: '', raw: '' }
  }
  
  // Work backwards through words to collect syllables
  const allSyllables: string[] = []
  
  // Process words from end to beginning
  for (let i = words.length - 1; i >= 0 && allSyllables.length < syllableCount; i--) {
    const word = words[i]
    const wordSyllables = breakWordIntoSyllables(word)
    
    // Add syllables in reverse (we're working backwards)
    for (let j = wordSyllables.length - 1; j >= 0 && allSyllables.length < syllableCount; j--) {
      allSyllables.unshift(wordSyllables[j])
    }
  }
  
  // Get the raw ending for comparison
  const rawEnding = words.slice(-(Math.ceil(syllableCount / 1.5))).join('')
  
  // Convert to phonetic representation
  const phonetic = syllablesToPhonetic(allSyllables)
  
  return {
    syllables: allSyllables,
    phonetic,
    raw: rawEnding
  }
}

/**
 * Break a word into syllables with better accuracy
 */
function breakWordIntoSyllables(word: string): string[] {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!cleaned) return []
  
  // Special cases for common words
  const specialCases: Record<string, string[]> = {
    // Single syllable that might be confused
    'the': ['the'], 'and': ['and'], 'of': ['of'], 'to': ['to'], 'a': ['a'],
    'in': ['in'], 'is': ['is'], 'it': ['it'], 'that': ['that'], 'for': ['for'],
    'with': ['with'], 'as': ['as'], 'was': ['was'], 'on': ['on'], 'are': ['are'],
    'be': ['be'], 'have': ['have'], 'from': ['from'], 'or': ['or'], 'had': ['had'],
    'by': ['by'], 'but': ['but'], 'what': ['what'], 'all': ['all'], 'when': ['when'],
    'we': ['we'], 'there': ['there'], 'can': ['can'], 'an': ['an'], 'your': ['your'],
    'which': ['which'], 'their': ['their'], 'said': ['said'], 'if': ['if'],
    'will': ['will'], 'way': ['way'], 'about': ['a', 'bout'], 'many': ['man', 'y'],
    'then': ['then'], 'them': ['them'], 'would': ['would'], 'like': ['like'],
    'so': ['so'], 'these': ['these'], 'her': ['her'], 'long': ['long'],
    'make': ['make'], 'him': ['him'], 'has': ['has'], 'two': ['two'], 'how': ['how'],
    'its': ['its'], 'our': ['our'], 'out': ['out'], 'up': ['up'], 'first': ['first'],
    'been': ['been'], 'now': ['now'], 'my': ['my'], 'made': ['made'], 'find': ['find'],
    
    // Multi-syllable words common in hip-hop
    'heartless': ['heart', 'less'],
    'darkness': ['dark', 'ness'],
    'arches': ['ar', 'ches'],
    'charges': ['char', 'ges'],
    'office': ['of', 'fice'],
    'cartridge': ['car', 'tridge'],
    'accomplished': ['ac', 'com', 'plished'],
    'cautious': ['cau', 'tious'],
    'meticulous': ['me', 'tic', 'u', 'lous'],
    'creature': ['crea', 'ture'],
    'features': ['fea', 'tures'],
    'pollution': ['pol', 'lu', 'tion'],
    'victim': ['vic', 'tim'],
    'system': ['sys', 'tem'],
    'vision': ['vi', 'sion'],
    'thesis': ['the', 'sis'],
    'jesus': ['je', 'sus'],
    'photoshop': ['pho', 'to', 'shop'],
    'golden': ['gol', 'den'],
    'oval': ['o', 'val'],
    'carcass': ['car', 'cass'],
    'carpet': ['car', 'pet'],
    'rotten': ['rot', 'ten'],
    'corner': ['cor', 'ner'],
    'million': ['mil', 'lion'],
    'pieces': ['pie', 'ces'],
    'brilliant': ['bril', 'liant'],
    'sicilian': ['si', 'cil', 'ian'],
    'gangsters': ['gang', 'sters'],
    'sixteen': ['six', 'teen'],
    'bleachers': ['blea', 'chers'],
    'jordan': ['jor', 'dan'],
    'greatest': ['grea', 'test'],
    'larkin': ['lar', 'kin'],
    'pippen': ['pip', 'pen'],
    'sickenin': ['sick', 'en', 'in'],
  }
  
  if (specialCases[cleaned]) {
    return specialCases[cleaned]
  }
  
  // General syllable breaking algorithm
  const syllables: string[] = []
  const vowels = 'aeiouy'
  let current = ''
  let vowelCount = 0
  
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]
    const isVowel = vowels.includes(char)
    const nextChar = cleaned[i + 1] || ''
    const prevChar = cleaned[i - 1] || ''
    
    current += char
    
    if (isVowel) {
      vowelCount++
      
      // Check for diphthongs (two vowels that make one sound)
      const diphthongs = ['ai', 'au', 'aw', 'ay', 'ea', 'ee', 'ei', 'ey', 'oa', 'oe', 'oi', 'oo', 'ou', 'ow', 'oy']
      const pair = char + nextChar
      
      if (diphthongs.includes(pair)) {
        current += nextChar
        i++ // Skip next char
      }
      
      // Check if we should break here
      if (nextChar && !vowels.includes(nextChar)) {
        // Look ahead to see if we should break
        const afterNext = cleaned[i + 2] || ''
        
        // Break if next is consonant + vowel (new syllable starting)
        if (afterNext && vowels.includes(afterNext)) {
          // But keep consonant clusters together
          const consonantClusters = ['bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sc', 'sh', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'th', 'tr', 'tw', 'wh', 'wr']
          const cluster = nextChar + afterNext
          
          if (!consonantClusters.includes(cluster.slice(0, 2))) {
            syllables.push(current)
            current = ''
            vowelCount = 0
          }
        }
      }
    }
  }
  
  // Add remaining
  if (current) {
    // Handle silent 'e' at end
    if (current.endsWith('e') && syllables.length > 0 && current.length > 1) {
      // Add to previous syllable instead
      syllables[syllables.length - 1] += current
    } else {
      syllables.push(current)
    }
  }
  
  // Ensure at least one syllable
  if (syllables.length === 0) {
    syllables.push(cleaned)
  }
  
  return syllables
}

/**
 * Convert syllables to phonetic representation
 */
function syllablesToPhonetic(syllables: string[]): string {
  if (syllables.length === 0) return ''
  
  // Phonetic mappings for common endings
  const phoneticMap: Record<string, string> = {
    // -ess sounds
    'less': 'ləs', 'ness': 'nəs', 'ess': 'əs', 'ous': 'əs',
    
    // -ar sounds  
    'ar': 'ɑr', 'arches': 'ɑrtʃəz', 'arges': 'ɑrdʒəz', 'arge': 'ɑrdʒ',
    'arch': 'ɑrtʃ', 'arden': 'ɑrdən', 'arpet': 'ɑrpət', 'arted': 'ɑrtəd',
    
    // -ice/-ish sounds
    'ice': 'ɪs', 'fice': 'fɪs', 'ish': 'ɪʃ', 'ished': 'ɪʃt', 'ious': 'ɪəs',
    
    // -idge sounds
    'idge': 'ɪdʒ', 'tridge': 'trɪdʒ', 'age': 'ɪdʒ',
    
    // -tion sounds
    'tion': 'ʃən', 'sion': 'ʃən', 'ution': 'uʃən',
    
    // -ture sounds
    'ture': 'tʃər', 'cher': 'tʃər', 'tures': 'tʃərz',
    
    // -im/-em sounds
    'im': 'ɪm', 'tim': 'tɪm', 'tem': 'təm', 'em': 'əm',
    
    // -en/-in sounds
    'en': 'ən', 'in': 'ɪn', 'pen': 'pən', 'tion': 'ʃən',
    
    // -ine/-ime sounds
    'ine': 'aɪn', 'ime': 'aɪm', 'yme': 'aɪm', 'ine': 'aɪn',
    
    // -ind sounds
    'ind': 'aɪnd', 'ined': 'aɪnd', 'inned': 'ɪnd',
  }
  
  // Join syllables and check for matches
  const joined = syllables.join('')
  
  // Check if entire ending matches a pattern
  for (const [pattern, phonetic] of Object.entries(phoneticMap)) {
    if (joined.endsWith(pattern)) {
      return phonetic
    }
  }
  
  // Otherwise, create phonetic from individual syllables
  return syllables.map(syl => {
    // Check if syllable matches a pattern
    for (const [pattern, phonetic] of Object.entries(phoneticMap)) {
      if (syl === pattern || syl.endsWith(pattern)) {
        return phonetic
      }
    }
    
    // Default: keep original
    return syl
  }).join('')
}

/**
 * Comprehensive rhyme check for multi-syllable patterns
 */
export function checkMultiSyllableRhyme(line1: string, line2: string): {
  rhymes: boolean
  strength: 'perfect' | 'strong' | 'moderate' | 'weak' | 'none'
  pattern?: string
  syllableMatch?: number
} {
  // Extract last 3 syllables from each line
  const ending1 = extractEndingSyllables(line1, 3)
  const ending2 = extractEndingSyllables(line2, 3)
  
  if (ending1.syllables.length === 0 || ending2.syllables.length === 0) {
    return { rhymes: false, strength: 'none' }
  }
  
  // Check how many syllables match from the end
  let matchingSyllables = 0
  const minLength = Math.min(ending1.syllables.length, ending2.syllables.length)
  
  for (let i = 0; i < minLength; i++) {
    const syl1 = ending1.syllables[ending1.syllables.length - 1 - i]
    const syl2 = ending2.syllables[ending2.syllables.length - 1 - i]
    
    if (syllablesRhyme(syl1, syl2)) {
      matchingSyllables++
    } else {
      break // Stop at first non-match
    }
  }
  
  // Also check phonetic match
  const phoneticMatch = ending1.phonetic === ending2.phonetic
  
  // Determine rhyme strength
  if (matchingSyllables >= 3 || phoneticMatch) {
    return {
      rhymes: true,
      strength: 'perfect',
      pattern: `${ending1.syllables.join('-')}/${ending2.syllables.join('-')}`,
      syllableMatch: matchingSyllables
    }
  } else if (matchingSyllables >= 2) {
    return {
      rhymes: true,
      strength: 'strong',
      pattern: `${ending1.syllables.slice(-2).join('-')}/${ending2.syllables.slice(-2).join('-')}`,
      syllableMatch: matchingSyllables
    }
  } else if (matchingSyllables >= 1) {
    // Check if the raw endings are similar enough
    if (ending1.raw.slice(-4) === ending2.raw.slice(-4)) {
      return {
        rhymes: true,
        strength: 'moderate',
        pattern: ending1.raw.slice(-4),
        syllableMatch: matchingSyllables
      }
    }
    return {
      rhymes: true,
      strength: 'weak',
      pattern: ending1.syllables[ending1.syllables.length - 1],
      syllableMatch: matchingSyllables
    }
  }
  
  return { rhymes: false, strength: 'none', syllableMatch: 0 }
}

/**
 * Check if two syllables rhyme
 */
function syllablesRhyme(syl1: string, syl2: string): boolean {
  if (!syl1 || !syl2) return false
  if (syl1 === syl2) return true
  
  // Common rhyming patterns for syllables
  const rhymeGroups = [
    ['less', 'ness', 'ess', 'ous'],
    ['ar', 'arch', 'arge', 'art'],
    ['ches', 'ges', 'dges'],
    ['ice', 'ish', 'ished', 'is'],
    ['idge', 'age', 'edge'],
    ['ture', 'cher', 'sure'],
    ['tion', 'sion', 'ution'],
    ['im', 'tim', 'dim', 'em', 'tem'],
    ['en', 'in', 'pen', 'kin'],
    ['ine', 'ime', 'ind', 'imed'],
    ['ot', 'op', 'ock', 'ought'],
  ]
  
  // Check if syllables are in same rhyme group
  for (const group of rhymeGroups) {
    const s1InGroup = group.some(pattern => syl1.endsWith(pattern))
    const s2InGroup = group.some(pattern => syl2.endsWith(pattern))
    
    if (s1InGroup && s2InGroup) {
      return true
    }
  }
  
  // Check if endings match (at least 2 chars)
  if (syl1.length >= 2 && syl2.length >= 2) {
    if (syl1.slice(-2) === syl2.slice(-2)) {
      return true
    }
  }
  
  return false
}

/**
 * Detect rhyme scheme for a set of lines using multi-syllable analysis
 */
export function detectMultiSyllableRhymeScheme(lines: string[]): {
  pattern: string
  groups: Record<string, string[]>
  analysis: Array<{
    line: number
    ending: string
    syllables: string[]
    rhymeGroup: string
  }>
} {
  if (lines.length === 0) {
    return { pattern: '', groups: {}, analysis: [] }
  }
  
  const analysis: Array<{
    line: number
    ending: string
    syllables: string[]
    rhymeGroup: string
  }> = []
  
  let pattern = ''
  let currentLetter = 'A'
  const groups: Record<string, string[]> = {}
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const ending = extractEndingSyllables(line, 3)
    
    if (ending.syllables.length === 0) {
      pattern += '-'
      continue
    }
    
    let foundGroup = ''
    
    // Check against all previous lines
    for (let j = 0; j < i; j++) {
      const prevAnalysis = analysis.find(a => a.line === j)
      if (!prevAnalysis) continue
      
      const rhymeResult = checkMultiSyllableRhyme(line, lines[j])
      
      if (rhymeResult.rhymes && rhymeResult.strength !== 'weak') {
        foundGroup = prevAnalysis.rhymeGroup
        break
      }
    }
    
    if (!foundGroup) {
      foundGroup = currentLetter
      currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1)
    }
    
    pattern += foundGroup
    
    // Add to groups
    const endingStr = ending.syllables.join('-')
    if (!groups[foundGroup]) {
      groups[foundGroup] = []
    }
    groups[foundGroup].push(endingStr)
    
    analysis.push({
      line: i,
      ending: endingStr,
      syllables: ending.syllables,
      rhymeGroup: foundGroup
    })
  }
  
  return { pattern, groups, analysis }
}