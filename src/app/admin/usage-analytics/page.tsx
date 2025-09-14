"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface UsageRow {
  id: string
  usedAt: string
  ipAddress: string | null
  userAgent: string | null
  user: { id: string; name: string | null; email: string } | null
  coupon: { id: string; title: string; brand: { id: string; name: string } }
}

export default function UsageAnalyticsPage() {
  const [rows, setRows] = useState<UsageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const fetchUsages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/coupon-usages')
      const data = await res.json()
      if (data.success) setRows(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsages()
  }, [])

  const filtered = rows.filter((r) => {
    const q = query.toLowerCase()
    return (
      r.coupon.title.toLowerCase().includes(q) ||
      r.coupon.brand.name.toLowerCase().includes(q) ||
      (r.user?.name?.toLowerCase() || '').includes(q) ||
      (r.user?.email?.toLowerCase() || '').includes(q)
    )
  })

  return (
    <div className="w-full px-6 py-8">
      <div className="w-full space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usage Analytics</h1>
            <p className="text-gray-600">All coupon usage events (no limits)</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Search usages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input className="pl-10" placeholder="Search by coupon, brand, or user" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm table-auto">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Coupon</th>
                    <th className="px-4 py-3 text-left">Brand</th>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">IP</th>
                    <th className="px-4 py-3 text-left">User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-4 py-4" colSpan={6}>Loading…</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4" colSpan={6}>No usage records</td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className="border-t align-top">
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{new Date(r.usedAt).toLocaleString()}</td>
                        <td className="px-4 py-3">{r.coupon.title}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.coupon.brand.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.user?.name || r.user?.email || 'Unknown User'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.ipAddress || '-'}</td>
                        <td className="px-4 py-3">{r.userAgent || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
