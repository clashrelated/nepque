'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Tag, 
  Heart, 
  Eye,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'

interface AnalyticsData {
  totalCoupons: number
  totalBrands: number
  totalCategories: number
  totalUsers: number
  activeCoupons: number
  verifiedCoupons: number
  totalFavorites: number
  totalUsage: number
  recentCoupons: Array<{
    id: string
    title: string
    brand: { name: string }
    usedCount: number
    createdAt: string
  }>
  topBrands: Array<{
    id: string
    name: string
    couponCount: number
    totalUsage: number
  }>
  topCategories: Array<{
    id: string
    name: string
    couponCount: number
    totalUsage: number
  }>
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/stats?timeRange=${timeRange}`)
      const data = await response.json()

      if (data.success) {
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = () => {
    // In a real implementation, this would generate and download analytics data
    alert('Export functionality will be implemented')
  }

  const statCards = [
    {
      title: 'Total Coupons',
      value: analytics?.totalCoupons || 0,
      icon: Tag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `${analytics?.activeCoupons || 0} active`
    },
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Registered users'
    },
    {
      title: 'Total Favorites',
      value: analytics?.totalFavorites || 0,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'User favorites'
    },
    {
      title: 'Total Usage',
      value: analytics?.totalUsage || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Coupon uses'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Platform performance and insights</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Platform performance and insights</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest coupons added to the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.recentCoupons?.length ? (
                analytics.recentCoupons.map((coupon) => (
                  <div key={coupon.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{coupon.title}</p>
                      <p className="text-xs text-gray-500">{coupon.brand.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{coupon.usedCount} uses</p>
                      <p className="text-xs text-gray-500">
                        {new Date(coupon.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Brands */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Brands
            </CardTitle>
            <CardDescription>
              Most popular brands by usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topBrands?.length ? (
                analytics.topBrands.map((brand, index) => (
                  <div key={brand.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{brand.name}</p>
                        <p className="text-xs text-gray-500">{brand.couponCount} coupons</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{brand.totalUsage}</p>
                      <p className="text-xs text-gray-500">total uses</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No brand data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Top Categories
          </CardTitle>
          <CardDescription>
            Most popular categories by usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics?.topCategories?.length ? (
              analytics.topCategories.map((category, index) => (
                <div key={category.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Coupons</span>
                      <span>{category.couponCount}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Total Uses</span>
                      <span>{category.totalUsage}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No category data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
