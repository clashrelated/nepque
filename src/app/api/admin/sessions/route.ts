import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/lib/security'
import { sessionManager, getSessionStats } from '@/lib/session-manager'
import { logUserManagement } from '@/lib/audit'
import { AuditAction } from '@/lib/audit'
import { z } from 'zod'

// Request body validation schema
const forceLogoutSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1).max(200)
})

export const GET = withSecurity(
  async () => {
    try {
      const stats = getSessionStats()
      
      return NextResponse.json({
        success: true,
        data: {
          activeSessions: stats.activeSessions,
          failedAttempts: stats.failedAttempts,
          lockedUsers: stats.lockedUsers
        }
      })

    } catch (error) {
      console.error('Error fetching session stats:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch session statistics'
        },
        { status: 500 }
      )
    }
  },
  {
    requireAdmin: true,
    rateLimit: { maxRequests: 50, windowMs: 15 * 60 * 1000 }
  }
)

export const POST = withSecurity(
  async (request: NextRequest) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = (request as any).validatedBody
      const { userId, reason } = body

      // Get admin user info for audit logging
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = (request as any).session
      const adminUser = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      }

      // Force logout user
      await sessionManager.forceLogoutUser(userId, reason)

      // Log the admin action
      await logUserManagement(
        AuditAction.USER_STATUS_CHANGED,
        request,
        adminUser,
        { id: userId, email: 'unknown' },
        undefined,
        { action: 'force_logout', reason }
      )

      return NextResponse.json({
        success: true,
        message: 'User sessions terminated successfully'
      })

    } catch (error) {
      console.error('Error forcing user logout:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to terminate user sessions'
        },
        { status: 500 }
      )
    }
  },
  {
    requireAdmin: true,
    requireCSRF: true,
    rateLimit: { maxRequests: 20, windowMs: 15 * 60 * 1000 },
    validateInput: forceLogoutSchema
  }
)
