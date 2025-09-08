import { NextRequest } from 'next/server'
import { prisma } from './db'
import { logger, LogCategory, logAuditEvent } from './logger'

// Audit action types
export enum AuditAction {
  // User management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_STATUS_CHANGED = 'USER_STATUS_CHANGED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  
  // Coupon management
  COUPON_CREATED = 'COUPON_CREATED',
  COUPON_UPDATED = 'COUPON_UPDATED',
  COUPON_DELETED = 'COUPON_DELETED',
  COUPON_STATUS_CHANGED = 'COUPON_STATUS_CHANGED',
  
  // Brand management
  BRAND_CREATED = 'BRAND_CREATED',
  BRAND_UPDATED = 'BRAND_UPDATED',
  BRAND_DELETED = 'BRAND_DELETED',
  BRAND_STATUS_CHANGED = 'BRAND_STATUS_CHANGED',
  
  // Category management
  CATEGORY_CREATED = 'CATEGORY_CREATED',
  CATEGORY_UPDATED = 'CATEGORY_UPDATED',
  CATEGORY_DELETED = 'CATEGORY_DELETED',
  CATEGORY_STATUS_CHANGED = 'CATEGORY_STATUS_CHANGED',
  
  // System actions
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  BULK_OPERATION = 'BULK_OPERATION',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
  
