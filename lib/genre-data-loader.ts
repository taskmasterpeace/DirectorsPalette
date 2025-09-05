import genreData from '@/music_genres.json'

export interface Microgenre {
  id: string
  name: string
  microgenres?: Microgenre[]
}

export interface Subgenre {
  id: string
  name: string
  microgenres: Microgenre[]
}

export interface Genre {
  id: string
  name: string
  subgenres: Subgenre[]
}

export interface GenreDatabase {
  genres: Genre[]
}

// Load the full genre database
export const genreDatabase: GenreDatabase = genreData as GenreDatabase

// Get popular main genres based on your updated list
export const POPULAR_GENRES = [
  "Hip-Hop/Rap",
  "Soul", 
  "Funk",
  "Afrobeat", 
  "Drill"
]

// Helper functions
export function getAllMainGenres(): Genre[] {
  return genreDatabase.genres
}

export function getMainGenreByName(name: string): Genre | undefined {
  return genreDatabase.genres.find(g => g.name === name)
}

export function getAllGenreNames(): string[] {
  const names: string[] = []
  
  genreDatabase.genres.forEach(genre => {
    names.push(genre.name)
    
    genre.subgenres.forEach(subgenre => {
      names.push(subgenre.name)
      
      subgenre.microgenres.forEach(microgenre => {
        names.push(microgenre.name)
        
        // Handle nested microgenres (like Drill under Trap)
        if (microgenre.microgenres) {
          microgenre.microgenres.forEach(nestedMicro => {
            names.push(nestedMicro.name)
          })
        }
      })
    })
  })
  
  return names
}

export function searchGenres(searchTerm: string, useWildcards = true): string[] {
  const allNames = getAllGenreNames()
  
  if (!searchTerm) return []
  
  return allNames.filter(name => {
    if (searchTerm.includes('"')) {
      const quoted = searchTerm.replace(/"/g, '')
      return name.toLowerCase().includes(quoted.toLowerCase())
    }
    
    if (useWildcards && searchTerm.includes('*')) {
      const pattern = searchTerm.replace(/\*/g, '.*')
      const regex = new RegExp(pattern, 'i')
      return regex.test(name)
    }
    
    return name.toLowerCase().includes(searchTerm.toLowerCase())
  })
}

export function getGenreStats() {
  let totalSubgenres = 0
  let totalMicrogenres = 0
  let totalNestedMicrogenres = 0
  
  genreDatabase.genres.forEach(genre => {
    totalSubgenres += genre.subgenres.length
    
    genre.subgenres.forEach(subgenre => {
      totalMicrogenres += subgenre.microgenres.length
      
      subgenre.microgenres.forEach(microgenre => {
        if (microgenre.microgenres) {
          totalNestedMicrogenres += microgenre.microgenres.length
        }
      })
    })
  })
  
  return {
    mainGenres: genreDatabase.genres.length,
    subgenres: totalSubgenres,
    microgenres: totalMicrogenres,
    nestedMicrogenres: totalNestedMicrogenres,
    total: genreDatabase.genres.length + totalSubgenres + totalMicrogenres + totalNestedMicrogenres
  }
}