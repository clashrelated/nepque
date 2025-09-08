import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user exists and has admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Get usage statistics
    const [
      totalUsages,
      uniqueUsers,
      topCoupons,
      usageByDay,
      usageByBrand,
      recentUsages
    ] = await Promise.all([
      // Total usages in period
      prisma.couponUsage.count({
        where: {
          usedAt: {
            gte: startDate
          }
        }
      }),

      // Unique users who used coupons
      prisma.couponUsage.findMany({
        where: {
          usedAt: {
            gte: startDate
          }
        },
        select: {
          userId: true
        },
        distinct: ['userId']
      }),

      // Top used coupons
      prisma.couponUsage.groupBy({
        by: ['couponId'],
        where: {
          usedAt: {
            gte: startDate
          }
        },
        _count: {
          couponId: true
        },
        orderBy: {
          _count: {
            couponId: 'desc'
          }
        }
      }),

      // Usage by day
      prisma.$queryRaw`
        SELECT 
          DATE("usedAt") as date,
          COUNT(*) as count
        FROM "coupon_usages" 
        WHERE "usedAt" >= ${startDate}
        GROUP BY DATE("usedAt")
        ORDER BY date DESC
        LIMIT 30
      `,

      // Usage by brand
      prisma.$queryRaw`
        SELECT 
          b.name as brand_name,
          COUNT(cu.id) as usage_count
        FROM "coupon_usages" cu
        JOIN "coupons" c ON cu."couponId" = c.id
        JOIN "brands" b ON c."brandId" = b.id
        WHERE cu."usedAt" >= ${startDate}
        GROUP BY b.id, b.name
        ORDER BY usage_count DESC
      `,

      // Recent usages
      prisma.couponUsage.findMany({
        where: {
          usedAt: {
            gte: startDate
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          coupon: {
            select: {
              id: true,
              title: true,
              brand: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          usedAt: 'desc'
        }
      })
    ])

    // Get coupon details for top coupons
    const topCouponIds = topCoupons.map(item => item.couponId)
    const topCouponDetails = await prisma.coupon.findMany({
      where: {
        id: {
          in: topCouponIds
        }
      },
      include: {
        brand: {
          select: {
            name: true
          }
        }
      }
    })

    // Combine top coupons with their details
    const topCouponsWithDetails = topCoupons.map(usage => {
      const coupon = topCouponDetails.find(c => c.id === usage.couponId)
      return {
        couponId: usage.couponId,
        usageCount: usage._count.couponId,
        coupon: coupon
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        period,
        totalUsages,
        uniqueUsers: uniqueUsers.length,
        topCoupons: topCouponsWithDetails,
        usageByDay,
        usageByBrand,
        recentUsages
      }
    })

  } catch (error) {
    console.error('Error fetching usage analytics:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch usage analytics' },
      { status: 500 }
    )
  }
}
