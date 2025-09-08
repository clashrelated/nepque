'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, ExternalLink, Star, Tag } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  isActive: boolean
  _count?: {
    coupons: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  })

  useEffect(() => {
    fetchCategories()
  }, [searchQuery])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      params.append('page', '1')
      params.append('limit', '20')

      const response = await fetch(`/api/categories?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const getCategoryIcon = (category: Category) => {
    if (category.icon) {
      return (
        <div 
          className="h-16 w-16 rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl"
          style={{ backgroundColor: category.color || '#f3f4f6' }}
        >
          {category.icon}
        </div>
      )
    }
    
    // Default icons based on category name
    const defaultIcons: Record<string, string> = {
      'fashion': '👗',
      'electronics': '📱',
      'food': '🍕',
      'travel': '✈️',
      'beauty': '💄',
      'home': '🏠',
      'sports': '⚽',
      'books': '📚',
      'toys': '🧸',
      'automotive': '🚗',
      'health': '💊',
      'entertainment': '🎬',
      'shopping': '🛍️',
      'services': '🔧',
      'education': '🎓'
    }

    const icon = defaultIcons[category.name.toLowerCase()] || '🏷️'
    
    return (
      <div 
        className="h-16 w-16 rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl"
        style={{ backgroundColor: category.color || '#f3f4f6' }}
      >
        {icon}
      </div>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Categories</h1>
            <p className="text-gray-600">
              Browse coupons by category and find deals that match your interests
            </p>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-16 w-16 bg-gray-200 rounded-lg mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No categories found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms
                </p>
                <Button onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    {/* Category Icon */}
                    {getCategoryIcon(category)}

                    {/* Category Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>

                    {/* Description */}
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    {/* Coupon Count */}
                    <div className="flex items-center justify-center mb-4">
                      <Badge variant="secondary" className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {category._count?.coupons || 0} Coupons
                      </Badge>
                    </div>

                    {/* Action Button */}
                    <Button asChild className="w-full">
                      <Link href={`/category/${category.slug}`}>
                        <Tag className="h-4 w-4 mr-2" />
                        View Coupons
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
