'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft, 
  Save, 
  X,
  Calendar,
  Tag,
  Building2,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { couponsApi } from '@/lib/api-client'

interface Brand {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

interface CouponFormData {
  title: string
  description: string
  code: string
  type: string
  discountType: string
  discountValue: number
  minOrderValue: number | null
  maxDiscount: number | null
  isActive: boolean
  isVerified: boolean
  isExclusive: boolean
  usageLimit: number
  startDate: string
  endDate: string
  terms: string
  image: string
  affiliateUrl: string
  brandId: string
  categoryId: string
}

export default function CreateCouponPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<CouponFormData>({
    title: '',
    description: '',
    code: '',
    type: 'COUPON_CODE',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderValue: null,
    maxDiscount: null,
    isActive: true,
    isVerified: false,
    isExclusive: false,
    usageLimit: 0,
    startDate: '',
    endDate: '',
    terms: '',
    image: '',
    affiliateUrl: '',
    brandId: '',
    categoryId: ''
  })

  useEffect(() => {
    fetchBrands()
    fetchCategories()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      const data = await response.json()
      if (data.success) {
        setBrands(data.data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (field: keyof CouponFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    
    if (!formData.brandId) {
      toast.error('Brand is required')
      return
    }
    
    if (!formData.categoryId) {
      toast.error('Category is required')
      return
    }
    
    setLoading(true)

    try {
      const data = await couponsApi.create(formData)

      if (data.success) {
        toast.success('Coupon created successfully')
        router.push('/admin/coupons')
      } else {
        toast.error(data.message || 'Failed to create coupon')
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create coupon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/admin/coupons">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Coupons
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Coupon</h1>
          <p className="text-gray-600">Add a new coupon to the platform</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential details about the coupon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., 20% Off Electronics"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the coupon offer..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="e.g., SAVE20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COUPON_CODE">Coupon Code</SelectItem>
                        <SelectItem value="DEAL">Deal</SelectItem>
                        <SelectItem value="CASHBACK">Cashback</SelectItem>
                        <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brandId">Brand *</Label>
                    <Select value={formData.brandId} onValueChange={(value) => handleInputChange('brandId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="categoryId">Category *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discount Information */}
            <Card>
              <CardHeader>
                <CardTitle>Discount Information</CardTitle>
                <CardDescription>
                  Configure the discount details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountType">Discount Type *</Label>
                    <Select value={formData.discountType} onValueChange={(value) => handleInputChange('discountType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                        <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                        <SelectItem value="BUY_ONE_GET_ONE">Buy One Get One</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="discountValue">Discount Value *</Label>
                    <Input
                      id="discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                      placeholder="e.g., 20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minOrderValue">Minimum Order Value</Label>
                    <Input
                      id="minOrderValue"
                      type="number"
                      value={formData.minOrderValue || ''}
                      onChange={(e) => handleInputChange('minOrderValue', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="e.g., 50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxDiscount">Maximum Discount</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      value={formData.maxDiscount || ''}
                      onChange={(e) => handleInputChange('maxDiscount', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Terms, conditions, and other details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => handleInputChange('terms', e.target.value)}
                    placeholder="Enter terms and conditions..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => handleInputChange('image', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="affiliateUrl">Affiliate URL</Label>
                    <Input
                      id="affiliateUrl"
                      value={formData.affiliateUrl}
                      onChange={(e) => handleInputChange('affiliateUrl', e.target.value)}
                      placeholder="https://brand.com/offer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Status Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isVerified">Verified</Label>
                  <Switch
                    id="isVerified"
                    checked={formData.isVerified}
                    onCheckedChange={(checked) => handleInputChange('isVerified', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isExclusive">Exclusive</Label>
                  <Switch
                    id="isExclusive"
                    checked={formData.isExclusive}
                    onCheckedChange={(checked) => handleInputChange('isExclusive', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Usage Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || 0)}
                    placeholder="0 = unlimited"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date Range */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Date Range
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Creating...' : 'Create Coupon'}
                  </Button>
                  
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <Link href="/admin/coupons">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
