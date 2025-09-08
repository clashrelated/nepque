import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withSecurity } from '@/lib/security'
import { couponSchemas } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        brand: {
          select: { id: true, name: true, logo: true, website: true }
        },
        category: {
          select: { id: true, name: true, color: true }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: coupon
    })

  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch coupon' },
      { status: 500 }
    )
  }
}

export const PUT = withSecurity(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const body = await request.json().catch(() => ({}))

      // Validate brand exists
      const brand = await prisma.brand.findUnique({
        where: { id: body.brandId }
      })

      if (!brand) {
        return NextResponse.json(
          { success: false, message: 'Brand not found' },
          { status: 400 }
        )
      }

      // Validate category exists
      const category = await prisma.category.findUnique({
        where: { id: body.categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { success: false, message: 'Category not found' },
          { status: 400 }
        )
      }

      const toNullableNumber = (value: unknown) => {
        if (value === '' || value === null || value === undefined) return null
        const n = Number(value)
        return isNaN(n) ? null : n
      }
      const toNullableDate = (value: unknown) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) return null
        const d = new Date(String(value))
        return isNaN(d.getTime()) ? null : d
      }

      const updatedCoupon = await prisma.coupon.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
          code: body.code,
          type: body.type,
          discountType: body.discountType,
          discountValue: body.discountValue !== undefined ? Number(body.discountValue) : undefined,
          minOrderValue: body.minOrderValue !== undefined ? toNullableNumber(body.minOrderValue) : undefined,
          maxDiscount: body.maxDiscount !== undefined ? toNullableNumber(body.maxDiscount) : undefined,
          isActive: body.isActive,
          isVerified: body.isVerified,
          isExclusive: body.isExclusive,
          usageLimit: body.usageLimit !== undefined ? (Number(body.usageLimit) || null) : undefined,
          startDate: body.startDate !== undefined ? toNullableDate(body.startDate) : undefined,
          endDate: body.endDate !== undefined ? toNullableDate(body.endDate) : undefined,
          terms: body.terms,
          image: body.image !== undefined ? (body.image && String(body.image).trim() !== '' ? body.image : null) : undefined,
          affiliateUrl: body.affiliateUrl !== undefined ? (body.affiliateUrl && String(body.affiliateUrl).trim() !== '' ? body.affiliateUrl : null) : undefined,
          sponsored: body.sponsored !== undefined ? Boolean(body.sponsored) : undefined,
          sponsorWeight: body.sponsorWeight !== undefined ? (Number(body.sponsorWeight) || 0) : undefined,
          brandId: body.brandId,
          categoryId: body.categoryId
        },
        include: {
          brand: {
            select: { id: true, name: true, logo: true }
          },
          category: {
            select: { id: true, name: true }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Coupon updated successfully',
        data: updatedCoupon
      })

    } catch (error) {
      console.error('Error updating coupon:', error)
      if (error instanceof Error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { success: false, message: 'Failed to update coupon' },
        { status: 500 }
      )
    }
  },
  {
    requireAdmin: true,
    requireCSRF: false
  }
)

export const DELETE = withSecurity(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params

      await prisma.coupon.delete({
        where: { id }
      })

      return NextResponse.json({
        success: true,
        message: 'Coupon deleted successfully'
      })

    } catch (error) {
      console.error('Error deleting coupon:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to delete coupon' },
        { status: 500 }
      )
    }
  },
  {
    requireAdmin: true,
    requireCSRF: true,
    rateLimit: { maxRequests: 10, windowMs: 15 * 60 * 1000 }
  }
)