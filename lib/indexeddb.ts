// IndexedDB utilities for project management
export interface SavedProject {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  story: string
  selectedDirector: string
  breakdown: any
  additionalShots: { [chapterId: string]: string[] }
  titleCardOptions: {
    enabled: boolean
    format: string
  }
  titleCardApproaches: string[]
  customDirectors: Array<{
    id: string
    name: string
    description: string
    visualStyle: string
    cameraStyle: string
    colorPalette: string
    narrativeFocus: string
  }>
  promptOptions: {
    includeCameraStyle: boolean
    includeColorPalette: boolean
  }
  selectedChapter: string
  expandedChapters: { [chapterId: string]: boolean }
}

class ProjectDB {
  private dbName = 'StoryBreakdownProjects'
  private version = 1
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
        
        // Create projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
          projectStore.createIndex('name', 'name', { unique: false })
          projectStore.createIndex('createdAt', 'createdAt', { unique: false })
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        }
      }
    })
  }

  async saveProject(project: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) await this.init()

    const id = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    
    const savedProject: SavedProject = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readwrite')
      const store = transaction.objectStore('projects')
      const request = store.add(savedProject)

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

  async exportProject(id: string): Promise<string> {
    const project = await this.getProject(id)
    if (!project) throw new Error('Project not found')

    // Create a clean export format
    const exportData = {
      projectName: project.name,
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        story: project.story,
        selectedDirector: project.selectedDirector,
        breakdown: project.breakdown,
        additionalShots: project.additionalShots,
        titleCardOptions: project.titleCardOptions,
        titleCardApproaches: project.titleCardApproaches,
        customDirectors: project.customDirectors,
        promptOptions: project.promptOptions,
        selectedChapter: project.selectedChapter,
        expandedChapters: project.expandedChapters
      }
    }

    return JSON.stringify(exportData, null, 2)
  }

  async importProject(jsonData: string, projectName?: string): Promise<string> {
    try {
      const importData = JSON.parse(jsonData)
      
      // Validate import data structure
      if (!importData.data || !importData.data.story) {
        throw new Error('Invalid project file format')
      }

      const project = {
        name: projectName || importData.projectName || `Imported Project ${new Date().toLocaleDateString()}`,
        story: importData.data.story,
        selectedDirector: importData.data.selectedDirector || 'none',
        breakdown: importData.data.breakdown || null,
        additionalShots: importData.data.additionalShots || {},
        titleCardOptions: importData.data.titleCardOptions || { enabled: false, format: 'full' },
        titleCardApproaches: importData.data.titleCardApproaches || ['character-focus', 'location-focus', 'abstract-thematic'],
        customDirectors: importData.data.customDirectors || [],
        promptOptions: importData.data.promptOptions || { includeCameraStyle: true, includeColorPalette: true },
        selectedChapter: importData.data.selectedChapter || '',
        expandedChapters: importData.data.expandedChapters || {}
      }

      return await this.saveProject(project)
    } catch (error) {
      throw new Error(`Failed to import project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const projectDB = new ProjectDB()
