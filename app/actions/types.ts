/**
 * Shared types for all actions
 */

export interface GenerationResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface StoryReferences {
  characters: Array<{
    id: string
    reference: string
    name: string
    description: string
  }>
  locations: Array<{
    id: string
    reference: string
    name: string
    description: string
  }>
  props: Array<{
    id: string
    reference: string
    name: string
    description: string
  }>
}

export interface MusicVideoReferences {
  locations?: Array<{
    name: string
    description: string
    type: string
  }>
  wardrobe?: Array<{
    name: string
    description: string
    style: string
  }>
  props?: Array<{
    name: string
    description: string
    purpose: string
  }>
  visualThemes?: string[]
}