'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Shield } from 'lucide-react'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  fallback?: ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/signin')
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      if (requiredRole === 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
        router.push('/')
        return
      }
      if (requiredRole === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
        router.push('/')
        return
      }
    }
  }, [session, status, requiredRole, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to sign in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requiredRole && session.user.role !== requiredRole) {
    if (requiredRole === 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don&apos;t have permission to access this page
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="w-full">
                <Link href="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return <>{children}</>
}
