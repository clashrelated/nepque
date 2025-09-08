import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Ensure admin access
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const usages = await prisma.couponUsage.findMany({
      orderBy: { usedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        coupon: {
          select: {
            id: true,
            title: true,
            brand: { select: { id: true, name: true } }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: usages
    })
  } catch (error) {
    console.error('Error fetching coupon usages:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch coupon usages' },
      { status: 500 }
    )
  }
}


