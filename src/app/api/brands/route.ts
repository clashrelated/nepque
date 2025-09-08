import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withSecurity } from '@/lib/security'
import { brandSchemas } from '@/lib/validation'

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
      const [brands, totalCount] = await Promise.all([
        prisma.brand.findMany({
          where,
          include: {
            _count: {
              select: {
                coupons: true,
              }
            }
          },
          orderBy: [
            { sponsored: 'desc' },
            { sponsorWeight: 'desc' },
            { name: 'asc' }
          ],
          skip,
          take: limit,
        }),
        prisma.brand.count({ where })
      ])

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1

      // Transform data
      const transformedBrands = brands.map(brand => ({
        ...brand,
        couponCount: brand._count.coupons,
      }))

      return NextResponse.json({
        success: true,
        data: transformedBrands,
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
      console.error('Error fetching brands:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch brands',
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

      // Check if brand already exists
      const existingBrand = await prisma.brand.findUnique({
        where: { name: body.name }
      })

      if (existingBrand) {
        return NextResponse.json(
          {
            success: false,
            message: 'Brand already exists',
          },
          { status: 400 }
        )
      }

      // Create slug from name
      const slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Create brand (omit SEO fields to avoid Prisma client mismatch)
      const created = await prisma.brand.create({
        data: {
          name: body.name,
          slug,
          description: body.description,
          logo: body.logo,
          website: body.website,
          isActive: body.isActive ?? true,
          sponsored: body.sponsored ?? false,
          sponsorWeight: typeof body.sponsorWeight === 'number' ? body.sponsorWeight : 0,
        }
      })

      // Persist SEO fields with parameterized raw updates if provided
      if (body.seoTitle !== undefined) {
        await prisma.$executeRaw`UPDATE "brands" SET "seoTitle" = ${body.seoTitle} WHERE "id" = ${created.id}`
      }
      if (body.seoDescription !== undefined) {
        await prisma.$executeRaw`UPDATE "brands" SET "seoDescription" = ${body.seoDescription} WHERE "id" = ${created.id}`
      }
      if (body.seoKeywords !== undefined) {
        await prisma.$executeRaw`UPDATE "brands" SET "seoKeywords" = ${body.seoKeywords} WHERE "id" = ${created.id}`
      }
      if (body.ogImage !== undefined) {
        await prisma.$executeRaw`UPDATE "brands" SET "ogImage" = ${body.ogImage} WHERE "id" = ${created.id}`
      }

      const [brandRow] = await prisma.$queryRaw<any[]>`SELECT * FROM "brands" WHERE id = ${created.id} LIMIT 1`
      const brand = brandRow || created

      return NextResponse.json({
        success: true,
        message: 'Brand created successfully',
        data: brand,
      }, { status: 201 })

    } catch (error) {
      console.error('Error creating brand:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create brand',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  },
  {
    requireAdmin: true,
    requireCSRF: false,
    rateLimit: { maxRequests: 20, windowMs: 15 * 60 * 1000 },
    validateInput: brandSchemas.create
  }
)
