'use server'

import { getCurrentUser } from '@/lib/supabase'
import { headers } from 'next/headers'

// Server-side admin verification
export async function verifyAdminAccess(): Promise<{ isAdmin: boolean; user?: any; error?: string }> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return { isAdmin: false, error: 'Not authenticated' }
    }

    // Check admin status from database user profile
    // This prevents client-side manipulation
    const isAdmin = user.email === process.env.ADMIN_EMAIL || 
                   user.app_metadata?.role === 'admin' ||
                   user.user_metadata?.is_admin === true

    if (!isAdmin) {
      // Log unauthorized admin access attempt
      console.warn(`🚨 Unauthorized admin access attempt by ${user.email} from IP: ${getClientIP()}`)
      return { isAdmin: false, error: 'Insufficient permissions' }
    }

    console.log(`✅ Admin access granted for ${user.email}`)
    return { isAdmin: true, user }
    
  } catch (error) {
    console.error('❌ Admin verification failed:', error)
    return { isAdmin: false, error: 'Verification failed' }
  }
}

// Get client IP for security logging
function getClientIP(): string {
  const headersList = headers()
  const forwarded = headersList.get('x-forwarded-for')
  const real = headersList.get('x-real-ip')
  
  return forwarded?.split(',')[0] || real || 'unknown'
}

// Rate limiting moved to client-side utility
// This function was moved to /lib/utils/rate-limiting.ts since it doesn't need to be a server action

// Secure admin middleware wrapper
export async function withAdminAuth<T>(
  action: (user: any) => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const adminCheck = await verifyAdminAccess()
    
    if (!adminCheck.isAdmin) {
      return { success: false, error: adminCheck.error || 'Admin access required' }
    }
    
    // Rate limiting
    if (!checkAdminRateLimit(adminCheck.user.email)) {
      return { success: false, error: 'Rate limit exceeded. Try again later.' }
    }
    
    const result = await action(adminCheck.user)
    return { success: true, data: result }
    
  } catch (error) {
    console.error('❌ Admin action failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Admin action failed' 
    }
  }
}