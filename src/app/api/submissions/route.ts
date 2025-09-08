import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withSecurity } from '@/lib/security'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Public POST: create a submission (no login required)
export const POST = withSecurity(
  async (request: NextRequest) => {
    try {
      const body = await request.json()

      const schema = z.object({
        type: z.enum(['BRAND', 'COUPON']),
        payload: z.object({}).passthrough(),
      })

      const { type, payload } = schema.parse(body)
      const session = await getServerSession(authOptions)
      const userId = session?.user?.id || null

      const submission = await prisma.userSubmission.create({
        data: {
          type,
          payload,
          status: 'PENDING',
          ...(userId ? { userId } : {}),
        },
      })

      return NextResponse.json({ success: true, data: submission }, { status: 201 })
    } catch (error) {
      console.error('Error creating submission:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to create submission' },
        { status: 400 }
      )
    }
  },
  { requireCSRF: true, rateLimit: { maxRequests: 30, windowMs: 15 * 60 * 1000 } }
)

// Admin GET: list submissions
export const GET = withSecurity(
  async (_request: NextRequest) => {
    try {
      const subs = await prisma.userSubmission.findMany({
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ success: true, data: subs })
    } catch (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }
  },
  { requireAdmin: true }
)

// Admin PATCH: update status or move to brands/coupons (creates inactive draft)
export const PATCH = withSecurity(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const schema = z.object({
        id: z.string().min(1),
        action: z.enum(['status', 'move']),
        status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
      })
      const { id, action, status } = schema.parse(body)

      const submission = await prisma.userSubmission.findUnique({ where: { id } })
      if (!submission) {
        return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
      }

      if (action === 'status') {
        if (!status) return NextResponse.json({ success: false, message: 'Missing status' }, { status: 400 })
        const updated = await prisma.userSubmission.update({ where: { id }, data: { status } })
        return NextResponse.json({ success: true, data: updated })
      }

      // Move to Brand/Coupon tables as inactive record
      if (submission.type === 'BRAND') {
        const p = submission.payload as any
        const name: string = p.name
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        // If a brand with the same name already exists, return that id instead of failing
        const existing = await prisma.brand.findUnique({ where: { name } })
        if (existing) {
          return NextResponse.json({ success: true, data: { movedTo: 'brand', id: existing.id, note: 'Brand already existed' } })
        }

        const brand = await prisma.brand.create({
          data: {
            name,
            slug,
            description: p.description ?? null,
            logo: p.logo ?? null,
            website: p.website ?? null,
            isActive: false,
          },
        })
        return NextResponse.json({ success: true, data: { movedTo: 'brand', id: brand.id } })
      } else {
        const p = submission.payload as any
        const coupon = await prisma.coupon.create({
          data: {
            title: p.title,
            description: p.description ?? null,
            code: p.code ?? null,
            type: p.type ?? 'COUPON_CODE',
            discountType: p.discountType ?? 'PERCENTAGE',
            discountValue: Number(p.discountValue ?? 0),
            isActive: false,
            isVerified: false,
            isExclusive: false,
            brandId: p.brandId,
            categoryId: p.categoryId ?? ((await prisma.category.findFirst({ select: { id: true } }))?.id ?? p.categoryId),
          },
        })
        return NextResponse.json({ success: true, data: { movedTo: 'coupon', id: coupon.id } })
      }
    } catch (error) {
      console.error('Error updating submission:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to update submission' },
        { status: 400 }
      )
    }
  },
  { requireAdmin: true, requireCSRF: false }
)


