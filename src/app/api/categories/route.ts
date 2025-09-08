import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withSecurity } from '@/lib/security'
import { categorySchemas } from '@/lib/validation'

export const GET = withSecurity(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const search = searchParams.get('search') || ''
      const isActive = searchParams.get('active') !== 'false' // Default to true

      // Build where clause
      const where: Record<string, unknown> = {}
      
      if (isActive) {
        where.isActive = true
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Calculate pagination
      const skip = (page - 1) * limit

      // Execute queries in parallel
      const [categories, totalCount] = await Promise.all([
        prisma.category.findMany({
          where,
          include: {
            _count: {
              select: {
                coupons: true,
              }
            }
          },
          orderBy: {
            name: 'asc',
          },
          skip,
          take: limit,
        }),
        prisma.category.count({ where })
      ])

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1

      // Transform data
      const transformedCategories = categories.map(category => ({
        ...category,
        couponCount: category._count.coupons,
      }))

      return NextResponse.json({
        success: true,
        data: transformedCategories,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        }
      })

    } catch (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch categories',
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

export const POST = withSecurity(
  async (request: NextRequest) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = (request as any).validatedBody

      // Check if category already exists
      const existingCategory = await prisma.category.findUnique({
        where: { name: body.name }
      })

      if (existingCategory) {
        return NextResponse.json(
          {
            success: false,
            message: 'Category already exists',
          },
          { status: 400 }
        )
      }

      // Create slug from name
      const slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Create category
      const category = await prisma.category.create({
        data: {
          name: body.name,
          slug,
          description: body.description,
          icon: body.icon,
          color: body.color,
          isActive: body.isActive ?? true,
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Category created successfully',
        data: category,
      }, { status: 201 })

    } catch (error) {
      console.error('Error creating category:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create category',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  },
  {
    requireAdmin: true,
    requireCSRF: true,
    rateLimit: { maxRequests: 20, windowMs: 15 * 60 * 1000 },
    validateInput: categorySchemas.create
  }
)
