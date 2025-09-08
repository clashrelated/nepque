"use client"
import Layout from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { contactsApi } from '@/lib/api-client'
import { Megaphone, Rocket, Sparkles, Send } from 'lucide-react'

export default function PartnerPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', company: '', goals: '', budget: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await contactsApi.submit({ type: 'PARTNER', name: form.name, email: form.email, company: form.company, message: form.goals, goals: form.goals, budget: form.budget })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit partner inquiry', err)
      alert('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 relative text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur ring-1 ring-white/20 mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Sponsored placements • Featured rails • Performance</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Partner with NepQue</h1>
          <p className="text-white/90">Showcase your brand and offers to high-intent shoppers. Drive sales with sponsored placements and curated visibility.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 pb-16 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur shadow ring-1 ring-black/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2"><Rocket className="h-5 w-5 text-purple-600" /><h3 className="font-semibold">Premium Placement</h3></div>
              <p className="text-gray-600">Get a dedicated Sponsored rail on Coupons and Brands. Rank via sponsor weight.</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur shadow ring-1 ring-black/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2"><Megaphone className="h-5 w-5 text-blue-600" /><h3 className="font-semibold">Performance Focus</h3></div>
              <p className="text-gray-600">Reach users ready to save. Track redemptions and brand engagement.</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur shadow ring-1 ring-black/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-amber-500" /><h3 className="font-semibold">Clean Experience</h3></div>
              <p className="text-gray-600">Premium UI with clear sponsorship labels that earn user trust.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl bg-white/80 backdrop-blur ring-1 ring-black/5">
          <CardContent className="p-6">
            {submitted ? (
              <div className="text-center py-10">
                <Rocket className="h-10 w-10 mx-auto text-purple-600 mb-3" />
                <h2 className="text-2xl font-semibold mb-2">Thanks! We’ll reach out soon.</h2>
                <p className="text-gray-600">Our team will contact you to discuss placements and next steps.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Your Name</label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Work Email</label>
                  <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Company</label>
                  <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Budget (optional)</label>
                  <Input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="e.g., Rs 50,000/mo" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Goals</label>
                  <Textarea value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} rows={6} placeholder="Tell us about your goals and the brands/offers you want to feature" required />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={loading}><Send className="h-4 w-4 mr-2" />{loading ? 'Submitting...' : 'Submit Inquiry'}</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}


