"use client"
import Layout from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { contactsApi } from '@/lib/api-client'
import { Mail, Send } from 'lucide-react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await contactsApi.submit({ type: 'CONTACT', ...form })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit contact', err)
      alert('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 relative text-center max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Contact Us</h1>
          <p className="text-white/90">Have questions, feedback, or partnership ideas? We’d love to hear from you.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 pb-16 max-w-4xl">
        <Card className="shadow-xl bg-white/80 backdrop-blur ring-1 ring-black/5">
          <CardContent className="p-6">
            {submitted ? (
              <div className="text-center py-10">
                <Mail className="h-10 w-10 mx-auto text-blue-600 mb-3" />
                <h2 className="text-2xl font-semibold mb-2">Thanks for reaching out!</h2>
                <p className="text-gray-600">We’ll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Company (optional)</label>
                  <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={6} required />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={loading}>
                    <Send className="h-4 w-4 mr-2" /> {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}


