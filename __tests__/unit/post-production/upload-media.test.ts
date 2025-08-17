import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { POST } from '@/app/api/upload-media/route'

// Mock NextResponse
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: init?.status ? init.status >= 200 && init.status < 300 : true
    }))
  }
}))

describe('Upload Media API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully upload a file and return base64 URL', async () => {
    // Create a mock file
    const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    
    // Create mock FormData
    const mockFormData = new FormData()
    mockFormData.append('file', mockFile)
    
    // Create mock request
    const mockRequest = {
      formData: vi.fn().mockResolvedValue(mockFormData)
    } as unknown as NextRequest
    
    const response = await POST(mockRequest)
    const data = await response.json()
    
    expect(data).toHaveProperty('url')
    expect(data).toHaveProperty('filename', 'test.jpg')
    expect(data).toHaveProperty('type', 'image/jpeg')
    expect(data.url).toMatch(/^data:image\/jpeg;base64,/)
  })

  it('should return 400 error when no file is provided', async () => {
    // Create mock FormData without file
    const mockFormData = new FormData()
    
    // Create mock request
    const mockRequest = {
      formData: vi.fn().mockResolvedValue(mockFormData)
    } as unknown as NextRequest
    
    const response = await POST(mockRequest)
    const data = await response.json()
    
    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error', 'No file provided')
  })

  it('should handle different file types correctly', async () => {
    const fileTypes = [
      { type: 'image/png', extension: 'png' },
      { type: 'image/webp', extension: 'webp' },
      { type: 'image/gif', extension: 'gif' }
    ]
    
    for (const { type, extension } of fileTypes) {
      const mockFile = new File(['test'], `test.${extension}`, { type })
      const mockFormData = new FormData()
      mockFormData.append('file', mockFile)
      
      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest
      
      const response = await POST(mockRequest)
      const data = await response.json()
      
      expect(data.type).toBe(type)
      expect(data.url).toMatch(new RegExp(`^data:${type};base64,`))
    }
  })

  it('should handle large files', async () => {
    // Create a large mock file (1MB)
    const largeContent = new Array(1024 * 1024).fill('a').join('')
    const mockFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
    
    const mockFormData = new FormData()
    mockFormData.append('file', mockFile)
    
    const mockRequest = {
      formData: vi.fn().mockResolvedValue(mockFormData)
    } as unknown as NextRequest
    
    const response = await POST(mockRequest)
    const data = await response.json()
    
    expect(data).toHaveProperty('url')
    expect(data.size).toBe(largeContent.length)
  })

  it('should handle upload errors gracefully', async () => {
    // Create mock request that throws an error
    const mockRequest = {
      formData: vi.fn().mockRejectedValue(new Error('Upload failed'))
    } as unknown as NextRequest
    
    const response = await POST(mockRequest)
    const data = await response.json()
    
    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error', 'Upload failed')
  })
})