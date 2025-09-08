import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './db'
import { logger, LogCategory, logAuthEvent } from './logger'
import { AuditAction, logSecurityEvent } from './audit'

// Session validation result
interface SessionValidationResult {
  isValid: boolean
  session?: any
  error?: string
  shouldRefresh?: boolean
}

// Session security settings
const SESSION_CONFIG = {
  // Session timeout (in milliseconds)
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  
  // Refresh token timeout (in milliseconds)
  REFRESH_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Maximum concurrent sessions per user
  MAX_CONCURRENT_SESSIONS: 5,
  
  // Session activity timeout (in milliseconds)
  ACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  
  // Failed login attempt limits
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
}

// Session activity tracking
interface SessionActivity {
  userId: string
  sessionId: string
  lastActivity: Date
  ipAddress: string
  userAgent: string
  endpoint: string
}

// Enhanced session manager
class SessionManager {
  private activeSessions = new Map<string, SessionActivity>()
  private failedAttempts = new Map<string, { count: number; lastAttempt: Date }>()

  // Validate session with enhanced security checks
  async validateSession(request: NextRequest): Promise<SessionValidationResult> {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return {
          isValid: false,
          error: 'No valid session found'
        }
      }

      // Check if user is locked out due to failed attempts
      const lockoutStatus = this.checkLockoutStatus(session.user.id)
      if (lockoutStatus.isLocked) {
        await logSecurityEvent(
          AuditAction.SUSPICIOUS_ACTIVITY,
          request,
          { id: session.user.id, email: session.user.email, role: session.user.role },
          { reason: 'Account locked due to failed attempts', lockoutUntil: lockoutStatus.lockoutUntil }
        )
        
        return {
          isValid: false,
          error: 'Account temporarily locked due to security concerns'
        }
      }

      // Check session activity timeout
      const sessionId = this.getSessionId(request)
      const activity = this.activeSessions.get(sessionId)
      
      if (activity) {
        const timeSinceActivity = Date.now() - activity.lastActivity.getTime()
        
        if (timeSinceActivity > SESSION_CONFIG.ACTIVITY_TIMEOUT) {
          // Session expired due to inactivity
          this.activeSessions.delete(sessionId)
          
          await logAuthEvent(
            'Session expired due to inactivity',
            request,
            session.user.id,
            { sessionId, timeSinceActivity }
          )
          
          return {
            isValid: false,
            error: 'Session expired due to inactivity'
          }
        }
        
        // Update last activity
        activity.lastActivity = new Date()
        activity.endpoint = request.nextUrl.pathname
      } else {
        // Track new session activity
        this.trackSessionActivity(request, session.user.id, sessionId)
      }

      // Check concurrent sessions
      const concurrentSessions = await this.getConcurrentSessions(session.user.id)
      if (concurrentSessions > SESSION_CONFIG.MAX_CONCURRENT_SESSIONS) {
        await logSecurityEvent(
          AuditAction.SUSPICIOUS_ACTIVITY,
          request,
          { id: session.user.id, email: session.user.email, role: session.user.role },
          { reason: 'Too many concurrent sessions', count: concurrentSessions }
        )
        
        return {
          isValid: false,
          error: 'Too many concurrent sessions'
        }
      }

