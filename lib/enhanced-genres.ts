/**
 * Enhanced genre system with drill-down functionality
 */

export const GENRE_STRUCTURE = {
  "genres": [
    {
      "id": "blues",
      "name": "Blues",
      "subgenres": [
        { "id": "acoustic-blues", "name": "Acoustic Blues", "microgenres": [] },
        { "id": "chicago-blues", "name": "Chicago Blues", "microgenres": [] },
        { "id": "classic-blues", "name": "Classic Blues", "microgenres": [] },
        { "id": "contemporary-blues", "name": "Contemporary Blues", "microgenres": [] },
        { "id": "country-blues", "name": "Country Blues", "microgenres": [] },
        { "id": "delta-blues", "name": "Delta Blues", "microgenres": [] },
        { "id": "electric-blues", "name": "Electric Blues", "microgenres": [] },
        { "id": "jazz-blues", "name": "Jazz Blues", "microgenres": [] },
        { "id": "piano-blues", "name": "Piano Blues", "microgenres": [] },
        { "id": "piedmont-blues", "name": "Piedmont Blues", "microgenres": [] },
        { "id": "texas-blues", "name": "Texas Blues", "microgenres": [] },
        { "id": "memphis-blues", "name": "Memphis Blues", "microgenres": [] },
        { "id": "st-louis-blues", "name": "St. Louis Blues", "microgenres": [] },
        { "id": "jump-blues", "name": "Jump Blues", "microgenres": [] },
        { "id": "rhythm-and-blues", "name": "Rhythm & Blues", "microgenres": [] }
      ]
    },
    {
      "id": "hip-hop-rap",
      "name": "Hip-Hop/Rap",
      "subgenres": [
        {
          "id": "gangsta-rap",
          "name": "Gangsta Rap",
          "microgenres": [
            { "id": "mafioso-rap", "name": "Mafioso Rap" },
            { "id": "g-funk", "name": "G-Funk" },
            { "id": "horrorcore", "name": "Horrorcore" },
            { "id": "west-coast-gangsta", "name": "West Coast Gangsta" },
            { "id": "east-coast-gangsta", "name": "East Coast Gangsta" },
            { "id": "reality-rap", "name": "Reality Rap" },
            { "id": "street-rap", "name": "Street Rap" },
            { "id": "hardcore-gangsta", "name": "Hardcore Gangsta" }
          ]
        },
        {
          "id": "rap-general",
          "name": "Rap",
          "microgenres": [
            { "id": "freestyle-rap", "name": "Freestyle Rap" },
            { "id": "battle-rap", "name": "Battle Rap" },
            { "id": "storytelling-rap", "name": "Storytelling Rap" },
            { "id": "party-rap", "name": "Party Rap" },
            { "id": "comedy-hip-hop", "name": "Comedy Hip-Hop" },
            { "id": "nerdcore", "name": "Nerdcore" },
            { "id": "chap-hop", "name": "Chap Hop" },
            { "id": "frat-rap", "name": "Frat Rap" },
            { "id": "noir-rap", "name": "Noir Rap" },
            { "id": "cinematic-street-rap", "name": "Cinematic Street Rap" }
          ]
        },
        {
          "id": "mumble-rap",
          "name": "Mumble Rap",
          "microgenres": [
            { "id": "melodic-mumble", "name": "Melodic Mumble" },
            { "id": "soundcloud-rap", "name": "SoundCloud Rap" },
            { "id": "auto-tune-rap", "name": "Auto-Tune Rap" },
            { "id": "triplet-flow-rap", "name": "Triplet Flow Rap" },
            { "id": "emo-mumble", "name": "Emo Mumble" },
            { "id": "cloud-mumble", "name": "Cloud Mumble" }
          ]
        },
        {
          "id": "trap",
          "name": "Trap",
          "microgenres": [
            { "id": "latin-trap", "name": "Latin Trap" },
            { "id": "country-trap", "name": "Country Trap" },
            { "id": "edm-trap", "name": "EDM Trap" },
            { "id": "boom-trap", "name": "Boom Trap" },
            {
              "id": "drill",
              "name": "Drill",
              "microgenres": [
                { "id": "uk-drill", "name": "UK Drill" },
                { "id": "brooklyn-drill", "name": "Brooklyn Drill" },
                { "id": "chicago-drill", "name": "Chicago Drill" },
                { "id": "jacksonville-drill", "name": "Jacksonville Drill" },
                { "id": "detroit-drill", "name": "Detroit Drill" },
                { "id": "toronto-drill", "name": "Toronto Drill" },
                { "id": "bronx-drill", "name": "Bronx Drill" },
                { "id": "louisiana-drill", "name": "Louisiana Drill" }
              ]
            },
            { "id": "phonk", "name": "Phonk" },
            { "id": "plugg", "name": "Plugg" },
            { "id": "pluggnb", "name": "Pluggnb" },
            { "id": "rage", "name": "Rage" },
            { "id": "tread-rap", "name": "Tread Rap" },
            { "id": "trap-metal", "name": "Trap Metal" },
            { "id": "gospel-trap", "name": "Gospel Trap" },
            { "id": "cloud-rap", "name": "Cloud Rap" },
            { "id": "hyperpop-rap", "name": "Hyperpop Rap" },
            { "id": "emo-trap", "name": "Emo Trap" },
            { "id": "soundcloud-rap", "name": "SoundCloud Rap" }
          ]
        },
        {
          "id": "conscious-rap",
          "name": "Conscious Rap",
          "microgenres": [
            { "id": "political-hip-hop", "name": "Political Hip-Hop" },
            { "id": "afrocentric-rap", "name": "Afrocentric Rap" },
            { "id": "social-commentary-rap", "name": "Social Commentary Rap" },
            { "id": "spiritual-rap", "name": "Spiritual Rap" },
            { "id": "educational-rap", "name": "Educational Rap" },
            { "id": "revolutionary-rap", "name": "Revolutionary Rap" },
            { "id": "backpack-rap", "name": "Backpack Rap" },
            { "id": "art-rap", "name": "Art Rap" },
            { "id": "jazz-rap", "name": "Jazz Rap" }
          ]
        },
        {
          "id": "boom-bap",
          "name": "Boom Bap",
          "microgenres": [
            { "id": "jazz-boom-bap", "name": "Jazz Boom Bap" },
            { "id": "lofi-boom-bap", "name": "Lo-Fi Boom Bap" },
            { "id": "east-coast-boom-bap", "name": "East Coast Boom Bap" },
            { "id": "underground-boom-bap", "name": "Underground Boom Bap" },
            { "id": "neo-boom-bap", "name": "Neo Boom Bap" },
            { "id": "sample-heavy-boom-bap", "name": "Sample-Heavy Boom Bap" },
            { "id": "mafioso-boom-bap", "name": "Mafioso Boom Bap" }
          ]
        },
        {
          "id": "memphis-rap",
          "name": "Memphis Rap",
          "microgenres": [
            { "id": "phonk", "name": "Phonk" },
            { "id": "crunk", "name": "Crunk" },
            { "id": "horrorcore-memphis", "name": "Horrorcore Memphis" },
            { "id": "underground-memphis", "name": "Underground Memphis" },
            { "id": "memphis-trap", "name": "Memphis Trap" },
            { "id": "dark-memphis", "name": "Dark Memphis" }
          ]
        },
        {
          "id": "rage-rap",
          "name": "Rage Rap",
          "microgenres": []
        },
        {
          "id": "jersey-club-rap",
          "name": "Jersey Club Rap",
          "microgenres": []
        },
        {
          "id": "lofi-hip-hop",
          "name": "Lo-Fi Hip-Hop",
          "microgenres": []
        }
      ]
    },
    {
      "id": "rnb-soul",
      "name": "R&B/Soul",
      "subgenres": [
        { "id": "contemporary-rnb-soul", "name": "Contemporary R&B", "microgenres": [] },
        { "id": "disco", "name": "Disco", "microgenres": [] },
        { "id": "doo-wop", "name": "Doo Wop", "microgenres": [] },
        { "id": "funk", "name": "Funk", "microgenres": [
            { "id": "afro-funk", "name": "Afro-Funk" },
            { "id": "electro-funk", "name": "Electro-Funk" },
            { "id": "funk-metal", "name": "Funk Metal" },
            { "id": "nu-funk", "name": "Nu-Funk" }
        ] },
        { "id": "motown", "name": "Motown", "microgenres": [] },
        { "id": "neo-soul", "name": "Neo-Soul", "microgenres": [] },
        { "id": "quiet-storm", "name": "Quiet Storm", "microgenres": [] },
        { "id": "soul", "name": "Soul", "microgenres": [
            { "id": "electro-soul", "name": "Electro-Soul" }
        ] },
        { "id": "northern-soul", "name": "Northern Soul", "microgenres": [] },
        { "id": "southern-soul", "name": "Southern Soul", "microgenres": [] },
        { "id": "deep-soul", "name": "Deep Soul", "microgenres": [] },
        { "id": "psychedelic-soul", "name": "Psychedelic Soul", "microgenres": [] },
        { "id": "blue-eyed-soul", "name": "Blue-Eyed Soul", "microgenres": [] },
        { "id": "philadelphia-soul", "name": "Philadelphia Soul", "microgenres": [] },
        { "id": "memphis-soul", "name": "Memphis Soul", "microgenres": [] },
        { "id": "chicago-soul", "name": "Chicago Soul", "microgenres": [] },
        { "id": "funk-rock", "name": "Funk Rock", "microgenres": [] },
        { "id": "p-funk", "name": "P-Funk", "microgenres": [] },
        { "id": "go-go", "name": "Go-Go", "microgenres": [] },
        { "id": "new-jack-swing", "name": "New Jack Swing", "microgenres": [
            { "id": "swing-beat", "name": "Swing Beat" },
            { "id": "jack-swing-ballads", "name": "Jack Swing Ballads" }
        ] },
        { "id": "minneapolis-sound", "name": "Minneapolis Sound", "microgenres": [] },
        { "id": "alternative-rnb", "name": "Alternative R&B", "microgenres": [
            { "id": "pbrnb", "name": "PBR&B" },
            { "id": "trap-soul-style", "name": "Trap Soul" },
            { "id": "dark-rnb", "name": "Dark R&B" },
            { "id": "electronic-rnb", "name": "Electronic R&B" },
            { "id": "early-2000s-rnb", "name": "Early 2000s R&B" },
            { "id": "mid-2000s-rnb", "name": "Mid 2000s R&B" },
            { "id": "2010s-alternative-rnb", "name": "2010s Alternative R&B" },
            { "id": "hip-hop-rnb-crossover", "name": "Hip-Hop/R&B Crossover" }
        ] },
        { "id": "trap-soul", "name": "Trap Soul", "microgenres": [
            { "id": "melodic-trap-soul", "name": "Melodic Trap Soul" },
            { "id": "dark-trap-soul", "name": "Dark Trap Soul" },
            { "id": "gospel-trap-soul", "name": "Gospel Trap Soul" }
        ] },
        { "id": "afrofuturism-soul", "name": "Afrofuturism Soul", "microgenres": [] },
        { "id": "stadium-rnb", "name": "Stadium R&B", "microgenres": [] },
        { "id": "southern-gothic-rnb", "name": "Southern Gothic R&B", "microgenres": [] }
      ]
    },
    {
      "id": "pop",
      "name": "Pop",
      "subgenres": [
        { "id": "baroque-pop", "name": "Baroque Pop", "microgenres": [] },
        { "id": "country-pop", "name": "Country Pop", "microgenres": [] },
        { "id": "contemporary-rnb", "name": "Contemporary R&B", "microgenres": [] },
        { "id": "cowboy-pop", "name": "Cowboy Pop", "microgenres": [] },
        { "id": "dancehall-pop", "name": "Dancehall Pop", "microgenres": [] },
        { "id": "electropop", "name": "Electropop", "microgenres": [] },
        { "id": "emo-pop", "name": "Emo Pop", "microgenres": [] },
        { "id": "folk-pop", "name": "Folk-Pop", "microgenres": [] },
        { "id": "hip-pop", "name": "Hip-Pop", "microgenres": [] },
        { "id": "indie-pop", "name": "Indie Pop", "microgenres": [] },
        { "id": "pop-punk", "name": "Pop Punk", "microgenres": [] },
        { "id": "pop-rap", "name": "Pop Rap", "microgenres": [] },
        { "id": "ambient-pop", "name": "Ambient Pop", "microgenres": [] },
        { "id": "pop-rock", "name": "Pop Rock", "microgenres": [] },
        { "id": "power-pop", "name": "Power Pop", "microgenres": [] },
        { "id": "psychedelic-pop", "name": "Psychedelic Pop", "microgenres": [] },
        { "id": "space-age-pop", "name": "Space Age Pop", "microgenres": [] },
        { "id": "worldbeat", "name": "Worldbeat", "microgenres": [] },
        { "id": "k-pop", "name": "K-Pop", "microgenres": [] }
      ]
    }
    // Truncated for length - would include all genres from your JSON
  ]
}

