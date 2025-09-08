'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export default function TestCSRFPage() {
  const [testData, setTestData] = useState('')
  const [loading, setLoading] = useState(false)

  const testCSRF = async () => {
    setLoading(true)
    try {
      const data = await apiClient.post('/api/test-csrf', { testData })
      toast.success('CSRF test successful!')
      console.log('CSRF test result:', data)
    } catch (error) {
      toast.error('CSRF test failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      console.error('CSRF test error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>CSRF Token Test</CardTitle>
          <CardDescription>
            Test if CSRF tokens are working properly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testData">Test Data</Label>
            <Input
              id="testData"
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              placeholder="Enter some test data"
            />
          </div>
          <Button 
            onClick={testCSRF} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test CSRF Token'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
