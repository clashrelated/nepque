import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const category = await prisma.category.findUnique({
      where: {
        slug: slug,
        isActive: true
      },
      include: {
        _count: {
          select: {
            coupons: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category
    })

  } catch (error) {
    console.error('Error fetching category by slug:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch category',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
