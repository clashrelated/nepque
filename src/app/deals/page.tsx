'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, ExternalLink, Copy, Check, Heart, Star, Zap, Clock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import CouponCard from '@/components/coupon/CouponCard'

interface Deal {
  id: string
  title: string
  description: string
  code: string | null
  type: string
  discountType: string
  discountValue: number
  minOrderValue: number | null
  maxDiscount: number | null
  isExclusive: boolean
  isVerified: boolean
  endDate: string | null
  terms: string | null
  affiliateUrl: string | null
  brand: {
    id: string
    name: string
    slug: string
    logo: string | null
    website: string | null
  }
  category: {
    id: string
    name: string
    icon: string | null
    color: string | null
  }
  _count?: {
    favoriteCoupons: number
    couponUsages: number
  }
}

interface FilterOptions {
  query: string
  categoryId: string
  brandId: string
  type: string
  discountType: string
  sortBy: string
  page: number
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [brands, setBrands] = useState<Array<{id: string, name: string}>>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    query: '',
    categoryId: 'all',
    brandId: 'all',
    type: 'all',
    discountType: 'all',
    sortBy: 'popular',
    page: 1
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  })

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  useEffect(() => {
    fetchDeals()
  }, [filters])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=50')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands?limit=50')
      const data = await response.json()
      if (data.success) {
        setBrands(data.data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const fetchDeals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.query) params.append('q', filters.query)
      if (filters.categoryId && filters.categoryId !== 'all') params.append('categoryId', filters.categoryId)
      if (filters.brandId && filters.brandId !== 'all') params.append('brandId', filters.brandId)
      if (filters.discountType && filters.discountType !== 'all') params.append('discountType', filters.discountType)
      params.append('sortBy', filters.sortBy)
      params.append('page', filters.page.toString())
      params.append('limit', '12')
      // Filter specifically for DEAL type coupons (this page is for deals only)
      params.append('type', 'DEAL')
      // Also include verified deals (but not necessarily exclusive)
      params.append('verified', 'true')

      const response = await fetch(`/api/coupons?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setDeals(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
      toast.error('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof FilterOptions, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  const formatDiscount = (deal: Deal) => {
    if (deal.discountType === 'PERCENTAGE') {
      return `${deal.discountValue}% OFF`
    } else if (deal.discountType === 'FIXED_AMOUNT') {
      return `$${deal.discountValue} OFF`
    } else if (deal.discountType === 'FREE_SHIPPING') {
      return 'FREE SHIPPING'
    }
    return 'DEAL'
  }

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false
    return new Date(endDate) < new Date()
  }

  const isExpiringSoon = (endDate: string | null) => {
    if (!endDate) return false
    const expiryDate = new Date(endDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      categoryId: 'all',
      brandId: 'all',
      type: 'all',
      discountType: 'all',
      sortBy: 'popular',
      page: 1
    })
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Hot Deals</h1>
            <p className="text-gray-600">
              Discover the best deals and exclusive offers from top brands
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Bar Row */}
              <div className="mb-6">
                <div className="relative w-full max-w-2xl">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search deals..."
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Buttons Row */}
              <div className="space-y-4">
                {/* All Filters in One Row */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Category Filter */}
                  <Select value={filters.categoryId} onValueChange={(value) => handleFilterChange('categoryId', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Brand Filter */}
                  <Select value={filters.brandId} onValueChange={(value) => handleFilterChange('brandId', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort By */}
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="discount">Highest Discount</SelectItem>
                      <SelectItem value="expiry">Expiring Soon</SelectItem>
                    </SelectContent>
                  </Select>


                  {/* Discount Type Filter */}
                  <Select value={filters.discountType} onValueChange={(value) => handleFilterChange('discountType', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Discounts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Discounts</SelectItem>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters Button */}
                  <Button variant="outline" onClick={clearFilters} className="ml-auto">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No deals found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Deals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
                {deals.map((deal) => (
                  <CouponCard key={deal.id} coupon={deal} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
