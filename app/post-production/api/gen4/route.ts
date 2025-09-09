import { type NextRequest, NextResponse } from "next/server";
import * as userCreditsModule from '@/lib/credits/user-credits';
const userCreditService = userCreditsModule.userCreditService;
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

    // TEMPORARY: Skip auth check for debugging - use hardcoded admin user
    console.log('🔧 TEMP: Bypassing auth check for debugging');
    const userId = '7cf1a35d-e572-4e39-b4cd-a38d8f10c6d2'; // Taskophilus Tanner from Supabase
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

    // TEMP: Removed credit calculation function for debugging

    // TEMPORARY: Skip credit check for debugging
    console.log('🔧 TEMP: Skipping credit check - assuming sufficient credits');
    const operationCost = 15; // Default cost for debugging
    console.log('💰 TEMP: Operation cost:', operationCost, 'credits');

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
      // TEMPORARY: Skip credit deduction for debugging
      console.log('🔧 TEMP: Skipping credit deduction - image generated successfully');

      return NextResponse.json({
        success: true,
        images: Array.isArray(result.output) ? result.output : [result.output],
        predictionId: result.id,
        referenceCount: reference_images.length,
        creditsUsed: operationCost,
        remainingCredits: 2500 // TEMP: Hardcoded for debugging
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