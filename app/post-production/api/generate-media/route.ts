import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiToken = process.env.REPLICATE_API_TOKEN!;
    const {
      fileUrl,
      prompt,
      resolution,
      duration,
      camera_fixed,
      mode,
      seedanceModel,
      filename,
      lastFrameUrl,
    }: {
      fileUrl: string;
      prompt: string;
      resolution: string;
      duration: number;
      camera_fixed: boolean;
      mode: "seedance" | "kontext";
      seedanceModel: string;
      filename: string;
      lastFrameUrl?: string;
    } = await request.json();

    if (!fileUrl || !prompt) {
      return NextResponse.json(
        { error: "Missing fileUrl or prompt" },
        { status: 400 }
      );
    }

    // Generate media
    const { model, settings } =
      mode === "seedance"
        ? {
            model: `bytedance/${seedanceModel}`,
            settings: (
              imageUrl: string,
              promptText: string,
              lastFrame?: string
            ) => ({
              image: imageUrl,
              last_frame_image: lastFrame || undefined,
              fps: 24,
              prompt: promptText,
              resolution,
              duration,
              camera_fixed,
            }),
          }
        : {
            model: "black-forest-labs/flux-kontext-pro",
            settings: (imageUrl: string, promptText: string) => ({
              input_image: imageUrl,
              prompt: promptText,
              aspect_ratio: "16:9", // You might want to make this configurable
              safety_tolerance: 2,
            }),
          };
    try {
      const generateResponse = await fetch(
        `https://api.replicate.com/v1/models/${model}/predictions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
            Prefer: "wait",
          },
          body: JSON.stringify({
            input: mode === "seedance" ? settings(fileUrl, prompt, lastFrameUrl) : settings(fileUrl, prompt),
          }),
        }
      );

      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        console.error(
          `🔴 Media Generation Failed for ${filename}: Status ${generateResponse.status}`,
          errorText
        );
        return NextResponse.json({
          status: "failed",
          generatedResponse: {
            filename,
            prompt,
            status: "failed",
            error: `Media generation failed: ${generateResponse.status}`,
          },
        });
      }

      let generateResult = await generateResponse.json();

      // Poll for completion if still processing
      while (generateResult.status === "starting" || generateResult.status === "processing") {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const pollResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${generateResult.id}`,
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
            },
          }
        );
        
        if (!pollResponse.ok) {
          throw new Error(`Polling failed: ${pollResponse.status}`);
        }
        
        generateResult = await pollResponse.json();
      }

      if (generateResult.status === "succeeded") {
        return NextResponse.json({
          status: "succeeded",
          generatedResponse: {
            filename,
            prompt,
            status: "completed",
            outputUrl: Array.isArray(generateResult.output) 
              ? generateResult.output[0] 
              : generateResult.output,
            fileUrl,
          },
        });
      } else {
        return NextResponse.json({
          status: "failed",
          generatedResponse: {
            filename,
            prompt,
            status: "failed",
            error: generateResult.error || "Generation failed",
          },
        });
      }
    } catch (error) {
      console.error("Error during media generation:", error);
      return NextResponse.json({
        status: "failed",
        generatedResponse: {
          filename,
          prompt,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}