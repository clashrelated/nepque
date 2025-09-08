import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/lib/security'
import { getUserSessionInfo } from '@/lib/session-manager'
import { prisma } from '@/lib/db'

export const GET = withSecurity(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, name: true, role: true }
      })

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: 'User not found'
          },
          { status: 404 }
        )
      }

      // Get session information
      const sessionInfo = await getUserSessionInfo(id)

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          sessions: sessionInfo
        }
      })

    } catch (error) {
      console.error('Error fetching user session info:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch user session information'
        },
        { status: 500 }
      )
    }
  },
  {
    requireAdmin: true,
    rateLimit: { maxRequests: 100, windowMs: 15 * 60 * 1000 }
  }
)
