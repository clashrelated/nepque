import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/lib/security'
import { auditLogger } from '@/lib/audit'
import { AuditAction } from '@/lib/audit'
import { z } from 'zod'

// Query parameters validation schema
const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  action: z.nativeEnum(AuditAction).optional(),
  userId: z.string().uuid().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

export const GET = withSecurity(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const queryParams = Object.fromEntries(searchParams.entries())
      
      // Validate query parameters
      const validation = auditLogQuerySchema.safeParse(queryParams)
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid query parameters',
            errors: validation.error.flatten()
          },
          { status: 400 }
        )
      }

      const {
        page,
        limit,
        action,
        userId,
        resourceType,
        resourceId,
        startDate,
        endDate
      } = validation.data

      // Parse dates if provided
      const filters: {
        page: number
        limit: number
        action?: AuditAction
        userId?: string
        resourceType?: string
        resourceId?: string
        startDate?: Date
        endDate?: Date
      } = {
        page,
        limit
      }

      if (action) filters.action = action
      if (userId) filters.userId = userId
      if (resourceType) filters.resourceType = resourceType
      if (resourceId) filters.resourceId = resourceId
      if (startDate) filters.startDate = new Date(startDate)
      if (endDate) filters.endDate = new Date(endDate)

      // Get audit logs
      const result = await auditLogger.getAuditLogs(filters)

      return NextResponse.json({
        success: true,
        data: result.logs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      })

    } catch (error) {
      console.error('Error fetching audit logs:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch audit logs'
        },
        { status: 500 }
      )
    }
  },
  {
    requireAdmin: true,
    rateLimit: { maxRequests: 100, windowMs: 15 * 60 * 1000 }
  }
)
