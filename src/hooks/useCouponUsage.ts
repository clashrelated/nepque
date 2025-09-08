'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { couponsApi } from '@/lib/api-client'

export function useCouponUsage() {
  const [loading, setLoading] = useState(false)

  const trackCouponUsage = async (couponId: string) => {
    setLoading(true)
    try {
      const data = await couponsApi.use(couponId)

      if (data.success) {
        toast.success('Coupon used successfully!')
        return true
      } else {
        toast.error(data.message || 'Failed to track coupon usage')
        return false
      }
    } catch (error) {
      console.error('Error tracking coupon usage:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred while tracking usage')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleCouponClick = async (couponId: string, affiliateUrl: string) => {
    // Track the usage first
    const tracked = await trackCouponUsage(couponId)
    
    if (tracked && affiliateUrl) {
      // Open the affiliate URL in a new tab
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return {
    loading,
    trackCouponUsage,
    handleCouponClick
  }
}
