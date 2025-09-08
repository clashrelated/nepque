import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withSecurity } from '@/lib/security'
import { couponSchemas } from '@/lib/validation'
import { logCouponManagement } from '@/lib/audit'
import { AuditAction } from '@/lib/audit'

export const POST = withSecurity(
  async (request: NextRequest) => {
    try {
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

      // Normalize/convert inputs to expected types
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

      const coupon = await prisma.coupon.create({
        data: {
          title: body.title,
          description: body.description,
          code: body.code,
          type: body.type,
          discountType: body.discountType,
          discountValue: Number(body.discountValue) || 0,
          minOrderValue: toNullableNumber(body.minOrderValue),
          maxDiscount: toNullableNumber(body.maxDiscount),
          isActive: body.isActive,
          isVerified: body.isVerified,
          isExclusive: body.isExclusive,
          usageLimit: Number(body.usageLimit) || null,
          startDate: toNullableDate(body.startDate),
          endDate: toNullableDate(body.endDate),
          terms: body.terms,
          image: body.image && String(body.image).trim() !== '' ? body.image : null,
          affiliateUrl: body.affiliateUrl && String(body.affiliateUrl).trim() !== '' ? body.affiliateUrl : null,
          brandId: body.brandId,
          categoryId: body.categoryId
        },
        include: {
          brand: true,
          category: true
        }
      })

      // Log audit event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = (request as any).session
      await logCouponManagement(
        AuditAction.COUPON_CREATED,
        request,
        {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role
        },
        {
          id: coupon.id,
          title: coupon.title
        },
        undefined,
        {
          brandId: coupon.brandId,
          categoryId: coupon.categoryId,
          type: coupon.type,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon
      })

    } catch (error) {
      console.error('Error creating coupon:', error)
      if (error instanceof Error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { success: false, message: 'Failed to create coupon' },
        { status: 500 }
      )
    }
  },
  {
    requireAdmin: true,
    requireCSRF: false
  }
)