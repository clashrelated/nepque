'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, FolderOpen, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { categoriesApi } from '@/lib/api-client';

interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

const colorOptions = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
];

const iconOptions = [
  'shopping-bag',
  'shirt',
  'home',
  'car',
  'smartphone',
  'laptop',
  'book',
  'gamepad2',
  'heart',
  'star',
  'gift',
  'ticket',
  'utensils',
  'coffee',
  'plane',
  'bed',
  'dumbbell',
  'music',
  'camera',
  'palette',
];

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: 'shopping-bag',
    color: 'blue',
    isActive: true,
  });

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${categoryId}`);
      const data = await response.json();

      if (data.success) {
        setFormData({
          name: data.data.name || '',
          description: data.data.description || '',
          icon: data.data.icon || 'shopping-bag',
          color: data.data.color || 'blue',
          isActive: data.data.isActive ?? true,
        });
      } else {
        toast.error(data.message || 'Failed to load category');
        router.push('/admin/categories');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to load category');
      router.push('/admin/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);

    try {
      const data = await categoriesApi.update(categoryId, formData);

      if (data.success) {
        toast.success('Category updated successfully!');
        router.push('/admin/categories');
      } else {
        toast.error(data.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchCategory();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
            <p className="text-gray-600">Loading category details...</p>
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
            <Link href="/admin/categories">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
            <p className="text-gray-600">Update category information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
              Category Information
            </CardTitle>
            <CardDescription>
              Update the details for this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter category name"
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
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>

              {/* Icon Selection */}
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-10 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handleInputChange('icon', icon)}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        formData.icon === icon
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 ${formData.color === 'blue' ? 'bg-blue-500' : `bg-${formData.color}-500`} rounded`}></div>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Selected icon: {formData.icon}
                </p>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleInputChange('color', color.value)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.color === color.value
                          ? 'border-gray-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 ${color.class} rounded`}></div>
                      <p className="text-xs mt-1">{color.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${formData.color === 'blue' ? 'bg-blue-500' : `bg-${formData.color}-500`} rounded flex items-center justify-center`}>
                      <span className="text-white text-sm">📦</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{formData.name || 'Category Name'}</h3>
                      <p className="text-sm text-gray-600">{formData.description || 'Category description'}</p>
                    </div>
                  </div>
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
                  {formData.isActive ? 'Category will be visible to users' : 'Category will be hidden from users'}
                </span>
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
                      Update Category
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/categories">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
