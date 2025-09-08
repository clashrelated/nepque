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
    const timeRange = searchParams.get('timeRange') || '7d'
    
    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    const [
      totalCoupons,
      totalBrands,
      totalCategories,
      totalUsers,
      activeCoupons,
      verifiedCoupons,
      totalFavorites,
      totalUsage,
      recentCoupons,
      topBrands,
      topCategories
    ] = await Promise.all([
      prisma.coupon.count(),
      prisma.brand.count(),
      prisma.category.count(),
      prisma.user.count(),
      prisma.coupon.count({ where: { isActive: true } }),
      prisma.coupon.count({ where: { isVerified: true } }),
      prisma.favoriteCoupon.count(),
      prisma.couponUsage.count(),
      
      // Recent coupons
      prisma.coupon.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: {
            select: { name: true }
          }
        }
      }),
      
      // Top brands by usage
      prisma.brand.findMany({
        take: 5,
        include: {
          _count: {
            select: { coupons: true }
          },
          coupons: {
            select: {
              usedCount: true
            }
          }
        }
      }).then(brands => 
        brands.map(brand => ({
          id: brand.id,
          name: brand.name,
          couponCount: brand._count.coupons,
          totalUsage: brand.coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)
        })).sort((a, b) => b.totalUsage - a.totalUsage)
      ),
      
      // Top categories by usage
      prisma.category.findMany({
        take: 5,
        include: {
          _count: {
            select: { coupons: true }
          },
          coupons: {
            select: {
              usedCount: true
            }
          }
        }
      }).then(categories => 
        categories.map(category => ({
          id: category.id,
          name: category.name,
          couponCount: category._count.coupons,
          totalUsage: category.coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)
        })).sort((a, b) => b.totalUsage - a.totalUsage)
      )
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalCoupons,
        totalBrands,
        totalCategories,
        totalUsers,
        activeCoupons,
        verifiedCoupons,
        totalFavorites,
        totalUsage,
        recentCoupons,
        topBrands,
        topCategories,
        timeRange
      }
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
