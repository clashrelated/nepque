'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import CouponCard from '@/components/coupon/CouponCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Heart, 
  Star, 
  Calendar,
  Tag,
  Shield
} from 'lucide-react';
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    coupons: number;
  };
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string | null;
  type: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  isExclusive: boolean;
  isVerified: boolean;
  endDate: string | null;
  terms: string | null;
  affiliateUrl: string | null;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    website: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  _count?: {
    favoriteCoupons: number;
    couponUsages: number;
  };
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchCategory()
      fetchCoupons()
    }
  }, [slug])

  useEffect(() => {
    if (category) {
      fetchCoupons()
    }
  }, [sortBy, category])

  // Debounced search effect
  useEffect(() => {
    if (category) {
      const timeoutId = setTimeout(() => {
        fetchCoupons()
      }, 500) // 500ms delay

      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, category])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories/slug/${slug}`)
      const data = await response.json()
      
      if (data.success) {
        setCategory(data.data)
      } else {
        toast.error('Category not found')
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      toast.error('Failed to load category')
    }
  }

  const fetchCoupons = async () => {
    try {
      const params = new URLSearchParams()
      if (category) params.append('categoryId', category.id)
      params.append('limit', '20')
      params.append('sortBy', sortBy)
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim())
      }

      const response = await fetch(`/api/coupons?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setCoupons(data.data)
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    fetchCoupons()
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

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}% OFF`;
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      return `Rs${coupon.discountValue} OFF`;
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      return 'FREE SHIPPING';
    }
    return 'DEAL';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-8">The category you&apos;re looking for doesn&apos;t exist.</p>
            <Button asChild>
              <Link href="/categories">Back to Categories</Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                {category.icon ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {category.icon.startsWith('http') ? (
                      <Image
                        src={category.icon}
                        alt={`${category.name} icon`}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-4xl">{category.icon}</span>
                    )}
                  </div>
                ) : (
                  <div 
                    className="w-20 h-20 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color || '#6B7280' }}
                  >
                    <span className="text-2xl font-bold text-white">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
                {category.description && (
                  <p className="text-lg text-gray-600 mb-4">{category.description}</p>
                )}
                
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    {category._count?.coupons || 0} Coupons
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {category.name}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search coupons in this category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </form>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="discount">Highest Discount</SelectItem>
                      <SelectItem value="expiry">Expiring Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coupons Grid */}
          <div className="mb-8">
            {coupons.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No coupons found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    There are no coupons available in this category yet.
                  </p>
                  <Button asChild>
                    <Link href="/categories">Browse Other Categories</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {coupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
