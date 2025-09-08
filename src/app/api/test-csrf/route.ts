import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/lib/security'

export const GET = withSecurity(
  async () => {
    return NextResponse.json({
      success: true,
      message: 'CSRF token endpoint is working'
    })
  },
  {
    rateLimit: { maxRequests: 10, windowMs: 15 * 60 * 1000 }
  }
)

export const POST = withSecurity(
  async (request: NextRequest) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (request as any).validatedBody
    
    return NextResponse.json({
      success: true,
      message: 'CSRF token validation successful',
      data: body
    })
  },
  {
    requireAuth: true,
    requireCSRF: true,
    rateLimit: { maxRequests: 10, windowMs: 15 * 60 * 1000 }
  }
)
