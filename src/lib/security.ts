import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DOMPurify from 'isomorphic-dompurify'
import { z } from 'zod'
import { logger, LogCategory, logSecurityEvent } from './logger'
import { handleError, RateLimitError, AuthenticationError, AuthorizationError } from './error-handler'
import { sessionManager } from './session-manager'

// Re-export z for convenience
export { z }

// Type definitions
interface SessionUser {
  id: string
  email: string
  name: string
  role: string
}

interface Session {
  user: SessionUser
}

interface AuthResult {
  session: Session | null
  response?: NextResponse
}

interface ExtendedRequest extends NextRequest {
  session?: Session
  validatedBody?: any
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// CSRF token store (in production, use Redis or similar)
const csrfTokens = new Map<string, { token: string; expires: number }>()

// Input sanitization schemas
export const sanitizeString = (input: string): string => {
  return DOMPurify.sanitize(input.trim())
}

export const sanitizeEmail = (email: string): string => {
  return DOMPurify.sanitize(email.toLowerCase().trim())
}

export const sanitizeUrl = (url: string): string => {
  const sanitized = DOMPurify.sanitize(url.trim())
  try {
    new URL(sanitized)
    return sanitized
  } catch {
    throw new Error('Invalid URL format')
  }
}

// Validation schemas
export const couponSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  code: z.string().max(50).optional(),
  type: z.enum(['COUPON_CODE', 'DEAL', 'CASHBACK', 'FREE_SHIPPING']),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_ONE_GET_ONE']),
  discountValue: z.number().min(0).max(10000),
  minOrderValue: z.number().min(0).max(100000).optional(),
  maxDiscount: z.number().min(0).max(10000).optional(),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  isExclusive: z.boolean(),
  usageLimit: z.number().min(1).max(1000000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  terms: z.string().max(2000).optional(),
  image: z.string().url().optional(),
  affiliateUrl: z.string().url().optional(),
  brandId: z.string().uuid(),
  categoryId: z.string().uuid()
})

export const brandSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  isActive: z.boolean().optional()
})

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  isActive: z.boolean().optional()
})

export const userProfileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email()
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100)
})

// Rate limiting
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const now = Date.now()
    const key = `${ip}:${request.nextUrl.pathname}`
    
    const current = rateLimitStore.get(key)
    
    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
      return null
    }
    
    if (current.count >= maxRequests) {
      // Log rate limit violation
      logSecurityEvent(
        'Rate limit exceeded',
        request,
        undefined,
        { 
          ip, 
          endpoint: request.nextUrl.pathname, 
          count: current.count, 
          limit: maxRequests,
          windowMs 
        }
      )
      
      throw new RateLimitError(`Rate limit exceeded: ${maxRequests} requests per ${windowMs / 1000 / 60} minutes`)
    }
    
    current.count++
    return null
  }
}

// Authentication middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const requireAuth = async (request: NextRequest): Promise<{ session: any; response?: NextResponse }> => {
  try {
    // Use enhanced session validation
    const validationResult = await sessionManager.validateSession(request)
    
    if (!validationResult.isValid) {
      // Log authentication failure
      logSecurityEvent(
        'Authentication failed',
        request,
        undefined,
        { reason: validationResult.error }
      )
      
      throw new AuthenticationError(validationResult.error || 'Authentication required')
    }
    
    return { session: validationResult.session }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error
    }
    
    // Log unexpected authentication error
    logger.error(
      LogCategory.AUTH,
      'Unexpected authentication error',
      request,
      { error: error instanceof Error ? error.message : 'Unknown error' },
      error instanceof Error ? error : undefined
    )
    
    throw new AuthenticationError('Authentication failed')
  }
}

