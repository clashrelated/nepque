'use client'

import { useEffect, useState } from 'react'
// Removed site Layout; admin pages are already wrapped by admin layout
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface Submission {
  id: string
  type: 'BRAND' | 'COUPON'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  userId?: string | null
  payload: Record<string, unknown>
  createdAt: string
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/submissions')
      const data = await res.json()
      if (data.success) setSubmissions(data.data)
    }
    load()
  }, [])

  const updateStatus = async (id: string, status: Submission['status']) => {
    const data = await apiClient.request('/api/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: { id, action: 'status', status },
    })
    if (data.success) {
      toast.success('Status updated')
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
    } else {
      toast.error(data.message || 'Failed to update')
    }
  }

  const moveToRecords = async (id: string) => {
    const data = await apiClient.request('/api/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: { id, action: 'move' },
    })
    if (data.success) {
      if (data.data.movedTo === 'brand') toast.success('Draft brand created (inactive)')
      else toast.success('Draft coupon created (inactive)')
    } else {
      toast.error(data.message || 'Failed to move')
    }
  }

  return (
      <div className="px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>User Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Payload</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                    <TableCell>{s.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v as Submission['status'])}>
                          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">PENDING</SelectItem>
                            <SelectItem value="APPROVED">APPROVED</SelectItem>
                            <SelectItem value="REJECTED">REJECTED</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => moveToRecords(s.id)}>
                          Move to {s.type === 'BRAND' ? 'Brands' : 'Coupons'} (inactive)
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{s.userId || '-'}</TableCell>
                    <TableCell>
                      <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(s.payload)}</pre>
                    </TableCell>
                    <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  )
}


