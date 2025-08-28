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

    console.log(`🎵 Starting fast transcription: ${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)`);

    // First, upload audio file to get public URL
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
    
    console.log(`🔗 Audio available at: ${audioUrl}`);

    const body = {
      input: {
        audio: audioUrl, // Use HTTP URL instead of data URI
        task: "transcribe",
        language: language === 'auto' ? "None" : language, // Replicate uses "None" for auto-detect
        batch_size: 24,
        timestamp: "word" // Request word-level timestamps
      }
    };

    console.log('🔄 Calling incredibly-fast-whisper...');
    
    const transcriptionResponse = await fetch(
      "https://api.replicate.com/v1/models/vaibhavs10/incredibly-fast-whisper/predictions",
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
      console.error(`❌ Fast Whisper failed: ${transcriptionResponse.status}`, errorText);
      return NextResponse.json(
        { error: `Transcription failed: ${transcriptionResponse.status}` },
        { status: transcriptionResponse.status }
      );
    }

    const result = await transcriptionResponse.json();
    console.log('✅ Fast whisper completed');

    // Process the transcription result
    let transcribedText = '';
    let segments = [];
    
    if (result.output) {
      if (typeof result.output === 'string') {
        transcribedText = result.output;
      } else if (result.output.text) {
        transcribedText = result.output.text;
        segments = result.output.segments || [];
      }
    }

    // Format with timestamps if available
    let lyricsWithTimestamps = transcribedText;
    if (segments && segments.length > 0) {
      lyricsWithTimestamps = segments.map((segment: any) => {
        const startTime = Math.floor(segment.start);
        const minutes = Math.floor(startTime / 60);
        const seconds = startTime % 60;
        const timestamp = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
        return `${timestamp} ${segment.text.trim()}`;
      }).join('\n');
    }

    return NextResponse.json({
      success: true,
      model: 'incredibly-fast-whisper',
      transcription: {
        text: transcribedText,
        lyrics_with_timestamps: lyricsWithTimestamps,
        segments: segments,
        language: result.output?.language || 'unknown',
        duration: audioFile.size > 0 ? 'estimated' : 'unknown'
      },
      processing_time: result.metrics?.predict_time || 'unknown',
      cost_estimate: `~$${((audioFile.size / 1024 / 1024) * 0.06).toFixed(3)} (est. $0.06/min)`
    });

  } catch (error) {
    console.error('💥 Fast Whisper transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}