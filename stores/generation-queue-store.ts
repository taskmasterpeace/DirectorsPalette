import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GenerationRequest {
  id: string
  type: 'image-edit' | 'gen4-create' | 'video-animate'
  status: 'queued' | 'processing' | 'completed' | 'failed'
  prompt: string
  inputData: any
  result?: any
  error?: string
  createdAt: Date
  completedAt?: Date
  creditsUsed?: number
}

interface QueueState {
  requests: GenerationRequest[]
  isProcessing: boolean
  currentlyProcessing: string | null
  
  // Actions
  addToQueue: (request: Omit<GenerationRequest, 'id' | 'status' | 'createdAt'>) => string
  updateRequest: (id: string, updates: Partial<GenerationRequest>) => void
  removeFromQueue: (id: string) => void
  clearCompleted: () => void
  clearAll: () => void
  
  // Queue processing
  processQueue: () => Promise<void>
  
  // Getters
  getQueuedCount: () => number
  getProcessingCount: () => number
  getCompletedCount: () => number
  getFailedCount: () => number
}

export const useGenerationQueueStore = create<QueueState>()(
  persist(
    (set, get) => ({
      requests: [],
      isProcessing: false,
      currentlyProcessing: null,
      
      addToQueue: (requestData) => {
        const newRequest: GenerationRequest = {
          ...requestData,
          id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'queued',
          createdAt: new Date()
        }
        
        set((state) => ({
          requests: [...state.requests, newRequest]
        }))
        
        // Auto-start processing if not already running
        if (!get().isProcessing) {
          get().processQueue()
        }
        
        return newRequest.id
      },
      
      updateRequest: (id, updates) => {
        set((state) => ({
          requests: state.requests.map(req => 
            req.id === id ? { ...req, ...updates } : req
          )
        }))
      },
      
      removeFromQueue: (id) => {
        set((state) => ({
          requests: state.requests.filter(req => req.id !== id)
        }))
      },
      
      clearCompleted: () => {
        set((state) => ({
          requests: state.requests.filter(req => 
            req.status !== 'completed' && req.status !== 'failed'
          )
        }))
      },
      
      clearAll: () => {
        set({ requests: [], isProcessing: false, currentlyProcessing: null })
      },
      
      processQueue: async () => {
        const state = get()
        if (state.isProcessing) return
        
        set({ isProcessing: true })
        
        try {
          while (true) {
            const queuedRequest = state.requests.find(req => req.status === 'queued')
            if (!queuedRequest) break
            
            set({ currentlyProcessing: queuedRequest.id })
            
            // Update status to processing
            get().updateRequest(queuedRequest.id, { 
              status: 'processing'
            })
            
            try {
              // Process the request based on type
              let result
              switch (queuedRequest.type) {
                case 'image-edit':
                  result = await processImageEdit(queuedRequest)
                  break
                case 'gen4-create':
                  result = await processGen4Creation(queuedRequest)
                  break
                case 'video-animate':
                  result = await processVideoAnimation(queuedRequest)
                  break
                default:
                  throw new Error('Unknown request type')
              }
              
              // Mark as completed with result
              get().updateRequest(queuedRequest.id, {
                status: 'completed',
                result,
                completedAt: new Date()
              })
              
            } catch (error) {
              // Mark as failed with error
              get().updateRequest(queuedRequest.id, {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                completedAt: new Date()
              })
            }
          }
        } finally {
          set({ isProcessing: false, currentlyProcessing: null })
        }
      },
      
      // Getters
      getQueuedCount: () => get().requests.filter(req => req.status === 'queued').length,
      getProcessingCount: () => get().requests.filter(req => req.status === 'processing').length,
      getCompletedCount: () => get().requests.filter(req => req.status === 'completed').length,
      getFailedCount: () => get().requests.filter(req => req.status === 'failed').length,
    }),
    {
      name: 'generation-queue-storage',
      version: 1
    }
  )
)

// Helper functions for different types of processing
async function processImageEdit(request: GenerationRequest) {
  // Implementation for image editing requests
  const response = await fetch('/api/image-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request.inputData)
  })
  
  if (!response.ok) {
    throw new Error(`Image edit failed: ${response.status}`)
  }
  
  return await response.json()
}

async function processGen4Creation(request: GenerationRequest) {
  // Implementation for Gen4 image generation
  const response = await fetch('/post-production/api/gen4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request.inputData)
  })
  
  if (!response.ok) {
    throw new Error(`Gen4 generation failed: ${response.status}`)
  }
  
  return await response.json()
}

async function processVideoAnimation(request: GenerationRequest) {
  // Implementation for video animation requests
  const response = await fetch('/api/video-animate', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request.inputData)
  })
  
  if (!response.ok) {
    throw new Error(`Video animation failed: ${response.status}`)
  }
  
  return await response.json()
}