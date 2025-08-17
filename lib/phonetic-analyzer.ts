/**
 * Advanced Phonetic Analysis for Rhyme Detection
 * Handles multi-syllable rhymes, slant rhymes, and complex hip-hop patterns
 */

// Phonetic sound mappings for English pronunciation
export const PHONETIC_MAPPINGS: Record<string, string> = {
  // Vowel sounds
  'a': 'æ', 'ai': 'eɪ', 'ay': 'eɪ', 'au': 'ɔː', 'aw': 'ɔː',
  'e': 'ɛ', 'ea': 'iː', 'ee': 'iː', 'ei': 'eɪ', 'ey': 'eɪ',
  'i': 'ɪ', 'ie': 'aɪ', 'igh': 'aɪ', 'y': 'aɪ',
  'o': 'ɒ', 'oa': 'oʊ', 'oe': 'oʊ', 'ow': 'oʊ', 'ou': 'aʊ',
  'u': 'ʌ', 'ue': 'uː', 'ew': 'uː', 'oo': 'uː',
  
  // Consonant clusters
  'ch': 'tʃ', 'sh': 'ʃ', 'th': 'θ', 'ph': 'f', 'gh': '',
  'ck': 'k', 'qu': 'kw', 'tion': 'ʃən', 'sion': 'ʃən',
  
  // Silent letters
  'mb': 'm', 'mn': 'm', 'kn': 'n', 'wr': 'r', 'ps': 's',
  'gn': 'n', 'rh': 'r', 'wh': 'w',
}

// Common word endings and their phonetic patterns
export const ENDING_PATTERNS: Record<string, string[]> = {
  // -ess endings (heartless, darkness, etc.)
  'əs': ['ess', 'less', 'ness', 'ous', 'us', 'ice', 'ace', 'ence'],
  
  // -ar sounds (charges, arches, carpet, etc.)
  'ɑr': ['ar', 'arges', 'arches', 'arpet', 'arded', 'ardless', 'artless', 'arted'],
  
  // -ish/-is sounds (accomplished, office, cautious)
  'ɪʃ': ['ish', 'ished', 'ice', 'iss', 'is', 'ious', 'eous'],
  
  // -idge sounds (cartridge, partridge)
  'ɪdʒ': ['idge', 'age', 'edge', 'ege'],
  
  // -us sounds (Jesus, thesis, pieces)
  'iːs': ['eus', 'esis', 'eces', 'eases', 'eeses', 'ises'],
  
  // -ture sounds (creature, feature)
  'tʃər': ['ture', 'cher', 'tcher', 'ture'],
  
  // -tion sounds (pollution, solution)
  'uːʃən': ['ution', 'usion', 'ution'],
  
  // -em sounds (victim, system)
  'ɪm': ['im', 'em', 'ym', 'um'],
  
  // -en sounds (Pippen, sickenin')
  'ən': ['en', 'in', 'on', 'an'],
}

/**
 * Break word into syllables for analysis
 */
export function breakIntoSyllables(word: string): string[] {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!cleaned) return []
  
  const syllables: string[] = []
  let current = ''
  const vowels = 'aeiou'
  let hasVowel = false
  
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]
    const isVowel = vowels.includes(char)
    
    if (isVowel) {
      hasVowel = true
      current += char
      
      // Check for vowel pairs
      if (i + 1 < cleaned.length && vowels.includes(cleaned[i + 1])) {
        current += cleaned[i + 1]
        i++
      }
    } else {
      current += char
      
      // Check if next char starts new syllable
      if (hasVowel && i + 1 < cleaned.length) {
        const next = cleaned[i + 1]
        const afterNext = i + 2 < cleaned.length ? cleaned[i + 2] : ''
        
        // If next is vowel or consonant+vowel, start new syllable
        if (vowels.includes(next) || (afterNext && vowels.includes(afterNext))) {
          syllables.push(current)
          current = ''
          hasVowel = false
        }
      }
    }
  }
  
  if (current) syllables.push(current)
  return syllables
}

/**
 * Get phonetic representation of a word
 */
export function getPhoneticRepresentation(word: string): string {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!cleaned) return ''
  
  let phonetic = cleaned
  
  // Apply phonetic mappings
  for (const [pattern, sound] of Object.entries(PHONETIC_MAPPINGS)) {
    phonetic = phonetic.replace(new RegExp(pattern, 'g'), sound)
  }
  
  return phonetic
}

