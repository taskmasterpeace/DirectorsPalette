import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addCorsHeaders, addSecurityHeaders } from '@/lib/middleware/api-middleware'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SeeeDanceRequest {
  prompt: string
  model: 'seedance-lite' | 'seedance-pro'
  duration: number
  resolution: string
  aspect_ratio: string
  camera_fixed: boolean
  input_image?: File
}

interface SeeeDanceResponse {
  success: boolean
  videoUrl?: string
  predictionId?: string
  error?: string
  metadata?: {
    model: string
    duration: number
    resolution: string
    creditsUsed: number
    processingTime?: number
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<SeeeDanceResponse>> {
  try {
    // Check required environment variables
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: "REPLICATE_API_TOKEN is not configured" },
        { status: 500 }
      )
    }

    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      )
    }

    // Verify user and get credits
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Parse form data
    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const model = formData.get('model') as string
    const duration = parseInt(formData.get('duration') as string)
    const resolution = formData.get('resolution') as string
    const aspectRatio = formData.get('aspect_ratio') as string
    const cameraFixed = formData.get('camera_fixed') === 'true'
    const inputImageFile = formData.get('input_image') as File | null

    // Validate inputs
    if (!prompt || prompt.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Prompt must be at least 5 characters' },
        { status: 400 }
      )
    }

    if (!['seedance-lite', 'seedance-pro'].includes(model)) {
      return NextResponse.json(
        { success: false, error: 'Invalid model selection' },
        { status: 400 }
      )
    }

    if (duration < 3 || duration > 12) {
      return NextResponse.json(
        { success: false, error: 'Duration must be between 3 and 12 seconds' },
        { status: 400 }
      )
    }

    // Calculate credits needed
    const creditsPerSecond = model === 'seedance-lite' ? 20 : 40
    const resolutionMultiplier = resolution === '1080p' ? 2 : resolution === '720p' ? 1.5 : 1
    const totalCreditsNeeded = Math.ceil(creditsPerSecond * duration * resolutionMultiplier)

    console.log('🎬 SeeeDance Video Generation Request:', {
      userId,
      model,
      duration,
      resolution,
      aspectRatio,
      creditsNeeded: totalCreditsNeeded,
      hasInputImage: !!inputImageFile
    })

    // Check user credits
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('current_points')
      .eq('user_id', userId)
      .single()

    if (creditsError || !userCredits) {
      return NextResponse.json(
        { success: false, error: 'Unable to verify user credits' },
        { status: 400 }
      )
    }

    if (userCredits.current_points < totalCreditsNeeded) {
      return NextResponse.json(
        { success: false, error: `Insufficient credits. Need ${totalCreditsNeeded}, have ${userCredits.current_points}` },
        { status: 400 }
      )
    }

    console.log('💰 Credits check passed:', userCredits.current_points, 'available,', totalCreditsNeeded, 'needed')

    // Process input image if provided
    let inputImageUrl: string | undefined
    if (inputImageFile) {
      try {
        // Upload input image to temporary storage
        const arrayBuffer = await inputImageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64 = buffer.toString('base64')
        inputImageUrl = `data:${inputImageFile.type};base64,${base64}`
        console.log('📷 Input image processed:', inputImageFile.name, inputImageFile.size, 'bytes')
      } catch (error) {
        console.error('❌ Input image processing failed:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to process input image' },
          { status: 400 }
        )
      }
    }

    // Prepare SeeeDance API request
    const replicateEndpoint = model === 'seedance-lite'
      ? 'bytedance/seedance-1-lite'
      : 'bytedance/seedance-1-lite' // Fallback to lite for now since Pro has limited access

    const requestBody = {
      version: "latest", // Use latest model version
      input: {
        prompt: prompt.trim(),
        duration: duration,
        aspect_ratio: aspectRatio,
        camera_fixed: cameraFixed,
        ...(inputImageUrl && { image: inputImageUrl })
      }
    }

    console.log('🚀 Making SeeeDance API call...', {
      endpoint: replicateEndpoint,
      input: { ...requestBody.input, image: inputImageUrl ? '[base64_data]' : undefined }
    })

    // Make request to Replicate
    const startTime = Date.now()
    const replicateResponse = await fetch(
      `https://api.replicate.com/v1/models/${replicateEndpoint}/predictions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait'
        },
        body: JSON.stringify(requestBody)
      }
    )

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text()
      console.error('❌ Replicate API error:', replicateResponse.status, errorText)
      return NextResponse.json(
        { success: false, error: `Video generation failed: ${replicateResponse.statusText}` },
        { status: 500 }
      )
    }

    const replicateResult = await replicateResponse.json()
    console.log('🎬 Replicate response:', replicateResult.status, replicateResult.id)

    // Handle response based on status
    let finalResult = replicateResult

    // If not completed immediately, poll for completion
    if (replicateResult.status === 'starting' || replicateResult.status === 'processing') {
      console.log('⏳ Polling for completion...')

      const maxPolls = 30 // 30 attempts = 5 minutes max
      let pollCount = 0

      while (pollCount < maxPolls && (finalResult.status === 'starting' || finalResult.status === 'processing')) {
        await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
        pollCount++

        const pollResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${replicateResult.id}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
            }
          }
        )

        if (!pollResponse.ok) {
          throw new Error(`Polling failed: ${pollResponse.status}`)
        }

        finalResult = await pollResponse.json()
        console.log(`🔄 Poll ${pollCount}/${maxPolls}: ${finalResult.status}`)
      }
    }

    if (finalResult.status === 'succeeded' && finalResult.output) {
      const processingTime = Date.now() - startTime
      const videoUrl = Array.isArray(finalResult.output) ? finalResult.output[0] : finalResult.output

      console.log('✅ Video generation completed:', {
        videoUrl,
        processingTime: `${processingTime}ms`,
        creditsUsed: totalCreditsNeeded
      })

      // Deduct credits
      const { error: deductError } = await supabase
        .from('user_credits')
        .update({ current_points: userCredits.current_points - totalCreditsNeeded })
        .eq('user_id', userId)

      if (deductError) {
        console.error('⚠️ Credit deduction failed:', deductError)
      } else {
        console.log('💰 Credits deducted successfully:', totalCreditsNeeded, 'credits')
      }

      // Log usage for tracking
      await supabase.from('usage_log').insert({
        user_id: userId,
        action_type: 'video_generation',
        model_id: model,
        model_name: model,
        points_consumed: totalCreditsNeeded,
        cost_usd: (totalCreditsNeeded * 0.01), // Estimated cost
        function_name: 'seedance_api',
        success: true
      })

      const response = NextResponse.json({
        success: true,
        videoUrl,
        predictionId: finalResult.id,
        metadata: {
          model,
          duration,
          resolution,
          creditsUsed: totalCreditsNeeded,
          processingTime
        }
      })

      return addSecurityHeaders(addCorsHeaders(response))

    } else {
      console.error('❌ Video generation failed:', finalResult.error || finalResult.status)

      const errorResponse = NextResponse.json(
        {
          success: false,
          error: finalResult.error || `Generation failed with status: ${finalResult.status}`,
          predictionId: finalResult.id
        },
        { status: 500 }
      )

      return addSecurityHeaders(addCorsHeaders(errorResponse))
    }

  } catch (error) {
    console.error('❌ SeeeDance API error:', error)

    const errorResponse = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )

    return addSecurityHeaders(addCorsHeaders(errorResponse))
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}