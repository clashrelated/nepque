import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            coupons: true,
          }
        }
      }
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...brand,
        couponCount: brand._count.coupons,
      }
    });

  } catch (error) {
    console.error('Error fetching brand by slug:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch brand' },
      { status: 500 }
    );
  }
}
