/**
 * Replicate API Client for Post Production
 * Handles image generation using Replicate models
 */

interface ReplicateConfig {
  apiToken: string
  model?: string
  webhook?: string
}

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  input: any
  output?: string[] | string
  error?: string
  logs?: string
  metrics?: {
    predict_time?: number
  }
}

class ReplicateClient {
  private apiToken: string
  private baseUrl = 'https://api.replicate.com/v1'
  // Using FLUX 1.1 Pro for best quality image generation
  private defaultModel = 'black-forest-labs/flux-1.1-pro'
  
  constructor(apiToken: string) {
    this.apiToken = apiToken
  }
  
  /**
   * Create a prediction (start image generation)
   */
  async createPrediction(
    prompt: string,
    model?: string,
    additionalInput?: Record<string, any>
  ): Promise<ReplicatePrediction> {
    const response = await fetch(`${this.baseUrl}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: model || this.defaultModel,
        input: {
          prompt,
          aspect_ratio: additionalInput?.aspect_ratio || '1:1',
          output_format: 'webp',
          output_quality: 80,
          ...additionalInput
        }
      })
    })
    
    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  /**
   * Get prediction status
   */
  async getPrediction(predictionId: string): Promise<ReplicatePrediction> {
    const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${this.apiToken}`,
      }
    })
    
    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  /**
   * Cancel a prediction
   */
  async cancelPrediction(predictionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/predictions/${predictionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiToken}`,
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to cancel prediction: ${response.statusText}`)
    }
  }
  
  /**
   * Poll for prediction completion
   */
  async waitForCompletion(
    predictionId: string,
    onProgress?: (status: string) => void,
    maxAttempts = 60,
    delayMs = 2000
  ): Promise<ReplicatePrediction> {
    let attempts = 0
    
    while (attempts < maxAttempts) {
      const prediction = await this.getPrediction(predictionId)
      
      if (onProgress) {
        onProgress(prediction.status)
      }
      
      if (prediction.status === 'succeeded' || prediction.status === 'failed' || prediction.status === 'canceled') {
        return prediction
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs))
      attempts++
    }
    
    throw new Error('Prediction timed out')
  }
}

/**
 * Create a Replicate client instance
 */
export function createReplicateClient(apiToken?: string): ReplicateClient | null {
  const token = apiToken || process.env.REPLICATE_API_TOKEN
  
  if (!token) {
    console.warn('Replicate API token not found. Image generation will not work.')
    return null
  }
  
  return new ReplicateClient(token)
}

/**
 * Generate image from prompt
 */
export async function generateImage(
  prompt: string,
  onProgress?: (status: string) => void,
  additionalInput?: Record<string, any>
): Promise<string[]> {
  const client = createReplicateClient()
  
  if (!client) {
    throw new Error('Replicate client not initialized. Please add REPLICATE_API_TOKEN to .env.local')
  }
  
  try {
    // Create prediction
    const prediction = await client.createPrediction(prompt, undefined, additionalInput)
    
    // Wait for completion
    const completed = await client.waitForCompletion(
      prediction.id,
      onProgress
    )
    
    if (completed.status === 'failed') {
      throw new Error(completed.error || 'Generation failed')
    }
    
    if (completed.status === 'canceled') {
      throw new Error('Generation was canceled')
    }
    
    // Return output URLs
    if (Array.isArray(completed.output)) {
      return completed.output
    } else if (typeof completed.output === 'string') {
      return [completed.output]
    } else {
      throw new Error('No output received from Replicate')
    }
  } catch (error) {
    console.error('Image generation error:', error)
    throw error
  }
}

/**
 * Available Replicate models for image and video generation
 */
export const REPLICATE_MODELS = {
  // Image generation models
  'flux-1.1-pro': 'black-forest-labs/flux-1.1-pro',
  'flux-pro': 'black-forest-labs/flux-pro',
  'flux-dev': 'black-forest-labs/flux-dev',
  'flux-schnell': 'black-forest-labs/flux-schnell',
  
  // Image editing models
  'flux-kontext-pro': 'black-forest-labs/flux-kontext-pro',
  'flux-kontext-max': 'black-forest-labs/flux-kontext-max',
  
  // Video generation models
  'seedance-1-lite': 'bytedance/seedance-1-lite',
  'seedance-1-pro': 'bytedance/seedance-1-pro',
  
  // Gen4 models
  'gen4-image': 'runwayml/gen4-image',
  'gen4-turbo': 'runwayml/gen4-turbo'
} as const

export type ReplicateModelKey = keyof typeof REPLICATE_MODELS