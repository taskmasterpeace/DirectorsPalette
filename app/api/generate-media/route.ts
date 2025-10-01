import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiToken = process.env.REPLICATE_API_TOKEN!;
    const {
      fileUrl,
      prompt,
      resolution,
      referenceImages,
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
      mode: "seedance";
      seedanceModel: string;
      filename: string;
      lastFrameUrl?: string;
      referenceImages?: string[];
    } = await request.json();

    if (!fileUrl || !prompt) {
      return NextResponse.json(
        { error: "Missing fileUrl or prompt" },
        { status: 400 }
      );
    }

    try {
      const model = seedanceModel === 'seedance-lite' ? 'bytedance/seedance-1-lite' : 'bytedance/seedance-1-pro';
      const settings = {
        image: fileUrl,
        last_frame_image: lastFrameUrl || undefined,
        fps: 24,
        prompt,
        resolution,
        duration,
        camera_fixed,
        reference_images: referenceImages || [],
      };

      // Generate video
      const generateResponse = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
        method: "POST",
        headers: {
          Authorization: `Token ${apiToken}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({ input: settings }),
      });


      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        console.error(`🔴 Video Generation Failed for ${filename}:`, errorText);
        return NextResponse.json({
          status: "failed",
          generatedResponse: { filename, prompt, status: "failed", error: errorText },
        });
      }

      let generateResult = await generateResponse.json();

      do {
        const generateResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${generateResult.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${apiToken}`,
            },
          }
        );
        generateResult = await generateResponse.json();
      } while (!generateResult.error && generateResult.status !== "succeeded" && generateResult.status !== "completed");


      const url = generateResult?.output;
      if (!url) {
        return NextResponse.json({
          status: "failed",
          generatedResponse: {
            filename,
            fileUrl,
            prompt,
            status: "failed",
            error: `No output URL returned. Status: ${generateResult.status}`,
          },
        });
      }

      return NextResponse.json({
        status: "completed",
        generatedResponse: {
          filename,
          fileUrl,
          prompt,
          status: "completed",
          outputUrl: url,
        },
      });
    } catch (error: any) {
      console.error(`🔴 Unexpected error for ${filename}:`, error);
      return NextResponse.json({
        status: "failed",
        generatedResponse: {
          filename,
          fileUrl,
          prompt,
          status: "failed",
          error: error.message || "An unexpected error occurred.",
        },
      });
    }
  } catch (error) {
    console.error("Error in generate-videos POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
