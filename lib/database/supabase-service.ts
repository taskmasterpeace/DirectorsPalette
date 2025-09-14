/**
 * Supabase Database Service
 * Replaces IndexedDB with Supabase for all data operations
 */
import { supabase, getCurrentUser } from '@/lib/supabase'
import type { 
  Project, 
  User, 
  UserTemplate, 
  AIUsage 
} from '@/lib/supabase'

// Enhanced types matching IndexedDB structure
export interface SavedProject {
  id: string
  user_id: string
  name: string
  type: 'story' | 'music-video' | 'commercial' | 'children-book'
  
  // Story mode data
  story?: string
  selected_director?: string
  breakdown?: any
  additional_shots?: { [chapterId: string]: string[] }
  title_card_options?: any
  title_card_approaches?: string[]
  selected_chapter?: string
  expanded_chapters?: { [chapterId: string]: boolean }

  // Music video mode data
  music_video_data?: {
    lyrics: string
    song_title: string
    artist: string
    genre: string
  }
  music_video_breakdown?: any
  selected_treatment?: any
  selected_music_video_section?: string
  music_video_config?: MusicVideoConfig
  additional_music_video_shots?: { [sectionId: string]: string[] }
  selected_music_video_director?: string
  custom_music_video_directors?: any[]

  // Shared data
  custom_directors?: any[]
  prompt_options?: any
  active_artist?: ArtistProfile
  
  created_at: string
  updated_at: string
}

export interface LocationConfig {
  id: string
  reference: string
  name: string
  description: string
  purpose: string
  assignedSections: string[]
}

export interface WardrobeConfig {
  id: string
  reference: string
  name: string
  description: string
  purpose: string
  assignedSections: string[]
}

export interface PropConfig {
  id: string
  reference: string
  name: string
  description: string
  purpose: string
  assignedSections: string[]
}

export interface Treatment {
  id: string
  name: string
  concept: string
  visualTheme: string
  performanceRatio: number
  hookStrategy: string
}

export interface MusicVideoConfig {
  selectedTreatmentId?: string
  customTreatment?: Treatment
  locations: LocationConfig[]
  wardrobe: WardrobeConfig[]
  props: PropConfig[]
  visualThemes?: string[]
  isConfigured: boolean
}

export interface ArtistProfile {
  id?: string
  user_id?: string
  artist_id: string
  artist_name?: string
  real_name?: string
  image_data_url?: string
  artist_identity?: any
  genres?: string[]
  sub_genres?: string[]
  micro_genres?: string[]
  vocal_description?: any
  signature_essence?: any
  production_preferences?: any
  writing_persona?: any
  personality?: any
  visual_look?: any
  material_prefs?: any
  adlib_profile?: any
  career_direction?: any
  chat_voice?: any
  meta?: any
  is_public?: boolean
  created_at?: string
  updated_at?: string
}

export interface FilmDirector {
  id?: string
  user_id?: string
  name: string
  description?: string
  visual_language?: string
  camera_style?: string
  color_palette?: string
  lighting_approach?: string
  editing_style?: string
  sound_design?: string
  is_custom?: boolean
  is_public?: boolean
  created_at?: string
  updated_at?: string
}

export interface MusicVideoDirector {
  id?: string
  user_id?: string
  name: string
  description?: string
  visual_hallmarks?: string
  narrative_style?: string
  genres?: string[]
  signature_elements?: string
  is_custom?: boolean
  is_public?: boolean
  created_at?: string
  updated_at?: string
}

class SupabaseService {
  /**
   * Project Operations
   */
  async saveProject(projectData: Omit<SavedProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: projectData.name,
        type: projectData.type,
        content: {
          // Story mode
          story: projectData.story,
          selected_director: projectData.selected_director,
          breakdown: projectData.breakdown,
          additional_shots: projectData.additional_shots,
          title_card_options: projectData.title_card_options,
          title_card_approaches: projectData.title_card_approaches,
          selected_chapter: projectData.selected_chapter,
          expanded_chapters: projectData.expanded_chapters,
          
          // Music video mode
          music_video_data: projectData.music_video_data,
          music_video_breakdown: projectData.music_video_breakdown,
          selected_treatment: projectData.selected_treatment,
          selected_music_video_section: projectData.selected_music_video_section,
          music_video_config: projectData.music_video_config,
          additional_music_video_shots: projectData.additional_music_video_shots,
          selected_music_video_director: projectData.selected_music_video_director,
          custom_music_video_directors: projectData.custom_music_video_directors,
          
          // Shared
          custom_directors: projectData.custom_directors,
          prompt_options: projectData.prompt_options,
          active_artist: projectData.active_artist,
        }
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  async updateProject(projectId: string, projectData: Partial<SavedProject>): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // Get current project to merge with updates
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('content')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) throw fetchError

