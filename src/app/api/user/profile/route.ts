import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withSecurity, userProfileSchema } from '@/lib/security'

export const GET = withSecurity(
  async (request: NextRequest) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = (request as any).session
      const userId = session.user.id

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              favoriteCoupons: true,
              couponUsages: true
            }
          }
        }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: user
      })

    } catch (error) {
      console.error('Error fetching user profile:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch profile' },
        { status: 500 }
      )
    }
  },
  {
    requireAuth: true,
    rateLimit: { maxRequests: 50, windowMs: 15 * 60 * 1000 }
  }
)

export const PUT = withSecurity(
  async (request: NextRequest) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = (request as any).session
      const userId = session.user.id
      const body = await request.json()
      const { name, email } = body

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          id: { not: userId }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: 'Email is already taken by another user',
          },
          { status: 400 }
        )
      }

      // Update user in database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name, email },
        select: { id: true, name: true, email: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          name: updatedUser.name,
          email: updatedUser.email,
        }
      })

    } catch (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update profile',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  },
  {
    requireAuth: true,
    requireCSRF: false
  }
)