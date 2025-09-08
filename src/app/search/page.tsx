'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import CouponCard from '@/components/coupon/CouponCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Building2, 
  Tag, 
  ExternalLink,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

interface SearchResult {
  coupons: Coupon[]
  brands: Brand[]
  categories: Category[]
}

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
}

interface Brand {
  id: string
  name: string
  logo: string | null
  website: string | null
}

interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult>({
    coupons: [],
    brands: [],
    categories: []
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'coupons' | 'brands' | 'categories'>('all')

  // Get search query from URL params
  useEffect(() => {
    const query = searchParams.get('q') || ''
    setSearchQuery(query)
    if (query.trim()) {
      performSearch(query)
    }
  }, [searchParams])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20`)
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data)
      } else {
        toast.error('Search failed')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleQueryChange = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const getTotalResults = () => {
    return results.coupons.length + results.brands.length + results.categories.length
  }

  const renderCoupons = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          Coupons ({results.coupons.length})
        </h3>
      </div>
      
      {results.coupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No coupons found for &quot;{searchQuery}&quot;</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderBrands = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Brands ({results.brands.length})
        </h3>
      </div>
      
      {results.brands.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.brands.map((brand) => (
            <Card key={brand.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link href={`/brand/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex flex-col items-center text-center space-y-3">
                    {brand.logo ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        <Image
                          src={brand.logo}
                          alt={`${brand.name} logo`}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600">
                          {brand.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-sm line-clamp-2">{brand.name}</h4>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No brands found for &quot;{searchQuery}&quot;</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          Categories ({results.categories.length})
        </h3>
      </div>
      
      {results.categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex flex-col items-center text-center space-y-3">
                    {category.icon ? (
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: category.color || '#f3f4f6' }}
                      >
                        {category.icon}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Tag className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-sm line-clamp-2">{category.name}</h4>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No categories found for &quot;{searchQuery}&quot;</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderAllResults = () => (
    <div className="space-y-8">
      {/* Coupons Section */}
      {results.coupons.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold flex items-center mb-4">
            <Tag className="h-5 w-5 mr-2" />
            Coupons ({results.coupons.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.coupons.slice(0, 6).map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
          {results.coupons.length > 6 && (
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('coupons')}
              >
                View All {results.coupons.length} Coupons
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Brands Section */}
      {results.brands.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold flex items-center mb-4">
            <Building2 className="h-5 w-5 mr-2" />
            Brands ({results.brands.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.brands.slice(0, 8).map((brand) => (
              <Card key={brand.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <Link href={`/brand/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="flex flex-col items-center text-center space-y-3">
                      {brand.logo ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          <Image
                            src={brand.logo}
                            alt={`${brand.name} logo`}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-600">
                            {brand.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2">{brand.name}</h4>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          {results.brands.length > 8 && (
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('brands')}
              >
                View All {results.brands.length} Brands
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Categories Section */}
      {results.categories.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold flex items-center mb-4">
            <Tag className="h-5 w-5 mr-2" />
            Categories ({results.categories.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.categories.slice(0, 8).map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <Link href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="flex flex-col items-center text-center space-y-3">
                      {category.icon ? (
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: category.color || '#f3f4f6' }}
                        >
                          {category.icon}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <Tag className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2">{category.name}</h4>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          {results.categories.length > 8 && (
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('categories')}
              >
                View All {results.categories.length} Categories
              </Button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {getTotalResults() === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-4">
              We couldn&apos;t find anything matching &quot;{searchQuery}&quot;
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Try searching for:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Brand names (e.g., &quot;Amazon&quot;, &quot;Nike&quot;)</li>
                <li>Product categories (e.g., &quot;Electronics&quot;, &quot;Fashion&quot;)</li>
                <li>Coupon types (e.g., &quot;Free Shipping&quot;, &quot;Discount&quot;)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Results</h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search coupons, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>
            </form>
          </div>

          {/* Results Summary */}
          {searchQuery && (
            <div className="mb-6">
              <p className="text-gray-600">
                {loading ? (
                  'Searching...'
                ) : (
                  <>
                    Found {getTotalResults()} result{getTotalResults() !== 1 ? 's' : ''} for &quot;
                    <span className="font-semibold">{searchQuery}</span>&quot;
                  </>
                )}
              </p>
            </div>
          )}

          {/* Tab Navigation */}
          {searchQuery && getTotalResults() > 0 && (
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <Button
                  variant={activeTab === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('all')}
                >
                  All ({getTotalResults()})
                </Button>
                {results.coupons.length > 0 && (
                  <Button
                    variant={activeTab === 'coupons' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('coupons')}
                  >
                    Coupons ({results.coupons.length})
                  </Button>
                )}
                {results.brands.length > 0 && (
                  <Button
                    variant={activeTab === 'brands' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('brands')}
                  >
                    Brands ({results.brands.length})
                  </Button>
                )}
                {results.categories.length > 0 && (
                  <Button
                    variant={activeTab === 'categories' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('categories')}
                  >
                    Categories ({results.categories.length})
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {searchQuery && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Searching...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'all' && renderAllResults()}
                  {activeTab === 'coupons' && renderCoupons()}
                  {activeTab === 'brands' && renderBrands()}
                  {activeTab === 'categories' && renderCategories()}
                </>
              )}
            </div>
          )}

          {/* Empty State */}
          {!searchQuery && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start your search</h3>
                <p className="text-gray-500 mb-6">
                  Search for coupons, brands, or categories to find what you&apos;re looking for
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <h4 className="font-medium mb-1">Popular Searches</h4>
                    <p className="text-sm text-gray-600">Amazon, Nike, Electronics</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Star className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                    <h4 className="font-medium mb-1">Top Brands</h4>
                    <p className="text-sm text-gray-600">Find deals from your favorite brands</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <h4 className="font-medium mb-1">Latest Deals</h4>
                    <p className="text-sm text-gray-600">Discover new offers and discounts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading search...</p>
            </div>
          </div>
        </div>
      </Layout>
    }>
      <SearchContent />
    </Suspense>
  )
}
