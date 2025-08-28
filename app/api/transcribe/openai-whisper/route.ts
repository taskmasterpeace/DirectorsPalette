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

    // Validate audio file
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
      'audio/ogg', 'audio/webm', 'video/mp4'
    ];
    
    if (!allowedTypes.some(type => audioFile.type.includes(type.split('/')[1]))) {
      return NextResponse.json(
        { error: "Invalid audio format. Supported: MP3, WAV, M4A, OGG, WebM, MP4" },
        { status: 400 }
      );
    }

    // File size limit (25MB)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Audio file too large (max 25MB)" },
        { status: 400 }
      );
    }

    console.log(`🎵 Starting OpenAI Whisper transcription: ${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)`);

    // Upload audio file to get public URL
    const uploadFormData = new FormData();
    uploadFormData.append('audio', audioFile);
    
    const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload-audio`, {
      method: 'POST',
      body: uploadFormData
    });

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: "Failed to upload audio file" },
        { status: 500 }
      );
    }

    const uploadResult = await uploadResponse.json();
    const audioUrl = uploadResult.url;

    const body = {
      input: {
        audio: audioUrl, // Use HTTP URL
        model: "large-v3",
        language: language === 'auto' ? "auto" : language,
        transcribe: "text", 
        translate: false,
        temperature: 0.0,
        patience: 1.0,
        suppress_tokens: "-1",
        initial_prompt: "This is a song with lyrics", // Better context for music
        condition_on_previous_text: true
      }
    };

    console.log('🔄 Calling OpenAI Whisper...');
    
    const transcriptionResponse = await fetch(
      "https://api.replicate.com/v1/models/openai/whisper/predictions",
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

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error(`❌ OpenAI Whisper failed: ${transcriptionResponse.status}`, errorText);
      return NextResponse.json(
        { error: `Transcription failed: ${transcriptionResponse.status}` },
        { status: transcriptionResponse.status }
      );
    }

    const result = await transcriptionResponse.json();
    console.log('✅ OpenAI Whisper completed');

    // Extract transcription text
    let transcribedText = '';
    if (result.output) {
      if (typeof result.output === 'string') {
        transcribedText = result.output;
      } else if (result.output.transcription) {
        transcribedText = result.output.transcription;
      } else if (Array.isArray(result.output)) {
        transcribedText = result.output.join('\n');
      }
    }

    // Clean up lyrics text (remove excessive whitespace, format nicely)
    const cleanLyrics = transcribedText
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\. /g, '\n') // Periods often indicate line breaks in lyrics
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    return NextResponse.json({
      success: true,
      model: 'openai-whisper',
      transcription: {
        text: transcribedText,
        lyrics_formatted: cleanLyrics,
        language: result.output?.language || 'auto-detected',
        confidence: 'high' // OpenAI Whisper generally high quality
      },
      processing_time: result.metrics?.predict_time || 'unknown',
      cost_estimate: `~$${((audioFile.size / 1024 / 1024) * 0.10).toFixed(3)} (est. $0.10/min)`
    });

  } catch (error) {
    console.error('💥 OpenAI Whisper transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}