    const updatedContent = {
      ...currentProject.content,
      // Merge new data
      story: projectData.story ?? currentProject.content.story,
      selected_director: projectData.selected_director ?? currentProject.content.selected_director,
      breakdown: projectData.breakdown ?? currentProject.content.breakdown,
      additional_shots: projectData.additional_shots ?? currentProject.content.additional_shots,
      title_card_options: projectData.title_card_options ?? currentProject.content.title_card_options,
      title_card_approaches: projectData.title_card_approaches ?? currentProject.content.title_card_approaches,
      selected_chapter: projectData.selected_chapter ?? currentProject.content.selected_chapter,
      expanded_chapters: projectData.expanded_chapters ?? currentProject.content.expanded_chapters,
      
      music_video_data: projectData.music_video_data ?? currentProject.content.music_video_data,
      music_video_breakdown: projectData.music_video_breakdown ?? currentProject.content.music_video_breakdown,
      selected_treatment: projectData.selected_treatment ?? currentProject.content.selected_treatment,
      selected_music_video_section: projectData.selected_music_video_section ?? currentProject.content.selected_music_video_section,
      music_video_config: projectData.music_video_config ?? currentProject.content.music_video_config,
      additional_music_video_shots: projectData.additional_music_video_shots ?? currentProject.content.additional_music_video_shots,
      selected_music_video_director: projectData.selected_music_video_director ?? currentProject.content.selected_music_video_director,
      custom_music_video_directors: projectData.custom_music_video_directors ?? currentProject.content.custom_music_video_directors,
      
      custom_directors: projectData.custom_directors ?? currentProject.content.custom_directors,
      prompt_options: projectData.prompt_options ?? currentProject.content.prompt_options,
      active_artist: projectData.active_artist ?? currentProject.content.active_artist,
    }

    const updateData: any = {
      content: updatedContent
    }

    if (projectData.name) updateData.name = projectData.name
    if (projectData.type) updateData.type = projectData.type

    const { error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (error) throw error
  }

  async getAllProjects(): Promise<SavedProject[]> {
    if (!supabase) return []
    
    const user = await getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error

    // Transform data to match SavedProject interface
    return data.map(project => ({
      id: project.id,
      user_id: project.user_id,
      name: project.name,
      type: project.type,
      created_at: project.created_at,
      updated_at: project.updated_at,
      
      // Extract from content JSONB
      story: project.content?.story,
      selected_director: project.content?.selected_director,
      breakdown: project.content?.breakdown,
      additional_shots: project.content?.additional_shots,
      title_card_options: project.content?.title_card_options,
      title_card_approaches: project.content?.title_card_approaches,
      selected_chapter: project.content?.selected_chapter,
      expanded_chapters: project.content?.expanded_chapters,
      
      music_video_data: project.content?.music_video_data,
      music_video_breakdown: project.content?.music_video_breakdown,
      selected_treatment: project.content?.selected_treatment,
      selected_music_video_section: project.content?.selected_music_video_section,
      music_video_config: project.content?.music_video_config,
      additional_music_video_shots: project.content?.additional_music_video_shots,
      selected_music_video_director: project.content?.selected_music_video_director,
      custom_music_video_directors: project.content?.custom_music_video_directors,
      
      custom_directors: project.content?.custom_directors,
      prompt_options: project.content?.prompt_options,
      active_artist: project.content?.active_artist,
    }))
  }

  async deleteProject(projectId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (error) throw error
  }

  /**
   * Film Director Operations
   */
  async saveFilmDirector(director: Omit<FilmDirector, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('film_directors')
      .insert({
        user_id: user.id,
        ...director
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  async getFilmDirectors(): Promise<FilmDirector[]> {
    if (!supabase) return []
    
    const user = await getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('film_directors')
      .select('*')
      .or(`is_public.eq.true,user_id.eq.${user.id}`)
      .order('name')

    if (error) throw error
    return data || []
  }

  /**
   * Music Video Director Operations
   */
  async saveMusicVideoDirector(director: Omit<MusicVideoDirector, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('music_video_directors')
      .insert({
        user_id: user.id,
        ...director
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  async getMusicVideoDirectors(): Promise<MusicVideoDirector[]> {
    if (!supabase) return []
    
    const user = await getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('music_video_directors')
      .select('*')
      .or(`is_public.eq.true,user_id.eq.${user.id}`)
      .order('name')

    if (error) throw error
    return data || []
  }

  /**
   * Artist Profile Operations
   */
  async saveArtistProfile(artist: Omit<ArtistProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('artist_profiles')
      .insert({
        user_id: user.id,
        ...artist
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  async getArtistProfiles(): Promise<ArtistProfile[]> {
    if (!supabase) return []
    
    const user = await getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('artist_profiles')
      .select('*')
      .or(`is_public.eq.true,user_id.eq.${user.id}`)
      .order('artist_name')

    if (error) throw error
    return data || []
  }

  async updateArtistProfile(artistId: string, updates: Partial<ArtistProfile>): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('artist_profiles')
      .update(updates)
      .eq('artist_id', artistId)
      .eq('user_id', user.id)

    if (error) throw error
  }

  async deleteArtistProfile(artistId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('artist_profiles')
      .delete()
      .eq('artist_id', artistId)
      .eq('user_id', user.id)

    if (error) throw error
  }

  /**
   * AI Usage Tracking
   */
  async trackAIUsage(modelId: string, functionType: string, tokensUsed: number, costUsd: number, metadata?: any): Promise<void> {
    if (!supabase) return
    
    const user = await getCurrentUser()
    if (!user) return

    const { error } = await supabase
      .from('ai_usage')
      .insert({
        user_id: user.id,
        model_id: modelId,
        function_type: functionType,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        metadata
      })

    if (error) console.error('Failed to track AI usage:', error)
  }

  /**
   * Templates
   */
  async saveTemplate(template: Omit<UserTemplate, 'id' | 'user_id' | 'created_at'>): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_templates')
      .insert({
        user_id: user.id,
        ...template
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  async getTemplates(templateType?: string): Promise<UserTemplate[]> {
    if (!supabase) return []
    
    const user = await getCurrentUser()
    if (!user) return []

    let query = supabase
      .from('user_templates')
      .select('*')
      .or(`is_public.eq.true,user_id.eq.${user.id}`)

    if (templateType) {
      query = query.eq('template_type', templateType)
    }

    const { data, error } = await query.order('name')

    if (error) throw error
    return data || []
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService()