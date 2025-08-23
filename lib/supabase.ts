// Conditional import for Supabase - only when installed
let createClient: any
try {
  createClient = require('@supabase/supabase-js').createClient
} catch (e) {
  // Fallback when Supabase not installed
  createClient = null
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient && supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database Types
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  type: 'story' | 'music-video' | 'commercial'
  content: any
  created_at: string
  updated_at: string
}

export interface UserTemplate {
  id: string
  user_id: string
  template_type: string
  name: string
  content: any
  is_public: boolean
  created_at: string
}

export interface AIUsage {
  id: string
  user_id: string
  model_id: string
  function_type: string
  tokens_used: number
  cost_usd: number
  created_at: string
}

// Auth helpers
export const getCurrentUser = async () => {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signInWithGoogle = async () => {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export const signOut = async () => {
  if (!supabase) return { error: null }
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Database helpers
export const createUserProfile = async (user: any) => {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url,
      is_admin: user.email === 'taskmasterpeace@gmail.com'
    })
    .select()
    .single()
  
  return { data, error }
}

export const saveProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()
  
  return { data, error }
}

export const getUserProjects = async (userId: string) => {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  
  return { data, error }
}

// Storage helpers
export const uploadImage = async (file: File, bucket: string = 'images') => {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${bucket}/${fileName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) return { data: null, error }

  const { data: publicUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return { data: { ...data, publicUrl: publicUrl.publicUrl }, error: null }
}

export const deleteImage = async (path: string, bucket: string = 'images') => {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  return { data, error }
}