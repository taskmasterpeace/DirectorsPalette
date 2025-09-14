/**
 * File Upload Security and Validation
 */

import { ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES, MAX_FILE_SIZES } from './input-validation'

export interface FileValidationResult {
  isValid: boolean
  error?: string
  warnings: string[]
  sanitizedFilename?: string
}

/**
 * Validate uploaded file for security
 */
export function validateFileUpload(
  file: File,
  expectedType: 'image' | 'audio' | 'video' = 'image'
): FileValidationResult {
  const warnings: string[] = []

  // Check file size
  const maxSize = MAX_FILE_SIZES[expectedType]
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File too large. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB`,
      warnings
    }
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File is empty',
      warnings
    }
  }

  // Check MIME type
  const allowedTypes = expectedType === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES
  if (!allowedTypes.includes(file.type as any)) {
    return {
      isValid: false,
      error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`,
      warnings
    }
  }

  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.name)
  if (sanitizedFilename !== file.name) {
    warnings.push('Filename was sanitized for security')
  }

  // Check for suspicious file extensions
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.js', '.jar']
  if (suspiciousExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
    return {
      isValid: false,
      error: 'Suspicious file extension detected',
      warnings
    }
  }

  return {
    isValid: true,
    warnings,
    sanitizedFilename
  }
}

/**
 * Sanitize filename for security
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .slice(0, 255) // Limit length
}

/**
 * Check file content for malicious patterns (basic)
 */
export async function scanFileContent(buffer: ArrayBuffer): Promise<boolean> {
  try {
    // Convert to text for scanning
    const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer)

    // Check for suspicious patterns
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\s*\(/i,
      /document\.write/i,
      /window\.location/i
    ]

    for (const pattern of maliciousPatterns) {
      if (pattern.test(text)) {
        console.warn('🚨 Suspicious file content detected:', pattern)
        return false
      }
    }

    return true
  } catch (error) {
    // If we can't decode as text, assume it's binary (likely safe)
    return true
  }
}

/**
 * Generate secure upload path
 */
export function generateSecureUploadPath(
  userId: string,
  originalFilename: string,
  type: 'image' | 'audio' | 'video'
): string {
  const sanitizedFilename = sanitizeFilename(originalFilename)
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)

  return `uploads/${type}/${userId}/${timestamp}_${randomId}_${sanitizedFilename}`
}

/**
 * File upload security configuration
 */
export const UPLOAD_CONFIG = {
  maxFileSize: {
    image: 10 * 1024 * 1024, // 10MB
    audio: 25 * 1024 * 1024, // 25MB
    video: 100 * 1024 * 1024 // 100MB
  },
  allowedMimeTypes: {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac'],
    video: ['video/mp4', 'video/webm', 'video/mov']
  },
  scanContent: true, // Enable content scanning
  virusScanning: false, // Disable for now (requires external service)
  quarantineEnabled: false // Disable for now
}