  // Security events
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

// Audit log interface
interface AuditLogEntry {
  id: string
  action: AuditAction
  userId: string
  userEmail: string
  userRole: string
  resourceType: string
  resourceId?: string
  resourceName?: string
  oldValues?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  newValues?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ipAddress: string
  userAgent: string
  endpoint: string
  method: string
  timestamp: Date
  metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Audit logger class
class AuditLogger {
  private async createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: entry.action,
          userId: entry.userId,
          userEmail: entry.userEmail,
          userRole: entry.userRole,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          resourceName: entry.resourceName,
          oldValues: entry.oldValues,
          newValues: entry.newValues,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          endpoint: entry.endpoint,
          method: entry.method,
          metadata: entry.metadata
        }
      })
    } catch (error) {
      // Log audit failure but don't throw to avoid breaking the main operation
      logger.error(
        LogCategory.AUDIT,
        'Failed to create audit log entry',
        undefined,
        { entry, error: error instanceof Error ? error.message : 'Unknown error' },
        error instanceof Error ? error : undefined
      )
    }
  }

  private extractRequestInfo(request: NextRequest) {
    return {
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      endpoint: request.nextUrl.pathname,
      method: request.method
    }
  }

  // Generic audit logging method
  async logAction(
    action: AuditAction,
    request: NextRequest,
    userId: string,
    userEmail: string,
    userRole: string,
    resourceType: string,
    resourceId?: string,
    resourceName?: string,
    oldValues?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    newValues?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<void> {
    const requestInfo = this.extractRequestInfo(request)
    
    await this.createAuditLog({
      action,
      userId,
      userEmail,
      userRole,
      resourceType,
      resourceId,
      resourceName,
      oldValues,
      newValues,
      ...requestInfo,
      metadata
    })

    // Also log to application logger
    logAuditEvent(
      action,
      request,
      userId,
      resourceType,
      {
        resourceId,
        resourceName,
        oldValues,
        newValues,
        ...metadata
      }
    )
  }

  // Specific audit logging methods
  async logUserAction(
    action: AuditAction,
    request: NextRequest,
    adminUserId: string,
    adminEmail: string,
    adminRole: string,
    targetUserId: string,
    targetUserEmail: string,
    oldValues?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    newValues?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<void> {
    await this.logAction(
      action,
      request,
      adminUserId,
      adminEmail,
      adminRole,
      'User',
      targetUserId,
      targetUserEmail,
      oldValues,
      newValues
    )
  }

  async logCouponAction(
    action: AuditAction,
    request: NextRequest,
    userId: string,
    userEmail: string,
    userRole: string,
    couponId: string,
    couponTitle: string,
    oldValues?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    newValues?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<void> {
    await this.logAction(
      action,
      request,
      userId,
      userEmail,
      userRole,
      'Coupon',
      couponId,
      couponTitle,
      oldValues,
      newValues
    )
  }

  async logBrandAction(
    action: AuditAction,
    request: NextRequest,
    userId: string,
    userEmail: string,
    userRole: string,
    brandId: string,
    brandName: string,
    oldValues?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    newValues?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<void> {
    await this.logAction(
      action,
      request,
      userId,
      userEmail,
      userRole,
      'Brand',
      brandId,
      brandName,
      oldValues,
      newValues
    )
  }

  async logCategoryAction(
    action: AuditAction,
    request: NextRequest,
    userId: string,
    userEmail: string,
    userRole: string,
    categoryId: string,
    categoryName: string,
    oldValues?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    newValues?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<void> {
    await this.logAction(
      action,
      request,
      userId,
      userEmail,
      userRole,
      'Category',
      categoryId,
      categoryName,
      oldValues,
      newValues
    )
  }

  async logSecurityEvent(
    action: AuditAction,
    request: NextRequest,
    userId?: string,
    userEmail?: string,
    userRole?: string,
    metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<void> {
    if (!userId || !userEmail || !userRole) {
      // For security events without authenticated user
      const requestInfo = this.extractRequestInfo(request)
      
      await prisma.auditLog.create({
        data: {
          action,
          userId: 'anonymous',
          userEmail: 'anonymous@system',
          userRole: 'ANONYMOUS',
          resourceType: 'Security',
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          endpoint: requestInfo.endpoint,
          method: requestInfo.method,
          metadata
        }
      })
    } else {
      await this.logAction(
        action,
        request,
        userId,
        userEmail,
        userRole,
        'Security',
        undefined,
        undefined,
        undefined,
        undefined,
        metadata
      )
    }
  }

  // Query audit logs
  async getAuditLogs(
    filters: {
      action?: AuditAction
      userId?: string
      resourceType?: string
      resourceId?: string
      startDate?: Date
      endDate?: Date
      page?: number
      limit?: number
    } = {}
  ) {
    const {
      action,
      userId,
      resourceType,
      resourceId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = filters

    const where: any = {}

    if (action) where.action = action
    if (userId) where.userId = userId
    if (resourceType) where.resourceType = resourceType
    if (resourceId) where.resourceId = resourceId
    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = startDate
      if (endDate) where.timestamp.lte = endDate
    }

    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ])

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger()

// Utility functions for common audit scenarios
export const logUserManagement = async (
  action: AuditAction,
  request: NextRequest,
  adminUser: { id: string; email: string; role: string },
  targetUser: { id: string; email: string },
  oldValues?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  newValues?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  await auditLogger.logUserAction(
    action,
    request,
    adminUser.id,
    adminUser.email,
    adminUser.role,
    targetUser.id,
    targetUser.email,
    oldValues,
    newValues
  )
}

export const logCouponManagement = async (
  action: AuditAction,
  request: NextRequest,
  user: { id: string; email: string; role: string },
  coupon: { id: string; title: string },
  oldValues?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  newValues?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  await auditLogger.logCouponAction(
    action,
    request,
    user.id,
    user.email,
    user.role,
    coupon.id,
    coupon.title,
    oldValues,
    newValues
  )
}

export const logBrandManagement = async (
  action: AuditAction,
  request: NextRequest,
  user: { id: string; email: string; role: string },
  brand: { id: string; name: string },
  oldValues?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  newValues?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  await auditLogger.logBrandAction(
    action,
    request,
    user.id,
    user.email,
    user.role,
    brand.id,
    brand.name,
    oldValues,
    newValues
  )
}

export const logCategoryManagement = async (
  action: AuditAction,
  request: NextRequest,
  user: { id: string; email: string; role: string },
  category: { id: string; name: string },
  oldValues?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  newValues?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  await auditLogger.logCategoryAction(
    action,
    request,
    user.id,
    user.email,
    user.role,
    category.id,
    category.name,
    oldValues,
    newValues
  )
}

export const logSecurityEvent = async (
  action: AuditAction,
  request: NextRequest,
  user?: { id: string; email: string; role: string },
  metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  await auditLogger.logSecurityEvent(
    action,
    request,
    user?.id,
    user?.email,
    user?.role,
    metadata
  )
}
