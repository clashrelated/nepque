'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, ExternalLink, Star, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  website: string | null
  isActive: boolean
  sponsored?: boolean
  sponsorWeight?: number
  _count?: {
    coupons: number
  }
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sponsored, setSponsored] = useState<Brand[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  })

  useEffect(() => {
    fetchBrands()
  }, [searchQuery])

  useEffect(() => {
    fetchSponsored()
  }, [])

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      params.append('page', '1')
      params.append('limit', '20')

      const response = await fetch(`/api/brands?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setBrands(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
      toast.error('Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  const fetchSponsored = async () => {
    try {
      const res = await fetch('/api/brands/sponsored?limit=8')
      const data = await res.json()
      if (data.success) setSponsored(data.data)
    } catch (e) {}
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Brands</h1>
            <p className="text-gray-600">
              Discover amazing brands and their exclusive deals
            </p>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sponsored Brands rail */}
          {sponsored.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Sponsored Brands</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sponsored.map((brand) => (
                  <Card key={brand.id} className="hover:shadow-lg transition-shadow flex flex-col h-full relative">
                    <CardContent className="p-6 text-center flex flex-col h-full">
                      <div className="absolute top-3 right-3 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Sponsored</div>
                      <div className="mb-4 flex-shrink-0">
                        {brand.logo ? (
                          <Image src={brand.logo} alt={brand.name} width={64} height={64} className="rounded-lg mx-auto" />
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-500">{brand.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex-shrink-0">{brand.name}</h3>
                      <div className="flex-1 flex items-center justify-center min-h-[2.5rem] mb-4">
                        {brand.description ? (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-tight">{brand.description}</p>
                        ) : (
                          <div className="h-6"></div>
                        )}
                      </div>
                      <div className="flex items-center justify-center mb-4 flex-shrink-0">
                        <Badge variant="secondary" className="flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {brand._count?.coupons || 0} Coupons
                        </Badge>
                      </div>
                      <div className="space-y-2 flex-shrink-0">
                        <Button asChild className="w-full">
                          <Link href={`/brand/${brand.slug}`}>View Coupons</Link>
                        </Button>
                        {brand.website && (
                          <Button variant="outline" asChild className="w-full">
                            <a href={brand.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit Website
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

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
          ) : brands.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No brands found
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
            <>
            <h2 className="text-xl font-semibold mb-3">All Brands</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {brands
                .filter(b => !sponsored.find(s => s.id === b.id))
                .map((brand) => (
                <Card key={brand.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardContent className="p-6 text-center flex flex-col h-full">
                    {/* Brand Logo */}
                    <div className="mb-4 flex-shrink-0">
                      {brand.logo ? (
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          width={64}
                          height={64}
                          className="rounded-lg mx-auto"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-500">
                            {brand.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Brand Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex-shrink-0">
                      {brand.name}
                    </h3>

                    {/* Description - Fixed height area */}
                    <div className="flex-1 flex items-center justify-center min-h-[2.5rem] mb-4">
                      {brand.description ? (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-tight">
                          {brand.description}
                        </p>
                      ) : (
                        <div className="h-6"></div>
                      )}
                    </div>

                    {/* Coupon Count */}
                    <div className="flex items-center justify-center mb-4 flex-shrink-0">
                      <Badge variant="secondary" className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {brand._count?.coupons || 0} Coupons
                      </Badge>
                    </div>

                    {/* Actions - Fixed at bottom */}
                    <div className="space-y-2 flex-shrink-0">
                      <Button asChild className="w-full">
                        <Link href={`/brand/${brand.slug}`}>
                          View Coupons
                        </Link>
                      </Button>
                      {brand.website && (
                        <Button variant="outline" asChild className="w-full">
                          <a 
                            href={brand.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            </>
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
