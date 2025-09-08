"use client"
import { useEffect, useState } from 'react'
import { contactsApi } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ContactItem = {
  id: string
  type: 'CONTACT' | 'PARTNER'
  name: string
  email: string
  company?: string | null
  message: string
  budget?: string | null
  goals?: string | null
  createdAt: string
}

export default function AdminContactPage() {
  const [items, setItems] = useState<ContactItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await contactsApi.list()
        if (res.success) setItems(res.data)
      } catch (e) {
        console.error('Failed to load contacts', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts & Partner Inquiries</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="p-4 border rounded-md bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === 'PARTNER' ? 'default' : 'secondary'}>
                      {item.type === 'PARTNER' ? 'From /partner' : 'From /contact'}
                    </Badge>
                    <span className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                  <div><span className="font-medium">Name:</span> {item.name}</div>
                  <div><span className="font-medium">Email:</span> {item.email}</div>
                  <div><span className="font-medium">Company:</span> {item.company || '-'}</div>
                  <div><span className="font-medium">Budget:</span> {item.budget || '-'}</div>
                </div>
                {item.goals && (
                  <div className="mt-2 text-sm"><span className="font-medium">Goals:</span> {item.goals}</div>
                )}
                <div className="mt-2 text-sm whitespace-pre-wrap break-words"><span className="font-medium">Message:</span> {item.message}</div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="py-10 text-center text-gray-500">No submissions yet.</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


