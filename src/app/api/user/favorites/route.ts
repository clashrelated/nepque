import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, favoriteAddedEmailHtml } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const favorites = await prisma.favoriteCoupon.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        coupon: {
          include: {
            brand: {
              select: { id: true, name: true, logo: true }
            },
            category: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: favorites
    })

  } catch (error) {
    console.error('Error fetching user favorites:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { couponId } = body

    if (!couponId) {
      return NextResponse.json(
        { success: false, message: 'Coupon ID is required' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteCoupon.findFirst({
      where: {
        userId: session.user.id,
        couponId: couponId
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { success: false, message: 'Coupon already favorited' },
        { status: 400 }
      )
    }

    // Create favorite
    const favorite = await prisma.favoriteCoupon.create({
      data: {
        userId: session.user.id,
        couponId: couponId
      },
      include: {
        coupon: {
          include: {
            brand: {
              select: { id: true, name: true, logo: true }
            },
            category: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    // Notify user by email (non-blocking)
    try {
      if (user.email) {
        const brandName = favorite?.coupon?.brand?.name || 'a coupon'
        const origin = new URL(request.url).origin
        const base = process.env.NEXT_PUBLIC_BASE_URL || origin
        void sendEmail({
          to: user.email,
          subject: 'Saved to favorites ✅',
          html: favoriteAddedEmailHtml(brandName, base),
        })
      }
    } catch (_) {
      // ignore email errors
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon added to favorites',
      data: favorite
    })

  } catch (error) {
    console.error('Error adding to favorites:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add to favorites' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const couponId = searchParams.get('couponId')

    if (!couponId) {
      return NextResponse.json(
        { success: false, message: 'Coupon ID is required' },
        { status: 400 }
      )
    }

    // Remove favorite
    await prisma.favoriteCoupon.deleteMany({
      where: {
        userId: session.user.id,
        couponId: couponId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Coupon removed from favorites'
    })

  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to remove from favorites' },
      { status: 500 }
    )
  }
}