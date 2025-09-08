import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required',
        },
        { status: 400 }
      )
    }

    // Get user stats
    const [favoriteCount, usedCount] = await Promise.all([
      prisma.favoriteCoupon.count({
        where: { userId }
      }),
      prisma.couponUsage.count({
        where: { userId }
      }),
      // Note: We don't have a savings field in CouponUsage
      // This would need to be calculated based on coupon discount values
      // For now, we'll return 0
      Promise.resolve({ _sum: {} })
    ])

    // Calculate estimated savings based on used coupons
    const usedCoupons = await prisma.couponUsage.findMany({
      where: { userId },
      include: {
        coupon: {
          select: {
            discountValue: true,
            discountType: true,
            minOrderValue: true,
          }
        }
      }
    })

    let estimatedSavings = 0
    usedCoupons.forEach(usage => {
      const coupon = usage.coupon
      if (coupon.discountType === 'PERCENTAGE') {
        // Estimate 20% of min order value as actual order value
        const estimatedOrderValue = coupon.minOrderValue || 50
        estimatedSavings += (estimatedOrderValue * coupon.discountValue) / 100
      } else if (coupon.discountType === 'FIXED_AMOUNT') {
        estimatedSavings += coupon.discountValue
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        favoriteCoupons: favoriteCount,
        usedCoupons: usedCount,
        totalSavings: estimatedSavings,
      }
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user stats',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
