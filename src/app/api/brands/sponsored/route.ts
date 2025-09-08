import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    const brands = await prisma.brand.findMany({
      where: { isActive: true, sponsored: true },
      orderBy: [
        { sponsorWeight: 'desc' },
        { name: 'asc' }
      ],
      take: limit,
      include: {
        _count: { select: { coupons: true } }
      }
    })

    const data = brands.map(b => ({ ...b, couponCount: b._count.coupons }))
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching sponsored brands:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch sponsored brands' }, { status: 500 })
  }
}


