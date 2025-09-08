'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  sponsored?: boolean;
  sponsorWeight?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
}

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: '',
    website: '',
    logo: '',
    isActive: true,
  });

  useEffect(() => {
    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/brands/${brandId}`);
      const data = await response.json();

      if (data.success) {
        setFormData({
          name: data.data.name || '',
          description: data.data.description || '',
          website: data.data.website || '',
          logo: data.data.logo || '',
          isActive: data.data.isActive ?? true,
          sponsored: data.data.sponsored ?? false,
          sponsorWeight: data.data.sponsorWeight ?? 0,
          seoTitle: data.data.seoTitle || '',
          seoDescription: data.data.seoDescription || '',
          seoKeywords: data.data.seoKeywords || '',
          ogImage: data.data.ogImage || '',
        });
      } else {
        toast.error(data.message || 'Failed to load brand');
        router.push('/admin/brands');
      }
    } catch (error) {
      console.error('Error fetching brand:', error);
      toast.error('Failed to load brand');
      router.push('/admin/brands');
    } finally {
      setLoading(false);
    }
  };

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

    setSaving(true);

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        website: formData.website,
        logo: formData.logo,
        isActive: formData.isActive,
        sponsored: formData.sponsored,
        sponsorWeight: formData.sponsorWeight,
      }
      // Only send SEO fields when provided to avoid overwriting existing values with null/empty
      if (typeof formData.seoTitle === 'string' && formData.seoTitle.trim() !== '') payload.seoTitle = formData.seoTitle
      if (typeof formData.seoDescription === 'string' && formData.seoDescription.trim() !== '') payload.seoDescription = formData.seoDescription
      if (typeof formData.seoKeywords === 'string' && formData.seoKeywords.trim() !== '') payload.seoKeywords = formData.seoKeywords
      if (typeof formData.ogImage === 'string' && formData.ogImage.trim() !== '') payload.ogImage = formData.ogImage
      const data = await brandsApi.update(brandId, payload);

      if (data.success) {
        toast.success('Brand updated successfully!');
        router.push('/admin/brands');
      } else {
        toast.error(data.message || 'Failed to update brand');
      }
    } catch (error) {
      console.error('Error updating brand:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update brand');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchBrand();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/brands">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Brands
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Brand</h1>
            <p className="text-gray-600">Loading brand details...</p>
          </div>
        </div>
        <div className="max-w-2xl">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>

              {/* SEO Fields */}
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">SEO Settings</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input id="seoTitle" value={formData.seoTitle} onChange={(e) => handleInputChange('seoTitle', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Input id="seoDescription" value={formData.seoDescription} onChange={(e) => handleInputChange('seoDescription', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">SEO Keywords</Label>
                  <Input id="seoKeywords" value={formData.seoKeywords} onChange={(e) => handleInputChange('seoKeywords', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogImage">OG Image URL</Label>
                  <Input id="ogImage" value={formData.ogImage} onChange={(e) => handleInputChange('ogImage', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Edit Brand</h1>
            <p className="text-gray-600">Update brand information</p>
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
              Update the details for this brand
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

              {/* Sponsored */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="sponsored"
                  checked={!!formData.sponsored}
                  onCheckedChange={(checked) => handleInputChange('sponsored', checked)}
                />
                <Label htmlFor="sponsored">Sponsored</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsorWeight">Sponsor Weight</Label>
                <Input
                  id="sponsorWeight"
                  type="number"
                  value={formData.sponsorWeight ?? 0}
                  onChange={(e) => handleInputChange('sponsorWeight', e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* SEO Settings Card */}
              <div className="pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">SEO Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input id="seoTitle" value={formData.seoTitle} onChange={(e) => handleInputChange('seoTitle', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Input id="seoDescription" value={formData.seoDescription} onChange={(e) => handleInputChange('seoDescription', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seoKeywords">SEO Keywords</Label>
                    <Input id="seoKeywords" value={formData.seoKeywords} onChange={(e) => handleInputChange('seoKeywords', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ogImage">OG Image URL</Label>
                    <Input id="ogImage" value={formData.ogImage} onChange={(e) => handleInputChange('ogImage', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center space-x-4 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Brand
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
      </div>
    </div>
  );
}
