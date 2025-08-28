import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'auto';
    
    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    console.log(`🎵 Starting simple transcription: ${audioFile.name}`);

    // Upload audio first
    const uploadFormData = new FormData();
    uploadFormData.append('audio', audioFile);
    
    const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload-audio`, {
      method: 'POST',
      body: uploadFormData
    });

    if (!uploadResponse.ok) {
      return NextResponse.json({ error: "Audio upload failed" }, { status: 500 });
    }

    const uploadResult = await uploadResponse.json();
    console.log(`🔗 Audio URL: ${uploadResult.url}`);

    // Try the working model format (like we use for gen4)
    const body = {
      input: {
        audio: uploadResult.url,
        task: "transcribe",
        language: language === 'auto' ? undefined : language
      }
    };

    // Use a simpler, known working model first
    const modelEndpoint = "openai/whisper"; // Try the basic OpenAI model
    
    console.log(`🔄 Testing model: ${modelEndpoint}`);
    
    const response = await fetch(
      `https://api.replicate.com/v1/models/${modelEndpoint}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait"
        },
        body: JSON.stringify(body)
      }
    );

    console.log(`📊 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Transcription failed:`, errorText);
      
      return NextResponse.json({
        error: "Transcription failed",
        status: response.status,
        details: errorText,
        audioUrl: uploadResult.url,
        model: modelEndpoint
      });
    }

    const result = await response.json();
    console.log('✅ Transcription completed');

    // Process result
    let transcribedText = result.output || '';
    if (Array.isArray(result.output)) {
      transcribedText = result.output.join('\n');
    }

    return NextResponse.json({
      success: true,
      model: 'simple-whisper',
      transcription: {
        text: transcribedText,
        lyrics_formatted: transcribedText,
        language: 'detected'
      },
      debug: {
        audioUrl: uploadResult.url,
        modelUsed: modelEndpoint,
        responseStatus: response.status
      }
    });

  } catch (error) {
    console.error('💥 Simple whisper error:', error);
    return NextResponse.json(
      { error: 'Transcription failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}