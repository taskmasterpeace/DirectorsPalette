export interface SavedProject {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  
  // Mode selection
  isMusicVideoMode?: boolean
  
  // Story mode data
  story?: string
  selectedDirector: string
  breakdown?: any
  additionalShots?: { [chapterId: string]: string[] }
  titleCardOptions?: {
    enabled: boolean
    format: string
  }
  titleCardApproaches?: string[]
  selectedChapter?: string
  expandedChapters?: { [chapterId: string]: boolean }
  
  // Music video mode data
  musicVideoData?: {
    lyrics: string
    songTitle: string
    artist: string
    genre: string
  }
  musicVideoBreakdown?: any
  selectedTreatment?: any
  selectedMusicVideoSection?: string
  
  // Shared data
  customDirectors?: Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>
  promptOptions?: {
    includeCameraStyle: boolean
    includeColorPalette: boolean
  }
}

class ProjectDatabase {
  private dbName = 'StoryBreakdownProjects'
  private version = 2 // Increment version for music video support
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create projects store if it doesn't exist
        if (!db.objectStoreNames.contains('projects')) {
          const store = db.createObjectStore('projects', { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('updatedAt', 'updatedAt', { unique: false })
          store.createIndex('name', 'name', { unique: false })
        }
      }
    })
  }

  async saveProject(project: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) await this.init()
    
    const id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    
    const fullProject: SavedProject = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readwrite')
      const store = transaction.objectStore('projects')
      const request = store.add(fullProject)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(id)
    })
  }

  async updateProject(id: string, updates: Partial<SavedProject>): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readwrite')
      const store = transaction.objectStore('projects')
      const getRequest = store.get(id)
      
      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const existingProject = getRequest.result
        if (!existingProject) {
          reject(new Error('Project not found'))
          return
        }
        
        const updatedProject = {
          ...existingProject,
          ...updates,
          updatedAt: new Date()
        }
        
        const putRequest = store.put(updatedProject)
        putRequest.onerror = () => reject(putRequest.error)
        putRequest.onsuccess = () => resolve()
      }
    })
  }

  async getProject(id: string): Promise<SavedProject | null> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readonly')
      const store = transaction.objectStore('projects')
      const request = store.get(id)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async getAllProjects(): Promise<SavedProject[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readonly')
      const store = transaction.objectStore('projects')
      const index = store.index('updatedAt')
      const request = index.getAll()
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        // Sort by updatedAt descending (most recent first)
        const projects = request.result.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        resolve(projects)
      }
    })
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readwrite')
      const store = transaction.objectStore('projects')
      const request = store.delete(id)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async searchProjects(query: string): Promise<SavedProject[]> {
    const allProjects = await this.getAllProjects()
    
    return allProjects.filter(project => 
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      (project.story && project.story.toLowerCase().includes(query.toLowerCase())) ||
      (project.musicVideoData?.songTitle && project.musicVideoData.songTitle.toLowerCase().includes(query.toLowerCase())) ||
      (project.musicVideoData?.artist && project.musicVideoData.artist.toLowerCase().includes(query.toLowerCase()))
    )
  }
}

export const projectDB = new ProjectDatabase()
