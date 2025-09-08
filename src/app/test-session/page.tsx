'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export default function TestSessionPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)

  const testSession = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get('/api/test-session')
      setSessionData(data.data)
      toast.success('Session test successful!')
      console.log('Session test result:', data)
    } catch (error) {
      toast.error('Session test failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      console.error('Session test error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Session Test</CardTitle>
          <CardDescription>
            Test if session management is working properly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Client-side Session:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          <Button 
            onClick={testSession} 
            disabled={loading || !session}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Server-side Session'}
          </Button>
          
          {sessionData && (
            <div>
              <h3 className="font-semibold">Server-side Session:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
