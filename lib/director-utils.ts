import type { FilmDirector, MusicVideoDirector } from './director-types'

/**
 * Utility function to combine and deduplicate director arrays by ID
 * Prevents React duplicate key errors when rendering director lists
 * 
 * @param curatedDirectors - Array of curated directors
 * @param customDirectors - Array of custom directors
 * @returns Deduplicated array with custom directors taking precedence over curated ones
 */
export function combineAndDeduplicateDirectors<T extends FilmDirector | MusicVideoDirector>(
  curatedDirectors: T[] | null | undefined,
  customDirectors: T[] | null | undefined
): T[] {
  return [
    ...(curatedDirectors || []), 
    ...(customDirectors || [])
  ].filter((director, index, array) => 
    array.findIndex(d => d.id === director.id) === index
  )
}

/**
 * Specific utility for combining film directors
 */
export function combineFilmDirectors(
  curatedDirectors: FilmDirector[] | null | undefined,
  customDirectors: FilmDirector[] | null | undefined
): FilmDirector[] {
  return combineAndDeduplicateDirectors(curatedDirectors, customDirectors)
}

/**
 * Specific utility for combining music video directors
 */
export function combineMusicVideoDirectors(
  curatedDirectors: MusicVideoDirector[] | null | undefined,
  customDirectors: MusicVideoDirector[] | null | undefined
): MusicVideoDirector[] {
  return combineAndDeduplicateDirectors(curatedDirectors, customDirectors)
}