import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withSecurity } from '@/lib/security'
// import { SearchFilters, PaginationParams } from '@/types'

export const GET = withSecurity(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      
      // Parse query parameters
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '12')
      const query = searchParams.get('q') || ''
      const categoryId = searchParams.get('categoryId') || ''
      const brandId = searchParams.get('brandId') || ''
      const couponType = searchParams.get('type') || ''
      const discountType = searchParams.get('discountType') || ''
      const minDiscount = searchParams.get('minDiscount') ? parseFloat(searchParams.get('minDiscount')!) : undefined
      const maxDiscount = searchParams.get('maxDiscount') ? parseFloat(searchParams.get('maxDiscount')!) : undefined
      const isVerified = searchParams.get('verified') === 'true' ? true : searchParams.get('verified') === 'false' ? false : undefined
      const isExclusive = searchParams.get('exclusive') === 'true' ? true : searchParams.get('exclusive') === 'false' ? false : undefined
      const sortBy = searchParams.get('sortBy') || 'newest'
      const sortOrder = searchParams.get('sortOrder') || 'desc'

      // Build where clause
      const where: Record<string, unknown> = {
        isActive: true,
      }

      // Text search
      if (query) {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { brand: { name: { contains: query, mode: 'insensitive' } } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ]
      }

      // Filters
      if (categoryId) where.categoryId = categoryId
      if (brandId) where.brandId = brandId
      if (couponType) where.type = couponType
      if (discountType) where.discountType = discountType
      if (isVerified !== undefined) where.isVerified = isVerified
      if (isExclusive !== undefined) where.isExclusive = isExclusive

      // Discount range filter
      if (minDiscount !== undefined || maxDiscount !== undefined) {
        where.discountValue = {} as Record<string, unknown>
        if (minDiscount !== undefined) (where.discountValue as Record<string, unknown>).gte = minDiscount
        if (maxDiscount !== undefined) (where.discountValue as Record<string, unknown>).lte = maxDiscount
      }

      // Date filters (only show active coupons) - temporarily disabled for testing
      // const now = new Date()
      // where.AND = [
      //   ...(where.AND || []),
      //   { OR: [{ startDate: null }, { startDate: { lte: now } }] },
      //   { OR: [{ endDate: null }, { endDate: { gte: now } }] }
      // ]

      // Build orderBy clause
      let orderBy: Record<string, string> = {}
      switch (sortBy) {
        case 'newest':
          orderBy = { createdAt: sortOrder }
          break
        case 'popular':
          orderBy = { usedCount: sortOrder }
          break
        case 'discount':
          orderBy = { discountValue: sortOrder }
          break
        case 'expiry':
          orderBy = { endDate: sortOrder }
          break
        default:
          orderBy = { createdAt: 'desc' }
      }

      // Calculate pagination
      const skip = (page - 1) * limit

      // Execute queries in parallel
      const [coupons, totalCount] = await Promise.all([
        prisma.coupon.findMany({
          where,
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
          orderBy,
          skip,
          take: limit,
        }),
        prisma.coupon.count({ where })
      ])

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1

      // Transform data
      const transformedCoupons = coupons.map(coupon => ({
        ...coupon,
        isFavorite: false, // Will be set based on user context
        usageCount: coupon._count.couponUsages,
        favoriteCount: coupon._count.favoriteCoupons,
      }))

      return NextResponse.json({
        success: true,
        data: transformedCoupons,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          query,
          categoryId,
          brandId,
          couponType,
          discountType,
          minDiscount,
          maxDiscount,
          isVerified,
          isExclusive,
          sortBy,
          sortOrder,
        }
      })

    } catch (error) {
      console.error('Error fetching coupons:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch coupons',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  },
  {
    rateLimit: { maxRequests: 100, windowMs: 15 * 60 * 1000 }
  }
)
