import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

// Common validation schemas
export const commonSchemas = {
  // CUID validation (Prisma uses CUIDs, not UUIDs)
  uuid: z.string().min(1, 'ID is required').max(50, 'ID too long'),
  
  // Email validation
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  
  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  // Name validation
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters'),
  
  // URL validation (treat empty string as undefined)
  url: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined
    }
    return value
  }, z.string().url('Invalid URL format').max(500, 'URL too long')),
  
  // Slug validation
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9\-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  
  // Color validation (hex)
  hexColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format'),
  
  // Date validation (accept empty string or null → undefined) and allow date-only strings
  dateString: z.preprocess((value) => {
    if (value === null || value === undefined) return undefined
    if (typeof value === 'string' && value.trim() === '') return undefined
    // If date-only (YYYY-MM-DD), convert to ISO string at midnight
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      try {
        const d = new Date(value + 'T00:00:00.000Z')
        if (!isNaN(d.getTime())) return d.toISOString()
      } catch {}
    }
    return value
  }, z.string().datetime('Invalid date format')),
  
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20)
  }),
  
  // Search query
  searchQuery: z.string()
    .min(1, 'Search query is required')
    .max(100, 'Search query too long')
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Search query contains invalid characters')
}

// Coupon validation schemas
const couponCreateSchema = z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(200, 'Title too long')
      .regex(/^[a-zA-Z0-9\s\-_\.&%()]+$/, 'Title contains invalid characters'),
    
    description: z.string()
      .max(1000, 'Description too long')
      .optional(),
    
    code: z.string()
      .max(50, 'Code too long')
      .regex(/^[A-Z0-9\-_]+$/, 'Code can only contain uppercase letters, numbers, hyphens, and underscores')
      .optional(),
    
    type: z.enum(['COUPON_CODE', 'DEAL', 'CASHBACK', 'FREE_SHIPPING'], {
      message: 'Invalid coupon type'
    }),
    
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_ONE_GET_ONE'], {
      message: 'Invalid discount type'
    }),
    
    discountValue: z.coerce.number()
      .min(0, 'Discount value must be positive')
      .max(10000, 'Discount value too large'),
    
    minOrderValue: z.coerce.number()
      .min(0, 'Minimum order value must be positive')
      .max(100000, 'Minimum order value too large')
      .optional(),
    
    maxDiscount: z.coerce.number()
      .min(0, 'Maximum discount must be positive')
      .max(10000, 'Maximum discount too large')
      .optional(),
    
    isActive: z.boolean().default(true),
    isVerified: z.boolean().default(false),
    isExclusive: z.boolean().default(false),
    
    usageLimit: z.coerce.number()
      .int()
      .min(1, 'Usage limit must be at least 1')
      .max(1000000, 'Usage limit too large')
      .optional(),
    
    startDate: commonSchemas.dateString.optional(),
    endDate: commonSchemas.dateString.optional(),
    
    terms: z.string()
      .max(2000, 'Terms too long')
      .optional(),
    
    image: commonSchemas.url.optional(),
    affiliateUrl: commonSchemas.url.optional(),
    
    brandId: commonSchemas.uuid,
    categoryId: commonSchemas.uuid
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate)
      }
      return true
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate']
    }
  )

const couponUpdateSchema = couponCreateSchema.partial().extend({
  id: commonSchemas.uuid
})

const couponQuerySchema = z.object({
    page: commonSchemas.pagination.shape.page,
    limit: commonSchemas.pagination.shape.limit,
    q: z.string().max(100, 'Search query too long').optional(),
    categoryId: commonSchemas.uuid.optional(),
    brandId: commonSchemas.uuid.optional(),
    type: z.enum(['COUPON_CODE', 'DEAL', 'CASHBACK', 'FREE_SHIPPING']).optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_ONE_GET_ONE']).optional(),
    minDiscount: z.coerce.number().min(0).optional(),
    maxDiscount: z.coerce.number().min(0).optional(),
    verified: z.enum(['true', 'false']).optional(),
    exclusive: z.enum(['true', 'false']).optional(),
    sortBy: z.enum(['newest', 'popular', 'discount', 'expiry']).default('newest'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const couponSchemas = {
  create: couponCreateSchema,
  update: couponUpdateSchema,
  query: couponQuerySchema
}

// Brand validation schemas
const optionalString = z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(1000).optional())

const brandCreateSchema = z.object({
    name: z.string()
      .min(1, 'Brand name is required')
      .max(100, 'Brand name too long')
      .regex(/^[a-zA-Z0-9\s\-_&\.]+$/, 'Brand name contains invalid characters'),
    
    description: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(500, 'Description too long').optional()),
    
    logo: commonSchemas.url.optional(),
    website: commonSchemas.url.optional(),
    seoTitle: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(70).optional()),
    seoDescription: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(160).optional()),
    seoKeywords: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(300).optional()),
    ogImage: commonSchemas.url.optional(),
    
    isActive: z.boolean().default(true)
  })

