import { User, Coupon, Brand, Category, CouponType, DiscountType, UserRole } from '@prisma/client'

export type { User, Coupon, Brand, Category, CouponType, DiscountType, UserRole }

export interface CouponWithDetails extends Coupon {
  brand: Brand
  category: Category
  isFavorite?: boolean
  usageCount?: number
}

export interface BrandWithStats extends Brand {
  _count: {
    coupons: number
  }
  activeCoupons: number
}

export interface CategoryWithStats extends Category {
  _count: {
    coupons: number
  }
  activeCoupons: number
}

export interface UserWithStats extends User {
  _count: {
    favoriteCoupons: number
    couponUsages: number
  }
}

export interface SearchFilters {
  query?: string
  categoryId?: string
  brandId?: string
  couponType?: CouponType
  discountType?: DiscountType
  minDiscount?: number
  maxDiscount?: number
  isVerified?: boolean
  isExclusive?: boolean
  sortBy?: 'newest' | 'popular' | 'discount' | 'expiry'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CouponFormData {
  title: string
  description?: string
  code?: string
  type: CouponType
  discountType: DiscountType
  discountValue: number
  minOrderValue?: number
  maxDiscount?: number
  isExclusive: boolean
  usageLimit?: number
  startDate?: string
  endDate?: string
  terms?: string
  image?: string
  affiliateUrl?: string
  brandId: string
  categoryId: string
}

export interface BrandFormData {
  name: string
  description?: string
  logo?: string
  website?: string
}

export interface CategoryFormData {
  name: string
  description?: string
  icon?: string
  color?: string
}
