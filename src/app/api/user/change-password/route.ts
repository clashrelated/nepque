import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { withSecurity, changePasswordSchema } from '@/lib/security'

export const PUT = withSecurity(
  async (request: NextRequest) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = (request as any).session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = (request as any).validatedBody
      const { currentPassword, newPassword } = body

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true }
      })

      if (!user || !user.password) {
        return NextResponse.json(
          { success: false, message: 'User not found or no password set' },
          { status: 404 }
        )
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12)

      // Update password
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedNewPassword }
      })

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully'
      })

    } catch (error) {
      console.error('Error changing password:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to change password' },
        { status: 500 }
      )
    }
  },
  {
    requireAuth: true,
    requireCSRF: true,
    rateLimit: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
    validateInput: changePasswordSchema
  }
)
