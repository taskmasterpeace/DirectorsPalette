import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate audio file type
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
      'audio/ogg', 'audio/webm', 'video/mp4'
    ];
    
    const isValidType = allowedTypes.some(type => 
      file.type === type || file.name.toLowerCase().includes(type.split('/')[1])
    );

    if (!isValidType) {
      return NextResponse.json(
        { error: 'Invalid audio format. Supported: MP3, WAV, M4A, OGG, WebM, MP4' },
        { status: 400 }
      );
    }

    // File size limit (25MB)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large (max 25MB)' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'temp-audio');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop() || 'mp3';
    const filename = `audio_${timestamp}_${randomId}.${fileExtension}`;
    
    // Save file to public directory
    const filepath = join(uploadsDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, new Uint8Array(bytes));

    // Generate public URL
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = request.headers.get('host') || 'localhost:3010';
    const publicUrl = `${protocol}://${host}/temp-audio/${filename}`;

    console.log(`✅ Audio uploaded: ${filename} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`🔗 Public URL: ${publicUrl}`);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      // Include cleanup info
      note: 'File will be automatically cleaned up after transcription'
    });

  } catch (error) {
    console.error('❌ Audio upload error:', error);
    return NextResponse.json(
      { error: 'Audio upload failed' },
      { status: 500 }
    );
  }
}