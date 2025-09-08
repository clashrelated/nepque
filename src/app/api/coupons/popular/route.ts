import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const timeframe = searchParams.get('timeframe') || '7d' // 1d, 7d, 30d, all

    // Calculate date range based on timeframe
    let dateFilter: Record<string, unknown> = {}
    const now = new Date()
    
    switch (timeframe) {
      case '1d':
        dateFilter = {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
        }
        break
      case '7d':
        dateFilter = {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
        break
      case '30d':
        dateFilter = {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
        break
      case 'all':
      default:
        dateFilter = {}
        break
    }

    // Get popular coupons based on usage count
    const popularCoupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        isVerified: true,
        ...(Object.keys(dateFilter).length > 0 && {
          couponUsages: {
            some: {
              usedAt: dateFilter
            }
          }
        })
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            website: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          }
        },
        _count: {
          select: {
            favoriteCoupons: true,
            couponUsages: true,
          }
        }
      },
      orderBy: [
        { isExclusive: 'desc' },
        { usedCount: 'desc' },
        { favoriteCoupons: { _count: 'desc' } }
      ],
      take: limit
    })

    // Get trending brands (brands with most coupon usage)
    const trendingBrands = await prisma.brand.findMany({
      where: {
        isActive: true,
        coupons: {
          some: {
            isActive: true,
            isVerified: true,
            ...(Object.keys(dateFilter).length > 0 && {
              couponUsages: {
                some: {
                  usedAt: dateFilter
                }
              }
            })
          }
        }
      },
      include: {
        _count: {
          select: {
            coupons: {
              where: {
                isActive: true,
                isVerified: true
              }
            }
          }
        }
      },
      orderBy: {
        coupons: {
          _count: 'desc'
        }
      },
      take: 5
    })

    // Get trending categories
    const trendingCategories = await prisma.category.findMany({
      where: {
        isActive: true,
        coupons: {
          some: {
            isActive: true,
            isVerified: true,
            ...(Object.keys(dateFilter).length > 0 && {
              couponUsages: {
                some: {
                  usedAt: dateFilter
                }
              }
            })
          }
        }
      },
      include: {
        _count: {
          select: {
            coupons: {
              where: {
                isActive: true,
                isVerified: true
              }
            }
          }
        }
      },
      orderBy: {
        coupons: {
          _count: 'desc'
        }
      },
      take: 5
    })

    // Transform data
    const transformedCoupons = popularCoupons.map(coupon => ({
      ...coupon,
      usageCount: coupon._count.couponUsages,
      favoriteCount: coupon._count.favoriteCoupons,
    }))

    const transformedBrands = trendingBrands.map(brand => ({
      ...brand,
      activeCouponCount: brand._count.coupons,
    }))

    const transformedCategories = trendingCategories.map(category => ({
      ...category,
      activeCouponCount: category._count.coupons,
    }))

    return NextResponse.json({
      success: true,
      data: {
        coupons: transformedCoupons,
        brands: transformedBrands,
        categories: transformedCategories,
      },
      timeframe,
      limit
    })

  } catch (error) {
    console.error('Error fetching popular coupons:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch popular coupons',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
