'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Building2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { brandsApi } from '@/lib/api-client';

interface BrandFormData {
  name: string;
  description: string;
  website: string;
  logo: string;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
}

export default function CreateBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: '',
    website: '',
    logo: '',
    isActive: true,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogImage: '',
  });

  const handleInputChange = (field: keyof BrandFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || '',
        website: formData.website || '',
        logo: formData.logo || '',
        isActive: formData.isActive,
        // ensure strings for optional fields to satisfy schema
        seoTitle: formData.seoTitle ?? '',
        seoDescription: formData.seoDescription ?? '',
        seoKeywords: formData.seoKeywords ?? '',
        ogImage: formData.ogImage ?? '',
      }
      const data = await brandsApi.create(payload);

      if (data.success) {
        toast.success('Brand created successfully!');
        router.push('/admin/brands');
      } else {
        toast.error(data.message || 'Failed to create brand');
      }
    } catch (error) {
      console.error('Error creating brand:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create brand');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      website: '',
      logo: '',
      isActive: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/brands">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Brands
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Brand</h1>
            <p className="text-gray-600">Add a new brand to the platform</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Brand Information
            </CardTitle>
            <CardDescription>
              Fill in the details for the new brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter brand name"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter brand description"
                  rows={3}
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  type="url"
                  value={formData.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Logo Preview:</p>
                    <div className="w-16 h-16 border rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SEO Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                    placeholder="Brand page title (<=70 chars)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Input
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                    placeholder="Short summary (<=160 chars)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">SEO Keywords</Label>
                  <Input
                    id="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={(e) => handleInputChange('seoKeywords', e.target.value)}
                    placeholder="coupon, brand, discounts"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogImage">OG Image URL</Label>
                  <Input
                    id="ogImage"
                    value={formData.ogImage}
                    onChange={(e) => handleInputChange('ogImage', e.target.value)}
                    placeholder="https://.../brand-og.png"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Active</Label>
                <span className="text-sm text-gray-500">
                  {formData.isActive ? 'Brand will be visible to users' : 'Brand will be hidden from users'}
                </span>
              </div>

              {/* Form Actions */}
              <div className="flex items-center space-x-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Brand
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/brands">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* SEO Settings Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              SEO Settings
            </CardTitle>
            <CardDescription>
              Optional metadata to improve brand page SEO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input id="seoTitle" value={formData.seoTitle} onChange={(e) => handleInputChange('seoTitle', e.target.value)} placeholder="Brand page title (<=70 chars)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Input id="seoDescription" value={formData.seoDescription} onChange={(e) => handleInputChange('seoDescription', e.target.value)} placeholder="Short summary (<=160 chars)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoKeywords">SEO Keywords</Label>
                <Input id="seoKeywords" value={formData.seoKeywords} onChange={(e) => handleInputChange('seoKeywords', e.target.value)} placeholder="coupon, brand, discounts" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ogImage">OG Image URL</Label>
                <Input id="ogImage" value={formData.ogImage} onChange={(e) => handleInputChange('ogImage', e.target.value)} placeholder="https://.../brand-og.png" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
