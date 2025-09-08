'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Tag, 
  Building2, 
  FolderOpen, 
  Users, 
  TrendingUp, 
  Eye,
  Heart,
  ExternalLink,
  Plus,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalCoupons: number
  totalBrands: number
  totalCategories: number
  totalUsers: number
  activeCoupons: number
  verifiedCoupons: number
  totalFavorites: number
  totalUsage: number
}

interface RecentCoupon {
  id: string
  title: string
  brand: {
    name: string
    logo?: string
  }
  discountValue: number
  discountType: string
  isVerified: boolean
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCoupons: 0,
    totalBrands: 0,
    totalCategories: 0,
    totalUsers: 0,
    activeCoupons: 0,
    verifiedCoupons: 0,
    totalFavorites: 0,
    totalUsage: 0
  })
  const [recentCoupons, setRecentCoupons] = useState<RecentCoupon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch admin stats
      const statsResponse = await fetch('/api/admin/stats')
      const statsData = await statsResponse.json()
      
      if (statsData.success) {
        setStats(statsData.data)
      }

      // Fetch recent coupons
      const couponsResponse = await fetch('/api/coupons?limit=5&sortBy=newest')
      const couponsData = await couponsResponse.json()
      
      if (couponsData.success && Array.isArray(couponsData.data)) {
        setRecentCoupons(couponsData.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Coupons',
      value: stats.totalCoupons,
      icon: Tag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `${stats.activeCoupons} active`
    },
    {
      title: 'Brands',
      value: stats.totalBrands,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Registered brands'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: FolderOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Active categories'
    },
    {
      title: 'Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Registered users'
    },
    {
      title: 'Verified Coupons',
      value: stats.verifiedCoupons,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: `${Math.round((stats.verifiedCoupons / Math.max(stats.totalCoupons, 1)) * 100)}% of total`
    },
    {
      title: 'Total Favorites',
      value: stats.totalFavorites,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'User favorites'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome to the admin dashboard</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to the admin dashboard</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/coupons/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Coupon
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/admin/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Coupons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Recent Coupons
            </CardTitle>
            <CardDescription>
              Latest coupons added to the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCoupons.length > 0 ? (
                recentCoupons.map((coupon) => (
                  <div key={coupon.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {coupon.brand.logo ? (
                          <img
                            src={coupon.brand.logo}
                            alt={coupon.brand.name}
                            className="h-8 w-8 rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-500">
                              {coupon.brand.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{coupon.title}</p>
                        <p className="text-xs text-gray-500">{coupon.brand.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={coupon.isVerified ? "default" : "secondary"}>
                        {coupon.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">
                        {coupon.discountValue}% off
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No coupons found</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/coupons">
                  View All Coupons
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link href="/admin/coupons/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Coupon
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/brands/create">
                  <Building2 className="h-4 w-4 mr-2" />
                  Add New Brand
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/categories/create">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Add New Category
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
