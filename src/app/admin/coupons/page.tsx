'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  MoreHorizontal,
  Calendar,
  Tag,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Coupon {
  id: string
  title: string
  description?: string
  code?: string
  type: string
  discountType: string
  discountValue: number
  isActive: boolean
  isVerified: boolean
  isExclusive: boolean
  usedCount: number
  usageLimit?: number
  startDate?: string
  endDate?: string
  createdAt: string
  brand: {
    id: string
    name: string
    logo?: string
  }
  category: {
    id: string
    name: string
  }
}

interface FilterOptions {
  search: string
  type: string
  discountType: string
  status: string
  brand: string
  category: string
  sortBy: string
  sortOrder: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [brands, setBrands] = useState<Array<{id: string, name: string}>>([])
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    type: 'all',
    discountType: 'all',
    status: 'all',
    brand: 'all',
    category: 'all',
    sortBy: 'newest',
    sortOrder: 'desc'
  })

  useEffect(() => {
    fetchCoupons()
    fetchBrands()
    fetchCategories()
  }, [filters, pagination.page])

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { q: filters.search }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.discountType !== 'all' && { discountType: filters.discountType }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.brand !== 'all' && { brandId: filters.brand }),
        ...(filters.category !== 'all' && { categoryId: filters.category }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })

      const response = await fetch(`/api/coupons?${params}`)
      const data = await response.json()

      if (data.success) {
        setCoupons(data.data)
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      const data = await response.json()
      if (data.success) {
        setBrands(data.data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setCoupons(prev => prev.filter(coupon => coupon.id !== couponId))
      } else {
        alert('Failed to delete coupon')
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert('Failed to delete coupon')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (coupon: Coupon) => {
    if (!coupon.isActive) return <Badge variant="secondary">Inactive</Badge>
    if (coupon.isExclusive) return <Badge variant="default">Exclusive</Badge>
    if (coupon.isVerified) return <Badge variant="default">Verified</Badge>
    return <Badge variant="outline">Active</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600">Manage all coupons on the platform</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/coupons/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Coupon
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search coupons..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="COUPON_CODE">Coupon Code</SelectItem>
                  <SelectItem value="DEAL">Deal</SelectItem>
                  <SelectItem value="CASHBACK">Cashback</SelectItem>
                  <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="exclusive">Exclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="discount">Highest Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons ({pagination.total})</CardTitle>
          <CardDescription>
            Manage and monitor all coupons on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Coupon</TableHead>
                    <TableHead className="min-w-[120px]">Brand</TableHead>
                    <TableHead className="min-w-[100px]">Category</TableHead>
                    <TableHead className="min-w-[100px]">Discount</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[80px]">Usage</TableHead>
                    <TableHead className="min-w-[100px]">Created</TableHead>
                    <TableHead className="min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{coupon.title}</p>
                          {coupon.code && (
                            <p className="text-sm text-gray-500 font-mono">{coupon.code}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {coupon.brand.logo ? (
                            <Image
                              src={coupon.brand.logo}
                              alt={coupon.brand.name}
                              width={20}
                              height={20}
                              className="rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-500">
                                {coupon.brand.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-900">{coupon.brand.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{coupon.category.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {coupon.discountValue}% off
                          </p>
                          <p className="text-gray-500 capitalize">
                            {coupon.discountType.toLowerCase().replace('_', ' ')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(coupon)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-gray-900">{coupon.usedCount}</p>
                          {coupon.usageLimit && (
                            <p className="text-gray-500">/ {coupon.usageLimit}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(coupon.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/coupons/${coupon.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/coupons/${coupon.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
