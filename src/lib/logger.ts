import { NextRequest } from 'next/server'

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Log categories
export enum LogCategory {
  SECURITY = 'security',
  AUTH = 'auth',
  API = 'api',
  DATABASE = 'database',
  AUDIT = 'audit',
  SYSTEM = 'system'
}

// Log entry interface
interface LogEntry {
  timestamp: string
  level: LogLevel
  category: LogCategory
  message: string
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  method?: string
  statusCode?: number
  duration?: number
  metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  error?: {
    name: string
    message: string
    stack?: string
  }
}

// Logger class
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatLogEntry(entry: LogEntry): string {
    const baseInfo = {
      timestamp: entry.timestamp,
      level: entry.level,
      category: entry.category,
      message: entry.message
    }

    const contextInfo = {
      userId: entry.userId,
      sessionId: entry.sessionId,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      endpoint: entry.endpoint,
      method: entry.method,
      statusCode: entry.statusCode,
      duration: entry.duration
    }

    const additionalInfo = {
      metadata: entry.metadata,
      error: entry.error
    }

    return JSON.stringify({
      ...baseInfo,
      ...Object.fromEntries(Object.entries(contextInfo).filter(([_, v]) => v !== undefined)),
      ...Object.fromEntries(Object.entries(additionalInfo).filter(([_, v]) => v !== undefined))
    })
  }

  private writeLog(entry: LogEntry): void {
    const formattedLog = this.formatLogEntry(entry)
    
    if (this.isDevelopment) {
      // In development, use console with colors
      const colors = {
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.INFO]: '\x1b[36m',  // Cyan
        [LogLevel.DEBUG]: '\x1b[90m'  // Gray
      }
      const reset = '\x1b[0m'
      
      console.log(`${colors[entry.level]}[${entry.level.toUpperCase()}]${reset} ${formattedLog}`)
    } else {
      // In production, use structured logging
      console.log(formattedLog)
    }

    // In production, you might want to send logs to external services
    // like CloudWatch, Datadog, or Elasticsearch
    if (this.isProduction) {
      this.sendToExternalService(entry)
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // TODO: Implement external logging service integration
    // Examples:
    // - AWS CloudWatch
    // - Datadog
    // - Elasticsearch
    // - Sentry (for errors)
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    request?: NextRequest,
    metadata?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata
    }

    if (request) {
      entry.ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown'
      entry.userAgent = request.headers.get('user-agent') || 'unknown'
      entry.endpoint = request.nextUrl.pathname
      entry.method = request.method
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined
      }
    }

    return entry
  }

  // Public logging methods
  error(
    category: LogCategory,
    message: string,
    request?: NextRequest,
    metadata?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    error?: Error
  ): void {
    this.writeLog(this.createLogEntry(LogLevel.ERROR, category, message, request, metadata, error))
  }

  warn(
    category: LogCategory,
    message: string,
    request?: NextRequest,
    metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): void {
    this.writeLog(this.createLogEntry(LogLevel.WARN, category, message, request, metadata))
  }

  info(
    category: LogCategory,
    message: string,
    request?: NextRequest,
    metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): void {
    this.writeLog(this.createLogEntry(LogLevel.INFO, category, message, request, metadata))
  }

  debug(
    category: LogCategory,
    message: string,
    request?: NextRequest,
    metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): void {
    if (this.isDevelopment) {
      this.writeLog(this.createLogEntry(LogLevel.DEBUG, category, message, request, metadata))
    }
  }

  // Security-specific logging methods
  securityEvent(
    event: string,
    request: NextRequest,
    userId?: string,
    metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): void {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.SECURITY, event, request, metadata)
    entry.userId = userId
    this.writeLog(entry)
  }

  authEvent(
    event: string,
    request: NextRequest,
    userId?: string,
    metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): void {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.AUTH, event, request, metadata)
    entry.userId = userId
    this.writeLog(entry)
  }

  auditEvent(
    action: string,
    request: NextRequest,
    userId: string,
    resource?: string,
    metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): void {
    const entry = this.createLogEntry(
      LogLevel.INFO, 
      LogCategory.AUDIT, 
      `Admin action: ${action}`, 
      request, 
      { ...metadata, resource }
    )
    entry.userId = userId
    this.writeLog(entry)
  }

  apiRequest(
    request: NextRequest,
    statusCode: number,
    duration: number,
    userId?: string
  ): void {
    const entry = this.createLogEntry(
      LogLevel.INFO,
      LogCategory.API,
      `API request completed`,
      request,
      undefined
    )
    entry.statusCode = statusCode
    entry.duration = duration
    entry.userId = userId
    this.writeLog(entry)
  }
}

// Export singleton instance
export const logger = new Logger()

// Utility functions for common logging scenarios
export const logSecurityEvent = (event: string, request: NextRequest, userId?: string, metadata?: Record<string, any>) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  logger.securityEvent(event, request, userId, metadata)
}

export const logAuthEvent = (event: string, request: NextRequest, userId?: string, metadata?: Record<string, any>) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  logger.authEvent(event, request, userId, metadata)
}

export const logAuditEvent = (action: string, request: NextRequest, userId: string, resource?: string, metadata?: Record<string, any>) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  logger.auditEvent(action, request, userId, resource, metadata)
}

export const logApiRequest = (request: NextRequest, statusCode: number, duration: number, userId?: string) => {
  logger.apiRequest(request, statusCode, duration, userId)
}

export const logError = (category: LogCategory, message: string, request?: NextRequest, metadata?: Record<string, any>, error?: Error) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  logger.error(category, message, request, metadata, error)
}

export const logWarning = (category: LogCategory, message: string, request?: NextRequest, metadata?: Record<string, any>) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  logger.warn(category, message, request, metadata)
}

export const logInfo = (category: LogCategory, message: string, request?: NextRequest, metadata?: Record<string, any>) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  logger.info(category, message, request, metadata)
}
