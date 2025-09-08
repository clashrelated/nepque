import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId') || undefined
    const limit = parseInt(searchParams.get('limit') || '8')

    const where: Record<string, unknown> = { isActive: true, sponsored: true }
    if (brandId) where.brandId = brandId

    const coupons = await prisma.coupon.findMany({
      where,
      include: {
        brand: { select: { id: true, name: true, slug: true, logo: true, website: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
        _count: { select: { favoriteCoupons: true, couponUsages: true } }
      },
      orderBy: [
        { sponsorWeight: 'desc' },
        { usedCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    const data = coupons.map(c => ({
      ...c,
      usageCount: c._count.couponUsages,
      favoriteCount: c._count.favoriteCoupons
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching sponsored coupons:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch sponsored coupons' }, { status: 500 })
  }
}


