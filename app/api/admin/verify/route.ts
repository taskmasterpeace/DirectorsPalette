import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/auth/admin-security'
import { addSecurityHeaders } from '@/lib/middleware/api-security'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await verifyAdminAccess()
    
    const response = NextResponse.json({
      isAdmin: adminCheck.isAdmin,
      user: adminCheck.isAdmin ? {
        email: adminCheck.user?.email,
        name: adminCheck.user?.user_metadata?.full_name,
        role: 'admin'
      } : null,
      error: adminCheck.error
    })
    
    return addSecurityHeaders(response)
    
  } catch (error) {
    console.error('❌ Admin verification API error:', error)
    const response = NextResponse.json(
      { isAdmin: false, error: 'Verification failed' },
      { status: 500 }
    )
    
    return addSecurityHeaders(response)
  }
}