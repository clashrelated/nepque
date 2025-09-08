import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Session is optional; anonymous users can redeem
    const session = await getServerSession(authOptions)
    const { id } = await context.params

    // If logged in, optionally verify user exists (non-blocking)
    let userId: string | undefined = undefined
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (user) userId = user.id
    }

    // Check if coupon exists and is active
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: { brand: true }
    })

      if (!coupon) {
        return NextResponse.json(
          { success: false, message: 'Coupon not found' },
          { status: 404 }
        )
      }

      if (!coupon.isActive) {
        return NextResponse.json(
          { success: false, message: 'Coupon is not active' },
          { status: 400 }
        )
      }

    // Allow multiple redemptions per user (no per-user restriction)

    // Check global usage limit (if set)
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: 'Coupon usage limit reached' },
        { status: 400 }
      )
    }

    // Get IP address and user agent for tracking
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-client-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Best-effort tracking (do not block redemption if tracking fails)
    try {
      await prisma.couponUsage.create({
        data: {
          userId: userId || undefined,
          couponId: id,
          ipAddress,
          userAgent
        }
      })
    } catch (e) {
      console.error('Non-blocking: failed to create coupon usage record', e)
    }

    // Increment the used count (non-blocking)
    try {
      await prisma.coupon.update({
        where: { id },
        data: { usedCount: { increment: 1 } }
      })
    } catch (e) {
      console.error('Non-blocking: failed to increment coupon usedCount', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon usage recorded successfully',
      data: {
        coupon: {
          id: coupon.id,
          title: coupon.title,
          code: coupon.code,
          brand: coupon.brand.name,
          affiliateUrl: coupon.affiliateUrl
        }
      }
    })

  } catch (error) {
    console.error('Error recording coupon usage:', error)
    // Still return success with minimal payload to avoid blocking redemption UX
    return NextResponse.json({ success: true, message: 'Coupon opened', data: {} })
  }
}