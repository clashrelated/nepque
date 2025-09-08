import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!q || q.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          coupons: [],
          brands: [],
          categories: []
        }
      })
    }

    const searchTerm = q.trim()

    // Search coupons
    const coupons = await prisma.coupon.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
              { code: { contains: searchTerm, mode: 'insensitive' } },
              { brand: { name: { contains: searchTerm, mode: 'insensitive' } } },
              { category: { name: { contains: searchTerm, mode: 'insensitive' } } }
            ]
          }
        ]
      },
      include: {
        brand: {
          select: { id: true, name: true, slug: true, logo: true, website: true }
        },
        category: {
          select: { id: true, name: true, icon: true, color: true }
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    // Search brands
    const brands = await prisma.brand.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        logo: true,
        website: true
      },
      take: limit,
      orderBy: { name: 'asc' }
    })

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true
      },
      take: limit,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        coupons,
        brands,
        categories
      }
    })

  } catch (error) {
    console.error('Error performing search:', error)
    return NextResponse.json(
      { success: false, message: 'Search failed' },
      { status: 500 }
    )
  }
}