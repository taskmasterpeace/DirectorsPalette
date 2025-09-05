/**
 * Qwen-Edit API Integration for Replicate
 * Provides image editing capabilities using Qwen-Image-Edit model
 */

export interface QwenEditRequest {
  image: string // URI of input image
  prompt: string // Text instruction for editing
  seed?: number // Random seed for reproducible results
  go_fast?: boolean // Enable faster processing (default: true)
  aspect_ratio?: string // Image aspect ratio
  output_format?: 'webp' | 'jpg' | 'png' // Output format (default: webp)
  output_quality?: number // Quality 0-100 (default: 95)
}

export interface QwenEditResponse {
  success: boolean
  imageUrls?: string[]
  error?: string
  cost?: number
  processingTime?: number
}

export interface QwenEditResult {
  id: string
  inputImage: string
  prompt: string
  outputImages: string[]
  timestamp: Date
  cost: number
  processingTime: number
}

class QwenEditAPI {
  private readonly baseUrl = 'https://api.replicate.com/v1'
  private readonly model = 'qwen/qwen-image-edit'
  private readonly costPerImage = 0.03

  async editImage(request: QwenEditRequest): Promise<QwenEditResponse> {
    const startTime = Date.now()
    
    try {
      // Validate inputs
      if (!request.image || !request.prompt) {
        return {
          success: false,
          error: 'Both image and prompt are required'
        }
      }

      // Get API key from environment
      const apiKey = process.env.REPLICATE_API_TOKEN
      if (!apiKey) {
        return {
          success: false,
          error: 'Replicate API token not configured'
        }
      }

      // Prepare request payload
      const payload = {
        version: await this.getLatestVersion(),
        input: {
          image: request.image,
          prompt: request.prompt,
          seed: request.seed,
          go_fast: request.go_fast ?? true,
          aspect_ratio: request.aspect_ratio,
          output_format: request.output_format ?? 'webp',
          output_quality: request.output_quality ?? 95
        }
      }

      // Make API request
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: `API request failed: ${errorData.detail || response.statusText}`
        }
      }

      const prediction = await response.json()
      
      // Poll for completion
      const result = await this.pollForCompletion(prediction.id)
      
      if (result.status === 'succeeded') {
        const processingTime = Date.now() - startTime
        
        return {
          success: true,
          imageUrls: Array.isArray(result.output) ? result.output : [result.output],
          cost: this.costPerImage,
          processingTime
        }
      } else {
        return {
          success: false,
          error: result.error || 'Image editing failed'
        }
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private async getLatestVersion(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/models/${this.model}`)
      const model = await response.json()
      return model.latest_version.id
    } catch {
      // Fallback version if fetch fails
      return 'latest'
    }
  }

  private async pollForCompletion(predictionId: string, maxAttempts = 60): Promise<any> {
    const apiKey = process.env.REPLICATE_API_TOKEN
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`
        }
      })
      
      const prediction = await response.json()
      
      if (prediction.status === 'succeeded' || prediction.status === 'failed') {
        return prediction
      }
      
      // Wait before next poll (start with 1s, increase to 2s after 10 attempts)
      const delay = attempt < 10 ? 1000 : 2000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    throw new Error('Prediction timed out')
  }

  // Helper method to validate image format
  validateImageFormat(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    return validTypes.includes(file.type)
  }

  // Helper method to convert file to data URL for API
  async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Common editing prompts for templates
  static readonly EDITING_TEMPLATES = {
    // Text editing
    'change-text': 'Change the text to say "{new_text}"',
    'remove-text': 'Remove all text from the image',
    'add-text': 'Add text that says "{text}" to the image',
    
    // Object editing
    'change-color': 'Change the {object} to {color}',
    'remove-object': 'Remove the {object} from the image',
    'add-object': 'Add a {object} to the image',
    
    // Style changes
    'change-style': 'Change the style to {style}',
    'make-vintage': 'Make the image look vintage and retro',
    'make-modern': 'Make the image look modern and clean',
    
    // Lighting and mood
    'change-lighting': 'Change the lighting to {lighting_type}',
    'make-dramatic': 'Make the lighting more dramatic and cinematic',
    'brighten': 'Make the image brighter and more vibrant'
  }

  // Generate template-based prompt
  generateTemplatePrompt(template: keyof typeof QwenEditAPI.EDITING_TEMPLATES, variables: Record<string, string>): string {
    let prompt = QwenEditAPI.EDITING_TEMPLATES[template]
    
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(`{${key}}`, value)
    })
    
    return prompt
  }
}

// Export singleton instance
export const qwenEditAPI = new QwenEditAPI()
export default qwenEditAPI