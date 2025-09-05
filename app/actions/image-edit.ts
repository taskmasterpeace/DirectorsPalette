'use server'

interface EditImageRequest {
  imageData: string // Base64 data URL
  prompt: string
  apiKey?: string // Optional API key from client
}

interface EditImageResponse {
  success: boolean
  imageUrl?: string
  error?: string
}

export async function editImageWithQwen(request: EditImageRequest): Promise<EditImageResponse> {
  try {
    const { imageData, prompt, apiKey: clientApiKey } = request
    
    if (!imageData || !prompt.trim()) {
      return {
        success: false,
        error: 'Both image and prompt are required'
      }
    }

    // Get Replicate API token (client-provided or environment)
    const apiKey = clientApiKey || process.env.REPLICATE_API_TOKEN
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Replicate API token not configured. Please add your API token in Settings.'
      }
    }

    // Create prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'qwen/qwen-image-edit',
        input: {
          image: imageData,
          prompt: prompt.trim(),
          go_fast: true,
          output_format: 'webp',
          output_quality: 95
        }
      })
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
    let attempts = 0
    const maxAttempts = 30 // 30 seconds max
    
    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${apiKey}`
        }
      })
      
      const statusData = await statusResponse.json()
      
      if (statusData.status === 'succeeded') {
        const imageUrl = Array.isArray(statusData.output) ? statusData.output[0] : statusData.output
        return {
          success: true,
          imageUrl
        }
      }
      
      if (statusData.status === 'failed') {
        return {
          success: false,
          error: statusData.error || 'Image editing failed'
        }
      }
      
      // Wait 1 second before next check
      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    }
    
    return {
      success: false,
      error: 'Image editing timed out'
    }
    
  } catch (error) {
    console.error('Image editing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}