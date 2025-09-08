'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/password/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('If an account exists, a reset link was sent')
      } else {
        toast.error('Something went wrong')
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="min-h-[60vh] flex items-start md:items-center justify-center py-10">
            <div className="w-full max-w-md">
          <Card>
          <CardHeader>
            <CardTitle>Forgot password</CardTitle>
            <CardDescription>Enter your email to receive a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
      </div>
    </div>
      <Footer />
    </>
  )
}


