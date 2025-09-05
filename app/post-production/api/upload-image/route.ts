import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { base64Data } = await request.json()
    
    if (!base64Data) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      )
    }

    // Extract the actual base64 content (removing data:image/...;base64, prefix)
    const base64Content = base64Data.split(',')[1] || base64Data
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, 'base64')
    
    // Upload to a temporary storage service
    // For now, we'll use a free image hosting service (you should replace with your own solution)
    const formData = new FormData()
    const blob = new Blob([buffer], { type: 'image/png' })
    formData.append('image', blob)
    
    // Upload to imgbb (free tier)
    const uploadResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY || ''}`,
      {
        method: 'POST',
        body: formData
      }
    )
    
    if (!uploadResponse.ok) {
      // Fallback: return the data URL as-is
      // Note: This won't work with Replicate, but at least won't crash
      console.warn('Image upload failed, returning data URL')
      return NextResponse.json({
        url: base64Data,
        warning: 'Using data URL - may not work with all services'
      })
    }
    
    const result = await uploadResponse.json()
    
    return NextResponse.json({
      url: result.data.url,
      deleteUrl: result.data.delete_url
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}