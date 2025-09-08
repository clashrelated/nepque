'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Shield, 
  Star,
  Eye,
  Heart
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import CouponModal from './CouponModal';
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

interface CouponCardProps {
  coupon: Coupon;
}

export default function CouponCard({ coupon }: CouponCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isFavorite } = useFavorites();
  const { handleCouponClick, loading: usageLoading } = useCouponUsage();


  return (
    <>
      <Card className="hover:shadow-lg transition-shadow flex flex-col h-full min-h-[280px] relative">
        {isFavorite(coupon.id) && (
          <div className="absolute top-3 right-3">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          </div>
        )}
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Brand and Category */}
              <div className="flex items-center space-x-3 mb-3">
                <Link 
                  href={`/brand/${coupon.brand.slug}`}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  {coupon.brand.logo ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      <Image
                        src={coupon.brand.logo}
                        alt={`${coupon.brand.name} logo`}
                        width={24}
                        height={24}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">
                        {coupon.brand.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{coupon.brand.name}</span>
                </Link>
                
                <Badge variant="outline" className="text-xs">
                  {coupon.category.name}
                </Badge>
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
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 flex-1 flex flex-col">
          <div className="flex-1 flex flex-col">
            {/* Title Display - Fixed height area */}
            <div className="text-center flex-1 flex items-center justify-center min-h-[3.5rem]">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                {coupon.title}
              </h3>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex space-x-2 mt-4">
              <Button 
                className="flex-1" 
                onClick={() => setIsModalOpen(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {coupon.type === 'COUPON_CODE' ? 'Show Coupon' : 'Show Deal'}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleCouponClick(coupon.id, coupon.affiliateUrl || '')}
                disabled={usageLoading}
                title="Visit Store"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CouponModal
        coupon={coupon}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
