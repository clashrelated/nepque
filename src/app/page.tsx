'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import HeroSection from '@/components/coupon/HeroSection'
import CouponCard from '@/components/coupon/CouponCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Copy, Check, Star, Zap, Clock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

interface Coupon {
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

export default function Home() {
  const [featuredCoupons, setFeaturedCoupons] = useState<Coupon[]>([])
  const [popularCoupons, setPopularCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchFeaturedCoupons()
    fetchPopularCoupons()
  }, [])

  const fetchFeaturedCoupons = async () => {
    try {
      const response = await fetch('/api/coupons?limit=8&sortBy=newest')
      const data = await response.json()
      if (data.success && Array.isArray(data.data)) {
        setFeaturedCoupons(data.data)
      } else {
        setFeaturedCoupons([])
      }
    } catch (error) {
      console.error('Error fetching featured coupons:', error)
      setFeaturedCoupons([])
    }
  }

  const fetchPopularCoupons = async () => {
    try {
      const response = await fetch('/api/coupons?limit=8&sortBy=newest&type=DEAL')
      const data = await response.json()
      if (data.success && Array.isArray(data.data)) {
        setPopularCoupons(data.data)
      } else {
        setPopularCoupons([])
      }
    } catch (error) {
      console.error('Error fetching popular coupons:', error)
      setPopularCoupons([])
    } finally {
      setLoading(false)
    }
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success('Coupon code copied!')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}% OFF`
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      return `Rs${coupon.discountValue} OFF`
    } else if (coupon.discountType === 'FREE_SHIPPING') {
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
    const now = new Date()
    const expiry = new Date(endDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return daysUntilExpiry <= 3 && daysUntilExpiry > 0
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Coupons */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Featured Coupons
                </h2>
                <p className="text-gray-600">
                  Latest coupons from top brands
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(8)].map((_, i) => (
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {Array.isArray(featuredCoupons) && featuredCoupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} />
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <Button asChild size="lg">
                  <Link href="/coupons">View All Coupons</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Deals */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Popular Deals
                </h2>
                <p className="text-gray-600">
                  Latest deals by our community
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {Array.isArray(popularCoupons) && popularCoupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} />
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <Button asChild size="lg" variant="outline">
                  <Link href="/deals">View All Deals</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}