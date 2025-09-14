import { type NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { calculateUserCredits, getModelInfo } from '@/lib/credits/model-costs';
import { parseDynamicPrompt } from '@/lib/dynamic-prompting';
import { parseWildCardPrompt } from '@/lib/wildcards/parser';
import { withApiAuth, addCorsHeaders, addSecurityHeaders } from '@/lib/middleware/api-middleware';
import { downloadAndSaveImage, type ImageMetadata } from '@/lib/storage/image-persistence';
// import { WildCardStorage } from '@/lib/wildcards/storage'; // Disabled for server-side

// Initialize Supabase client for auth verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function handleGen4Request(request: NextRequest, context: { apiKey: any }) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not configured" },
        { status: 500 }
      );
    }
    const apiKey = process.env.REPLICATE_API_TOKEN;

    // Get user from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    // Verify the token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = user.id;
    const {
      prompt,
      aspect_ratio,
      resolution,
      reference_tags,
      reference_images,
      seed,
      model = 'nano-banana',
      max_images,
      custom_width,
      custom_height,
      sequential_generation
    }: {
      prompt: string;
      aspect_ratio: string;
      resolution: string;
      reference_tags: string[];
      reference_images: string[];
      seed?: number;
      model?: 'gen4-image' | 'gen4-image-turbo' | 'nano-banana' | 'seedream-4';
      max_images?: number;
      custom_width?: number;
      custom_height?: number;
      sequential_generation?: boolean;
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

    // Parse dynamic prompts (bracket notation) AND wild cards  
    let promptResult = parseDynamicPrompt(prompt);
    let isDynamicPrompt = promptResult.hasBrackets && promptResult.isValid;
    
    // If no brackets, check for wild cards (temporary mock for server-side)
    if (!isDynamicPrompt) {
      // TODO: Replace with database lookup when tables are ready
      const mockWildCards = [
        {
          id: 'temp_locations',
          user_id: userId,
          name: 'locations',
          category: 'locations',
          content: 'in a mystical forest\non a busy city street\nat the edge of a cliff\ninside an ancient library\non a spaceship bridge',
          description: 'Diverse locations for story settings',
          is_shared: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      const wildCardResult = parseWildCardPrompt(prompt, mockWildCards);
      
      if (wildCardResult.hasWildCards && wildCardResult.isValid) {
        promptResult = {
          isValid: wildCardResult.isValid,
          hasBrackets: false,
          hasWildCards: true,
          expandedPrompts: wildCardResult.expandedPrompts,
          originalPrompt: prompt,
          wildCardNames: wildCardResult.wildCardNames,
          previewCount: wildCardResult.expandedPrompts.length,
          totalCount: wildCardResult.totalCombinations,
          warnings: wildCardResult.warnings,
          isCrossCombination: wildCardResult.crossCombination
        };
        isDynamicPrompt = true;
      }
    }
    
    const actualImageCount = isDynamicPrompt ? promptResult.expandedPrompts.length : (max_images || 1);
    
    // Calculate actual credits needed (with profit markup)
    const creditsNeeded = calculateUserCredits(model, actualImageCount);
    console.log('💰 Credits needed:', creditsNeeded, 'for model:', model, 'images:', actualImageCount);
    
    if (isDynamicPrompt) {
      if (promptResult.hasBrackets) {
        console.log('🔄 Dynamic prompt detected (brackets):', promptResult.expandedPrompts.length, 'variations');
      } else if (promptResult.hasWildCards) {
        console.log('🃏 Wild card prompt detected:', promptResult.expandedPrompts.length, 'variations');
        console.log('🎯 Wild cards used:', promptResult.wildCardNames);
      }
      console.log('📝 Expanded prompts:', promptResult.expandedPrompts);
    }

    // Check user has sufficient credits (direct database query)
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('current_points')
      .eq('user_id', userId)
      .single();

    if (creditsError || !userCredits) {
      // Try to initialize credits for new user
      const { error: initError } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          current_points: 2500,
          monthly_allocation: 2500,
          tier: 'pro',
          total_purchased_points: 0
        });
      
      if (initError) {
        console.error('❌ Failed to initialize user credits:', initError);
        return NextResponse.json({ error: 'Unable to verify credits' }, { status: 500 });
      }
      
      // Set initial credits after creation
      const userCredits = { current_points: 2500 };
    }

    if (userCredits.current_points < creditsNeeded) {
      return NextResponse.json({ 
        error: 'Insufficient credits', 
        required: creditsNeeded,
        available: userCredits.current_points
      }, { status: 402 });
    }

    console.log('✅ Credit check passed:', userCredits.current_points, 'available,', creditsNeeded, 'needed');

    // Handle dynamic prompts - generate each variation
    const promptsToGenerate = isDynamicPrompt ? promptResult.expandedPrompts : [prompt];
    const allGeneratedImages: string[] = [];
    
    console.log(`🎯 Processing ${promptsToGenerate.length} prompt${promptsToGenerate.length > 1 ? 's' : ''}`);

    // Generate images for each prompt variation
    for (let promptIndex = 0; promptIndex < promptsToGenerate.length; promptIndex++) {
      const currentPrompt = promptsToGenerate[promptIndex];
      console.log(`🔄 Generating image ${promptIndex + 1}/${promptsToGenerate.length}: "${currentPrompt}"`);

    // Model-specific parameter mapping
    let body: any;
    let modelEndpoint: string;

    if (model === 'nano-banana') {
      // Nano-banana format
      body = {
        input: {
          prompt: currentPrompt,
          image_input: reference_images, // maps from reference_images
          output_format: "png"
          // Note: nano-banana doesn't support reference_tags, aspect_ratio, or seed
        }
      };
      modelEndpoint = 'google/nano-banana';
    } else if (model === 'seedream-4') {
      // Seedream-4 format
      body = {
        input: {
          prompt: currentPrompt,
          size: resolution === 'custom' ? 'custom' : resolution, // 1K, 2K, 4K, or custom
          ...(resolution === 'custom' && {
            width: custom_width || 2048,
            height: custom_height || 2048
          }),
          aspect_ratio: aspect_ratio || "16:9",
          max_images: max_images || 1, // 1-15 range
          image_input: reference_images, // 1-10 reference images
          sequential_image_generation: sequential_generation ? 'auto' : 'disabled'
        }
      };
      modelEndpoint = 'bytedance/seedream-4';
    } else {
      // Gen4 format (backward compatibility)
      body = {
        input: {
          prompt: currentPrompt,
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
      // Collect images from this generation with prompt mapping
      const images = Array.isArray(result.output) ? result.output : [result.output];

      console.log(`✅ Generated ${images.length} image(s) for prompt ${promptIndex + 1}`);
      console.log('📥 Starting automatic download and permanent storage...');

      // Download and save each image to permanent storage
      for (const imageUrl of images) {
        try {
          const imageMetadata: ImageMetadata = {
            prompt: currentPrompt,
            model: model,
            source: 'shot-creator',
            settings: {
              aspectRatio: aspect_ratio || '16:9',
              resolution: resolution || '1080p',
              seed: seed
            },
            creditsUsed: calculateUserCredits(model, 1),
            originalPrompt: prompt,
            variationIndex: promptIndex + 1
          };

          // Download from Replicate and save to Supabase Storage
          const downloadResult = await downloadAndSaveImage(imageUrl, userId, imageMetadata);

          if (downloadResult.success && downloadResult.permanentUrl) {
            // Use permanent URL instead of temporary Replicate URL
            allGeneratedImages.push({
              url: downloadResult.permanentUrl, // PERMANENT URL
              prompt: currentPrompt,
              variationIndex: promptIndex + 1,
              originalPrompt: prompt,
              isPermanent: true, // Flag to indicate this is permanent storage
              temporaryUrl: imageUrl, // Keep reference to original for debugging
              storagePath: downloadResult.storagePath,
              fileSize: downloadResult.fileSize
            });
            console.log('✅ Image permanently saved:', downloadResult.permanentUrl);
          } else {
            // Fallback to temporary URL with warning
            console.warn('⚠️ Failed to save permanently, using temporary URL:', downloadResult.error);
            allGeneratedImages.push({
              url: imageUrl, // Temporary fallback
              prompt: currentPrompt,
              variationIndex: promptIndex + 1,
              originalPrompt: prompt,
              isPermanent: false, // Flag as temporary
              error: downloadResult.error
            });
          }
        } catch (error) {
          console.error('❌ Image persistence failed for:', imageUrl, error);
          // Fallback to temporary URL
          allGeneratedImages.push({
            url: imageUrl,
            prompt: currentPrompt,
            variationIndex: promptIndex + 1,
            originalPrompt: prompt,
            isPermanent: false,
            error: error instanceof Error ? error.message : 'Storage failed'
          });
        }
      }
    } else {
      console.error(`❌ Generation failed for prompt ${promptIndex + 1}:`, result.error || result.status);
    }
    
    } // End of for loop

    // Check if any images were generated successfully
    if (allGeneratedImages.length === 0) {
      return NextResponse.json(
        { error: "No images generated successfully" },
        { status: 500 }
      );
    }

    // Deduct credits after all successful generations (direct database operation)
    const totalCreditsToDeduct = calculateUserCredits(model, allGeneratedImages.length);
    const { data: updatedCredits, error: deductError } = await supabase
      .from('user_credits')
      .update({ current_points: userCredits.current_points - totalCreditsToDeduct })
      .eq('user_id', userId)
      .select('current_points')
      .single();

    if (deductError) {
      console.error('⚠️ Credit deduction failed:', deductError);
      // Still return success since images were generated
    } else {
      console.log('✅ Credits deducted successfully:', totalCreditsToDeduct, 'credits. New balance:', updatedCredits?.current_points);
    }

    // Log usage for tracking
    const modelInfo = getModelInfo(model);
    await supabase.from('usage_log').insert({
      user_id: userId,
      action_type: isDynamicPrompt ? 'dynamic_image_generation' : 'image_generation',
      model_id: model,
      model_name: model,
      points_consumed: totalCreditsToDeduct,
      cost_usd: modelInfo.apiCost * allGeneratedImages.length,
      function_name: 'gen4_api',
      success: true
    });

    return NextResponse.json({
      success: true,
      images: allGeneratedImages,
      originalPrompt: prompt,
      expandedPrompts: promptsToGenerate,
      isDynamic: isDynamicPrompt,
      isWildCard: isDynamicPrompt && promptResult.hasWildCards,
      promptVariations: isDynamicPrompt ? promptsToGenerate.length : 1,
      referenceCount: reference_images.length,
      creditsUsed: totalCreditsToDeduct,
      remainingCredits: updatedCredits?.current_points || userCredits.current_points - totalCreditsToDeduct
    });
  } catch (error) {
    console.error("Gen 4 generation error:", error);
    const errorResponse = NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
    return addSecurityHeaders(addCorsHeaders(errorResponse));
  }
}

// Temporarily use direct export for internal frontend calls
// TODO: Implement proper API key system for external access
export const POST = handleGen4Request

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}