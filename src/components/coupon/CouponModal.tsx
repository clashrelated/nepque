'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Calendar, 
  Tag, 
  Shield, 
  Star,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useFavorites } from '@/hooks/useFavorites';
import { useCouponUsage } from '@/hooks/useCouponUsage';

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

interface CouponModalProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CouponModal({ coupon, isOpen, onClose }: CouponModalProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();
  const { handleCouponClick, loading: usageLoading } = useCouponUsage();

  if (!coupon) return null;

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
      return `Rs${coupon.discountValue} OFF`;
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      return 'FREE SHIPPING';
    }
    return 'DEAL';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COUPON_CODE':
        return 'bg-blue-100 text-blue-800';
      case 'DEAL':
        return 'bg-green-100 text-green-800';
      case 'SALE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {coupon.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Brand and Category Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {coupon.brand.logo ? (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  <Image
                    src={coupon.brand.logo}
                    alt={`${coupon.brand.name} logo`}
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">
                    {coupon.brand.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-medium text-gray-900">{coupon.brand.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {coupon.category.name}
              </Badge>
              <Badge className={`text-xs ${getTypeColor(coupon.type)}`}>
                {coupon.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center space-x-2">
            {coupon.isExclusive && (
              <Badge variant="default" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Exclusive
              </Badge>
            )}
            {coupon.isVerified && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Main Offer Display */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatDiscount(coupon)}
              </div>
              {(coupon.minOrderValue !== null && coupon.minOrderValue !== undefined && coupon.minOrderValue > 0) && (
                <div className="text-sm text-gray-600 mb-4">
                  Min. order: Rs{coupon.minOrderValue}
                </div>
              )}
              {(coupon.maxDiscount !== null && coupon.maxDiscount !== undefined && coupon.maxDiscount > 0) && (
                <div className="text-sm text-gray-600">
                  Max. discount: Rs{coupon.maxDiscount}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{coupon.description}</p>
          </div>

          {/* Coupon Code */}
          {coupon.code && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Coupon Code</h3>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <code className="font-mono text-lg font-bold text-gray-900">
                    {coupon.code}
                  </code>
                </div>
                <Button
                  onClick={() => copyCode(coupon.code!)}
                  variant="outline"
                  size="lg"
                  className="px-6"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Expiry Date */}
          {coupon.endDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Expires: {formatDate(coupon.endDate)}</span>
            </div>
          )}

          {/* Terms and Conditions */}
          {coupon.terms && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {coupon.terms}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              className="flex-1"
              size="lg"
              onClick={() => handleCouponClick(coupon.id, coupon.affiliateUrl || '')}
              disabled={usageLoading}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {usageLoading ? 'Tracking...' : 'Redeem'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-6"
              onClick={() => toggleFavorite(coupon.id)}
              disabled={favoritesLoading}
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite(coupon.id) ? 'fill-red-500 text-red-500' : ''}`} />
              {isFavorite(coupon.id) ? 'Saved' : 'Save'}
            </Button>
          </div>

          {/* Usage Stats */}
          {coupon._count && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Used {coupon._count.couponUsages || 0} times</span>
                <span>Saved by {coupon._count.favoriteCoupons || 0} users</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
