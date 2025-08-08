// Director Library Database using IndexedDB
const DB_NAME = 'DirectorLibraryDB'
const DB_VERSION = 1
const FILM_STORE = 'filmDirectors'
const MUSIC_STORE = 'musicDirectors'

import type { FilmDirector, MusicVideoDirector } from './director-types'
import { curatedFilmDirectors, curatedMusicVideoDirectors } from './curated-directors'

class DirectorDB {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create film directors store
        if (!db.objectStoreNames.contains(FILM_STORE)) {
          const filmStore = db.createObjectStore(FILM_STORE, { keyPath: 'id' })
          filmStore.createIndex('name', 'name', { unique: false })
          filmStore.createIndex('category', 'category', { unique: false })
        }
        
        // Create music video directors store
        if (!db.objectStoreNames.contains(MUSIC_STORE)) {
          const musicStore = db.createObjectStore(MUSIC_STORE, { keyPath: 'id' })
          musicStore.createIndex('name', 'name', { unique: false })
          musicStore.createIndex('category', 'category', { unique: false })
        }
      }
    })
  }

  async ensureSeeded(): Promise<void> {
    if (!this.db) await this.init()
    
    // Check if we already have curated data
    const filmCount = await this.countFilm()
    const musicCount = await this.countMusic()
    
    if (filmCount === 0) {
      await this.bulkUpsertFilm(curatedFilmDirectors)
    }
    
    if (musicCount === 0) {
      await this.bulkUpsertMusic(curatedMusicVideoDirectors)
    }
  }

  private async countFilm(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized')
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILM_STORE], 'readonly')
      const store = transaction.objectStore(FILM_STORE)
      const request = store.count()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  private async countMusic(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized')
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MUSIC_STORE], 'readonly')
      const store = transaction.objectStore(MUSIC_STORE)
      const request = store.count()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllFilm(): Promise<FilmDirector[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILM_STORE], 'readonly')
      const store = transaction.objectStore(FILM_STORE)
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllMusic(): Promise<MusicVideoDirector[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MUSIC_STORE], 'readonly')
      const store = transaction.objectStore(MUSIC_STORE)
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getFilmById(id: string): Promise<FilmDirector | undefined> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILM_STORE], 'readonly')
      const store = transaction.objectStore(FILM_STORE)
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getMusicById(id: string): Promise<MusicVideoDirector | undefined> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MUSIC_STORE], 'readonly')
      const store = transaction.objectStore(MUSIC_STORE)
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async upsertFilm(director: FilmDirector): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILM_STORE], 'readwrite')
      const store = transaction.objectStore(FILM_STORE)
      const request = store.put(director)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async upsertMusic(director: MusicVideoDirector): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MUSIC_STORE], 'readwrite')
      const store = transaction.objectStore(MUSIC_STORE)
      const request = store.put(director)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async bulkUpsertFilm(directors: FilmDirector[]): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILM_STORE], 'readwrite')
      const store = transaction.objectStore(FILM_STORE)
      
      let completed = 0
      const total = directors.length
      
      if (total === 0) {
        resolve()
        return
      }
      
      directors.forEach(director => {
        const request = store.put(director)
        request.onsuccess = () => {
          completed++
          if (completed === total) resolve()
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  async bulkUpsertMusic(directors: MusicVideoDirector[]): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MUSIC_STORE], 'readwrite')
      const store = transaction.objectStore(MUSIC_STORE)
      
      let completed = 0
      const total = directors.length
      
      if (total === 0) {
        resolve()
        return
      }
      
      directors.forEach(director => {
        const request = store.put(director)
        request.onsuccess = () => {
          completed++
          if (completed === total) resolve()
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  async deleteFilm(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILM_STORE], 'readwrite')
      const store = transaction.objectStore(FILM_STORE)
      const request = store.delete(id)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteMusic(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MUSIC_STORE], 'readwrite')
      const store = transaction.objectStore(MUSIC_STORE)
      const request = store.delete(id)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async searchFilm(query: string): Promise<FilmDirector[]> {
    const all = await this.getAllFilm()
    const lowerQuery = query.toLowerCase()
    
    return all.filter(director => 
      director.name.toLowerCase().includes(lowerQuery) ||
      director.description.toLowerCase().includes(lowerQuery) ||
      director.visualLanguage?.toLowerCase().includes(lowerQuery) ||
      director.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  async searchMusic(query: string): Promise<MusicVideoDirector[]> {
    const all = await this.getAllMusic()
    const lowerQuery = query.toLowerCase()
    
    return all.filter(director => 
      director.name.toLowerCase().includes(lowerQuery) ||
      director.description.toLowerCase().includes(lowerQuery) ||
      director.visualHallmarks.toLowerCase().includes(lowerQuery) ||
      director.genres.some(genre => genre.toLowerCase().includes(lowerQuery)) ||
      director.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  async getFilmByCategory(category: string): Promise<FilmDirector[]> {
    const all = await this.getAllFilm()
    return all.filter(director => director.category === category)
  }

  async getMusicByCategory(category: string): Promise<MusicVideoDirector[]> {
    const all = await this.getAllMusic()
    return all.filter(director => director.category === category)
  }

  async exportData(): Promise<{ film: FilmDirector[], music: MusicVideoDirector[] }> {
    const [film, music] = await Promise.all([
      this.getAllFilm(),
      this.getAllMusic()
    ])
    
    return { film, music }
  }

  async importData(data: { film?: FilmDirector[], music?: MusicVideoDirector[] }): Promise<void> {
    const promises = []
    
    if (data.film) {
      promises.push(this.bulkUpsertFilm(data.film))
    }
    
    if (data.music) {
      promises.push(this.bulkUpsertMusic(data.music))
    }
    
    await Promise.all(promises)
  }
}

export const directorDB = new DirectorDB()
