import { NextRequest, NextResponse } from 'next/server'
import { logger, LogCategory, logError } from './logger'

// Custom error classes
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly category: LogCategory

  constructor(
    message: string,
    statusCode: number = 500,
    category: LogCategory = LogCategory.SYSTEM,
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.category = category

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, LogCategory.API)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, LogCategory.AUTH)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, LogCategory.AUTH)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, LogCategory.API)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, LogCategory.API)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, LogCategory.SECURITY)
    this.name = 'RateLimitError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, LogCategory.DATABASE)
    this.name = 'DatabaseError'
  }
}

// Error response interface
interface ErrorResponse {
  success: false
  message: string
  code?: string
  details?: any
  timestamp: string
  requestId?: string
}

// Generate a unique request ID for tracking
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Safe error messages for production
const getSafeErrorMessage = (error: Error, isDevelopment: boolean): string => {
  if (isDevelopment) {
    return error.message
  }

  // In production, only show safe error messages
  if (error instanceof AppError && error.isOperational) {
    return error.message
  }

  // For non-operational errors, show generic message
  return 'An unexpected error occurred. Please try again later.'
}

// Get error code for client
const getErrorCode = (error: Error): string | undefined => {
  if (error instanceof AppError) {
    return error.name
  }
  return undefined
}

// Get additional details for development
const getErrorDetails = (error: Error, isDevelopment: boolean): any => {
  if (!isDevelopment) {
    return undefined
  }

  if (error instanceof AppError) {
    return {
      stack: error.stack,
      category: error.category,
      isOperational: error.isOperational
    }
  }

  return {
    stack: error.stack,
    name: error.name
  }
}

// Main error handler
export const handleError = (
  error: Error,
  request?: NextRequest,
  userId?: string
): NextResponse => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const requestId = generateRequestId()

  // Determine status code
  let statusCode = 500
  if (error instanceof AppError) {
    statusCode = error.statusCode
  }

  // Log the error
  logError(
    error instanceof AppError ? error.category : LogCategory.SYSTEM,
    error.message,
    request,
    {
      requestId,
      userId,
      errorName: error.name,
      statusCode
    },
    error
  )

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    message: getSafeErrorMessage(error, isDevelopment),
    code: getErrorCode(error),
    details: getErrorDetails(error, isDevelopment),
    timestamp: new Date().toISOString(),
    requestId
  }

  // Return appropriate response
  return NextResponse.json(errorResponse, { status: statusCode })
}

// Async error wrapper for API routes
export const withErrorHandling = <T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) => {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      // Extract request from args if available
      const request = args.find(arg => arg && typeof arg === 'object' && 'nextUrl' in arg) as NextRequest | undefined
      
      return handleError(error as Error, request)
    }
  }
}

// Database error handler
export const handleDatabaseError = (error: any, operation: string): never => {
  // Log database error
  logger.error(
    LogCategory.DATABASE,
    `Database error during ${operation}`,
    undefined,
    { operation, errorCode: error.code },
    error
  )

  // Throw appropriate error
  if (error.code === 'P2002') {
    throw new ConflictError('A record with this information already exists')
  } else if (error.code === 'P2025') {
    throw new NotFoundError('Record not found')
  } else if (error.code === 'P2003') {
    throw new ValidationError('Invalid reference to related record')
  } else {
    throw new DatabaseError(`Database operation failed: ${operation}`)
  }
}

// Validation error handler
export const handleValidationError = (errors: any[]): never => {
  const errorMessages = errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
  throw new ValidationError(`Validation failed: ${errorMessages}`)
}

// Security error handler
export const handleSecurityError = (
  event: string,
  request: NextRequest,
  userId?: string,
  metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
): never => {
  // Log security event
  logger.securityEvent(event, request, userId, metadata)
  
  // Throw appropriate error based on event
  if (event.includes('rate limit')) {
    throw new RateLimitError('Too many requests. Please try again later.')
  } else if (event.includes('authentication')) {
    throw new AuthenticationError('Authentication failed')
  } else if (event.includes('authorization')) {
    throw new AuthorizationError('Access denied')
  } else {
    throw new AppError('Security violation detected', 403, LogCategory.SECURITY)
  }
}

// Utility function to create standardized error responses
export const createErrorResponse = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): NextResponse => {
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  }

  return NextResponse.json(errorResponse, { status: statusCode })
}

// Utility function to create success responses
export const createSuccessResponse = (
  data: any,
  message?: string,
  statusCode: number = 200
): NextResponse => {
  const response: {
    success: boolean
    data: any
    timestamp: string
    message?: string
  } = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }

  if (message) {
    response.message = message
  }

  return NextResponse.json(response, { status: statusCode })
}
