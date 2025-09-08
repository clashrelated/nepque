'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { submissionsApi } from '@/lib/api-client'
import { toast } from 'sonner'

interface BrandOption { id: string; name: string }

export default function SubmitPage() {
  const [brands, setBrands] = useState<BrandOption[]>([])

  // Brand form state
  const [brandName, setBrandName] = useState('')
  const [brandWebsite, setBrandWebsite] = useState('')
  const [brandLogo, setBrandLogo] = useState('')
  const [brandDesc, setBrandDesc] = useState('')

  // Coupon form state
  const [couponBrandId, setCouponBrandId] = useState('')
  const [couponTitle, setCouponTitle] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponType, setCouponType] = useState('COUPON_CODE')
  const [discountType, setDiscountType] = useState('PERCENTAGE')
  const [discountValue, setDiscountValue] = useState('')

  useEffect(() => {
    // Load existing brands for coupon submission
    const loadBrands = async () => {
      try {
        const res = await fetch('/api/brands?limit=100')
        const data = await res.json()
        if (data.success) {
          setBrands(data.data.map((b: any) => ({ id: b.id, name: b.name })))
        }
      } catch {}
    }
    loadBrands()
  }, [])

  const submitBrand = async () => {
    if (!brandName.trim()) {
      toast.error('Please enter brand name')
      return
    }
    try {
      await submissionsApi.submitBrand({
        name: brandName.trim(),
        website: brandWebsite || undefined,
        logo: brandLogo || undefined,
        description: brandDesc || undefined,
      })
      toast.success('Thanks! Your brand submission is received and pending review.')
      setBrandName(''); setBrandWebsite(''); setBrandLogo(''); setBrandDesc('')
    } catch (e) {
      toast.error('Failed to submit brand')
    }
  }

  const submitCoupon = async () => {
    if (!couponBrandId) { toast.error('Please select a brand'); return }
    if (!couponTitle.trim()) { toast.error('Please add a title'); return }
    if (!discountValue) { toast.error('Please add discount value'); return }
    try {
      await submissionsApi.submitCoupon({
        brandId: couponBrandId,
        title: couponTitle.trim(),
        type: couponType,
        discountType,
        discountValue: Number(discountValue),
        code: couponType === 'COUPON_CODE' ? (couponCode || undefined) : undefined,
      })
      toast.success('Thanks! Your coupon submission is received and pending review.')
      setCouponBrandId(''); setCouponTitle(''); setCouponCode(''); setDiscountValue('')
    } catch (e) {
      toast.error('Failed to submit coupon')
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Submit to NepQue</h1>

          <Card>
            <CardHeader>
              <CardTitle>Suggest a New Brand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Brand Name</Label>
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g., Amazon" />
              </div>
              <div className="space-y-2">
                <Label>Website (optional)</Label>
                <Input value={brandWebsite} onChange={(e) => setBrandWebsite(e.target.value)} placeholder="https://example.com" />
              </div>
              <div className="space-y-2">
                <Label>Logo URL (optional)</Label>
                <Input value={brandLogo} onChange={(e) => setBrandLogo(e.target.value)} placeholder="https://logo.png" />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input value={brandDesc} onChange={(e) => setBrandDesc(e.target.value)} placeholder="Short description" />
              </div>
              <Button onClick={submitBrand}>Submit Brand</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submit a Coupon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select value={couponBrandId} onValueChange={(v) => setCouponBrandId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={couponTitle} onChange={(e) => setCouponTitle(e.target.value)} placeholder="e.g., 25% Off" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={couponType} onValueChange={(v) => setCouponType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COUPON_CODE">Coupon Code</SelectItem>
                      <SelectItem value="DEAL">Deal</SelectItem>
                      <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select value={discountType} onValueChange={(v) => setDiscountType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <Input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="e.g., 25" />
                </div>
              </div>
              {couponType === 'COUPON_CODE' && (
                <div className="space-y-2">
                  <Label>Code (optional)</Label>
                  <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="e.g., SAVE25" />
                </div>
              )}
              <Button onClick={submitCoupon}>Submit Coupon</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}


