import { NextResponse } from 'next/server'
import { withSecurity, generateCSRFToken } from '@/lib/security'

export const GET = withSecurity(
  async () => {
    try {
      const token = generateCSRFToken()
      
      return NextResponse.json({
        success: true,
        data: { csrfToken: token }
      })
    } catch (error) {
      console.error('Error generating CSRF token:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to generate CSRF token' },
        { status: 500 }
      )
    }
  },
  {
    rateLimit: { maxRequests: 20, windowMs: 15 * 60 * 1000 }
  }
)
