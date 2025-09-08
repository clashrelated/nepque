'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Users, Tag, Building2, ShoppingCart } from 'lucide-react'

interface DatabaseStats {
  users: number
  coupons: number
  brands: number
  categories: number
}

export default function DatabaseStats() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        setStats(data.stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="destructive">Error: {error}</Badge>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.users}</div>
            <div className="text-sm text-gray-600">Users</div>
          </div>
          <div className="text-center">
            <Tag className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.coupons}</div>
            <div className="text-sm text-gray-600">Coupons</div>
          </div>
          <div className="text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.brands}</div>
            <div className="text-sm text-gray-600">Brands</div>
          </div>
          <div className="text-center">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{stats.categories}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            ✅ Database Connected
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