const brandUpdateSchema = brandCreateSchema.partial().extend({
  id: commonSchemas.uuid
})

const brandQuerySchema = z.object({
    page: commonSchemas.pagination.shape.page,
    limit: commonSchemas.pagination.shape.limit,
    search: z.string().max(100, 'Search query too long').optional(),
    active: z.enum(['true', 'false']).optional()
})

export const brandSchemas = {
  create: brandCreateSchema,
  update: brandUpdateSchema,
  query: brandQuerySchema
}

// Category validation schemas
const categoryCreateSchema = z.object({
    name: z.string()
      .min(1, 'Category name is required')
      .max(100, 'Category name too long')
      .regex(/^[a-zA-Z0-9\s\-_&\.]+$/, 'Category name contains invalid characters'),
    
    description: z.string()
      .max(500, 'Description too long')
      .optional(),
    
    icon: z.string()
      .max(10, 'Icon too long')
      .optional(),
    
    color: commonSchemas.hexColor.optional(),
    
    isActive: z.boolean().default(true)
  })

const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: commonSchemas.uuid
})

const categoryQuerySchema = z.object({
  page: commonSchemas.pagination.shape.page,
  limit: commonSchemas.pagination.shape.limit,
  search: z.string().max(100, 'Search query too long').optional(),
  active: z.enum(['true', 'false']).optional()
})

export const categorySchemas = {
  create: categoryCreateSchema,
  update: categoryUpdateSchema,
  query: categoryQuerySchema
}

// Contact & Partner submissions
export const contactSchemas = {
  create: z.object({
    type: z.enum(['CONTACT', 'PARTNER']),
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email required'),
    company: z.string().optional(),
    message: z.string().min(1, 'Please add a message'),
    budget: z.string().optional(),
    goals: z.string().optional()
  })
}

// User validation schemas
export const userSchemas = {
  profile: z.object({
    name: commonSchemas.name,
    email: commonSchemas.email
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password
  }).refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: 'New password must be different from current password',
      path: ['newPassword']
    }
  ),
  
  favorites: z.object({
    couponId: commonSchemas.uuid
  }),
  
  query: z.object({
    page: commonSchemas.pagination.shape.page,
    search: z.string().max(100, 'Search query too long').optional(),
    role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN', 'all']).default('all'),
    status: z.enum(['active', 'inactive', 'all']).default('all')
  })
}

// Search validation schemas
export const searchSchemas = {
  query: z.object({
    q: z.string()
      .min(1, 'Search query is required')
      .max(100, 'Search query too long')
      .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Search query contains invalid characters'),
    
    type: z.enum(['all', 'coupons', 'brands', 'categories']).default('all'),
    limit: z.coerce.number().int().min(1).max(50).default(10)
  })
}

// Admin validation schemas
export const adminSchemas = {
  userToggle: z.object({
    userId: commonSchemas.uuid,
    isActive: z.boolean()
  }),
  
  analytics: z.object({
    period: z.enum(['7d', '30d', '90d', '1y']).default('30d')
  })
}

// Validation helper functions
export const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      throw new Error(`Validation failed: ${errorMessages}`)
    }
    throw error
  }
}

export const validateQueryParams = <T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T => {
  const params = Object.fromEntries(searchParams.entries())
  return validateRequest(schema, params)
}

export const validateRequestBody = <T>(schema: z.ZodSchema<T>, body: unknown): T => {
  return validateRequest(schema, body)
}

// Middleware for request validation
export const withValidation = <T>(
  schema: z.ZodSchema<T>,
  source: 'body' | 'query' = 'body'
) => {
  return (handler: (validatedData: T, ...args: any[]) => Promise<NextResponse>) => {
    return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
      try {
        let validatedData: T
        
        if (source === 'body') {
          const body = await request.json()
          validatedData = validateRequestBody(schema, body)
        } else {
          const { searchParams } = new URL(request.url)
          validatedData = validateQueryParams(schema, searchParams)
        }
        
        return await handler(validatedData, ...args)
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            message: error instanceof Error ? error.message : 'Validation failed',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        )
      }
    }
  }
}