/**
 * Extract the phonetic ending of a word (last 1-2 syllables)
 */
export function getPhoneticEnding(word: string, syllableCount: number = 2): string {
  const syllables = breakIntoSyllables(word)
  if (syllables.length === 0) return ''
  
  const relevantSyllables = syllables.slice(-syllableCount).join('')
  return getPhoneticRepresentation(relevantSyllables)
}

/**
 * Check if two words rhyme based on phonetic analysis
 */
export function checkPhoneticRhyme(word1: string, word2: string): {
  rhymes: boolean
  strength: 'perfect' | 'near' | 'slant' | 'assonance' | 'consonance' | 'none'
  pattern?: string
} {
  if (!word1 || !word2) return { rhymes: false, strength: 'none' }
  
  const w1 = word1.toLowerCase().replace(/[^a-z]/g, '')
  const w2 = word2.toLowerCase().replace(/[^a-z]/g, '')
  
  if (w1 === w2) return { rhymes: true, strength: 'perfect', pattern: 'identical' }
  
  // Get phonetic endings
  const ending1 = getPhoneticEnding(w1, 2)
  const ending2 = getPhoneticEnding(w2, 2)
  
  // Perfect rhyme - exact phonetic match
  if (ending1 === ending2) {
    return { rhymes: true, strength: 'perfect', pattern: ending1 }
  }
  
  // Check for near rhymes (last syllable matches)
  const lastSyllable1 = getPhoneticEnding(w1, 1)
  const lastSyllable2 = getPhoneticEnding(w2, 1)
  
  if (lastSyllable1 === lastSyllable2) {
    return { rhymes: true, strength: 'near', pattern: lastSyllable1 }
  }
  
  // Check for common ending patterns
  for (const [phoneticPattern, spellings] of Object.entries(ENDING_PATTERNS)) {
    let match1 = false, match2 = false
    
    for (const spelling of spellings) {
      if (w1.endsWith(spelling)) match1 = true
      if (w2.endsWith(spelling)) match2 = true
    }
    
    if (match1 && match2) {
      return { rhymes: true, strength: 'slant', pattern: phoneticPattern }
    }
  }
  
  // Check for assonance (matching vowel sounds)
  const vowels1 = ending1.replace(/[^æeɪɔːɛiːaɪɒoʊaʊʌuː]/g, '')
  const vowels2 = ending2.replace(/[^æeɪɔːɛiːaɪɒoʊaʊʌuː]/g, '')
  
  if (vowels1.length >= 2 && vowels1 === vowels2) {
    return { rhymes: true, strength: 'assonance', pattern: vowels1 }
  }
  
  // Check for consonance (matching consonant patterns)
  const consonants1 = w1.slice(-3).replace(/[aeiou]/g, '')
  const consonants2 = w2.slice(-3).replace(/[aeiou]/g, '')
  
  if (consonants1.length >= 2 && consonants1 === consonants2) {
    return { rhymes: true, strength: 'consonance', pattern: consonants1 }
  }
  
  return { rhymes: false, strength: 'none' }
}

/**
 * Analyze multi-word rhyme patterns (e.g., "Oval Office" with "so accomplished")
 */
export function checkMultiWordRhyme(phrase1: string, phrase2: string): {
  rhymes: boolean
  pattern?: string
} {
  // Get last 2-3 words from each phrase
  const words1 = phrase1.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const words2 = phrase2.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  
  if (words1.length === 0 || words2.length === 0) {
    return { rhymes: false }
  }
  
  // Check various combinations
  const combinations = [
    // Last word with last word
    [words1.slice(-1).join(' '), words2.slice(-1).join(' ')],
    // Last 2 words with last 2 words
    [words1.slice(-2).join(' '), words2.slice(-2).join(' ')],
    // Last word with last 2 words
    [words1.slice(-1).join(' '), words2.slice(-2).join(' ')],
    // Last 2 words with last word
    [words1.slice(-2).join(' '), words2.slice(-1).join(' ')],
  ]
  
  for (const [combo1, combo2] of combinations) {
    const phonetic1 = getPhoneticRepresentation(combo1.replace(/\s+/g, ''))
    const phonetic2 = getPhoneticRepresentation(combo2.replace(/\s+/g, ''))
    
    // Check if the endings match
    const minLength = Math.min(phonetic1.length, phonetic2.length, 4)
    if (minLength >= 3) {
      const end1 = phonetic1.slice(-minLength)
      const end2 = phonetic2.slice(-minLength)
      
      if (end1 === end2) {
        return { rhymes: true, pattern: `${combo1}/${combo2}` }
      }
    }
  }
  
  return { rhymes: false }
}

