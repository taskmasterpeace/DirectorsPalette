export interface LocationConfig {
  id: string;
  reference: string;
  name: string;
  description: string;
  purpose: string;
  assignedSections: string[];
}

export interface WardrobeConfig {
  id: string;
  reference: string;
  name: string;
  description: string;
  purpose: string;
  assignedSections: string[];
}

export interface PropConfig {
  id:string;
  reference: string;
  name: string;
  description: string;
  purpose: string;
  assignedSections: string[];
}

export interface Treatment {
  id: string;
  name: string;
  concept: string;
  visualTheme: string;
  performanceRatio: number;
  hookStrategy: string;
}

export interface MusicVideoConfig {
  selectedTreatmentId?: string;
  customTreatment?: Treatment;
  locations: LocationConfig[];
  wardrobe: WardrobeConfig[];
  props: PropConfig[];
  isConfigured: boolean;
}

export interface SavedProject {
  id: string;
  name: string;
  updatedAt: Date;
  isMusicVideoMode: boolean;

  // Story mode data
  story?: string;
  selectedDirector?: string;
  breakdown?: any;
  additionalShots?: { [chapterId: string]: string[] };
  titleCardOptions?: any;
  titleCardApproaches?: string[];
  selectedChapter?: string;
  expandedChapters?: { [chapterId: string]: boolean };

  // Music video mode data
  musicVideoData?: {
    lyrics: string;
    songTitle: string;
    artist: string;
    genre: string;
  };
  musicVideoBreakdown?: any;
  selectedTreatment?: any;
  selectedMusicVideoSection?: string;
  musicVideoConfig?: MusicVideoConfig;
  additionalMusicVideoShots?: { [sectionId:string]: string[] };
  selectedMusicVideoDirector?: string;
  customMusicVideoDirectors?: any[];

  // Shared data
  customDirectors?: any[];
  promptOptions?: any;
}

const DB_NAME = "DirectorStyleDB";
const DB_VERSION = 2;
const STORE_NAME = "projects";

class ProjectDBManager {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    if (typeof window !== 'undefined') {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          console.error("Database error:", request.error);
          reject(new Error("Database error"));
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: "id" });
          }
        };
      });
    } else {
      this.dbPromise = Promise.reject(new Error("IndexedDB is not available on the server."));
    }
  }

  private async getDB(): Promise<IDBDatabase> {
    return this.dbPromise;
  }

  async saveProject(project: Omit<SavedProject, 'id' | 'updatedAt'>): Promise<string> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const id = crypto.randomUUID();
    const projectToSave: SavedProject = {
      ...project,
      id,
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const request = store.add(projectToSave);
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async updateProject(projectId: string, projectData: Partial<SavedProject>): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(projectId);
      getRequest.onsuccess = () => {
        const existingProject = getRequest.result as SavedProject | undefined;
        if (existingProject) {
          const updatedProject: SavedProject = {
            ...existingProject,
            ...projectData,
            updatedAt: new Date(),
            id: projectId,
          };
          const putRequest = store.put(updatedProject);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error(`Project with id ${projectId} not found.`));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getAllProjects(): Promise<SavedProject[]> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const sortedProjects = (request.result as SavedProject[]).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        resolve(sortedProjects);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getProject(projectId: string): Promise<SavedProject | undefined> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(projectId);
      request.onsuccess = () => resolve(request.result as SavedProject | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProject(projectId: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(projectId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Optional helpers if needed elsewhere:
  async exportProject(projectId: string): Promise<{ schema: "director-project"; version: 1; exportedAt: string; project: SavedProject } | null> {
    const project = await this.getProject(projectId)
    if (!project) return null
    return {
      schema: "director-project",
      version: 1,
      exportedAt: new Date().toISOString(),
      project,
    }
  }

  async importProject(data: unknown): Promise<string> {
    const obj = data as any
    let project: SavedProject | undefined
    if (obj?.schema === "director-project" && typeof obj?.version === "number" && obj?.project) {
      project = obj.project as SavedProject
    } else if (obj && obj.name && (obj.isMusicVideoMode === true || obj.isMusicVideoMode === false)) {
      project = obj as SavedProject
    }
    if (!project) {
      throw new Error("Unrecognized project format")
    }

    // Strip id/updatedAt and save new
    const { id: _ignore, updatedAt: _ignore2, ...rest } = project as any
    return await this.saveProject(rest)
  }
}

// Export a single instance
export const projectDB = new ProjectDBManager();