/**
 * Find adjacent/related genres for recommendations
 */
export function getAdjacentGenres(genreId: string): string[] {
  // Define adjacency relationships
  const adjacencies: Record<string, string[]> = {
    'trap': ['hip-hop-rap', 'rnb-soul', 'contemporary-rnb'],
    'neo-soul': ['rnb-soul', 'jazz', 'hip-hop-rap'],
    'drill': ['trap', 'gangsta-rap', 'uk-drill'],
    'alternative-rnb': ['neo-soul', 'pop', 'hip-hop-rap'],
    // Add more relationships as needed
  }
  
  return adjacencies[genreId] || []
}

/**
 * Get genre suggestions based on input description
 */
export function suggestGenresFromDescription(description: string): {
  genres: string[]
  subgenres: string[]
  microgenres: string[]
} {
  const desc = description.toLowerCase()
  const suggestions = { genres: [], subgenres: [], microgenres: [] }
  
  // Trap indicators
  if (desc.includes('trap') || desc.includes('808') || desc.includes('drill')) {
    suggestions.genres.push('Hip-Hop/Rap')
    suggestions.subgenres.push('Trap')
    if (desc.includes('drill')) suggestions.microgenres.push('Brooklyn Drill', 'Chicago Drill')
  }
  
  // R&B indicators  
  if (desc.includes('soul') || desc.includes('r&b') || desc.includes('smooth')) {
    suggestions.genres.push('R&B/Soul')
    if (desc.includes('neo')) suggestions.subgenres.push('Neo-Soul')
  }
  
  // Pop indicators
  if (desc.includes('pop') || desc.includes('mainstream') || desc.includes('radio')) {
    suggestions.genres.push('Pop')
  }
  
  return suggestions
}