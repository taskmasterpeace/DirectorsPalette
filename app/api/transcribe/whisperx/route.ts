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

    console.log(`🎵 Starting WhisperX transcription: ${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)`);

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
        language: language === 'auto' ? null : language,
        model_name: "large-v3",
        batch_size: 8,
        compute_type: "float16",
        return_char_alignments: false,
        vad_filter: true, // Voice activity detection
        word_timestamps: true, // PRECISE WORD-LEVEL TIMESTAMPS
        align_output: true, // Better alignment for lyrics
        diarization: false, // Single singer
        min_speakers: null,
        max_speakers: null
      }
    };

    console.log('🔄 Calling WhisperX for precise timestamps...');
    
    const transcriptionResponse = await fetch(
      "https://api.replicate.com/v1/models/victor-upmeet/whisperx/predictions",
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
      console.error(`❌ WhisperX failed: ${transcriptionResponse.status}`, errorText);
      return NextResponse.json(
        { error: `Transcription failed: ${transcriptionResponse.status}` },
        { status: transcriptionResponse.status }
      );
    }

    const result = await transcriptionResponse.json();
    console.log('✅ WhisperX completed with timestamps');

    // Process WhisperX result (includes word-level timestamps)
    let transcribedText = '';
    let preciseTimestamps = '';
    let segments = [];
    let words = [];
    
    if (result.output) {
      if (result.output.transcription) {
        transcribedText = result.output.transcription;
      }
      
      if (result.output.segments) {
        segments = result.output.segments;
        
        // Create precise timestamps for lyrics
        preciseTimestamps = segments.map((segment: any) => {
          const startMinutes = Math.floor(segment.start / 60);
          const startSeconds = Math.floor(segment.start % 60);
          const timestamp = `[${startMinutes.toString().padStart(2, '0')}:${startSeconds.toString().padStart(2, '0')}]`;
          return `${timestamp} ${segment.text.trim()}`;
        }).join('\n');
      }
      
      if (result.output.words) {
        words = result.output.words;
      }
    }

    // Create ultra-precise word-by-word timestamps if available
    let wordLevelLyrics = '';
    if (words && words.length > 0) {
      let currentLine = '';
      let lastTimestamp = 0;
      
      words.forEach((word: any, index: number) => {
        // Add timestamp every ~10 seconds or new sentence
        if (word.start - lastTimestamp > 10 || word.word.includes('.')) {
          if (currentLine.trim()) {
            const minutes = Math.floor(word.start / 60);
            const seconds = Math.floor(word.start % 60);
            const timestamp = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
            wordLevelLyrics += `${timestamp} ${currentLine.trim()}\n`;
            currentLine = '';
            lastTimestamp = word.start;
          }
        }
        currentLine += word.word + ' ';
      });
      
      // Add final line
      if (currentLine.trim()) {
        wordLevelLyrics += currentLine.trim();
      }
    }

    return NextResponse.json({
      success: true,
      model: 'whisperx-premium',
      transcription: {
        text: transcribedText,
        lyrics_with_timestamps: preciseTimestamps,
        word_level_lyrics: wordLevelLyrics,
        segments: segments,
        words: words,
        language: result.output?.language || 'auto-detected'
      },
      processing_time: result.metrics?.predict_time || 'unknown',
      cost_estimate: `~$${((audioFile.size / 1024 / 1024) * 0.15).toFixed(3)} (est. $0.15/min)`
    });

  } catch (error) {
    console.error('💥 WhisperX transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}