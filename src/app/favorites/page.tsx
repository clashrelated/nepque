'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ExternalLink, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
// import Image from 'next/image'

interface FavoriteCoupon {
  id: string
  userId: string
  couponId: string
  createdAt: string
  coupon: {
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
}

export default function FavoritesPage() {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<FavoriteCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchFavorites()
    }
  }, [session])

  const fetchFavorites = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/user/favorites')
      const data = await response.json()
      
      if (data.success) {
        setFavorites(data.data)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
      toast.error('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (couponId: string) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/user/favorites?couponId=${couponId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setFavorites(favorites.filter(fav => fav.coupon.id !== couponId))
        toast.success('Removed from favorites')
      } else {
        toast.error('Failed to remove from favorites')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
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

  const formatDiscount = (coupon: FavoriteCoupon['coupon']) => {
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

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your favorites...</p>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600">
                {favorites.length} {favorites.length === 1 ? 'coupon' : 'coupons'} saved
              </p>
            </div>

            {favorites.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start saving coupons you love to see them here
                  </p>
                  <Button asChild>
                    <a href="/coupons">Browse Coupons</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => (
                  <Card key={favorite.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">
                            {favorite.coupon.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {favorite.coupon.brand.name}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFavorite(favorite.coupon.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Discount Badge */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className="text-sm font-semibold px-3 py-1"
                        >
                          {formatDiscount(favorite.coupon)}
                        </Badge>
                        <div className="flex space-x-1">
                          {favorite.coupon.isExclusive && (
                            <Badge variant="destructive" className="text-xs">
                              EXCLUSIVE
                            </Badge>
                          )}
                          {favorite.coupon.isVerified && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              VERIFIED
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Coupon Code */}
                      {favorite.coupon.code && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Coupon Code
                          </label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 p-2 bg-gray-100 rounded border font-mono text-sm">
                              {favorite.coupon.code}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyCode(favorite.coupon.code!)}
                            >
                              {copiedCode === favorite.coupon.code ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {favorite.coupon.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {favorite.coupon.description}
                        </p>
                      )}

                      {/* Terms */}
                      {favorite.coupon.terms && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {favorite.coupon.terms}
                        </p>
                      )}

                      {/* Expiry */}
                      {favorite.coupon.endDate && (
                        <p className="text-xs text-gray-500">
                          {isExpired(favorite.coupon.endDate) ? (
                            <span className="text-red-500">Expired</span>
                          ) : (
                            <span>Expires {new Date(favorite.coupon.endDate).toLocaleDateString()}</span>
                          )}
                        </p>
                      )}

                      {/* Action Button */}
                      <Button 
                        className="w-full" 
                        asChild
                        disabled={isExpired(favorite.coupon.endDate)}
                      >
                        <a 
                          href={favorite.coupon.affiliateUrl || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {isExpired(favorite.coupon.endDate) ? 'Expired' : 'Get Deal'}
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
