import { NextResponse } from 'next/server'
import { withSecurity } from '@/lib/security'
import { getSessionStats } from '@/lib/session-manager'
import { auditLogger } from '@/lib/audit'
import { AuditAction } from '@/lib/audit'
import { prisma } from '@/lib/db'

export const GET = withSecurity(
  async () => {
    try {
      // Get session statistics
      const sessionStats = getSessionStats()

      // Get recent security events (last 24 hours)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const recentSecurityEvents = await auditLogger.getAuditLogs({
        startDate: yesterday,
        limit: 50
      })

      // Get failed login attempts
      const failedLogins = recentSecurityEvents.logs.filter(
        log => log.action === AuditAction.LOGIN_FAILED
      )

      // Get suspicious activities
      const suspiciousActivities = recentSecurityEvents.logs.filter(
        log => log.action === AuditAction.SUSPICIOUS_ACTIVITY
      )

      // Get admin actions
      const adminActions = recentSecurityEvents.logs.filter(
        log => [
          AuditAction.COUPON_CREATED,
          AuditAction.COUPON_UPDATED,
          AuditAction.COUPON_DELETED,
          AuditAction.BRAND_CREATED,
          AuditAction.BRAND_UPDATED,
          AuditAction.BRAND_DELETED,
          AuditAction.CATEGORY_CREATED,
          AuditAction.CATEGORY_UPDATED,
          AuditAction.CATEGORY_DELETED,
          AuditAction.USER_STATUS_CHANGED,
          AuditAction.USER_ROLE_CHANGED
        ].includes(log.action as AuditAction)
      )

      // Get user statistics
      const userStats = await prisma.user.groupBy({
        by: ['role', 'isActive'],
        _count: {
          id: true
        }
      })

      // Get coupon statistics
      const couponStats = await prisma.coupon.groupBy({
        by: ['isActive', 'isVerified'],
        _count: {
          id: true
        }
      })

      // Calculate security metrics
      const securityMetrics = {
        totalUsers: userStats.reduce((sum, stat) => sum + stat._count.id, 0),
        activeUsers: userStats
          .filter(stat => stat.isActive)
          .reduce((sum, stat) => sum + stat._count.id, 0),
        adminUsers: userStats
          .filter(stat => stat.role === 'ADMIN' || stat.role === 'SUPER_ADMIN')
          .reduce((sum, stat) => sum + stat._count.id, 0),
        totalCoupons: couponStats.reduce((sum, stat) => sum + stat._count.id, 0),
        activeCoupons: couponStats
          .filter(stat => stat.isActive)
          .reduce((sum, stat) => sum + stat._count.id, 0),
        verifiedCoupons: couponStats
          .filter(stat => stat.isVerified)
          .reduce((sum, stat) => sum + stat._count.id, 0)
      }

      // Get top failed login IPs
      const failedLoginIPs = failedLogins.reduce((acc, log) => {
        const ip = log.ipAddress
        acc[ip] = (acc[ip] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topFailedIPs = Object.entries(failedLoginIPs)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count }))

      // Get recent admin activities by user
      const adminActivitiesByUser = adminActions.reduce((acc, log) => {
        const userId = log.userId
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userEmail: log.userEmail,
            userRole: log.userRole,
            count: 0,
            actions: []
          }
        }
        acc[userId].count++
        acc[userId].actions.push({
          action: log.action,
          resourceType: log.resourceType,
          resourceName: log.resourceName,
          timestamp: log.timestamp
        })
        return acc
      }, {} as Record<string, {
        userId: string
        userEmail: string
        userRole: string
        count: number
        actions: Array<{
          action: string
          resourceType: string
          resourceName: string | null
          timestamp: Date
        }>
      }>)

      const topAdminUsers = Object.values(adminActivitiesByUser)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return NextResponse.json({
        success: true,
        data: {
          sessionStats,
          securityMetrics,
          recentEvents: {
            total: recentSecurityEvents.total,
            failedLogins: failedLogins.length,
            suspiciousActivities: suspiciousActivities.length,
            adminActions: adminActions.length
          },
          topFailedIPs,
          topAdminUsers,
          recentSecurityEvents: recentSecurityEvents.logs.slice(0, 20)
        }
      })

    } catch (error) {
      console.error('Error fetching security dashboard data:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch security dashboard data'
        },
        { status: 500 }
      )
    }
  },
  {
    requireAdmin: true,
    rateLimit: { maxRequests: 30, windowMs: 15 * 60 * 1000 }
  }
)
