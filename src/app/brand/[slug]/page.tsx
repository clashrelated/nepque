'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import CouponCard from '@/components/coupon/CouponCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Heart, 
  Star, 
  Calendar,
  Tag,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { Badge as UIBadge } from '@/components/ui/badge';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    coupons: number;
  };
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string | null;
  type: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  isExclusive: boolean;
  isVerified: boolean;
  endDate: string | null;
  terms: string | null;
  affiliateUrl: string | null;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    website: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  _count?: {
    favoriteCoupons: number;
    couponUsages: number;
  };
}

interface FilterOptions {
  query: string;
  categoryId: string;
  type: string;
  discountType: string;
  verified: string;
  exclusive: string;
  sortBy: string;
}

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Array<{id: string, name: string, icon: string | null, color: string | null}>>([]);
  const [loading, setLoading] = useState(true);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sponsored, setSponsored] = useState<Coupon[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    query: '',
    categoryId: 'all',
    type: 'all',
    discountType: 'all',
    verified: 'all',
    exclusive: 'all',
    sortBy: 'newest'
  });

  useEffect(() => {
    if (slug) {
      fetchBrand();
      fetchCategories();
    }
  }, [slug]);

  useEffect(() => {
    if (brand) {
      fetchSponsored();
      fetchCoupons();
    }
  }, [brand, filters]);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/brands/slug/${slug}`);
      const data = await response.json();

      if (data.success) {
        setBrand(data.data);
      } else {
        toast.error('Brand not found');
      }
    } catch (error) {
      console.error('Error fetching brand:', error);
      toast.error('Failed to load brand');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=50');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCoupons = async () => {
    if (!brand) return;

    try {
      setCouponsLoading(true);
      const params = new URLSearchParams();
      params.append('brandId', brand.id);
      params.append('limit', '20');
      
      if (filters.query) params.append('q', filters.query);
      if (filters.categoryId !== 'all') params.append('categoryId', filters.categoryId);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.discountType !== 'all') params.append('discountType', filters.discountType);
      if (filters.verified !== 'all') params.append('verified', filters.verified);
      if (filters.exclusive !== 'all') params.append('exclusive', filters.exclusive);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const response = await fetch(`/api/coupons?${params}`);
      const data = await response.json();

      if (data.success) {
        setCoupons(data.data);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setCouponsLoading(false);
    }
  };

  const fetchSponsored = async () => {
    if (!brand) return;
    try {
      const res = await fetch(`/api/coupons/sponsored?brandId=${brand.id}&limit=8`);
      const data = await res.json();
      if (data.success) setSponsored(data.data);
    } catch (e) {}
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      categoryId: 'all',
      type: 'all',
      discountType: 'all',
      verified: 'all',
      exclusive: 'all',
      sortBy: 'newest'
    });
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}% OFF`;
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      return `$${coupon.discountValue} OFF`;
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      return 'FREE SHIPPING';
    }
    return 'DEAL';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!brand) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <Card>
              <CardContent className="py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Brand Not Found</h1>
                <p className="text-gray-600 mb-6">The brand you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                <Button asChild>
                  <Link href="/brands">Browse All Brands</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                {brand.logo ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{brand.name}</h1>
                {brand.description && (
                  <p className="text-gray-600 mb-4">{brand.description}</p>
                )}
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {brand._count?.coupons || 0} Coupons
                  </Badge>
                  {brand.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={brand.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filters (match /coupons UI) */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Bar Row */}
              <div className="mb-6">
                <div className="relative w-full max-w-2xl">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search coupons..."
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Buttons Row */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Category */}
                  <Select value={filters.categoryId} onValueChange={(value) => handleFilterChange('categoryId', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Type */}
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="COUPON_CODE">Coupon Code</SelectItem>
                      <SelectItem value="DEAL">Deal</SelectItem>
                      <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Discount Type */}
                  <Select value={filters.discountType} onValueChange={(value) => handleFilterChange('discountType', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Discounts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Discounts</SelectItem>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort By */}
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="discount">Highest Discount</SelectItem>
                      <SelectItem value="expiry">Expiring Soon</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear */}
                  <Button variant="outline" onClick={clearFilters} className="ml-auto">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sponsored rail */}
          {sponsored.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Sponsored at {brand.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch mb-2">
                  {sponsored.map(coupon => (
                    <div key={coupon.id} className="relative h-full">
                      <UIBadge className="absolute top-3 left-3 z-10">Sponsored</UIBadge>
                      <CouponCard coupon={coupon} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coupons Grid */}
          {couponsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No coupons found</h3>
                <p className="text-gray-600 mb-4">
                  {filters.query || filters.categoryId !== 'all' || filters.type !== 'all' || filters.verified !== 'all' || filters.exclusive !== 'all'
                    ? 'Try adjusting your filters to see more results'
                    : 'This brand doesn&apos;t have any coupons yet'
                  }
                </p>
                {(filters.query || filters.categoryId !== 'all' || filters.type !== 'all' || filters.verified !== 'all' || filters.exclusive !== 'all') && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {coupons
                .filter(c => !sponsored.find(s => s.id === c.id))
                .map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
