import { type NextRequest, NextResponse } from "next/server";
import { userCreditService } from '@/lib/credits/user-credits';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for auth verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not configured" },
        { status: 500 }
      );
    }
    const apiKey = process.env.REPLICATE_API_TOKEN;

    // Extract user token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const userId = user.id;
    const {
      prompt,
      aspect_ratio,
      resolution,
      reference_tags,
      reference_images,
      seed,
      model = 'nano-banana'
    }: {
      prompt: string;
      aspect_ratio: string;
      resolution: string;
      reference_tags: string[];
      reference_images: string[];
      seed?: number;
      model?: 'gen4-image' | 'gen4-image-turbo' | 'nano-banana';
    } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    if (!reference_images || reference_images.length === 0) {
      return NextResponse.json(
        { error: "At least one reference image is required" },
        { status: 400 }
      );
    }

    // Credit calculation based on model and settings
    const getOperationCost = (model: string, resolution: string) => {
      const baseCosts = {
        'nano-banana': 25,
        'gen4-image': 50, 
        'gen4-image-turbo': 75
      };
      
      const resolutionMultiplier = {
        '720p': 1,
        '1080p': 1.5,
        '4K': 2.5
      };
      
      const base = baseCosts[model as keyof typeof baseCosts] || 25;
      const multiplier = resolutionMultiplier[resolution as keyof typeof resolutionMultiplier] || 1;
      
      return Math.ceil(base * multiplier);
    };

    const operationCost = getOperationCost(model, resolution);

    // Check user credits before processing
    const userCredits = await userCreditService.getUserCredits(userId);
    if (!userCredits) {
      return NextResponse.json(
        { error: "Unable to verify user credits" },
        { status: 500 }
      );
    }

    if (userCredits.current_points < operationCost) {
      return NextResponse.json(
        { 
          error: "Insufficient credits",
          required: operationCost,
          available: userCredits.current_points,
          shortfall: operationCost - userCredits.current_points
        },
        { status: 402 } // Payment Required
      );
    }

    // Model-specific parameter mapping
    let body: any;
    let modelEndpoint: string;

    if (model === 'nano-banana') {
      // Nano-banana format
      body = {
        input: {
          prompt: prompt,
          image_input: reference_images, // maps from reference_images
          output_format: "png"
          // Note: nano-banana doesn't support reference_tags, aspect_ratio, or seed
        }
      };
      modelEndpoint = 'google/nano-banana';
    } else {
      // Gen4 format (backward compatibility)
      body = {
        input: {
          prompt: prompt,
          seed: seed || undefined,
          aspect_ratio: aspect_ratio || "16:9", 
          resolution: resolution || "720p",
          reference_images: reference_images,
          reference_tags: reference_tags,
        }
      };
      modelEndpoint = model === 'gen4-image-turbo' 
        ? 'runwayml/gen4-image-turbo'
        : 'runwayml/gen4-image';
    }
      
    const generateResponse = await fetch(
      `https://api.replicate.com/v1/models/${modelEndpoint}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify(body),
      }
    );

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error(
        `🔴 Gen 4 Generation Failed: Status ${generateResponse.status}`,
        errorText
      );
      return NextResponse.json(
        { error: "Failed to create prediction" },
        { status: generateResponse.status }
      );
    }

    const prediction = await generateResponse.json();
    let result = prediction;
    
    // Poll for completion if still processing
    while (result.status === "starting" || result.status === "processing") {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      
      if (!pollResponse.ok) {
        throw new Error(`Polling failed: ${pollResponse.status}`);
      }
      
      result = await pollResponse.json();
    }

    if (result.status === "succeeded") {
      // Deduct credits after successful generation
      const deductionResult = await userCreditService.deductPoints(
        userId,
        operationCost,
        'image_generation',
        model,
        `${model} (${resolution})`,
        operationCost * 0.001, // Approximate USD cost
        'gen4_api',
        0 // tokens not applicable for image generation
      );

      if (!deductionResult.success) {
        console.error('❌ Failed to deduct credits after successful generation:', deductionResult.error);
        // Continue anyway since generation succeeded
      }

      return NextResponse.json({
        success: true,
        images: Array.isArray(result.output) ? result.output : [result.output],
        predictionId: result.id,
        referenceCount: reference_images.length,
        creditsUsed: operationCost,
        remainingCredits: deductionResult.remainingPoints || userCredits.current_points - operationCost
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Generation failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Gen 4 generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}