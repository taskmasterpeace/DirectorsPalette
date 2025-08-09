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
  isConfigured: boolean
}

export interface SavedProject {
  id: string
  name: string
  updatedAt: Date
  isMusicVideoMode: boolean

  // Story mode data
  story?: string
  selectedDirector?: string
  breakdown?: any
  additionalShots?: { [chapterId: string]: string[] }
  titleCardOptions?: any
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
  musicVideoConfig?: MusicVideoConfig
  additionalMusicVideoShots?: { [sectionId: string]: string[] }
  selectedMusicVideoDirector?: string
  customMusicVideoDirectors?: any[]

  // Shared data
  customDirectors?: any[]
  promptOptions?: any

  // Artist data - store the full artist profile with the project
  activeArtist?: {
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
  }
}

const DB_NAME = "DirectorStyleDB"
const DB_VERSION = 3 // Incremented for artist data
const STORE_NAME = "projects"

class ProjectDBManager {
  private dbPromise: Promise<IDBDatabase>

  constructor() {
    // This check ensures that IndexedDB is only accessed in the browser.
    if (typeof window !== "undefined") {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => {
          console.error("Database error:", request.error)
          reject(new Error("Database error"))
        }

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: "id" })
          }
        }
      })
    } else {
      // On the server, create a dummy promise. Methods will throw an error.
      this.dbPromise = Promise.reject(new Error("IndexedDB is not available on the server."))
    }
  }

  private async getDB(): Promise<IDBDatabase> {
    // This will either return the resolved DB promise or the rejected one from the constructor.
    return this.dbPromise
  }

  async saveProject(project: Omit<SavedProject, "id" | "updatedAt">): Promise<string> {
    const db = await this.getDB()
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    const id = crypto.randomUUID()
    const projectToSave: SavedProject = {
      ...project,
      id,
      updatedAt: new Date(),
    }

    return new Promise((resolve, reject) => {
      const request = store.add(projectToSave)
      request.onsuccess = () => resolve(id)
      request.onerror = () => reject(request.error)
    })
  }

  async updateProject(projectId: string, projectData: Partial<SavedProject>): Promise<void> {
    const db = await this.getDB()
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const getRequest = store.get(projectId)
      getRequest.onsuccess = () => {
        const existingProject = getRequest.result
        if (existingProject) {
          const updatedProject = {
            ...existingProject,
            ...projectData,
            updatedAt: new Date(),
            id: projectId,
          }
          const putRequest = store.put(updatedProject)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          reject(new Error(`Project with id ${projectId} not found.`))
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async getAllProjects(): Promise<SavedProject[]> {
    const db = await this.getDB()
    const transaction = db.transaction(STORE_NAME, "readonly")
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const sortedProjects = request.result.sort(
          (a: SavedProject, b: SavedProject) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        resolve(sortedProjects)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteProject(projectId: string): Promise<void> {
    const db = await this.getDB()
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.delete(projectId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Export a single instance. The constructor will run once when the module is imported.
export const projectDB = new ProjectDBManager()