// Admin authorization middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const requireAdmin = async (request: NextRequest): Promise<{ session: any; response?: NextResponse }> => {
  try {
    const { session, response } = await requireAuth(request)
    
    if (response) return { session, response }
    
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      // Log authorization failure
      logSecurityEvent(
        'Authorization failed - insufficient privileges',
        request,
        session.user.id,
        { 
          userRole: session.user.role, 
          requiredRole: 'ADMIN or SUPER_ADMIN',
          endpoint: request.nextUrl.pathname 
        }
      )
      
      throw new AuthorizationError('Admin access required')
    }
    
    return { session }
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof AuthenticationError) {
      throw error
    }
    
    // Log unexpected authorization error
    logger.error(
      LogCategory.AUTH,
      'Unexpected authorization error',
      request,
      { error: error instanceof Error ? error.message : 'Unknown error' },
      error instanceof Error ? error : undefined
    )
    
    throw new AuthorizationError('Authorization failed')
  }
}

// CSRF protection
export const generateCSRFToken = (): string => {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15)
  const expires = Date.now() + (60 * 60 * 1000) // 1 hour
  
  csrfTokens.set(token, { token, expires })
  
  // Clean up expired tokens
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < Date.now()) {
      csrfTokens.delete(key)
    }
  }
  
  return token
}

export const validateCSRFToken = (token: string): boolean => {
  const stored = csrfTokens.get(token)
  
  if (!stored || stored.expires < Date.now()) {
    csrfTokens.delete(token)
    return false
  }
  
  return true
}

// CSRF middleware for state-changing operations
export const requireCSRF = (request: NextRequest): NextResponse | null => {
  const token = request.headers.get('x-csrf-token')
  
  if (!token || !validateCSRFToken(token)) {
    return NextResponse.json(
      { success: false, message: 'Invalid CSRF token' },
      { status: 403 }
    )
  }
  
  return null
}

// Input validation and sanitization
export const validateAndSanitize = <T>(schema: z.ZodSchema<T>, data: any): { success: true; data: T } | { success: false; error: string } => {
  try {
    const sanitizedData = sanitizeInput(data)
    const validatedData = schema.parse(sanitizedData)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map(e => e.message).join(', ') }
    }
    return { success: false, error: 'Invalid input data' }
  }
}

// Recursive input sanitization
const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return sanitizeString(input)
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// Security headers middleware
export const addSecurityHeaders = (response: NextResponse): NextResponse => {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return response
}

// Comprehensive security middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withSecurity = (
  handler: (request: any, ...args: any[]) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requireAdmin?: boolean
    requireCSRF?: boolean
    rateLimit?: { maxRequests: number; windowMs: number }
    validateInput?: z.ZodSchema<any>
  } = {}
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const startTime = Date.now()
    let userId: string | undefined

    try {
      // Rate limiting
      if (options.rateLimit) {
        await rateLimit(options.rateLimit.maxRequests, options.rateLimit.windowMs)(request)
      }
      
      // CSRF protection
      if (options.requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const csrfResponse = requireCSRF(request)
        if (csrfResponse) return csrfResponse
      }
      
      // Authentication
      if (options.requireAuth || options.requireAdmin) {
        const { session, response } = options.requireAdmin 
          ? await requireAdmin(request)
          : await requireAuth(request)
        
        if (response) return response
        
        // Add session to request context
        ;(request as any).session = session
        userId = session.user.id
      }
      
      // Input validation
      if (options.validateInput && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const body = await request.json()
        const validation = validateAndSanitize(options.validateInput, body)
        
        if (!validation.success) {
          logger.warn(
            LogCategory.API,
            'Input validation failed',
            request,
            { userId, validationError: validation.error }
          )
          
          return NextResponse.json(
            { success: false, message: validation.error },
            { status: 400 }
          )
        }
        
        // Replace request body with validated data
        ;(request as any).validatedBody = validation.data
      }
      
      // Execute handler
      const response = await handler(request, ...args)
      
      // Log successful API request
      const duration = Date.now() - startTime
      logger.apiRequest(request, response.status, duration, userId)
      
      // Add security headers
      return addSecurityHeaders(response)
      
    } catch (error) {
      // Use enhanced error handling
      return handleError(error as Error, request, userId)
    }
  }
}