/**
 * Find internal rhymes within a line
 */
export function findInternalRhymes(line: string): {
  pairs: Array<[string, string]>
  positions: Array<[number, number]>
} {
  const words = line.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const pairs: Array<[string, string]> = []
  const positions: Array<[number, number]> = []
  
  for (let i = 0; i < words.length - 1; i++) {
    for (let j = i + 1; j < words.length; j++) {
      const result = checkPhoneticRhyme(words[i], words[j])
      if (result.rhymes && result.strength !== 'consonance') {
        pairs.push([words[i], words[j]])
        positions.push([i, j])
      }
    }
  }
  
  return { pairs, positions }
}

/**
 * Hip-hop specific rhyme patterns
 * These are common rhyme groups in rap that might not follow standard phonetic rules
 */
export const HIPHOP_RHYME_GROUPS: Record<string, string[]> = {
  // -ot/-op/-ock group
  'ot_group': [
    'plot', 'plots', 'got', 'not', 'lot', 'hot', 'shot', 'spot', 'knot', 'pot',
    'op', 'ops', 'cop', 'cops', 'drop', 'drops', 'stop', 'stops', 'pop', 'pops', 'top', 'tops', 'shop', 'shops',
    'ock', 'ocks', 'block', 'blocks', 'clock', 'clocks', 'lock', 'locks', 'rock', 'rocks', 'shock', 'shocks', 'stock', 'stocks', 'glock', 'glocks',
    'photoshop', 'ciroc', 'croc'
  ],
  
  // -ess/-less/-ness group
  'ess_group': [
    'heartless', 'darkness', 'regardless', 'mess', 'less', 'bless', 'stress', 'press',
    'confess', 'express', 'impress', 'address', 'success', 'process'
  ],
  
  // -ar/-arge/-arch group
  'ar_group': [
    'charges', 'arches', 'marches', 'carpet', 'target', 'market', 'started',
    'parted', 'charted', 'departed', 'garden', 'harden', 'pardon'
  ],
  
  // -ished/-ice/-ious group
  'ish_group': [
    'accomplished', 'demolished', 'abolished', 'polished', 'office', 'notice',
    'cautious', 'conscious', 'nauseous', 'vicious', 'precious', 'delicious'
  ],
  
  // -idge/-age group
  'idge_group': [
    'cartridge', 'partridge', 'bridge', 'ridge', 'damage', 'baggage',
    'package', 'message', 'passage', 'savage', 'average', 'leverage'
  ],
  
  // -eature/-eacher group
  'eature_group': [
    'creature', 'feature', 'features', 'teacher', 'preacher', 'bleachers',
    'reaches', 'beaches', 'peaches', 'leeches'
  ],
  
  // -tion/-sion group
  'tion_group': [
    'pollution', 'solution', 'revolution', 'evolution', 'contribution',
    'distribution', 'constitution', 'institution', 'prostitution',
    'confusion', 'illusion', 'conclusion', 'intrusion', 'exclusion'
  ],
  
  // -im/-em/-um group
  'im_group': [
    'victim', 'system', 'wisdom', 'kingdom', 'freedom', 'random',
    'problem', 'emblem', 'rhythm', 'algorithm'
  ],
  
  // -en/-in group
  'en_group': [
    'pippen', 'kippen', 'rippin', 'slippin', 'trippin', 'drippin',
    'sickenin', 'thickenin', 'quickenin', 'vision', 'mission', 'ambition',
    'condition', 'position', 'tradition', 'commission'
  ]
}

/**
 * Check if words belong to the same hip-hop rhyme group
 */
export function checkHipHopRhyme(word1: string, word2: string): boolean {
  const w1 = word1.toLowerCase().replace(/[^a-z]/g, '')
  const w2 = word2.toLowerCase().replace(/[^a-z]/g, '')
  
  for (const group of Object.values(HIPHOP_RHYME_GROUPS)) {
    if (group.includes(w1) && group.includes(w2)) {
      return true
    }
  }
  
  return false
}