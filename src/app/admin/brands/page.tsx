'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Building2,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    coupons: number
  }
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    setLoading(true)
    try {
      // active=false returns all brands (active and inactive)
      const response = await fetch('/api/brands?active=false&limit=100')
      const data = await response.json()

      if (data.success) {
        setBrands(data.data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand? This will also delete all associated coupons.')) return

    try {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setBrands(prev => prev.filter(brand => brand.id !== brandId))
      } else {
        alert('Failed to delete brand')
      }
    } catch (error) {
      console.error('Error deleting brand:', error)
      alert('Failed to delete brand')
    }
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600">Manage all brands on the platform</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/brands/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Brand
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Brands Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Brands ({filteredBrands.length})</CardTitle>
          <CardDescription>
            Manage and monitor all brands on the platform
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
                    <TableHead>Brand</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Coupons</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {brand.logo ? (
                            <Image
                              src={brand.logo}
                              alt={brand.name}
                              width={40}
                              height={40}
                              className="rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{brand.name}</p>
                            <p className="text-sm text-gray-500">/{brand.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {brand.description || 'No description'}
                        </p>
                      </TableCell>
                      <TableCell>
                        {brand.website ? (
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Visit
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">No website</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {brand._count?.coupons || 0} coupons
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={brand.isActive ? "default" : "secondary"}>
                          {brand.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(brand.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/brands/${brand.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/brands/${brand.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteBrand(brand.id)}
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

          {filteredBrands.length === 0 && !loading && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first brand.'}
              </p>
              <Button asChild>
                <Link href="/admin/brands/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brand
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}