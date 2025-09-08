'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { couponsApi } from '@/lib/api-client';

interface Brand {
  id: string;
  name: string;
  logo: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface CouponFormData {
  title: string;
  description: string;
  code: string;
  type: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  isActive: boolean;
  isVerified: boolean;
  isExclusive: boolean;
  usageLimit: number;
  startDate: string;
  endDate: string;
  terms: string;
  image: string;
  affiliateUrl: string;
  brandId: string;
  categoryId: string;
  sponsored?: boolean;
  sponsorWeight?: number;
}

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
  });

  useEffect(() => {
    if (couponId) {
      fetchCoupon();
      fetchBrands();
      fetchCategories();
    }
  }, [couponId]);

  const fetchCoupon = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coupons/${couponId}`);
      const data = await response.json();

      if (data.success) {
        const coupon = data.data;
        setFormData({
          title: coupon.title || '',
          description: coupon.description || '',
          code: coupon.code || '',
          type: coupon.type || 'COUPON_CODE',
          discountType: coupon.discountType || 'PERCENTAGE',
          discountValue: coupon.discountValue || 0,
          minOrderValue: coupon.minOrderValue,
          maxDiscount: coupon.maxDiscount,
          isActive: coupon.isActive ?? true,
          isVerified: coupon.isVerified ?? false,
          isExclusive: coupon.isExclusive ?? false,
          usageLimit: coupon.usageLimit || 0,
          startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
          endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
          terms: coupon.terms || '',
          image: coupon.image || '',
          affiliateUrl: coupon.affiliateUrl || '',
          brandId: coupon.brandId || '',
          categoryId: coupon.categoryId || '',
          sponsored: coupon.sponsored ?? false,
          sponsorWeight: coupon.sponsorWeight ?? 0
        });
      } else {
        toast.error('Failed to load coupon');
        router.push('/admin/coupons');
      }
    } catch (error) {
      console.error('Error fetching coupon:', error);
      toast.error('Failed to load coupon');
      router.push('/admin/coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands?limit=100');
      const data = await response.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=100');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (field: keyof CouponFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.brandId) {
      toast.error('Brand is required');
      return;
    }
    
    if (!formData.categoryId) {
      toast.error('Category is required');
      return;
    }

    try {
      setSaving(true);
      const data = await couponsApi.update(couponId, formData);

      if (data.success) {
        toast.success('Coupon updated successfully');
        router.push('/admin/coupons');
      } else {
        toast.error(data.message || 'Failed to update coupon');
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update coupon');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/coupons">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Coupons
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Coupon</h1>
              <p className="text-gray-600">Update coupon details and settings</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for this coupon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter coupon title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="Enter coupon code"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter coupon description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandId">Brand *</Label>
                  <Select value={formData.brandId} onValueChange={(value) => handleInputChange('brandId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
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
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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

          {/* Discount Details */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Details</CardTitle>
              <CardDescription>
                Configure the discount amount and type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COUPON_CODE">Coupon Code</SelectItem>
                      <SelectItem value="DEAL">Deal</SelectItem>
                      <SelectItem value="SALE">Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type</Label>
                  <Select value={formData.discountType} onValueChange={(value) => handleInputChange('discountType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">Discount Value</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                    placeholder="Enter discount value"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrderValue">Minimum Order Value</Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    value={formData.minOrderValue || ''}
                    onChange={(e) => handleInputChange('minOrderValue', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Enter minimum order value"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDiscount">Maximum Discount</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    value={formData.maxDiscount || ''}
                    onChange={(e) => handleInputChange('maxDiscount', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Enter maximum discount"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates and Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Dates and Limits</CardTitle>
              <CardDescription>
                Set validity period and usage limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || 0)}
                  placeholder="Enter usage limit (0 for unlimited)"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
              <CardDescription>
                Configure additional options and URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="affiliateUrl">Affiliate URL</Label>
                <Input
                  id="affiliateUrl"
                  type="url"
                  value={formData.affiliateUrl}
                  onChange={(e) => handleInputChange('affiliateUrl', e.target.value)}
                  placeholder="Enter affiliate URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="Enter image URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Terms and Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                  placeholder="Enter terms and conditions"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Status Settings</CardTitle>
              <CardDescription>
                Configure the visibility and verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-sm text-gray-500">
                    Make this coupon visible to users
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sponsored">Sponsored</Label>
                  <p className="text-sm text-gray-500">
                    Show in the sponsored rail
                  </p>
                </div>
                <Switch
                  id="sponsored"
                  checked={!!formData.sponsored}
                  onCheckedChange={(checked) => handleInputChange('sponsored', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsorWeight">Sponsor Weight</Label>
                <Input
                  id="sponsorWeight"
                  type="number"
                  value={formData.sponsorWeight ?? 0}
                  onChange={(e) => handleInputChange('sponsorWeight', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isVerified">Verified</Label>
                  <p className="text-sm text-gray-500">
                    Mark this coupon as verified
                  </p>
                </div>
                <Switch
                  id="isVerified"
                  checked={formData.isVerified}
                  onCheckedChange={(checked) => handleInputChange('isVerified', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isExclusive">Exclusive</Label>
                  <p className="text-sm text-gray-500">
                    Mark this coupon as exclusive
                  </p>
                </div>
                <Switch
                  id="isExclusive"
                  checked={formData.isExclusive}
                  onCheckedChange={(checked) => handleInputChange('isExclusive', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button variant="outline" asChild>
              <Link href="/admin/coupons">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