      return {
        isValid: true,
        session
      }

    } catch (error) {
      logger.error(
        LogCategory.AUTH,
        'Session validation failed',
        request,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        error instanceof Error ? error : undefined
      )
      
      return {
        isValid: false,
        error: 'Session validation failed'
      }
    }
  }

  // Track session activity
  private trackSessionActivity(request: NextRequest, userId: string, sessionId: string): void {
    const activity: SessionActivity = {
      userId,
      sessionId,
      lastActivity: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      endpoint: request.nextUrl.pathname
    }
    
    this.activeSessions.set(sessionId, activity)
  }

  // Generate session ID from request
  private getSessionId(request: NextRequest): string {
    // Use a combination of IP and User-Agent for session identification
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    return `${ip}_${userAgent}`.replace(/[^a-zA-Z0-9_]/g, '_')
  }

  // Check lockout status
  private checkLockoutStatus(userId: string): { isLocked: boolean; lockoutUntil?: Date } {
    const attempts = this.failedAttempts.get(userId)
    
    if (!attempts) {
      return { isLocked: false }
    }

    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime()
    
    if (attempts.count >= SESSION_CONFIG.MAX_FAILED_ATTEMPTS) {
      if (timeSinceLastAttempt < SESSION_CONFIG.LOCKOUT_DURATION) {
        const lockoutUntil = new Date(attempts.lastAttempt.getTime() + SESSION_CONFIG.LOCKOUT_DURATION)
        return { isLocked: true, lockoutUntil }
      } else {
        // Reset failed attempts after lockout period
        this.failedAttempts.delete(userId)
        return { isLocked: false }
      }
    }

    return { isLocked: false }
  }

  // Record failed login attempt
  async recordFailedAttempt(request: NextRequest, userId: string): Promise<void> {
    const attempts = this.failedAttempts.get(userId) || { count: 0, lastAttempt: new Date() }
    attempts.count++
    attempts.lastAttempt = new Date()
    
    this.failedAttempts.set(userId, attempts)

    await logSecurityEvent(
      AuditAction.LOGIN_FAILED,
      request,
      { id: userId, email: 'unknown', role: 'USER' },
      { attemptCount: attempts.count }
    )

    // If max attempts reached, log security event
    if (attempts.count >= SESSION_CONFIG.MAX_FAILED_ATTEMPTS) {
      await logSecurityEvent(
        AuditAction.SUSPICIOUS_ACTIVITY,
        request,
        { id: userId, email: 'unknown', role: 'USER' },
        { reason: 'Account locked due to failed login attempts', lockoutDuration: SESSION_CONFIG.LOCKOUT_DURATION }
      )
    }
  }

  // Clear failed attempts (on successful login)
  clearFailedAttempts(userId: string): void {
    this.failedAttempts.delete(userId)
  }

  // Get concurrent sessions count
  private async getConcurrentSessions(userId: string): Promise<number> {
    let count = 0
    for (const [_, activity] of this.activeSessions) {
      if (activity.userId === userId) {
        count++
      }
    }
    return count
  }

  // Invalidate session
  async invalidateSession(request: NextRequest, userId: string, reason: string): Promise<void> {
    const sessionId = this.getSessionId(request)
    this.activeSessions.delete(sessionId)

    await logAuthEvent(
      `Session invalidated: ${reason}`,
      request,
      userId,
      { sessionId, reason }
    )
  }

  // Clean up expired sessions
  cleanupExpiredSessions(): void {
    const now = Date.now()
    
    for (const [sessionId, activity] of this.activeSessions) {
      const timeSinceActivity = now - activity.lastActivity.getTime()
      
      if (timeSinceActivity > SESSION_CONFIG.ACTIVITY_TIMEOUT) {
        this.activeSessions.delete(sessionId)
      }
    }
  }

  // Get session statistics
  getSessionStats(): {
    activeSessions: number
    failedAttempts: number
    lockedUsers: number
  } {
    const activeSessions = this.activeSessions.size
    const failedAttempts = this.failedAttempts.size
    let lockedUsers = 0

    for (const [_, attempts] of this.failedAttempts) {
      if (attempts.count >= SESSION_CONFIG.MAX_FAILED_ATTEMPTS) {
        const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime()
        if (timeSinceLastAttempt < SESSION_CONFIG.LOCKOUT_DURATION) {
          lockedUsers++
        }
      }
    }

    return {
      activeSessions,
      failedAttempts,
      lockedUsers
    }
  }

  // Force logout all sessions for a user
  async forceLogoutUser(userId: string, reason: string): Promise<void> {
    const sessionsToRemove: string[] = []
    
    for (const [sessionId, activity] of this.activeSessions) {
      if (activity.userId === userId) {
        sessionsToRemove.push(sessionId)
      }
    }

    for (const sessionId of sessionsToRemove) {
      this.activeSessions.delete(sessionId)
    }

    logger.info(
      LogCategory.AUTH,
      `Force logged out user ${userId}: ${reason}`,
      undefined,
      { userId, reason, sessionsRemoved: sessionsToRemove.length }
    )
  }

  // Check if user has admin privileges
  async hasAdminPrivileges(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
    } catch (error) {
      logger.error(
        LogCategory.AUTH,
        'Failed to check admin privileges',
        undefined,
        { userId, error: error instanceof Error ? error.message : 'Unknown error' },
        error instanceof Error ? error : undefined
      )
      return false
    }
  }

  // Get user session info
  async getUserSessionInfo(userId: string): Promise<{
    activeSessions: number
    lastActivity?: Date
    isLocked: boolean
    lockoutUntil?: Date
  }> {
    const lockoutStatus = this.checkLockoutStatus(userId)
    let activeSessions = 0
    let lastActivity: Date | undefined

    for (const [_, activity] of this.activeSessions) {
      if (activity.userId === userId) {
        activeSessions++
        if (!lastActivity || activity.lastActivity > lastActivity) {
          lastActivity = activity.lastActivity
        }
      }
    }

    return {
      activeSessions,
      lastActivity,
      isLocked: lockoutStatus.isLocked,
      lockoutUntil: lockoutStatus.lockoutUntil
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager()

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  sessionManager.cleanupExpiredSessions()
}, 5 * 60 * 1000)

// Utility functions
export const validateSession = (request: NextRequest) => sessionManager.validateSession(request)
export const recordFailedLogin = (request: NextRequest, userId: string) => sessionManager.recordFailedAttempt(request, userId)
export const clearFailedAttempts = (userId: string) => sessionManager.clearFailedAttempts(userId)
export const invalidateSession = (request: NextRequest, userId: string, reason: string) => sessionManager.invalidateSession(request, userId, reason)
export const forceLogoutUser = (userId: string, reason: string) => sessionManager.forceLogoutUser(userId, reason)
export const hasAdminPrivileges = (userId: string) => sessionManager.hasAdminPrivileges(userId)
export const getUserSessionInfo = (userId: string) => sessionManager.getUserSessionInfo(userId)
export const getSessionStats = () => sessionManager.getSessionStats()
