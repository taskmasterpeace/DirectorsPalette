import { dbManager } from './indexeddb';

interface QueueItem {
  id: string;
  url: string;
  filename: string;
  retries: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  timestamp: number;
}

class DownloadQueueManager {
  private queue: Map<string, QueueItem> = new Map();
  private isProcessing = false;
  private maxRetries = 3;
  private downloadedVideos: Map<string, string> = new Map(); // id -> blob URL

  constructor() {
    // Initialize from IndexedDB
    this.loadCachedVideos();
  }

  private async loadCachedVideos() {
    try {
      const cached = await this.getCachedVideos();
      cached.forEach(item => {
        this.downloadedVideos.set(item.id, item.blobUrl);
      });
    } catch (error) {
      console.error('Failed to load cached videos:', error);
    }
  }

  async addToQueue(id: string, url: string, filename: string) {
    // Check if already downloaded
    if (this.downloadedVideos.has(id)) {
      console.log(`Video ${id} already cached`);
      return this.downloadedVideos.get(id);
    }

    // Check if already in queue
    if (this.queue.has(id)) {
      console.log(`Video ${id} already in queue`);
      return;
    }

    const item: QueueItem = {
      id,
      url,
      filename,
      retries: 0,
      status: 'pending',
      timestamp: Date.now()
    };

    this.queue.set(id, item);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.size > 0) {
      const pending = Array.from(this.queue.values())
        .filter(item => item.status === 'pending')
        .sort((a, b) => a.timestamp - b.timestamp);

      if (pending.length === 0) break;

      const item = pending[0];
      await this.downloadItem(item);
    }

    this.isProcessing = false;
  }

  private async downloadItem(item: QueueItem) {
    item.status = 'downloading';
    this.queue.set(item.id, item);

    try {
      console.log(`Downloading video ${item.id} from ${item.url}`);
      
      const response = await fetch(item.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Save to IndexedDB
      await this.saveCachedVideo(item.id, blobUrl, blob);

      // Update local cache
      this.downloadedVideos.set(item.id, blobUrl);

      item.status = 'completed';
      this.queue.delete(item.id);

      console.log(`Successfully downloaded and cached video ${item.id}`);
      return blobUrl;
    } catch (error) {
      console.error(`Failed to download video ${item.id}:`, error);
      
      item.retries++;
      if (item.retries >= this.maxRetries) {
        item.status = 'failed';
        this.queue.delete(item.id);
        console.error(`Max retries reached for video ${item.id}`);
      } else {
        item.status = 'pending';
        item.timestamp = Date.now() + (item.retries * 5000); // Exponential backoff
        console.log(`Retrying download for video ${item.id} (attempt ${item.retries + 1})`);
      }
    }
  }

  getCachedUrl(id: string): string | undefined {
    return this.downloadedVideos.get(id);
  }

  async clearCache() {
    // Revoke all blob URLs
    this.downloadedVideos.forEach(blobUrl => {
      URL.revokeObjectURL(blobUrl);
    });
    this.downloadedVideos.clear();
    
    // Clear from IndexedDB
    await this.clearCachedVideos();
  }

  // IndexedDB operations
  private async saveCachedVideo(id: string, blobUrl: string, blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('seedance-generator', 3);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cachedVideos'], 'readwrite');
        const store = transaction.objectStore('cachedVideos');
        
        const data = {
          id,
          blobUrl,
          blob,
          timestamp: Date.now()
        };
        
        const putRequest = store.put(data);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async getCachedVideos(): Promise<Array<{id: string, blobUrl: string}>> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('seedance-generator', 3);
      
      request.onsuccess = () => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains('cachedVideos')) {
          resolve([]);
          return;
        }
        
        const transaction = db.transaction(['cachedVideos'], 'readonly');
        const store = transaction.objectStore('cachedVideos');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const results = getAllRequest.result || [];
          const videos = results.map(item => ({
            id: item.id,
            blobUrl: URL.createObjectURL(item.blob)
          }));
          resolve(videos);
        };
        
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async clearCachedVideos(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('seedance-generator', 3);
      
      request.onsuccess = () => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains('cachedVideos')) {
          resolve();
          return;
        }
        
        const transaction = db.transaction(['cachedVideos'], 'readwrite');
        const store = transaction.objectStore('cachedVideos');
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

export const downloadQueue = new DownloadQueueManager();