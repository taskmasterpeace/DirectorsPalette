/**
 * Song DNA Database Management
 * Handles storage, retrieval, and management of analyzed Song DNA patterns
 */

import type { SongDNA } from "./song-dna-types"

export interface StoredSongDNA {
  id: string
  dna: SongDNA
  metadata: {
    title: string
    artist: string
    savedAt: string
    lastModified: string
    tags: string[]
    notes?: string
    version: string
    analysisVersion: string
  }
}

class SongDNADatabase {
  private dbName = "song-dna-db"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error("Failed to open Song DNA database")
        reject(new Error("Failed to open database"))
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create the song DNA store if it doesn't exist
        if (!db.objectStoreNames.contains("songDNA")) {
          const store = db.createObjectStore("songDNA", { keyPath: "id" })
          
          // Create indexes for searching
          store.createIndex("artist", "metadata.artist", { unique: false })
          store.createIndex("title", "metadata.title", { unique: false })
          store.createIndex("savedAt", "metadata.savedAt", { unique: false })
          store.createIndex("tags", "metadata.tags", { unique: false, multiEntry: true })
        }
      }
    })
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    if (!this.db) {
      throw new Error("Database not initialized")
    }
    return this.db
  }

  async save(dna: SongDNA, metadata?: Partial<StoredSongDNA["metadata"]>): Promise<string> {
    const db = await this.ensureDB()
    
    const storedDNA: StoredSongDNA = {
      id: dna.id || `dna_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      dna,
      metadata: {
        title: metadata?.title || dna.reference_song.title || "Untitled",
        artist: metadata?.artist || dna.reference_song.artist || "Unknown",
        savedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: metadata?.tags || [],
        notes: metadata?.notes,
        version: "2.0",
        analysisVersion: dna.analysis_version || "2.0-enhanced",
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["songDNA"], "readwrite")
      const store = transaction.objectStore("songDNA")
      const request = store.put(storedDNA)

      request.onsuccess = () => {
        resolve(storedDNA.id)
      }

      request.onerror = () => {
        reject(new Error("Failed to save Song DNA"))
      }
    })
  }

  async get(id: string): Promise<StoredSongDNA | null> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["songDNA"], "readonly")
      const store = transaction.objectStore("songDNA")
      const request = store.get(id)

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      request.onerror = () => {
        reject(new Error("Failed to retrieve Song DNA"))
      }
    })
  }

  async getAll(): Promise<StoredSongDNA[]> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["songDNA"], "readonly")
      const store = transaction.objectStore("songDNA")
      const request = store.getAll()

      request.onsuccess = () => {
        const results = request.result || []
        // Sort by saved date, newest first
        results.sort((a, b) => 
          new Date(b.metadata.savedAt).getTime() - new Date(a.metadata.savedAt).getTime()
        )
        resolve(results)
      }

      request.onerror = () => {
        reject(new Error("Failed to retrieve Song DNAs"))
      }
    })
  }

  async searchByArtist(artist: string): Promise<StoredSongDNA[]> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["songDNA"], "readonly")
      const store = transaction.objectStore("songDNA")
      const index = store.index("artist")
      const request = index.getAll(artist)

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        reject(new Error("Failed to search by artist"))
      }
    })
  }

  async searchByTag(tag: string): Promise<StoredSongDNA[]> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["songDNA"], "readonly")
      const store = transaction.objectStore("songDNA")
      const index = store.index("tags")
      const request = index.getAll(tag)

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        reject(new Error("Failed to search by tag"))
      }
    })
  }

  async update(id: string, updates: Partial<StoredSongDNA>): Promise<void> {
    const existing = await this.get(id)
    if (!existing) {
      throw new Error("Song DNA not found")
    }

    const updated: StoredSongDNA = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        lastModified: new Date().toISOString(),
      }
    }

    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["songDNA"], "readwrite")
      const store = transaction.objectStore("songDNA")
      const request = store.put(updated)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error("Failed to update Song DNA"))
      }
    })
  }

  async delete(id: string): Promise<void> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["songDNA"], "readwrite")
      const store = transaction.objectStore("songDNA")
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error("Failed to delete Song DNA"))
      }
    })
  }

  async exportDNA(id: string): Promise<string> {
    const stored = await this.get(id)
    if (!stored) {
      throw new Error("Song DNA not found")
    }

    const exportData = {
      version: "2.0",
      exported_at: new Date().toISOString(),
      source: {
        title: stored.metadata.title,
        artist: stored.metadata.artist,
        analyzed_at: stored.metadata.savedAt,
      },
      dna: stored.dna,
      metadata: {
        syllable_pattern: stored.dna.lyrical.syllables_per_line.distribution?.slice(0, 16),
        rhyme_schemes: stored.dna.lyrical.rhyme_schemes,
        flow_type: stored.dna.production_notes,
        tags: stored.metadata.tags,
        notes: stored.metadata.notes,
      }
    }

    return JSON.stringify(exportData, null, 2)
  }

  async importDNA(jsonData: string): Promise<string> {
    try {
      const imported = JSON.parse(jsonData)
      
      // Validate structure
      if (!imported.dna || !imported.version) {
        throw new Error("Invalid DNA format")
      }

      // Create metadata from imported data
      const metadata: Partial<StoredSongDNA["metadata"]> = {
        title: imported.source?.title || imported.dna.reference_song?.title || "Imported",
        artist: imported.source?.artist || imported.dna.reference_song?.artist || "Unknown",
        tags: imported.metadata?.tags || [],
        notes: imported.metadata?.notes || `Imported from ${imported.source?.title || "unknown source"}`,
      }

      // Save the imported DNA
      return await this.save(imported.dna, metadata)
    } catch (error) {
      throw new Error(`Failed to import DNA: ${error instanceof Error ? error.message : "Invalid format"}`)
    }
  }

  async exportAll(): Promise<string> {
    const all = await this.getAll()
    
    const exportData = {
      version: "2.0",
      exported_at: new Date().toISOString(),
      count: all.length,
      dna_collection: all.map(stored => ({
        id: stored.id,
        metadata: stored.metadata,
        dna: stored.dna,
      }))
    }

    return JSON.stringify(exportData, null, 2)
  }

  async clear(): Promise<void> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["songDNA"], "readwrite")
      const store = transaction.objectStore("songDNA")
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error("Failed to clear database"))
      }
    })
  }
}

// Create singleton instance
export const songDNADB = new SongDNADatabase()